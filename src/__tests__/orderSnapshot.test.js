// orderSnapshot の Cookie 用データ生成と復元判定を確認するテスト。
import {
  buildOrderSnapshot,
  isReservationExpired,
  parseReservedFromSaved,
} from "../features/order/orderSnapshot";

describe("orderSnapshot", () => {
  test("builds a cookie snapshot payload", () => {
    expect(
      buildOrderSnapshot({
        createdAtIso: "2026-07-02T12:00:00.000Z",
        reservedAtIso: "2026-07-02T13:00:00.000Z",
        orderId: "ORDER-1",
        itemsCart: { 10: 1 },
        displayReserved: "2026-07-02 13:00",
      })
    ).toEqual({
      createdAt: "2026-07-02T12:00:00.000Z",
      reservedAtIso: "2026-07-02T13:00:00.000Z",
      orderId: "ORDER-1",
      itemsCart: { 10: 1 },
      displayReserved: "2026-07-02 13:00",
    });
  });

  test("parses saved reservation from ISO and HH:mm formats", () => {
    expect(parseReservedFromSaved("2026-07-02T13:00:00.000Z", null)?.toISOString()).toBe(
      "2026-07-02T13:00:00.000Z"
    );

    const parsed = parseReservedFromSaved("13:15", "2026-07-02T12:00:00.000Z");
    expect(parsed?.getHours()).toBe(13);
    expect(parsed?.getMinutes()).toBe(15);
  });

  test("detects expired reservation snapshots", () => {
    const reserved = new Date(2026, 6, 2, 12, 0, 0);
    const now = new Date(2026, 6, 2, 13, 1, 0);

    expect(isReservationExpired(reserved, now, 60 * 60 * 1000)).toBe(true);
  });
});