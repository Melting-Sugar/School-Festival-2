// 決済開始や送信を行うボタンを表示するコンポーネント。
export const PaymentActionButton = ({ paymentState, setPaymentState, handleSubmitOrderFlow }) => {
  const baseBtnStyle = {
    marginLeft: 10,
    width: 160,
    height: 32,
    fontSize: 14,
    borderRadius: 4,
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    color: "#222",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };
  const processingBtnStyle = {
    ...baseBtnStyle,
    backgroundColor: "#f4f6f8",
    color: "#888",
    border: "1px solid #ddd",
    cursor: "not-allowed",
    opacity: 0.95,
  };
  const disabledReason =
    !paymentState.cardAttached ||
    !paymentState.billingInfo.familyName.trim() ||
    !paymentState.billingInfo.givenName.trim() ||
    !paymentState.billingInfo.email.trim();

  return (
    <button
      style={paymentState.isSubmitting ? processingBtnStyle : baseBtnStyle}
      disabled={paymentState.isSubmitting || disabledReason}
      aria-disabled={paymentState.isSubmitting || disabledReason}
      onClick={async () => {
        if (paymentState.isSubmitting) return;
        setPaymentState((prev) => ({ ...prev, isSubmitting: true }));
        try {
          await handleSubmitOrderFlow();
        } catch (e) {
          alert(e?.message || "決済でエラーが発生しました");
        } finally {
          setPaymentState((prev) => ({ ...prev, isSubmitting: false }));
        }
      }}
    >
      {paymentState.isSubmitting ? (
        <>
          <span
            style={{
              width: 14,
              height: 14,
              border: "2px solid #ccc",
              borderTopColor: "#333",
              borderRadius: "50%",
              display: "inline-block",
              animation: "cm-spin 1s linear infinite",
            }}
          />
          <span>処理中…</span>
        </>
      ) : (
        "支払う"
      )}
    </button>
  );
};
