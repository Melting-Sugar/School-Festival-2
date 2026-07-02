// soldoutPolicy の売り切れ連動ルールを確認するテスト。
import { applySoldoutRules } from "../features/soldout/soldoutPolicy";

describe("soldoutPolicy", () => {
  test("applies set link rules from raw soldout values", () => {
    const result = applySoldoutRules({
      10: true,
      20: false,
      91: false,
      92: false,
      93: false,
      94: false,
    });

    expect(result.soldout).toEqual({
      10: true,
      20: false,
      30: false,
      40: true,
      50: false,
      91: false,
      92: false,
      93: false,
      94: false,
    });
  });

  test("marks all menu items sold out when every drink is sold out", () => {
    const result = applySoldoutRules({
      10: false,
      20: false,
      91: true,
      92: true,
      93: true,
      94: true,
    });

    expect(result.soldout).toEqual({
      10: false,
      20: false,
      30: true,
      40: true,
      50: true,
      91: true,
      92: true,
      93: true,
      94: true,
    });
  });
});