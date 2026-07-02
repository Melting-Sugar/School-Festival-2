// Cookie に保存された注文状態を復元し、期限切れなら削除するフック。
import { useCallback, useEffect } from "react";

import { COOKIE_CONFIG } from "../constants/config";
import { deleteCookie, getCookieJSON } from "../utils/cookies";
import { formatDisplayReserved } from "../utils/dateFormat";
import {
  clearOrderSnapshot,
  isReservationExpired,
  parseReservedFromSaved,
} from "../features/order/orderSnapshot";

export function useCookieRestore({ dispatch, setPaymentState, setSelectedTime }) {
  const clearSavedCookie = useCallback(() => {
    clearOrderSnapshot(deleteCookie, COOKIE_CONFIG.KEY);
  }, []);

  useEffect(() => {
    try {
      const saved = getCookieJSON(COOKIE_CONFIG.KEY);
      if (!saved) return;

      const { createdAt, reservedAtIso, orderId, itemsCart, displayReserved } = saved;
      if (!reservedAtIso) {
        clearSavedCookie();
        return;
      }

      const reserved = parseReservedFromSaved(reservedAtIso, createdAt);
      if (!reserved) {
        console.warn(
          "DEBUG: " + COOKIE_CONFIG.KEY + " has invalid reservedAtIso, deleting cookie:",
          reservedAtIso
        );
        clearSavedCookie();
        return;
      }

      if (isReservationExpired(reserved, new Date(), COOKIE_CONFIG.RESERVATION_VALID_DURATION_MS)) {
        console.log(
          "DEBUG: " + COOKIE_CONFIG.KEY + " expired (more than 1 hour since reserved). Deleting cookie."
        );
        clearSavedCookie();
        return;
      }

      console.log("DEBUG: " + COOKIE_CONFIG.KEY + " is still valid. Restoring state from cookie.");
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
      dispatch({ type: "GOTO", step: "paymentResult" });
    } catch (e) {
      console.warn("DEBUG: error while restoring cookie:", e);
    }
  }, [clearSavedCookie, dispatch, setPaymentState, setSelectedTime]);

  return { clearSavedCookie };
}