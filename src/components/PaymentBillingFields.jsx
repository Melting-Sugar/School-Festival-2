// Square 決済で使う請求先情報の入力欄をまとめたコンポーネント。
export const PaymentBillingFields = ({ paymentState, setPaymentState }) => {
  return (
    <div style={{ margin: "6px 10px", marginBottom: 12 }}>
      <input
        placeholder="苗字 (例: 山田)"
        value={paymentState.billingInfo.familyName}
        onChange={(e) =>
          setPaymentState((prev) => ({
            ...prev,
            billingInfo: { ...prev.billingInfo, familyName: e.target.value },
          }))
        }
        style={{ width: "32%", marginRight: 6 }}
      />
      <input
        placeholder="名前 (例: 太郎)"
        value={paymentState.billingInfo.givenName}
        onChange={(e) =>
          setPaymentState((prev) => ({
            ...prev,
            billingInfo: { ...prev.billingInfo, givenName: e.target.value },
          }))
        }
        style={{ width: "32%", marginRight: 6 }}
      />
      <input
        placeholder="メールアドレス (例: taro@example.com)"
        value={paymentState.billingInfo.email}
        onChange={(e) =>
          setPaymentState((prev) => ({
            ...prev,
            billingInfo: { ...prev.billingInfo, email: e.target.value },
          }))
        }
        style={{ width: "68%" }}
      />
      <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
        ※3DS（本人認証）用に氏名とメールが必要になる場合があります
      </div>
    </div>
  );
};
