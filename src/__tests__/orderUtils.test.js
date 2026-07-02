import { buildOrderItems, formatReservedTimeHHmm, parseReservedToDate } from "../utils/orderUtils";

describe("orderUtils", () => {
  test("buildOrderItems filters invalid items and zero quantities", () => {
    const result = buildOrderItems({
      10: 2,
      30: 1,
      31: 3,
      999: 5,
      40: 0,
    });

    expect(result).toEqual([
      { itemId: 10, quantity: 2 },
      { itemId: 30, quantity: 1 },
      { itemId: 31, quantity: 3 },
    ]);
  });

  test("formatReservedTimeHHmm formats a date as HH:mm", () => {
    const date = new Date(2026, 6, 2, 9, 5, 0);

    expect(formatReservedTimeHHmm(date)).toBe("09:05");
  });

  test("parseReservedToDate accepts an ISO string", () => {
    const parsed = parseReservedToDate("2026-07-02T12:34:00.000Z");

    expect(parsed).toBeInstanceOf(Date);
    expect(parsed?.toISOString()).toBe("2026-07-02T12:34:00.000Z");
  });
});