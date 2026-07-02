// テスト用の固定時刻を経過時間込みで再計算するユーティリティ。
export function getCurrentTestDate(appStartTime, testDate) {
  const elapsedMs = Date.now() - appStartTime;
  return new Date(testDate.getTime() + elapsedMs);
}