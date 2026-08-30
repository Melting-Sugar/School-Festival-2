// テスト用の固定時刻を経過時間込みで再計算するユーティリティ。
// (現状どこからも呼ばれていない。App.jsxが同等のロジックを直接持っている)
export function getCurrentTestDate(appStartTime: number, testDate: Date): Date {
  const elapsedMs = Date.now() - appStartTime;
  return new Date(testDate.getTime() + elapsedMs);
}
