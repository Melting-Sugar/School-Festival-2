// クレジットカード決済画面。useCardPaymentFlowフックが送信・結果更新を担う。
import { useCardPaymentFlow } from "../hooks/useCardPaymentFlow";

export const PaymentPage = ({
  dispatch,
  setPaymentState,
  selectedTime,
  cart,
  onOpenLegalNotice,
}) => {
  const { handlePayWithCard, submitting } = useCardPaymentFlow({
    cart,
    selectedTime,
    dispatch,
    setPaymentState,
  });

  return (
    <div style={{ padding: "12px 10px" }}>
      <p style={{ margin: "6px 10px" }}>クレジットカードでのお支払い</p>

      <button
        style={{ ...payBtnStyle, opacity: submitting ? 0.5 : 1 }}
        onClick={handlePayWithCard}
        disabled={submitting}
      >
        {submitting ? "処理中..." : "クレジットカード決済ページへ進む"}
      </button>

      <p style={{ color: "#808080" }}>この決済は外部決済サービス「Paysys」によって行われます</p>
      <p style={{ color: "#808080" }}>決済には数秒〜数十秒ほど時間がかかる場合があります。</p>

      <p style={{ textAlign: "center", marginTop: "16px" }}>
        <button style={legalLinkStyle} onClick={onOpenLegalNotice}>
          特定商取引法に基づく表示
        </button>
      </p>
    </div>
  );
};

const payBtnStyle = {
  display: "block",
  width: "100%",
  height: "56px",
  fontSize: "18px",
  fontWeight: "bold",
  borderRadius: "8px",
  border: "2px solid #222",
  backgroundColor: "#fff",
  margin: "12px 0",
  cursor: "pointer",
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
