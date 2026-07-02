// メニュー画面から次へ進めるかどうかの判定をまとめるロジック。
import { PRODUCT_CATEGORIES } from "../../constants/items";

export function canProceedFromMenu(cart) {
  const menuCount =
    (cart[PRODUCT_CATEGORIES.DRINK_SINGLE] || 0) +
    (cart[PRODUCT_CATEGORIES.PORK_DRINK_SET] || 0) +
    (cart[PRODUCT_CATEGORIES.PORK_DRINK_SET_LARGE] || 0);

  return menuCount > 0;
}
