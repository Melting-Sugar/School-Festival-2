// localStorage に保存された注文スナップショットの有無を判定し、要求に応じて画面へ復元するフック。
import { useCallback, useEffect, useState } from "react";

import { ORDER_SNAPSHOT_CONFIG } from "../constants/config";
import { getLocalStorageJSON, removeLocalStorageItem } from "../utils/localStorage";
import { formatDisplayReserved } from "../utils/dateFormat";
import {
  clearOrderSnapshot,
  isReservationExpired,
  parseReservedFromSaved,
} from "../features/order/orderSnapshot";

export function useOrderSnapshotRestore({ dispatch, setPaymentState, setSelectedTime }) {
  const [hasSavedOrder, setHasSavedOrder] = useState(false);

  const clearSavedOrder = useCallback(() => {
    clearOrderSnapshot(removeLocalStorageItem, ORDER_SNAPSHOT_CONFIG.KEY);
    setHasSavedOrder(false);
  }, []);

  const readValidSnapshot = useCallback(() => {
    const saved = getLocalStorageJSON(ORDER_SNAPSHOT_CONFIG.KEY);
    if (!saved) return null;

    const { reservedAtIso, createdAt } = saved;
    if (!reservedAtIso) return null;

    const reserved = parseReservedFromSaved(reservedAtIso, createdAt);
    if (!reserved) return null;

    if (isReservationExpired(reserved, new Date(), ORDER_SNAPSHOT_CONFIG.RESERVATION_VALID_DURATION_MS)) {
      return null;
    }

    return { ...saved, reserved };
  }, []);

  useEffect(() => {
    const valid = readValidSnapshot();
    if (valid) {
      setHasSavedOrder(true);
    } else {
      clearSavedOrder();
    }
  }, [readValidSnapshot, clearSavedOrder]);

  const viewSavedOrder = useCallback(() => {
    const valid = readValidSnapshot();
    if (!valid) {
      clearSavedOrder();
      return;
    }

    const { reserved, orderId, itemsCart, displayReserved } = valid;
    if (itemsCart && typeof itemsCart === "object") {
      dispatch({ type: "REPLACE_CART", cart: itemsCart });
    }
    setSelectedTime(reserved.toISOString());
    setPaymentState((prev) => ({
      ...prev,
      outcome: {
        ok: true,
        orderId: orderId || null,
        error: null,
        receiptUrl: null,
        displayReserved: displayReserved || formatDisplayReserved(reserved),
      },
    }));
    dispatch({ type: "GOTO", step: "numberTag" });
  }, [readValidSnapshot, clearSavedOrder, dispatch, setPaymentState, setSelectedTime]);

  return { hasSavedOrder, viewSavedOrder, clearSavedOrder };
}
