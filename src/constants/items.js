// 商品 ID・カート初期値をまとめるファイル。
//
// 商品ID(itemId)とドリンク種別ID(drinkId)は合成しない(旧: セットID+ドリンク
// オフセットでIDを合成するgetDrinkBreakdownId方式は廃止した)。カテゴリ別の
// 個数とドリンク種別ごとの合計数は、それぞれ別のフィールドとして持ち回す。
// どのカテゴリにどのドリンクを割り振るかの計算はバックエンドが行う
// (docs/backend-requirements.md 5番参照)。
export const PRODUCT_CATEGORIES = {
  // 商品
  PORK_SINGLE: 10,
  PORK_SINGLE_LARGE: 20,
  DRINK_SINGLE: 30,           // 単品ドリンク
  PORK_DRINK_SET: 40,         // 角煮ドリンクセット
  PORK_DRINK_SET_LARGE: 50,   // 角煮ドリンクセット大盛り

  // ドリンク種別
  COLA: 91,
  ORANGE: 92,
  CIDER: 93,
  OOLONG: 94,
};

// ===== ドリンク関連の便利な配列 =====
export const DRINK_TYPE_IDS = [91, 92, 93, 94];

// ===== 注文処理で使う ID 集合 =====
export const PRODUCT_CATEGORY_IDS = [10, 20, 30, 40, 50];

// 価格・商品名・画像はバックエンド(GET /api/items/get/allItems)から取得する。
// モック値・フォールバック値は src/constants/mocks/menuMock.js に集約している。

// ===== カート初期値（全 ID を 0 で初期化） =====
export const CART_INITIAL = {
  // 商品
  10: 0,
  20: 0,

  // セット/ドリンク
  30: 0,
  40: 0,
  50: 0,

  // ドリンク種別
  91: 0,
  92: 0,
  93: 0,
  94: 0,
};
