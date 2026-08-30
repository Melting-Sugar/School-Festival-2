// PayPay決済の送信・結果更新をまとめて扱うフック。
// PaySys(カード・PayPayとも)の実バックエンド連携は後任フロントエンド開発者が担当する。
// USE_MOCK_PAYMENTがオンの場合のみ、モックで決済成功画面まで到達できる迂回策であり、
// 実際のAPI接続(バックエンドへの注文作成・決済実行)は一切行っていない。
import { useCallback, useState, type Dispatch, type SetStateAction } from "react";

import { ORDER_SNAPSHOT_CONFIG, USE_MOCK_PAYMENT } from "../constants/config";
import { buildOrderSnapshot } from "../features/order/orderSnapshot";
import { formatDisplayReserved } from "../utils/dateFormat";
import { setLocalStorageJSON } from "../utils/localStorage";
import { parseReservedToDate } from "../utils/orderUtils";
import { MOCK_PAYPAY_ORDER_ID } from "../constants/mocks/paypayPaymentMock";
import type { AppAction, Cart, PaymentState } from "../types";

export function usePayPayPaymentFlow({
  cart,
  selectedTime,
  dispatch,
  setPaymentState,
}: {
  cart: Cart;
  selectedTime: string | null;
  dispatch: Dispatch<AppAction>;
  setPaymentState: Dispatch<SetStateAction<PaymentState>>;
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

    if (USE_MOCK_PAYMENT) {
      const orderId = MOCK_PAYPAY_ORDER_ID;
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
      // PaySys(PayPay)の実装は後任フロントエンド開発者が担当。ここでは未実装として扱う。
      setPaymentState((prev) => ({
        ...prev,
        outcome: {
          ok: false,
          orderId: null,
          error: "PayPay決済(PaySys)は未実装です。後任担当者が実装予定です。",
          receiptUrl: null,
          displayReserved,
        },
      }));
    }

    setSubmitting(false);
    dispatch({ type: "GOTO", step: "paymentResult" });
  }, [cart, selectedTime, dispatch, setPaymentState]);

  return { handlePayWithPayPay, submitting };
}
