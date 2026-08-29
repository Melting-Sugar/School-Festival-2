// 注文作成に必要な入力をまとめ、支払いセッションの前提を作るロジック。
import { buildOrderItems, parseReservedToDate } from "../../utils/orderUtils";
import { toLocalDateTimeString } from "../../utils/dateFormat";
import { MOCK_CARD_ORDER_ID } from "../../constants/mocks/cardPaymentMock";

export async function createPaymentOrder({
  cart,
  selectedTime,
  calculateSumPrice,
  useMockPayment,
  createOrder,
  createdAtIso = new Date().toISOString(),
}) {
  const items = buildOrderItems(cart);
  if (items.length === 0) throw new Error("カートが空です");

  const reservedDate = parseReservedToDate(selectedTime);
  if (!reservedDate) throw new Error("予約時刻が不正です");

  const amount = calculateSumPrice();
  const reservedAtIso = reservedDate.toISOString();

  let orderId;
  if (useMockPayment) {
    orderId = MOCK_CARD_ORDER_ID();
  } else {
    const orderDateLocal = toLocalDateTimeString(new Date(createdAtIso));
    const reservedLocal = toLocalDateTimeString(reservedDate);
    const orderResp = await createOrder({
      items,
      orderDate: orderDateLocal,
      reservedTime: reservedLocal,
    });
    orderId = orderResp;
    if (!orderId) {
      throw new Error("注文作成に失敗しました (orderId 未取得)");
    }
  }

  return {
    orderId,
    createdAtIso,
    reservedDate,
    reservedAtIso,
    items,
    amount,
  };
}