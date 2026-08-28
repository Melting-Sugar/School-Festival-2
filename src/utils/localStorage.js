// localStorage の読み書きと削除を安全に扱う汎用ユーティリティ。
export const setLocalStorageJSON = (key, obj) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(obj));
  } catch {
    // プライベートブラウジング等でlocalStorageが使えない場合は何もしない
  }
};

export const getLocalStorageJSON = (key) => {
  try {
    const s = window.localStorage.getItem(key);
    if (!s) return undefined;
    return JSON.parse(s);
  } catch {
    return undefined;
  }
};

export const removeLocalStorageItem = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // 読み取れない場合は削除もできないため何もしない
  }
};
