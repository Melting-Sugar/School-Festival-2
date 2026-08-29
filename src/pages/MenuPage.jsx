// メニュー画面全体を組み立て、商品カードを並べるページコンポーネント。
// 商品画像はバックエンドのimagePathから取得する(未取得時はMenu.jsxがプレースホルダーを表示する)。
// fetchErrorがtrueの場合(ネットワーク不調時)は、商品グリッドの代わりに
// 「メニューを取得できませんでした」を表示する。
import { Menu } from "../components/Menu";
import { StepPageLayout } from "../components/StepPageLayout";

export const MenuPage = ({
  prices,
  itemNames,
  imagePaths,
  cart,
  addItems,
  removeItems,
  isSoldout,
  fetchError,
  onRetry,
}) => {
  if (fetchError) {
    return (
      <StepPageLayout>
        <div style={errorContainerStyle}>
          <p style={errorTextStyle}>メニューを取得できませんでした</p>
          <p style={errorSubTextStyle}>
            通信状況をご確認の上、もう一度お試しください。
          </p>
          {onRetry && (
            <button style={retryButtonStyle} onClick={onRetry}>
              再読み込み
            </button>
          )}
        </div>
      </StepPageLayout>
    );
  }

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
            image={imagePaths[40]}
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
            image={imagePaths[50]}
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
            image={imagePaths[10]}
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
            image={imagePaths[20]}
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
            image={imagePaths[30]}
            isSoldout={isSoldout[30]}
          />
        </div>
      </div>
    </StepPageLayout>
  );
};

const errorContainerStyle = {
  padding: "40px 20px",
  textAlign: "center",
};

const errorTextStyle = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#c0392b",
  margin: "8px 0",
};

const errorSubTextStyle = {
  fontSize: "14px",
  color: "#666",
  margin: "8px 0 20px 0",
};

const retryButtonStyle = {
  padding: "10px 24px",
  fontSize: "16px",
  fontWeight: "bold",
  borderRadius: "8px",
  border: "2px solid #222",
  backgroundColor: "#fff",
  cursor: "pointer",
};
