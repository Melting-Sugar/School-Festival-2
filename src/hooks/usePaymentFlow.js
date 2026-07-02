import { useCallback, useEffect, useRef, useState } from "react";

import { INITIAL_PAYMENT_STATE } from "../constants/initialState";
import { COOKIE_CONFIG, TIMEOUTS, TEMP_COOKIE_TEST_KEY, USE_MOCK_PAYMENT } from "../constants/config";
import { Api } from "../services/apiService";
import { loadSquareSdk } from "../services/squarePaymentService";
import { buildOrderItems, parseReservedToDate } from "../utils/orderUtils";
import { deleteCookie, getCookieJSON, getCookieStr, setCookieJSON, setCookieStr } from "../utils/cookies";
import { formatDisplayReserved, toLocalDateTimeString } from "../utils/dateFormat";
import { isValidEmail } from "../utils/validation";

export function usePaymentFlow({ step, cart, selectedTime, dispatch, calculateSumPrice }) {
  const [paymentState, setPaymentState] = useState(INITIAL_PAYMENT_STATE);
  const paymentTimerRef = useRef(null);
  const cardRef = useRef(null);

  const clearCardContainer = useCallback(() => {
    const el = document.getElementById("card-container");
    if (el) el.innerHTML = "";
  }, []);

  const destroyCardIfAny = useCallback(async () => {
    try {
      if (cardRef.current && typeof cardRef.current.destroy === "function") {
        await cardRef.current.destroy();
      }
    } catch (_) {
    } finally {
      cardRef.current = null;
      clearCardContainer();
      setPaymentState((prev) => ({ ...prev, cardAttached: false }));
    }
  }, [clearCardContainer]);

  const canUseCookies = useCallback(async () => {
    try {
      const key = TEMP_COOKIE_TEST_KEY;
      setCookieStr(key, "1", TIMEOUTS.COOKIE_TEST_TIMEOUT);
      const v = getCookieStr(key);
      deleteCookie(key);
      return v === "1";
    } catch {
      return false;
    }
  }, []);

  const ensureCardMounted = useCallback(
    async (applicationId, locationId) => {
      function waitForContainer(
        timeoutMs = TIMEOUTS.CARD_ATTACH_WAIT,
        intervalMs = TIMEOUTS.CARD_ATTACH_INTERVAL
      ) {
        const start = Date.now();
        return new Promise((resolve) => {
          const check = () => {
            const el = document.getElementById("card-container");
            if (el) return resolve(el);
            if (Date.now() - start >= timeoutMs) return resolve(null);
            setTimeout(check, intervalMs);
          };
          check();
        });
      }

      async function tryAttach(card, selector = "#card-container", tries = 4, delayMs = 300) {
        for (let i = 0; i < tries; i++) {
          try {
            await card.attach(selector);
            console.log("DEBUG: card.attach succeeded (attempt)", i + 1);
            return true;
          } catch (e) {
            console.warn("DEBUG: card.attach attempt failed", i + 1, e);
            await new Promise((r) => setTimeout(r, delayMs));
          }
        }
        return false;
      }

      if (!window.Square) throw new Error("Square SDKが読み込まれていません");

      const container = await waitForContainer();
      if (!container) {
        throw new Error("#card-container が見つかりません（タイムアウト）。");
      }

      if (cardRef.current && container.childElementCount === 0) {
        try {
          const ok = await tryAttach(cardRef.current, "#card-container");
          if (ok) {
            setPaymentState((prev) => ({ ...prev, cardAttached: true }));
            return;
          }
          await destroyCardIfAny();
        } catch (e) {
          await destroyCardIfAny();
        }
      }

      if (!cardRef.current) {
        let payments;
        try {
          payments = window.Square.payments(applicationId, locationId);
        } catch (e) {
          throw new Error("Square.payments の初期化に失敗: " + (e?.message || e));
        }

        const card = await payments.card();

        const attached = await tryAttach(card, "#card-container");
        if (!attached) {
          try {
            await card.destroy?.();
          } catch {
          }
          throw new Error("カードUIの attach に失敗しました（複数回リトライしてもダメでした）。");
        }

        cardRef.current = card;
        setPaymentState((prev) => ({ ...prev, cardAttached: true }));
        return;
      }

      if (cardRef.current && container.childElementCount > 0) {
        setPaymentState((prev) => ({ ...prev, cardAttached: true }));
      }
    },
    [destroyCardIfAny]
  );

  const buildVerificationDetails = useCallback((amountYen, billingContact) => {
    if (
      !billingContact ||
      !String(billingContact.familyName || "").trim() ||
      !String(billingContact.givenName || "").trim() ||
      !String(billingContact.email || "").trim() ||
      !isValidEmail(billingContact.email)
    ) {
      throw new Error("請求先情報が不正です。苗字・名前・有効なメールアドレスを入力してください。");
    }

    return {
      amount: String(amountYen),
      currencyCode: "JPY",
      intent: "CHARGE",
      customerInitiated: true,
      sellerKeyedIn: false,
      billingContact: {
        familyName: billingContact.familyName.trim(),
        givenName: billingContact.givenName.trim(),
        email: billingContact.email.trim(),
      },
    };
  }, []);

  const handleSubmitOrderFlow = useCallback(async () => {
    if (!(await canUseCookies())) {
      throw new Error("このブラウザではCookieが使えません。");
    }

    const items = buildOrderItems(cart);
    if (items.length === 0) throw new Error("カートが空です");

    const reservedDate = parseReservedToDate(selectedTime);
    if (!reservedDate) throw new Error("予約時刻が不正です");

    const reservedAtIso = reservedDate.toISOString();
    const amount = calculateSumPrice();

    let orderId = paymentState.orderId;
    let createdAtIso = paymentState.createdAtIso || new Date().toISOString();

    if (!orderId) {
      if (USE_MOCK_PAYMENT) {
        orderId = "MOCK-" + Math.floor(Math.random() * 100000);
      } else {
        const orderDateLocal = toLocalDateTimeString(new Date(createdAtIso));
        const reservedLocal = toLocalDateTimeString(reservedDate);
        const orderResp = await Api.createOrder({
          items,
          orderDate: orderDateLocal,
          reservedTime: reservedLocal,
          amount,
        });
        orderId = orderResp?.orderId;
        if (!orderId) throw new Error("orderIdの発行に失敗しました");
      }
      setPaymentState((prev) => ({ ...prev, orderId, createdAtIso }));
    }

    try {
      if (
        !paymentState.billingInfo.familyName.trim() ||
        !paymentState.billingInfo.givenName.trim() ||
        !paymentState.billingInfo.email.trim()
      ) {
        throw new Error("氏名とメールアドレスを入力してください。");
      }
      if (!isValidEmail(paymentState.billingInfo.email)) {
        throw new Error("有効なメールアドレスを入力してください。");
      }

      let payment;
      if (USE_MOCK_PAYMENT) {
        if (!cardRef.current) {
          const cfg2 = await Api.getSquareConfig();
          await loadSquareSdk(cfg2?.environment || "PRODUCTION");
          await ensureCardMounted(cfg2?.applicationId, cfg2?.locationId);
          if (!cardRef.current) throw new Error("カードUIの初期化に失敗しました");
        }

        const verificationDetails = buildVerificationDetails(amount, {
          familyName: paymentState.billingInfo.familyName,
          givenName: paymentState.billingInfo.givenName,
          email: paymentState.billingInfo.email,
        });

        const result = await cardRef.current.tokenize(verificationDetails);

        if (result.status !== "OK") {
          const msg = result.errors?.[0]?.message || "カードのトークン化に失敗しました";
          throw new Error(msg);
        }

        await new Promise((r) => setTimeout(r, 300));
        payment = { status: "COMPLETED", receiptUrl: "" };
      } else {
        if (!cardRef.current) {
          const cfg2 = await Api.getSquareConfig();
          await loadSquareSdk(cfg2?.environment || "PRODUCTION");
          await ensureCardMounted(cfg2?.applicationId, cfg2?.locationId);
          if (!cardRef.current) throw new Error("カードUIの初期化に失敗しました");
        }

        const verificationDetails = buildVerificationDetails(amount, {
          familyName: paymentState.billingInfo.familyName,
          givenName: paymentState.billingInfo.givenName,
          email: paymentState.billingInfo.email,
        });

        const result = await cardRef.current.tokenize(verificationDetails);

        if (result.status !== "OK") {
          const msg = result.errors?.[0]?.message || "カードのトークン化に失敗しました";
          throw new Error(msg);
        }
        const sourceId = result.token;

        payment = await Api.chargeOrder({
          orderId,
          sourceId,
        });
      }

      if (payment?.hasKeyError) {
        return;
      }

      if (payment?.status === "COMPLETED") {
        const displayReserved = formatDisplayReserved(reservedDate);
        setCookieJSON(
          COOKIE_CONFIG.KEY,
          {
            createdAt: createdAtIso,
            reservedAtIso,
            orderId,
            itemsCart: cart,
            displayReserved,
          },
          COOKIE_CONFIG.MAX_AGE_SEC
        );

        setPaymentState((prev) => ({
          ...prev,
          outcome: {
            ok: true,
            orderId,
            error: null,
            receiptUrl: payment?.receiptUrl || null,
            displayReserved,
          },
        }));
      } else {
        setPaymentState((prev) => ({
          ...prev,
          outcome: {
            ok: false,
            orderId,
            error: payment?.error || "決済が承認されませんでした",
            receiptUrl: null,
            displayReserved: formatDisplayReserved(reservedDate),
          },
        }));
      }
    } catch (e) {
      setPaymentState((prev) => ({
        ...prev,
        outcome: {
          ok: false,
          orderId: orderId || null,
          error: e?.message || "決済処理中にエラーが発生しました",
          receiptUrl: null,
          displayReserved: formatDisplayReserved(reservedDate),
        },
      }));
    }
    dispatch({ type: "GOTO", step: "paymentResult" });
  }, [
    canUseCookies,
    cart,
    selectedTime,
    paymentState,
    calculateSumPrice,
    ensureCardMounted,
    buildVerificationDetails,
    dispatch,
  ]);

  useEffect(() => {
    if (step !== "payment") return;

    setPaymentState(INITIAL_PAYMENT_STATE);
    if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);
    destroyCardIfAny();

    paymentTimerRef.current = setTimeout(async () => {
      try {
        const reservedDate = parseReservedToDate(selectedTime);
        if (!reservedDate) {
          throw new Error("予約時刻が設定されていません。");
        }

        const createdAtIso = new Date().toISOString();
        const items = buildOrderItems(cart);
        if (!items || items.length === 0) {
          throw new Error("カートが空です");
        }

        const orderDateLocal = toLocalDateTimeString(new Date(createdAtIso));
        const reservedLocal = toLocalDateTimeString(reservedDate);

        let orderId;
        if (USE_MOCK_PAYMENT) {
          orderId = "MOCK-" + Math.floor(Math.random() * 100000);
        } else {
          const orderResp = await Api.createOrder({
            items,
            orderDate: orderDateLocal,
            reservedTime: reservedLocal,
            amount: calculateSumPrice(),
          });
          orderId = orderResp?.orderId;
          if (!orderId) {
            throw new Error("注文作成に失敗しました (orderId 未取得)");
          }
        }

        const cfg = await Api.getSquareConfig();
        await loadSquareSdk(cfg?.environment || "PRODUCTION");
        setPaymentState((prev) => ({ ...prev, orderId, createdAtIso, phase: "input" }));
      } catch (e) {
        alert(e?.message || "決済モジュールの初期化に失敗しました");
        dispatch({ type: "GOTO", step: "cart" });
      }
    }, TIMEOUTS.PAYMENT_INIT_DELAY);

    return () => {
      if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);
      destroyCardIfAny();
    };
  }, [step, selectedTime, cart, calculateSumPrice, destroyCardIfAny, dispatch]);

  useEffect(() => {
    if (step !== "payment") return;
    if (paymentState.phase !== "input") return;

    const attachTimer = setTimeout(() => {
      (async () => {
        try {
          const cfg = await Api.getSquareConfig();
          await ensureCardMounted(cfg?.applicationId, cfg?.locationId);
        } catch (e) {
          alert(e?.message || "#card-container の初期化に失敗しました");
          dispatch({ type: "GOTO", step: "cart" });
        }
      })();
    }, TIMEOUTS.CARD_MOUNT_DELAY);

    return () => {
      clearTimeout(attachTimer);
    };
  }, [step, paymentState.phase, ensureCardMounted, dispatch]);

  return { paymentState, setPaymentState, handleSubmitOrderFlow };
}