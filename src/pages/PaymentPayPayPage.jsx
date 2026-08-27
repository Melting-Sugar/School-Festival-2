// PayPay 決済のモック画面。実際のPayPay連携は行わず、押下でダミーの決済結果へ遷移する。
import { formatDisplayReserved } from "../utils/dateFormat";
import { parseReservedToDate } from "../utils/orderUtils";

export const PaymentPayPayPage = ({ dispatch, setPaymentState, selectedTime, onOpenLegalNotice }) => {
  const handlePayWithPayPay = () => {
    const reservedDate = parseReservedToDate(selectedTime);
    setPaymentState((prev) => ({
      ...prev,
      outcome: {
        ok: true,
        orderId: "PAYPAY-MOCK-ORDER",
        error: null,
        receiptUrl: null,
        displayReserved: reservedDate ? formatDisplayReserved(reservedDate) : null,
      },
    }));
    dispatch({ type: "GOTO", step: "paymentResult" });
  };

  return (
    <div style={{ padding: "12px 10px" }}>
      <p style={{ margin: "6px 10px" }}>PayPayでのお支払い</p>

      <button style={payBtnStyle} onClick={handlePayWithPayPay}>
        PayPayで支払う
      </button>

      <p style={{ color: "#808080" }}>この決済は外部決済サービス「PayPay」によって行われます</p>
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
  backgroundColor: "#ffe6a8",
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
