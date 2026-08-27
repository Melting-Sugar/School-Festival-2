// Square 決済の入力画面を組み立てるページコンポーネント。
import { PaymentBillingFields } from "../components/PaymentBillingFields";
import { PaymentActionButton } from "../components/PaymentActionButton";

export const PaymentPage = ({ paymentState, setPaymentState, handleSubmitOrderFlow, onOpenLegalNotice }) => {
  return (
    <>
      {true && (
        <p style={{ marginLeft: "10px" }}>外部決済サービスに接続中...</p>
      )}
      {true && (
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

          <p style={{ textAlign: "center", marginTop: "16px" }}>
            <button style={legalLinkStyle} onClick={onOpenLegalNotice}>
              特定商取引法に基づく表示
            </button>
          </p>
        </div>
      )}
    </>
  );
};

const legalLinkStyle = {
  background: "none",
  border: "none",
  color: "#0066cc",
  textDecoration: "underline",
  fontSize: "14px",
  cursor: "pointer",
  padding: 0,
};
