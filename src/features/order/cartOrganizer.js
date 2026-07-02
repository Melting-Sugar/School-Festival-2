import {
  PRODUCT_CATEGORIES,
  DRINK_TYPE_IDS,
  DRINK_SUBITEM_IDS,
} from "../../constants/items";

// カート内のドリンク数量をセット内訳へ振り分ける注文整形ロジック。
export function organizeCart(cart) {
  const newCart = { ...cart };
  let sumM = newCart[PRODUCT_CATEGORIES.PORK_DRINK_SET] || 0;
  let sumL = newCart[PRODUCT_CATEGORIES.PORK_DRINK_SET_LARGE] || 0;

  for (const breakdownId of DRINK_SUBITEM_IDS) {
    newCart[breakdownId] = 0;
  }

  for (const drinkTypeId of DRINK_TYPE_IDS) {
    const drinkNo = drinkTypeId % 10;
    let qty = newCart[drinkTypeId] || 0;

    const takeM = Math.min(qty, sumM);
    if (takeM > 0) {
      const target = PRODUCT_CATEGORIES.PORK_DRINK_SET + drinkNo;
      newCart[target] = (newCart[target] || 0) + takeM;
      sumM -= takeM;
      qty -= takeM;
    }

    const takeL = Math.min(qty, sumL);
    if (takeL > 0) {
      const target = PRODUCT_CATEGORIES.PORK_DRINK_SET_LARGE + drinkNo;
      newCart[target] = (newCart[target] || 0) + takeL;
      sumL -= takeL;
      qty -= takeL;
    }

    if (qty > 0) {
      const target = PRODUCT_CATEGORIES.DRINK_SINGLE + drinkNo;
      newCart[target] = (newCart[target] || 0) + qty;
    }
  }

  return newCart;
}