// 各ページで共通して使うレイアウト枠を提供するコンポーネント。
export const StepPageLayout = ({ children, spacerHeight = "60px" }) => {
  return (
    <>
      {children}
      <div style={{ minHeight: spacerHeight }}></div>
    </>
  );
};
