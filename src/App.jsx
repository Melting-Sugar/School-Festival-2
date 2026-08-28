// アプリ全体の画面遷移と共通レイアウトをまとめるルートコンポーネント。
import "./styles.css";
import { useRef, useState } from "react";

import { Header } from "./components/Header";
import { useAppFlow } from "./hooks/useAppFlow";
import { useOrderSummary } from "./hooks/useOrderSummary";
import { useSoldout } from "./hooks/useSoldout";
import { useOrderSnapshotRestore } from "./hooks/useOrderSnapshotRestore";
import { AppScreenRenderer } from "./AppScreenRenderer";
import { LegalNoticePage } from "./pages/LegalNoticePage";
import { PRICES, ITEM_NAMES } from "./constants/items";
import { INITIAL_PAYMENT_STATE } from "./constants/initialState";
import { USE_TEST_TIME, TEST_DATE } from "./constants/config";

const prices = PRICES;
const itemNames = ITEM_NAMES;

export const App = () => {
  const appStartTimeRef = useRef(Date.now());
  const [isLegalNoticeOpen, setIsLegalNoticeOpen] = useState(false);

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
  const [paymentState, setPaymentState] = useState(INITIAL_PAYMENT_STATE);
  const { hasSavedOrder, viewSavedOrder } = useOrderSnapshotRestore({
    dispatch,
    setPaymentState,
    setSelectedTime,
  });

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
        dispatch={dispatch}
        onOpenLegalNotice={() => setIsLegalNoticeOpen(true)}
        hasSavedOrder={hasSavedOrder}
        onViewSavedOrder={viewSavedOrder}
      />

      {isLegalNoticeOpen && (
        <LegalNoticePage onClose={() => setIsLegalNoticeOpen(false)} />
      )}
    </>
  );
};
