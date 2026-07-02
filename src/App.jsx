import "./styles.css";
import { useRef, useState } from "react";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { useAppFlow } from "./hooks/useAppFlow";
import { useOrderSummary } from "./hooks/useOrderSummary";
import { useSoldout } from "./hooks/useSoldout";
import { useCookieRestore } from "./hooks/useCookieRestore";
import { usePaymentFlow } from "./hooks/usePaymentFlow";
import { TitlePage } from "./pages/TitlePage";
import { MenuPage } from "./pages/MenuPage";
import { DrinkPage } from "./pages/DrinkPage";
import { CartPage } from "./pages/CartPage";
import { TimePage } from "./pages/TimePage";
import { PaymentPage } from "./pages/PaymentPage";
import { PaymentResultPage } from "./pages/PaymentResultPage";
import { NumberTagPage } from "./pages/NumberTagPage";
import { PRICES, ITEM_NAMES } from "./constants/items";
import { USE_TEST_TIME, TEST_DATE } from "./constants/config";
import { INITIAL_UI_STATE, INITIAL_PAYMENT_STATE } from "./constants/initialState";

const prices = PRICES;
const itemNames = ITEM_NAMES;

export const App = () => {
  const appStartTimeRef = useRef(Date.now());
  const [selectedTime, setSelectedTime] = useState(INITIAL_UI_STATE.selectedTime);
  const [paymentState, setPaymentState] = useState(INITIAL_PAYMENT_STATE);

  const currentTestTime = USE_TEST_TIME
    ? new Date(TEST_DATE.getTime() + (Date.now() - appStartTimeRef.current))
    : false;

  const { state, dispatch, next, prev, addItems, removeItems } = useAppFlow();
  const {
    calculateDifferenceOfDrinks,
    calculateSumInMenu,
    calculateSumPrice,
  } = useOrderSummary(state.cart, prices);
  const { isSoldout } = useSoldout(state.step);
  useCookieRestore({ dispatch, setPaymentState, setSelectedTime });
  const { handleSubmitOrderFlow } = usePaymentFlow({
    step: state.step,
    cart: state.cart,
    selectedTime,
    paymentState,
    setPaymentState,
    dispatch,
    calculateSumPrice,
  });

  const renderPage = () => {
    switch (state.step) {
      case "title":
        return <TitlePage onStart={next} />;
      case "menu":
        return (
          <MenuPage
            prices={prices}
            itemNames={itemNames}
            cart={state.cart}
            addItems={addItems}
            removeItems={removeItems}
            isSoldout={isSoldout}
          />
        );
      case "drink":
        return (
          <DrinkPage
            itemNames={itemNames}
            cart={state.cart}
            addItems={addItems}
            removeItems={removeItems}
            difference={calculateDifferenceOfDrinks()}
            isSoldout={isSoldout}
          />
        );
      case "cart":
        return <CartPage cart={state.cart} price={prices} names={itemNames} />;
      case "time":
        return <TimePage onTimeChange={setSelectedTime} testTime={currentTestTime} />;
      case "payment":
        return (
          <PaymentPage
            paymentState={paymentState}
            setPaymentState={setPaymentState}
            handleSubmitOrderFlow={handleSubmitOrderFlow}
          />
        );
      case "paymentResult":
        return (
          <PaymentResultPage
            paymentState={paymentState}
            selectedTime={selectedTime}
            setPaymentState={setPaymentState}
            dispatch={dispatch}
          />
        );
      case "numberTag":
        return (
          <NumberTagPage
            cart={state.cart}
            price={prices}
            names={itemNames}
            paymentState={paymentState}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`\n        @keyframes cm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }\n      `}</style>

      <header>
        <Header />
        <div style={{ minHeight: "10px" }}></div>
      </header>

      {renderPage()}

      {state.step !== "payment" &&
        state.step !== "paymentResult" &&
        state.step !== "complete" &&
        state.step !== "title" &&
        state.step !== "numberTag" && (
          <footer>
            <Footer
              sumPrice={calculateSumPrice()}
              prev={prev}
              next={next}
              currentStep={state.step}
              testTime={currentTestTime}
              numOfChosenMenu={calculateSumInMenu()}
              difference={calculateDifferenceOfDrinks()}
            />
          </footer>
        )}
    </>
  );
};
