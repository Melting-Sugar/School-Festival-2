// 決済画面の初期化、カード接続、送信、結果更新をまとめて扱うフック。
import { useCallback, useEffect, useRef, useState } from "react";

import { INITIAL_PAYMENT_STATE } from "../constants/initialState";
import { ORDER_SNAPSHOT_CONFIG, TIMEOUTS, TEMP_STORAGE_TEST_KEY, USE_MOCK_PAYMENT } from "../constants/config";
import { Api } from "../services/apiService";
import { loadSquareSdk } from "../services/squarePaymentService";
import { getLocalStorageJSON, removeLocalStorageItem, setLocalStorageJSON } from "../utils/localStorage";
import { formatDisplayReserved } from "../utils/dateFormat";
import { buildVerificationDetails } from "../features/payment/paymentValidation";
import { buildOrderSnapshot } from "../features/order/orderSnapshot";
import { createPaymentOrder } from "../features/payment/paymentSession";
import { parseReservedToDate } from "../utils/orderUtils";
import {
  ensurePaymentCardMounted,
  submitPaymentTransaction,
} from "../features/payment/paymentGateway";
import { initializePaymentScreen } from "../features/payment/paymentScreen";

export function usePaymentFlow({ step, cart, selectedTime, dispatch, calculateSumPrice }) {
  const [paymentState, setPaymentState] = useState(INITIAL_PAYMENT_STATE);
  const paymentTimerRef = useRef(null);
  const cardRef = useRef(null);

  const setCardAttached = useCallback(
    (cardAttached) => {
      setPaymentState((prev) => ({ ...prev, cardAttached }));
    },
    [setPaymentState]
  );

  const setPaymentOutcome = useCallback(
    ({ ok, orderId, error, receiptUrl, displayReserved }) => {
      setPaymentState((prev) => ({
        ...prev,
        outcome: {
          ok,
          orderId,
          error,
          receiptUrl,
          displayReserved,
        },
      }));
    },
    [setPaymentState]
  );

  const handlePaymentInitializationFailure = useCallback(
    (error, fallbackMessage) => {
      alert(error?.message || fallbackMessage);
      dispatch({ type: "GOTO", step: "cart" });
    },
    [dispatch]
  );

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
      setCardAttached(false);
    }
  }, [clearCardContainer, setCardAttached]);

  const canUseLocalStorage = useCallback(async () => {
    try {
      const key = TEMP_STORAGE_TEST_KEY;
      setLocalStorageJSON(key, "1");
      const v = getLocalStorageJSON(key);
      removeLocalStorageItem(key);
      return v === "1";
    } catch {
      return false;
    }
  }, []);

  const handleSubmitOrderFlow = useCallback(async () => {
    if (!(await canUseLocalStorage())) {
      throw new Error("このブラウザでは注文情報の保存ができません。");
    }

    const reservedDate = parseReservedToDate(selectedTime);
    if (!reservedDate) {
      throw new Error("予約時刻が不正です");
    }

    const orderId = paymentState.orderId;
    if (!orderId) {
      throw new Error("注文IDがありません");
    }
    const createdAtIso = paymentState.createdAtIso || new Date().toISOString();
    const reservedAtIso = reservedDate.toISOString();
    const amount = calculateSumPrice();

    try {
      const payment = await submitPaymentTransaction({
        orderId,
        amount,
        billingInfo: paymentState.billingInfo,
        useMockPayment: USE_MOCK_PAYMENT,
        cardRef,
        getSquareConfig: Api.getSquareConfig,
        loadSquareSdk,
        ensurePaymentCardMounted: async (cfg) =>
          ensurePaymentCardMounted({
            cardRef,
            setPaymentState,
            destroyCardIfAny,
            applicationId: cfg?.applicationId,
            locationId: cfg?.locationId,
          }),
        chargeOrder: Api.chargeOrder,
        buildVerificationDetails,
      });

      if (payment?.hasKeyError) {
        return;
      }

      if (payment?.status === "COMPLETED") {
        const displayReserved = formatDisplayReserved(reservedDate);
        setLocalStorageJSON(
          ORDER_SNAPSHOT_CONFIG.KEY,
          buildOrderSnapshot({
            createdAtIso,
            reservedAtIso,
            orderId,
            itemsCart: cart,
            displayReserved,
          })
        );

        setPaymentOutcome({
          ok: true,
          orderId,
          error: null,
          receiptUrl: payment?.receiptUrl || null,
          displayReserved,
        });
      } else {
        setPaymentOutcome({
          ok: false,
          orderId,
          error: payment?.error || "決済が承認されませんでした",
          receiptUrl: null,
          displayReserved: formatDisplayReserved(reservedDate),
        });
      }
    } catch (e) {
      setPaymentOutcome({
        ok: false,
        orderId: orderId || null,
        error: e?.message || "決済処理中にエラーが発生しました",
        receiptUrl: null,
        displayReserved: formatDisplayReserved(reservedDate),
      });
    }
    dispatch({ type: "GOTO", step: "paymentResult" });
  }, [
    canUseLocalStorage,
    cart,
    selectedTime,
    paymentState,
    calculateSumPrice,
    buildVerificationDetails,
    dispatch,
    destroyCardIfAny,
    cardRef,
  ]);

  useEffect(() => {
    if (step !== "payment") return;

    setPaymentState(INITIAL_PAYMENT_STATE);
    if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current);
    destroyCardIfAny();

    paymentTimerRef.current = setTimeout(async () => {
      try {
        const orderSession = await createPaymentOrder({
          cart,
          selectedTime,
          calculateSumPrice,
          useMockPayment: USE_MOCK_PAYMENT,
          createOrder: Api.createOrder,
        });

        const { orderId, createdAtIso } = orderSession;

        await initializePaymentScreen({
          getSquareConfig: Api.getSquareConfig,
          loadSquareSdk,
          setPaymentState,
          orderId,
          createdAtIso,
          useMockPayment: USE_MOCK_PAYMENT,
        });
      } catch (e) {
        handlePaymentInitializationFailure(e, "決済モジュールの初期化に失敗しました");
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
          const cfg = await initializePaymentScreen({
            getSquareConfig: Api.getSquareConfig,
            loadSquareSdk,
            setPaymentState,
            orderId: paymentState.orderId,
            createdAtIso: paymentState.createdAtIso || new Date().toISOString(),
            useMockPayment: USE_MOCK_PAYMENT,
          });
          await ensurePaymentCardMounted({
            cardRef,
            setPaymentState,
            destroyCardIfAny,
            applicationId: cfg?.applicationId,
            locationId: cfg?.locationId,
          });
        } catch (e) {
          handlePaymentInitializationFailure(e, "#card-container の初期化に失敗しました");
        }
      })();
    }, TIMEOUTS.CARD_MOUNT_DELAY);

    return () => {
      clearTimeout(attachTimer);
    };
  }, [
    step,
    paymentState.phase,
    dispatch,
    cardRef,
    setPaymentState,
    destroyCardIfAny,
    loadSquareSdk,
    handlePaymentInitializationFailure,
  ]);

  return { paymentState, setPaymentState, handleSubmitOrderFlow };
}