import { useCallback } from "react";

import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_IDS, DRINK_TYPE_IDS } from "../constants/items";

export function useOrderSummary(cart, prices) {
  const calculateNumberOfDrinksInMenu = useCallback(() => {
    return (
      (cart[PRODUCT_CATEGORIES.DRINK_SINGLE] || 0) +
      (cart[PRODUCT_CATEGORIES.PORK_DRINK_SET] || 0) +
      (cart[PRODUCT_CATEGORIES.PORK_DRINK_SET_LARGE] || 0)
    );
  }, [cart]);

  const calculateNumberOfDrinksInDrink = useCallback(() => {
    return DRINK_TYPE_IDS.reduce((sum, id) => sum + (cart[id] || 0), 0);
  }, [cart]);

  const calculateDifferenceOfDrinks = useCallback(() => {
    return calculateNumberOfDrinksInMenu() - calculateNumberOfDrinksInDrink();
  }, [calculateNumberOfDrinksInMenu, calculateNumberOfDrinksInDrink]);

  const calculateSumInMenu = useCallback(() => {
    return PRODUCT_CATEGORY_IDS.reduce((sum, itemId) => sum + (cart[itemId] || 0), 0);
  }, [cart]);

  const calculateSumPrice = useCallback(() => {
    return PRODUCT_CATEGORY_IDS.reduce(
      (sum, itemId) => sum + (prices[itemId] || 0) * (cart[itemId] || 0),
      0
    );
  }, [cart, prices]);

  return {
    calculateNumberOfDrinksInMenu,
    calculateNumberOfDrinksInDrink,
    calculateDifferenceOfDrinks,
    calculateSumInMenu,
    calculateSumPrice,
  };
}