// Square 決済の入力画面を組み立てるページコンポーネント。
import { PaymentBillingFields } from "../components/PaymentBillingFields";
import { PaymentActionButton } from "../components/PaymentActionButton";

export const PaymentPage = ({ paymentState, setPaymentState, handleSubmitOrderFlow }) => {
  return (
    <>
      {paymentState.phase === "connecting" && (
        <p style={{ marginLeft: "10px" }}>外部決済サービスに接続中...</p>
      )}
      {paymentState.phase === "input" && (
        <div style={{ padding: "12px 10px" }}>
          <p style={{ margin: "6px 10px" }}>カード情報の入力</p>

          <PaymentBillingFields paymentState={paymentState} setPaymentState={setPaymentState} />

          <div id="card-container" style={{ margin: "12px 10px" }} />

          <PaymentActionButton
            paymentState={paymentState}
            setPaymentState={setPaymentState}
            handleSubmitOrderFlow={handleSubmitOrderFlow}
          />

          <p style={{ color: "#808080" }}>この決済は外部決済サービス「Square」によって行われます</p>
          <p style={{ color: "#808080" }}>決済には数秒〜数十秒ほど時間がかかる場合があります。</p>
        </div>
      )}
    </>
  );
};
