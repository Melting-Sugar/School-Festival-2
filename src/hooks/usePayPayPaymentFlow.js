// PayPay決済の送信・結果更新をまとめて扱うフック(usePaymentFlow.jsのPayPay版)。
import { useCallback, useState } from "react";

import { ORDER_SNAPSHOT_CONFIG, USE_MOCK_PAYMENT } from "../constants/config";
import { Api } from "../services/apiService";
import { buildOrderSnapshot } from "../features/order/orderSnapshot";
import { formatDisplayReserved } from "../utils/dateFormat";
import { setLocalStorageJSON } from "../utils/localStorage";
import { parseReservedToDate } from "../utils/orderUtils";
import { createPaymentOrder } from "../features/payment/paymentSession";
import { MOCK_PAYPAY_ORDER_ID } from "../constants/mocks/paypayPaymentMock";

export function usePayPayPaymentFlow({
  cart,
  selectedTime,
  dispatch,
  setPaymentState,
  calculateSumPrice,
}) {
  const [submitting, setSubmitting] = useState(false);

  const handlePayWithPayPay = useCallback(async () => {
    const reservedDate = parseReservedToDate(selectedTime);
    if (!reservedDate) {
      alert("予約時刻が不正です");
      return;
    }

    setSubmitting(true);
    const createdAtIso = new Date().toISOString();
    const reservedAtIso = reservedDate.toISOString();
    const displayReserved = formatDisplayReserved(reservedDate);

    let orderId = null;
    try {
      if (USE_MOCK_PAYMENT) {
        // モック時は現行通りlocalStorageへ書き込むのみ(バックエンド未接続)。
        orderId = MOCK_PAYPAY_ORDER_ID;
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
        setPaymentState((prev) => ({
          ...prev,
          outcome: {
            ok: true,
            orderId,
            error: null,
            receiptUrl: null,
            displayReserved,
          },
        }));
      } else {
        // カード決済と同じく、課金直前に注文を作成する(幽霊注文防止)。
        // PayPay用バックエンドは未実装のため、ここは現状失敗する想定。
        const orderSession = await createPaymentOrder({
          cart,
          selectedTime,
          calculateSumPrice,
          useMockPayment: false,
          createOrder: Api.createOrder,
          createdAtIso,
        });
        orderId = orderSession.orderId;

        const payment = await Api.chargePayPay({ orderId });

        if (payment?.hasKeyError) {
          setSubmitting(false);
          return;
        }

        if (payment?.status === "COMPLETED") {
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
              displayReserved,
            },
          }));
        }
      }
    } catch (e) {
      setPaymentState((prev) => ({
        ...prev,
        outcome: {
          ok: false,
          orderId,
          error: e?.message || "決済処理中にエラーが発生しました",
          receiptUrl: null,
          displayReserved,
        },
      }));
    }
    setSubmitting(false);
    dispatch({ type: "GOTO", step: "paymentResult" });
  }, [cart, selectedTime, dispatch, setPaymentState, calculateSumPrice]);

  return { handlePayWithPayPay, submitting };
}
