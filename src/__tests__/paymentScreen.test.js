// paymentScreen の初期化処理と Square SDK 読み込みを確認するテスト。
import { initializePaymentScreen } from "../features/payment/paymentScreen";

describe("paymentScreen", () => {
  test("loads square sdk and puts payment screen into input phase", async () => {
    const getSquareConfig = jest.fn().mockResolvedValue({ environment: "SANDBOX" });
    const loadSquareSdk = jest.fn().mockResolvedValue(undefined);
    const setPaymentState = jest.fn();

    await initializePaymentScreen({
      getSquareConfig,
      loadSquareSdk,
      setPaymentState,
      orderId: "ORDER-1",
      createdAtIso: "2026-07-02T12:00:00.000Z",
    });

    expect(getSquareConfig).toHaveBeenCalled();
    expect(loadSquareSdk).toHaveBeenCalledWith("SANDBOX");
    expect(setPaymentState).toHaveBeenCalled();
  });
});