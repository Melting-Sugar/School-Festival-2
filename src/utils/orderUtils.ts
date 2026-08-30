// 注文アイテムの整形、予約時刻変換、表示用フォーマットを扱うユーティリティ。
import { PRODUCT_CATEGORY_IDS, DRINK_TYPE_IDS } from "../constants/items";
import type { Cart, OrderItemsPayload } from "../types";

// バックエンドへ送る注文データを組み立てる。
// 商品ID(itemId)とドリンク種別ID(drinkId)は合成しない(docs/backend-requirements.md
// 5番参照)。items はカテゴリ別の生の数量、drinkCounts はドリンク種別ごとの
// 合計数(どのカテゴリに属するかは紐付けない生データ)。割り振り計算はバックエンドが行う。
export const buildOrderItems = (cart: Cart): OrderItemsPayload => {
  const items = PRODUCT_CATEGORY_IDS.map((itemId) => ({
    itemId,
    quantity: Number(cart[itemId]) || 0,
  })).filter(({ quantity }) => quantity > 0);

  const drinkCounts: Record<number, number> = {};
  for (const drinkId of DRINK_TYPE_IDS) {
    const quantity = Number(cart[drinkId]) || 0;
    if (quantity > 0) {
      drinkCounts[drinkId] = quantity;
    }
  }

  return { items, drinkCounts };
};

/** Date → "HH:mm"（予約なしは null） */
export const formatReservedTimeHHmm = (
  dateOrNull: Date | string | null | undefined
): string | null => {
  if (!dateOrNull) return null;
  const d = new Date(dateOrNull);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** "HH:mm" or ISO文字列 → Date（当日扱い/ISOはそのまま） */
export const parseReservedToDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  // ISOなら new Date() が解釈
  if (value.includes("T") || value.includes("-")) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  // "HH:mm" を今日の日付として扱う
  const [hh, mm] = value.split(":").map((v) => Number(v));
  if (isNaN(hh) || isNaN(mm)) return null;
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0, 0);
  return d;
};
