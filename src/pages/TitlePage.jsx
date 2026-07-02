// タイトル画面全体を組み立てるページコンポーネント。
import { Title } from "../components/Title";

export const TitlePage = ({ onStart }) => {
  return <Title onStart={onStart} />;
};
