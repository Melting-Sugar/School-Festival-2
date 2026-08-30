// 売り切れ情報にセット商品の連動ルールを適用するロジック。
import type { SoldoutMap } from "../../types";

export function applySoldoutRules(rawSoldout: SoldoutMap = {}): { soldout: SoldoutMap } {
  const soldout: SoldoutMap = { ...rawSoldout };

  soldout[40] = Boolean(soldout[10]);
  soldout[50] = Boolean(soldout[20]);

  if (soldout[91] && soldout[92] && soldout[93] && soldout[94]) {
    soldout[30] = true;
    soldout[40] = true;
    soldout[50] = true;
  } else {
    soldout[30] = false;
  }

  return { soldout };
}
