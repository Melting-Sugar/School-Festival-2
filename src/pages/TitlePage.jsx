// タイトル画面全体を組み立てるページコンポーネント。
import { Title } from "../components/Title";

export const TitlePage = ({ onStart, onOpenLegalNotice, hasSavedOrder, onViewSavedOrder }) => {
  return (
    <Title
      onStart={onStart}
      onOpenLegalNotice={onOpenLegalNotice}
      hasSavedOrder={hasSavedOrder}
      onViewSavedOrder={onViewSavedOrder}
    />
  );
};
