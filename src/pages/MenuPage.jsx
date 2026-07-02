// メニュー画面全体を組み立て、商品カードを並べるページコンポーネント。
import { Menu } from "../components/Menu";
import { StepPageLayout } from "../components/StepPageLayout";
import img_10 from "../image/img_10.jpg";
import img_20 from "../image/img_20.jpg";
import img_30 from "../image/img_30.jpg";
import img_40 from "../image/img_40.jpg";
import img_50 from "../image/img_50.jpg";

export const MenuPage = ({ prices, itemNames, cart, addItems, removeItems, isSoldout }) => {
  return (
    <StepPageLayout>
      <div className="center-alignment">
        <div className="list-row">
          <Menu
            borderColor={"2px solid #ffbf7f"}
            backgroundColor={"#ffd3a8"}
            itemPrice={`¥${prices[40]}`}
            itemName={itemNames[40]}
            count={cart[40]}
            id={40}
            add={addItems}
            remove={removeItems}
            image={img_40}
            isSoldout={isSoldout[40]}
          />
          <Menu
            borderColor={"2px solid #ffbf7f"}
            backgroundColor={"#ffd3a8"}
            itemPrice={`¥${prices[50]}`}
            itemName={itemNames[50]}
            count={cart[50]}
            id={50}
            add={addItems}
            remove={removeItems}
            image={img_50}
            isSoldout={isSoldout[50]}
          />
        </div>
        <div className="list-row">
          <Menu
            borderColor={"2px solid #ffbf7f"}
            backgroundColor={"#ffd3a8"}
            itemPrice={`¥${prices[10]}`}
            itemName={itemNames[10]}
            count={cart[10]}
            id={10}
            add={addItems}
            remove={removeItems}
            image={img_10}
            isSoldout={isSoldout[10]}
          />
          <Menu
            borderColor={"2px solid #ffbf7f"}
            backgroundColor={"#ffd3a8"}
            itemPrice={`¥${prices[20]}`}
            itemName={itemNames[20]}
            count={cart[20]}
            id={20}
            add={addItems}
            remove={removeItems}
            image={img_20}
            isSoldout={isSoldout[20]}
          />
        </div>
        <div className="list-row">
          <Menu
            borderColor={"2px solid #ffbf7f"}
            backgroundColor={"#ffd3a8"}
            itemPrice={`¥${prices[30]}`}
            itemName={itemNames[30]}
            count={cart[30]}
            id={30}
            add={addItems}
            remove={removeItems}
            image={img_30}
            isSoldout={isSoldout[30]}
          />
        </div>
      </div>
    </StepPageLayout>
  );
};
