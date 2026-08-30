// ドリンク選択画面。商品画像はバックエンドのimagePathから取得する
// (未取得時はMenu.tsxがプレースホルダーを表示する)。
import { Menu } from "../components/Menu";
import { StepPageLayout } from "../components/StepPageLayout";
import type { Cart, ImagePathMap, NameMap, SoldoutMap } from "../types";

interface DrinkPageProps {
  itemNames: NameMap;
  imagePaths: ImagePathMap;
  cart: Cart;
  addItems: (id: number) => void;
  removeItems: (id: number) => void;
  difference: number;
  isSoldout: SoldoutMap;
}

export const DrinkPage = ({ itemNames, imagePaths, cart, addItems, removeItems, difference, isSoldout }: DrinkPageProps) => {
  return (
    <StepPageLayout>
      <p
        style={{
          textAlign: "center",
          fontSize: "22px",
          margin: "10px auto",
        }}
      >
        飲み物を選択してください
      </p>
      {difference > 0 && (
        <p
          style={{
            textAlign: "center",
            fontSize: "30px",
            fontWeight: "bold",
            margin: "10px auto",
            backgroundColor: "#9eceff",
          }}
        >
          {`あと ${difference} 個`}
        </p>
      )}
      {difference === 0 && (
        <p
          style={{
            textAlign: "center",
            fontSize: "30px",
            fontWeight: "bold",
            margin: "10px auto",
            backgroundColor: "#9eceff",
          }}
        >
          OK！
        </p>
      )}
      {difference < 0 && (
        <p
          style={{
            textAlign: "center",
            fontSize: "30px",
            fontWeight: "bold",
            margin: "10px auto",
            backgroundColor: "#9eceff",
          }}
        >
          数を減らしてください
        </p>
      )}
      <div className="center-alignment">
        <div className="list-row">
          <Menu
            borderColor={"2px solid #7fbfff"}
            backgroundColor={"#a8d3ff"}
            itemName={itemNames[91]}
            count={cart[91]}
            id={91}
            add={addItems}
            remove={removeItems}
            difference={difference}
            isDrinkScreen={true}
            image={imagePaths[91]}
            isSoldout={isSoldout[91]}
          />
          <Menu
            borderColor={"2px solid #7fbfff"}
            backgroundColor={"#a8d3ff"}
            itemName={itemNames[92]}
            count={cart[92]}
            id={92}
            add={addItems}
            remove={removeItems}
            difference={difference}
            isDrinkScreen={true}
            image={imagePaths[92]}
            isSoldout={isSoldout[92]}
          />
        </div>
        <div className="list-row">
          <Menu
            borderColor={"2px solid #7fbfff"}
            backgroundColor={"#a8d3ff"}
            itemName={itemNames[93]}
            count={cart[93]}
            id={93}
            add={addItems}
            remove={removeItems}
            difference={difference}
            isDrinkScreen={true}
            image={imagePaths[93]}
            isSoldout={isSoldout[93]}
          />
          <Menu
            borderColor={"2px solid #7fbfff"}
            backgroundColor={"#a8d3ff"}
            itemName={itemNames[94]}
            count={cart[94]}
            id={94}
            add={addItems}
            remove={removeItems}
            difference={difference}
            isDrinkScreen={true}
            image={imagePaths[94]}
            isSoldout={isSoldout[94]}
          />
        </div>
      </div>
    </StepPageLayout>
  );
};
