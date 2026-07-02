// Api.getSquareConfig の real / mock モード別の fallback 挙動を確認するテスト。
describe("Api.getSquareConfig", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("fails closed in real mode when square config cannot be fetched", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: jest.fn().mockReturnValue("application/json") },
      text: jest.fn().mockResolvedValue(""),
    });

    const { Api } = require("../services/apiService");

    await expect(Api.getSquareConfig({ useMockPayment: false })).rejects.toThrow(
      "Square設定の取得に失敗しました"
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/square/config",
      expect.objectContaining({
        headers: { Accept: "application/json" },
      })
    );
  });

  test("falls back to env config in mock mode when backend config is unavailable", async () => {
    process.env.REACT_APP_SQUARE_APP_ID = "sq0idp-mock-app";
    process.env.REACT_APP_SQUARE_LOCATION_ID = "mock-location";
    process.env.REACT_APP_SQUARE_ENV = "sandbox";

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: { get: jest.fn().mockReturnValue("application/json") },
        text: jest.fn().mockResolvedValue(""),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue(""),
      });

    const { Api } = require("../services/apiService");

    await expect(Api.getSquareConfig({ useMockPayment: true })).resolves.toEqual({
      applicationId: "sq0idp-mock-app",
      locationId: "mock-location",
      environment: "SANDBOX",
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});