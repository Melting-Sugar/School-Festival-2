import { SQUARE_ENVIRONMENT, SQUARE_SDK_URLS } from "./constants/config";

export async function loadSquareSdk(env = SQUARE_ENVIRONMENT.PRODUCTION) {
  const SRC = SQUARE_SDK_URLS[env];

  if (window.Square) {
    console.log("[square] SDK already present");
    return;
  }

  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => {
      console.log("[square] SDK loaded:", SRC);
      resolve();
    };
    s.onerror = () => {
      reject(new Error("square.js のロードに失敗: " + SRC));
    };
    document.head.appendChild(s);
  });
}
