import { Order } from "../components/Order";

export const NumberTagPage = ({ cart, price, names, paymentState }) => {
  return (
    <>
      <p
        style={{
          textAlign: "center",
          fontSize: "22px",
          fontWeight: "bold",
          margin: "16px auto",
        }}
      >
        ご注文ありがとうございます！
      </p>
      <p
        style={{
          textAlign: "center",
          fontSize: "20px",
          margin: "16px 0px 2px 0px",
        }}
      >
        注文番号
      </p>
      <p
        style={{
          textAlign: "center",
          fontSize: "60px",
          fontWeight: "bold",
          margin: "2px",
        }}
      >
        {paymentState.outcome.orderId ?? "NNNNN"}
      </p>
      {paymentState.outcome.displayReserved && (
        <p style={{ textAlign: "center", fontSize: 24, margin: "16px 0" }}>
          予約日時：{paymentState.outcome.displayReserved}
        </p>
      )}
      <Order cart={cart} price={price} names={names} />
    </>
  );
};
