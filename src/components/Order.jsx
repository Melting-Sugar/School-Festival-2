// 注文内容の一覧と数量表示をまとめて描画するコンポーネント。
import {
  PRODUCT_CATEGORIES,
  SET_DRINK_SUBITEM_MAP,
  ORDER_DISPLAY_SEQUENCE,
  isSetItemBreakdownId,
  SINGLE_DRINK_ID_START,
  SINGLE_DRINK_ID_END,
  DRINK_TYPE_BASE,
  DRINK_TYPE_MOD,
} from "../constants/items";

export const Order = ({ cart = {}, price = {}, names = {} }) => {
  // 表示順：PORK_SINGLE → PORK_SINGLE_LARGE → PORK_DRINK_SET → SET内訳 → PORK_DRINK_SET_LARGE → SET_LARGE内訳 → DRINK_SINGLE → SINGLE内訳
  const displayOrder = ORDER_DISPLAY_SEQUENCE;

  let totalItems = 0; // ※セット内訳(41-44,51-54,31-34)は合計から除外
  let totalPrice = 0;

  const rows = [];

  const isSetDrink = (id) => isSetItemBreakdownId(id);
  const isSubOf30 = (id) => id >=SINGLE_DRINK_ID_START && id <= SINGLE_DRINK_ID_END; // ← 30の内訳も"セット風"表示にする

  const getLabel = (id) => {
    // 内部的に商品IDが31-34, 41-44, 41-54の場合、91-94の名前（ドリンク）を流用
    if (isSubOf30(id) || isSetDrink(id)) {
      const drinkIndex = id % DRINK_TYPE_MOD; // 1..4
      const drinkId = DRINK_TYPE_BASE + drinkIndex; // 91..94
      return names[drinkId] ?? `ドリンク ${drinkIndex}`;
    }
    return names[id] ?? `商品 ${id}`;
  };

  for (const id of displayOrder) {
    const qty = cart[id] || 0;
    if (qty <= 0) continue;

    const label = getLabel(id);

    // セット内訳(41-44,51-54) と 30の内訳(31-34) は
    // 価格を出さず「◯個 セット/内訳」表示、合計にも加算しない
    if (isSetDrink(id) || isSubOf30(id)) {
      rows.push(
        <div key={id} style={setRowStyle}>
          <p style={{ fontSize: "18px", margin: "6px" }}>{label}</p>
          <p style={rightLineStyle}>{qty}個</p>
        </div>
      );
      continue;
    }

    // 通常行（10,20,40,50,30）は金額あり＆合計加算
    const unit = price[id] || 0;
    const sub = unit * qty;
    totalItems += qty;
    totalPrice += sub;

    rows.push(
      <div key={id} style={normalRowStyle}>
        <p style={{ fontSize: "18px", margin: "6px" }}>{label}</p>
        <p style={rightLineStyle}>
          {qty}個　¥{sub.toLocaleString()}
        </p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div style={normalRowStyle}>
        <p style={{ fontSize: "20px", margin: "6px" }}>カートは空です</p>
      </div>
    );
  }

  return (
    <>
      {rows}
      <div
        style={{ ...normalRowStyle, border: "2px solid", marginTop: "30px" }}
      >
        <p style={{ fontSize: "20px", margin: "6px", fontWeight: "bold" }}>
          合計
        </p>
        <p style={{ ...rightLineStyle, color: "red", fontSize: "20px" }}>
          {totalItems}個　¥{totalPrice.toLocaleString()}
        </p>
      </div>
    </>
  );
};

const normalRowStyle = {
  border: "3px solid #222",
  width: "auto",
  minHeight: "64px",
  padding: "8px",
  margin: "6px",
  borderRadius: "8px",
  backgroundColor: "#fff",
};

const setRowStyle = {
  ...normalRowStyle,
  border: "3px solid #aaa",
  marginLeft: "40px",
};

const rightLineStyle = {
  margin: "6px",
  textAlign: "right",
  fontSize: "18px",
};
