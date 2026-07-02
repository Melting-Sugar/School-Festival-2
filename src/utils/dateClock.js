export function getCurrentTestDate(appStartTime, testDate) {
  const elapsedMs = Date.now() - appStartTime;
  return new Date(testDate.getTime() + elapsedMs);
}