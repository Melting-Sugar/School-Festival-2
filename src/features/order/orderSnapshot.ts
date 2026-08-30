// 注文内容をlocalStorageに保存し、復元や期限判定を行うロジック。
import type { Cart, OrderSnapshot } from "../../types";

export function buildOrderSnapshot({
  createdAtIso,
  reservedAtIso,
  orderId,
  itemsCart,
  displayReserved,
}: {
  createdAtIso: string;
  reservedAtIso: string;
  orderId: string | number | null;
  itemsCart: Cart;
  displayReserved: string | null;
}): OrderSnapshot {
  return {
    createdAt: createdAtIso,
    reservedAtIso,
    orderId,
    itemsCart,
    displayReserved,
  };
}

export function clearOrderSnapshot(
  removeItem: (key: string) => void,
  storageKey: string
): void {
  removeItem(storageKey);
}

export function parseReservedFromSaved(
  savedReserved: string | null | undefined,
  savedCreatedAt: string | null | undefined
): Date | null {
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

export function isReservationExpired(
  reservedDate: Date,
  now: Date,
  validDurationMs: number
): boolean {
  return now.getTime() - reservedDate.getTime() > validDurationMs;
}
