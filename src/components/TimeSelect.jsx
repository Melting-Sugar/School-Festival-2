import React, { useMemo, useEffect } from "react";
import { RESERVATION_CONFIG } from "../constants/config";

// 定数
// const START_OFFSET_MINUTES = 10;
// const LAST_ORDER_HOUR = 17
// const LAST_ORDER_MINUTE = 10;
// const INTERVAL_MINUTES = 5;

//予約可能な時刻オプションの配列を生成する関数
const generateTimeOptions = (now) => {
  const startTargetTime = new Date(
    now.getTime() + RESERVATION_CONFIG.START_OFFSET_MINUTES * 60000
  );

  const minutes = startTargetTime.getMinutes();
  const minutesToRound = minutes % RESERVATION_CONFIG.INTERVAL_MINUTES;

  let roundedMinutes = minutes;
  if (minutesToRound !== 0) {
    roundedMinutes = minutes + (RESERVATION_CONFIG.INTERVAL_MINUTES - minutesToRound);
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
      currentHour > RESERVATION_CONFIG.LAST_ORDER_HOUR ||
      (currentHour === RESERVATION_CONFIG.LAST_ORDER_HOUR && currentMinutes > RESERVATION_CONFIG.LAST_ORDER_MINUTE)
    ) {
      break;
    }

    const timeString = `${String(currentHour).padStart(2, "0")}:${String(
      currentMinutes
    ).padStart(2, "0")}`;
    options.push({ value: timeString, label: timeString });

    currentTime = new Date(currentTime.getTime() + RESERVATION_CONFIG.INTERVAL_MINUTES * 60000);
  }

  return options;
};

// 本体
export const TimeSelect = ({ onTimeChange, testTime }) => {
  const now = useMemo(() => {
    return testTime || new Date();
  }, [testTime]);
  const timeOptions = useMemo(() => generateTimeOptions(now), [now]);

  //現在時刻をフォーマット
  const currentHour = String(now.getHours()).padStart(2, "0");
  const currentMinutes = String(now.getMinutes()).padStart(2, "0");
  const formattedTime = `${currentHour}:${currentMinutes}`;

  // ← 修正: render中に onTimeChange を直接呼ばない
  // マウント時 / timeOptions が変わったときに一度だけ呼ぶ
  useEffect(() => {
    if (timeOptions.length > 0 && typeof onTimeChange === "function") {
      try {
        onTimeChange(timeOptions[0].value);
      } catch (e) {
        // 親が同期的にエラーを投げても無視してループを防ぐ
        console.warn("TimeSelect: onTimeChange threw:", e);
      }
    }
    // onTimeChange は通常は安定（setState）だが、念のため依存に入れておく
  }, [timeOptions, onTimeChange]);

  if (timeOptions.length === 0) {
    return (
      <p style={{ ...containerStyle, color: "red" }}>
        本日の予約受付は終了しました。
      </p>
    );
  }

  return (
    <div style={containerStyle}>
      <p style={titleStyle}>予約時刻確認</p>
      <p style={currentTimeStyle}>現在時刻: {formattedTime}</p>
      <label htmlFor="reservation-time" style={labelStyle}>
        予約時刻を選択してください:
      </label>
      <select
        id="reservation-time"
        defaultValue={timeOptions[0].value}
        onChange={(e) => {
          // 変更があったら、Propsとして渡された親の関数を呼び出す
          if (onTimeChange) {
            try {
              onTimeChange(e.target.value);
            } catch (e) {
              console.warn("TimeSelect: onTimeChange threw:", e);
            }
          }
        }}
        style={selectStyle}
      >
        {timeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const containerStyle = {
  padding: "20px",
  textAlign: "center",
};

const titleStyle = {
  fontSize: "22px",
  fontWeight: "bold",
  margin: "10px auto",
};

const currentTimeStyle = {
  fontSize: "16px",
  margin: "10px auto",
  color: "#666",
};

const labelStyle = {
  display: "block",
  fontSize: "16px",
  margin: "16px auto 8px",
  fontWeight: "bold",
};

const selectStyle = {
  fontSize: "16px",
  padding: "8px 12px",
  margin: "8px auto",
  borderRadius: "4px",
  border: "1px solid #ccc",
  width: "200px",
};
