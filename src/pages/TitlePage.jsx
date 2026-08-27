// タイトル画面全体を組み立てるページコンポーネント。
import { Title } from "../components/Title";

export const TitlePage = ({ onStart, onOpenLegalNotice }) => {
  return <Title onStart={onStart} onOpenLegalNotice={onOpenLegalNotice} />;
};
