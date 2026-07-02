// 決済画面の初期化と Square SDK の読み込み状態を整えるロジック。
export async function initializePaymentScreen({
  getSquareConfig,
  loadSquareSdk,
  setPaymentState,
  orderId,
  createdAtIso,
  useMockPayment = false,
}) {
  const cfg = await getSquareConfig({ useMockPayment });
  await loadSquareSdk(cfg?.environment || "PRODUCTION");
  setPaymentState((prev) => ({ ...prev, orderId, createdAtIso, phase: "input" }));
  return cfg;
}