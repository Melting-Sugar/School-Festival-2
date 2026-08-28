// 画面ごとのフッター表示、ボタン文言、遷移制御の条件をまとめる定義ファイル。
import { STEPS } from "./steps";

const FOOTER_STEPS = new Set([
  STEPS.MENU,
  STEPS.DRINK,
  STEPS.CART,
  STEPS.TIME,
]);

export const STEP_RULES = {
  [STEPS.TITLE]: {
    showFooter: false,
  },
  [STEPS.MENU]: {
    showFooter: true,
    nextDisabled: ({ numOfChosenMenu }) => numOfChosenMenu === 0,
  },
  [STEPS.DRINK]: {
    showFooter: true,
    nextDisabled: ({ difference }) => difference !== 0,
  },
  [STEPS.CART]: {
    showFooter: true,
  },
  [STEPS.TIME]: {
    showFooter: true,
    actionLabel: "注文確定",
    nextDisabled: ({ now }) => {
      const afterLastOrder =
        now.getHours() > 17 ||
        (now.getHours() === 17 && now.getMinutes() >= 10);
      return afterLastOrder;
    },
  },
  [STEPS.PAYMENT_METHOD]: {
    showFooter: false,
  },
  [STEPS.PAYMENT]: {
    showFooter: false,
  },
  [STEPS.PAYMENT_PAYPAY]: {
    showFooter: false,
  },
  [STEPS.PAYMENT_RESULT]: {
    showFooter: false,
  },
  [STEPS.NUMBER_TAG]: {
    showFooter: false,
  },
};

export const shouldShowFooter = (step) => FOOTER_STEPS.has(step);

export const getStepRule = (step) => STEP_RULES[step] || { showFooter: false };

export const getFooterActionLabel = (step) => getStepRule(step).actionLabel || "次へ";

export const isFooterNextDisabled = (step, context) => {
  const rule = getStepRule(step);
  if (typeof rule.nextDisabled !== "function") {
    return false;
  }

  return rule.nextDisabled(context);
};
