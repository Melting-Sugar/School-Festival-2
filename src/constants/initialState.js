//初期状態の定義

import { STEPS, STEPS_ARRAY } from "./steps";
import { CART_INITIAL } from "./items";

export const INITIAL_APP_STATE = {
  step: STEPS.TITLE,
  cart: CART_INITIAL,
};

export const INITIAL_PAYMENT_STATE = {
  phase: "connecting",
  outcome: {
    ok: false,
    orderId: null,
    error: null,
    receiptUrl: null,
    displayReserved: null,
  },
  orderId: null,
  createdAtIso: null,
  billingInfo: {
    familyName: "",
    givenName: "",
    email: "",
  },
  cardAttached: false,
  isSubmitting: false,
};

export const INITIAL_UI_STATE = {
  selectedTime: null,
  isSoldout: {
    10: false, 20: false, 30: false, 40: false, 50: false,
    91: false, 92: false, 93: false, 94: false,
  },
};