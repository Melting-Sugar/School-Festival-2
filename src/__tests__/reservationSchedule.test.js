// reservationSchedule の時刻候補生成ルールを確認するテスト。
import { generateTimeOptions } from "../features/reservation/reservationSchedule";

describe("reservationSchedule", () => {
  const config = {
    START_OFFSET_MINUTES: 10,
    LAST_ORDER_HOUR: 17,
    LAST_ORDER_MINUTE: 10,
    INTERVAL_MINUTES: 5,
  };

  test("generates rounded reservation options from the next available slot", () => {
    const now = new Date(2026, 6, 2, 16, 56, 0);

    expect(generateTimeOptions(now, config)).toEqual([
      { value: "17:10", label: "17:10" },
    ]);
  });

  test("stops at the last order time", () => {
    const now = new Date(2026, 6, 2, 17, 1, 0);

    expect(generateTimeOptions(now, config)).toEqual([]);
  });
});