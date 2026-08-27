// 現在の画面状態に応じて各ページコンポーネントを切り替えて描画する補助コンポーネント。
import { Footer } from "./components/Footer";
import { TitlePage } from "./pages/TitlePage";
import { MenuPage } from "./pages/MenuPage";
import { DrinkPage } from "./pages/DrinkPage";
import { CartPage } from "./pages/CartPage";
import { TimePage } from "./pages/TimePage";
import { PaymentMethodPage } from "./pages/PaymentMethodPage";
import { PaymentPage } from "./pages/PaymentPage";
import { PaymentPayPayPage } from "./pages/PaymentPayPayPage";
import { PaymentResultPage } from "./pages/PaymentResultPage";
import { NumberTagPage } from "./pages/NumberTagPage";
import { shouldShowFooter } from "./constants/stepRules";

const renderPage = ({
  step,
  next,
  cart,
  addItems,
  removeItems,
  prices,
  itemNames,
  isSoldout,
  calculateDifferenceOfDrinks,
  selectedTime,
  setSelectedTime,
  currentTestTime,
  paymentState,
  setPaymentState,
  dispatch,
  onOpenLegalNotice,
  hasSavedOrder,
  onViewSavedOrder,
}) => {
  switch (step) {
    case "title":
      return (
        <TitlePage
          onStart={next}
          onOpenLegalNotice={onOpenLegalNotice}
          hasSavedOrder={hasSavedOrder}
          onViewSavedOrder={onViewSavedOrder}
        />
      );
    case "menu":
      return (
        <MenuPage
          prices={prices}
          itemNames={itemNames}
          cart={cart}
          addItems={addItems}
          removeItems={removeItems}
          isSoldout={isSoldout}
        />
      );
    case "drink":
      return (
        <DrinkPage
          itemNames={itemNames}
          cart={cart}
          addItems={addItems}
          removeItems={removeItems}
          difference={calculateDifferenceOfDrinks()}
          isSoldout={isSoldout}
        />
      );
    case "cart":
      return <CartPage cart={cart} price={prices} names={itemNames} />;
    case "time":
      return <TimePage onTimeChange={setSelectedTime} testTime={currentTestTime} />;
    case "paymentMethod":
      return <PaymentMethodPage dispatch={dispatch} onOpenLegalNotice={onOpenLegalNotice} />;
    case "payment":
      return <PaymentPage onOpenLegalNotice={onOpenLegalNotice} />;
    case "paymentPaypay":
      return (
        <PaymentPayPayPage
          dispatch={dispatch}
          setPaymentState={setPaymentState}
          selectedTime={selectedTime}
          cart={cart}
          onOpenLegalNotice={onOpenLegalNotice}
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
          cart={cart}
          price={prices}
          names={itemNames}
          paymentState={paymentState}
        />
      );
    default:
      return null;
  }
};

export const AppScreenRenderer = ({
// 現在の画面状態に応じて各ページコンポーネントを切り替えて描画する補助コンポーネント。
  step,
  next,
  prev,
  cart,
  addItems,
  removeItems,
  prices,
  itemNames,
  isSoldout,
  calculateDifferenceOfDrinks,
  calculateSumInMenu,
  calculateSumPrice,
  selectedTime,
  setSelectedTime,
  currentTestTime,
  paymentState,
  setPaymentState,
  dispatch,
  onOpenLegalNotice,
  hasSavedOrder,
  onViewSavedOrder,
}) => {
  return (
    <>
      {renderPage({
        step,
        next,
        cart,
        addItems,
        removeItems,
        prices,
        itemNames,
        isSoldout,
        calculateDifferenceOfDrinks,
        selectedTime,
        setSelectedTime,
        currentTestTime,
        paymentState,
        setPaymentState,
        dispatch,
        onOpenLegalNotice,
        hasSavedOrder,
        onViewSavedOrder,
      })}

      {shouldShowFooter(step) && (
        <footer>
          <Footer
            sumPrice={calculateSumPrice()}
            prev={prev}
            next={next}
            currentStep={step}
            testTime={currentTestTime}
            numOfChosenMenu={calculateSumInMenu()}
            difference={calculateDifferenceOfDrinks()}
          />
        </footer>
      )}
    </>
  );
};