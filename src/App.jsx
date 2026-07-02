import "./styles.css";
import { useRef } from "react";

import { Header } from "./components/Header";
import { useAppFlow } from "./hooks/useAppFlow";
import { useOrderSummary } from "./hooks/useOrderSummary";
import { useSoldout } from "./hooks/useSoldout";
import { useCookieRestore } from "./hooks/useCookieRestore";
import { usePaymentFlow } from "./hooks/usePaymentFlow";
import { AppScreenRenderer } from "./AppScreenRenderer";
import { PRICES, ITEM_NAMES } from "./constants/items";
import { USE_TEST_TIME, TEST_DATE } from "./constants/config";

const prices = PRICES;
const itemNames = ITEM_NAMES;

export const App = () => {
  const appStartTimeRef = useRef(Date.now());

  const currentTestTime = USE_TEST_TIME
    ? new Date(TEST_DATE.getTime() + (Date.now() - appStartTimeRef.current))
    : false;

  const {
    state,
    dispatch,
    next,
    prev,
    addItems,
    removeItems,
    selectedTime,
    setSelectedTime,
  } = useAppFlow();
  const {
    calculateDifferenceOfDrinks,
    calculateSumInMenu,
    calculateSumPrice,
  } = useOrderSummary(state.cart, prices);
  const { isSoldout } = useSoldout(state.step);
  const { paymentState, setPaymentState, handleSubmitOrderFlow } = usePaymentFlow({
    step: state.step,
    cart: state.cart,
    selectedTime,
    dispatch,
    calculateSumPrice,
  });
  useCookieRestore({ dispatch, setPaymentState, setSelectedTime });

  return (
    <>
      <style>{`\n        @keyframes cm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }\n      `}</style>

      <header>
        <Header />
        <div style={{ minHeight: "10px" }}></div>
      </header>

      <AppScreenRenderer
        step={state.step}
        next={next}
        prev={prev}
        cart={state.cart}
        addItems={addItems}
        removeItems={removeItems}
        prices={prices}
        itemNames={itemNames}
        isSoldout={isSoldout}
        calculateDifferenceOfDrinks={calculateDifferenceOfDrinks}
        calculateSumInMenu={calculateSumInMenu}
        calculateSumPrice={calculateSumPrice}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        currentTestTime={currentTestTime}
        paymentState={paymentState}
        setPaymentState={setPaymentState}
        handleSubmitOrderFlow={handleSubmitOrderFlow}
        dispatch={dispatch}
      />
    </>
  );
};
