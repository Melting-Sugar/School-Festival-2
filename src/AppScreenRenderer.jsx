// 現在の画面状態に応じて各ページコンポーネントを切り替えて描画する補助コンポーネント。
import { Footer } from "./components/Footer";
import { TitlePage } from "./pages/TitlePage";
import { MenuPage } from "./pages/MenuPage";
import { DrinkPage } from "./pages/DrinkPage";
import { CartPage } from "./pages/CartPage";
import { TimePage } from "./pages/TimePage";
import { PaymentPage } from "./pages/PaymentPage";
import { PaymentResultPage } from "./pages/PaymentResultPage";
import { NumberTagPage } from "./pages/NumberTagPage";

const shouldShowFooter = (step) => {
  return (
    step !== "payment" &&
    step !== "paymentResult" &&
    step !== "complete" &&
    step !== "title" &&
    step !== "numberTag"
  );
};

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
  handleSubmitOrderFlow,
  dispatch,
}) => {
  switch (step) {
    case "title":
      return <TitlePage onStart={next} />;
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
  handleSubmitOrderFlow,
  dispatch,
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
        handleSubmitOrderFlow,
        dispatch,
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