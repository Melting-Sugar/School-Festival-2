// 予約可能な時刻候補を生成し、受付終了時刻までの範囲を管理するロジック。
export function generateTimeOptions(now, reservationConfig) {
  const startTargetTime = new Date(
    now.getTime() + reservationConfig.START_OFFSET_MINUTES * 60000
  );

  const minutes = startTargetTime.getMinutes();
  const minutesToRound = minutes % reservationConfig.INTERVAL_MINUTES;

  let roundedMinutes = minutes;
  if (minutesToRound !== 0) {
    roundedMinutes =
      minutes + (reservationConfig.INTERVAL_MINUTES - minutesToRound);
  }

  const startTime = new Date(startTargetTime);
  startTime.setMinutes(roundedMinutes);
  startTime.setSeconds(0, 0);
  startTime.setMilliseconds(0);

  const options = [];
  let currentTime = startTime;

  while (true) {
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();

    if (
      currentHour > reservationConfig.LAST_ORDER_HOUR ||
      (currentHour === reservationConfig.LAST_ORDER_HOUR &&
        currentMinutes > reservationConfig.LAST_ORDER_MINUTE)
    ) {
      break;
    }

    const timeString = `${String(currentHour).padStart(2, "0")}:${String(
      currentMinutes
    ).padStart(2, "0")}`;
    options.push({ value: timeString, label: timeString });

    currentTime = new Date(
      currentTime.getTime() + reservationConfig.INTERVAL_MINUTES * 60000
    );
  }

  return options;
}