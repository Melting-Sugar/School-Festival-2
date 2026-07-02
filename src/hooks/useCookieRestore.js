import { useCallback, useEffect } from "react";

import { COOKIE_CONFIG } from "../constants/config";
import { deleteCookie, getCookieJSON } from "../utils/cookies";
import { formatDisplayReserved } from "../utils/dateFormat";

function parseReservedFromSaved(savedReserved, savedCreatedAt) {
  if (!savedReserved) return null;
  const byIso = new Date(savedReserved);
  if (!isNaN(byIso.getTime())) return byIso;

  const hhmm = String(savedReserved).trim();
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    const base = savedCreatedAt ? new Date(savedCreatedAt) : new Date();
    const hours = parseInt(m[1], 10);
    const minutes = parseInt(m[2], 10);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      const r = new Date(base);
      r.setHours(hours, minutes, 0, 0);
      return r;
    }
  }
  return null;
}

export function useCookieRestore({ dispatch, setPaymentState, setSelectedTime }) {
  const clearSavedCookie = useCallback(() => {
    deleteCookie(COOKIE_CONFIG.KEY);
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

      const now = new Date();
      const msSinceReserved = now.getTime() - reserved.getTime();
      if (msSinceReserved > COOKIE_CONFIG.RESERVATION_VALID_DURATION_MS) {
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