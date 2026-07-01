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
export const DRINK_TYPE_NAMES = {
  91: "コーラ",
  92: "なっちゃんオレンジ",
  93: "三ツ矢サイダー",
  94: "烏龍茶",
};

// ===== セット内訳 ID（バックエンドへも送信） =====
// これらはセット購入時、ドリンク選択を記録するための ID
export const SET_DRINK_SUBITEM_MAP = {
  // ID 30 (単品ドリンク) の内訳
  SINGLE_COLA: 31,
  SINGLE_ORANGE: 32,
  SINGLE_CIDER: 33,
  SINGLE_OOLONG: 34,
  
  // ID 40 (セット) の内訳
  SET_COLA: 41,
  SET_ORANGE: 42,
  SET_CIDER: 43,
  SET_OOLONG: 44,
  
  // ID 50 (セット大盛り) の内訳
  SET_LARGE_COLA: 51,
  SET_LARGE_ORANGE: 52,
  SET_LARGE_CIDER: 53,
  SET_LARGE_OOLONG: 54,
};

// ===== 内訳 ID の範囲（Order.jsx の判定ロジックで使用） =====
export const SINGLE_DRINK_ID_START = 31;
export const SINGLE_DRINK_ID_END = 34;

export const SET_DRINK_ID_START = 41;
export const SET_DRINK_ID_END = 44;

export const SET_LARGE_DRINK_ID_START = 51;
export const SET_LARGE_DRINK_ID_END = 54;

// ===== 注文処理で使う ID 集合 =====
export const PRODUCT_CATEGORY_IDS = [10, 20, 30, 40, 50];
export const DRINK_SUBITEM_IDS = [31, 32, 33, 34, 41, 42, 43, 44, 51, 52, 53, 54];
export const ORDER_ALLOWED_IDS = [...PRODUCT_CATEGORY_IDS, ...DRINK_SUBITEM_IDS];
export const ORDER_DISPLAY_SEQUENCE = [
  PRODUCT_CATEGORIES.PORK_SINGLE,
  PRODUCT_CATEGORIES.PORK_SINGLE_LARGE,
  PRODUCT_CATEGORIES.PORK_DRINK_SET,
  SET_DRINK_SUBITEM_MAP.SET_COLA,
  SET_DRINK_SUBITEM_MAP.SET_ORANGE,
  SET_DRINK_SUBITEM_MAP.SET_CIDER,
  SET_DRINK_SUBITEM_MAP.SET_OOLONG,
  PRODUCT_CATEGORIES.PORK_DRINK_SET_LARGE,
  SET_DRINK_SUBITEM_MAP.SET_LARGE_COLA,
  SET_DRINK_SUBITEM_MAP.SET_LARGE_ORANGE,
  SET_DRINK_SUBITEM_MAP.SET_LARGE_CIDER,
  SET_DRINK_SUBITEM_MAP.SET_LARGE_OOLONG,
  PRODUCT_CATEGORIES.DRINK_SINGLE,
  SET_DRINK_SUBITEM_MAP.SINGLE_COLA,
  SET_DRINK_SUBITEM_MAP.SINGLE_ORANGE,
  SET_DRINK_SUBITEM_MAP.SINGLE_CIDER,
  SET_DRINK_SUBITEM_MAP.SINGLE_OOLONG,
];

// ===== ドリンク種別 ID 計算用 =====
export const DRINK_TYPE_BASE = 90;   // ドリンク種別 ID の基数 (90 + index)
export const DRINK_TYPE_MOD = 10;    // index 抽出用 (id % 10)

// ===== 価格 =====
export const PRICES = {
  10: 470,   // PORK_SINGLE
  20: 670,   // PORK_LARGE
  30: 150,   // DRINK_SINGLE
  40: 570,   // PORK_DRINK_SET
  50: 770,   // PORK_DRINK_SET_LARGE
};

// ===== 商品名 =====
export const ITEM_NAMES = {
  10: "角煮 単品",
  20: "角煮大盛り 単品",
  30: "ドリンク 単品",
  40: "【お得】角煮ドリンクセット",
  50: "【お得】角煮ドリンクセット大盛り",
  91: "コーラ",
  92: "なっちゃんオレンジ",
  93: "三ツ矢サイダー",
  94: "烏龍茶",
};

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
  
  // セット内訳
  31: 0, 32: 0, 33: 0, 34: 0,
  41: 0, 42: 0, 43: 0, 44: 0,
  51: 0, 52: 0, 53: 0, 54: 0,
};

// ===== ヘルパー関数 =====

/** ドリンク ID (91-94) からセット内訳 ID に変換 */
export const getDrinkBreakdownId = (drinkTypeId, setTypeId) => {
  // setTypeId: 30 → 31-34, 40 → 41-44, 50 → 51-54
  // drinkTypeId: 91 → +1, 92 → +2, 93 → +3, 94 → +4
  const drinkIndex = drinkTypeId - 90;
  const baseId = setTypeId + drinkIndex;
  return baseId;
};

/**
 * セット内訳 ID から、親セット ID とドリンク ID を逆算
 * 例: 41 → { setId: 40, drinkId: 91 }
 */
export const parseSetBreakdownId = (breakdownId) => {
  const first = Math.floor(breakdownId / 10) * 10;  // 十の位を取得
  const drinkOffset = breakdownId % 10;             // 一の位を取得
  
  let setId = null;
  if (first === 30) setId = 30;
  else if (first === 40) setId = 40;
  else if (first === 50) setId = 50;
  
  if (!setId) return null;
  
  const drinkId = 90 + drinkOffset;
  return { setId, drinkId };
};

export const isSetItemBreakdownId = (id) => {
  return (
    (id >= SINGLE_DRINK_ID_START && id <= SINGLE_DRINK_ID_END) ||
    (id >= SET_DRINK_ID_START && id <= SET_DRINK_ID_END) ||
    (id >= SET_LARGE_DRINK_ID_START && id <= SET_LARGE_DRINK_ID_END)
  );
};