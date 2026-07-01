export const StepPageLayout = ({ children, spacerHeight = "60px" }) => {
  return (
    <>
      {children}
      <div style={{ minHeight: spacerHeight }}></div>
    </>
  );
};
