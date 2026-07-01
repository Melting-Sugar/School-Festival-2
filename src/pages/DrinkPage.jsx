import { Menu } from "../components/Menu";
import { StepPageLayout } from "../components/StepPageLayout";
import img_91 from "../image/img_91.jpg";
import img_92 from "../image/img_92.jpg";
import img_93 from "../image/img_93.jpg";
import img_94 from "../image/img_94.jpg";

export const DrinkPage = ({ itemNames, cart, addItems, removeItems, difference, isSoldout }) => {
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
            image={img_91}
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
            image={img_92}
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
            image={img_93}
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
            image={img_94}
            isSoldout={isSoldout[94]}
          />
        </div>
      </div>
    </StepPageLayout>
  );
};
