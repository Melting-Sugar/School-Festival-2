// 注文内容を Cookie に保存し、復元や期限判定を行うロジック。
export function buildOrderSnapshot({
  createdAtIso,
  reservedAtIso,
  orderId,
  itemsCart,
  displayReserved,
}) {
  return {
    createdAt: createdAtIso,
    reservedAtIso,
    orderId,
    itemsCart,
    displayReserved,
  };
}

export function clearOrderSnapshot(deleteCookie, cookieKey) {
  deleteCookie(cookieKey);
}

export function parseReservedFromSaved(savedReserved, savedCreatedAt) {
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
      const reserved = new Date(base);
      reserved.setHours(hours, minutes, 0, 0);
      return reserved;
    }
  }

  return null;
}

export function isReservationExpired(reservedDate, now, validDurationMs) {
  return now.getTime() - reservedDate.getTime() > validDurationMs;
}