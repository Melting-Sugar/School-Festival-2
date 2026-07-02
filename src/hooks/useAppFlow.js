import { useCallback, useReducer, useState } from "react";

import { INITIAL_APP_STATE, INITIAL_UI_STATE } from "../constants/initialState";
import {
  PRODUCT_CATEGORIES,
  DRINK_TYPE_IDS,
  DRINK_SUBITEM_IDS,
} from "../constants/items";
import { STEPS_ARRAY } from "../constants/steps";

const steps = STEPS_ARRAY;

export const screenState = (state, action) => {
  switch (action.type) {
    case "GOTO":
      if (!steps.includes(action.step)) return state;
      return { ...state, step: action.step };
    case "NEXT": {
      const currentIndex = steps.indexOf(state.step);
      if (currentIndex === -1) return state;
      if (currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1];
        return { ...state, step: nextStep };
      }
      return state;
    }
    case "PREV": {
      const currentIndex = steps.indexOf(state.step);
      if (currentIndex === -1) return state;
      if (currentIndex > 0) {
        const prevStep = steps[currentIndex - 1];
        return { ...state, step: prevStep };
      }
      return state;
    }
    case "ADD_ITEM": {
      const { itemId } = action;
      const currentCount = state.cart[itemId] || 0;
      return {
        ...state,
        cart: {
          ...state.cart,
          [itemId]: currentCount + 1,
        },
      };
    }
    case "REMOVE_ITEM": {
      const { itemId } = action;
      const currentCount = state.cart[itemId] || 0;
      if (currentCount > 0) {
        return {
          ...state,
          cart: {
            ...state.cart,
            [itemId]: currentCount - 1,
          },
        };
      }
      return state;
    }
    case "ADD_DRINK": {
      const { itemId } = action;
      const currentCount = state.cart[itemId] || 0;
      return {
        ...state,
        cart: {
          ...state.cart,
          [itemId]: currentCount + 1,
        },
      };
    }
    case "REMOVE_DRINK": {
      const { itemId } = action;
      const currentCount = state.cart[itemId] || 0;
      if (currentCount > 0) {
        return {
          ...state,
          cart: {
            ...state.cart,
            [itemId]: currentCount - 1,
          },
        };
      }
      return state;
    }
    case "CLEAR_TEMPORARY_DRINKS": {
      const newCart = { ...state.cart };
      for (const drinkId of DRINK_TYPE_IDS) {
        newCart[drinkId] = 0;
      }
      return { ...state, cart: newCart };
    }
    case "DELETE_TEMPORARY": {
      const newCart = { ...state.cart };
      for (const itemId of [
        PRODUCT_CATEGORIES.DRINK_SINGLE,
        PRODUCT_CATEGORIES.PORK_DRINK_SET,
        PRODUCT_CATEGORIES.PORK_DRINK_SET_LARGE,
      ]) {
        newCart[itemId] = 0;
      }
      return { ...state, cart: newCart };
    }
    case "ORGANIZE_CART": {
      const cart = state.cart;
      const newCart = { ...cart };
      let sumM = newCart[PRODUCT_CATEGORIES.PORK_DRINK_SET] || 0;
      let sumL = newCart[PRODUCT_CATEGORIES.PORK_DRINK_SET_LARGE] || 0;
      for (const breakdownId of DRINK_SUBITEM_IDS) newCart[breakdownId] = 0;

      for (const d of DRINK_TYPE_IDS) {
        const drinkNo = d % 10;
        let qty = newCart[d] || 0;
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
          qty = 0;
        }
      }
      return { ...state, cart: newCart };
    }
    case "REPLACE_CART": {
      return { ...state, cart: { ...state.cart, ...action.cart } };
    }
    default:
      return state;
  }
};

export function useAppFlow() {
  const [state, dispatch] = useReducer(screenState, INITIAL_APP_STATE);
  const [selectedTime, setSelectedTime] = useState(INITIAL_UI_STATE.selectedTime);

  const goto = useCallback((step) => {
    dispatch({ type: "GOTO", step });
  }, []);

  const next = useCallback(() => {
    if (state.step === "menu") {
      const menuCount =
        (state.cart[PRODUCT_CATEGORIES.DRINK_SINGLE] || 0) +
        (state.cart[PRODUCT_CATEGORIES.PORK_DRINK_SET] || 0) +
        (state.cart[PRODUCT_CATEGORIES.PORK_DRINK_SET_LARGE] || 0);
      if (menuCount === 0) {
        dispatch({ type: "GOTO", step: "cart" });
        return;
      }
    } else if (state.step === "drink") {
      dispatch({ type: "ORGANIZE_CART" });
      dispatch({ type: "NEXT" });
      return;
    }
    dispatch({ type: "NEXT" });
  }, [state.step, state.cart]);

  const prev = useCallback(() => {
    if (state.step === "cart") {
      dispatch({ type: "CLEAR_TEMPORARY_DRINKS" });
      dispatch({ type: "GOTO", step: "menu" });
      return;
    }
    dispatch({ type: "PREV" });
  }, [state.step]);

  const addItems = useCallback((itemId) => {
    dispatch({ type: "ADD_ITEM", itemId });
  }, []);

  const removeItems = useCallback((itemId) => {
    dispatch({ type: "REMOVE_ITEM", itemId });
  }, []);

  return {
    state,
    dispatch,
    goto,
    next,
    prev,
    addItems,
    removeItems,
    selectedTime,
    setSelectedTime,
  };
}