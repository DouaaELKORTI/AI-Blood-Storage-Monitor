import React from "react";
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const HISTORY_SECONDS = 24 * 60 * 60;  
const DEFAULT_INTERVAL = 10;

export default function HistoryChart({
  title,
  field,
  records,
  sampleIntervalSeconds = DEFAULT_INTERVAL,
}) {
  if (!records || records.length === 0) return null;

  const maxPointsForInterval = Math.floor(
    HISTORY_SECONDS / sampleIntervalSeconds
  );

  const sliceStart = Math.max(0, records.length - maxPointsForInterval);
  const lastRecords = records.slice(sliceStart);

  const now = new Date();

  const data = lastRecords.map((r, index) => {
    const i = lastRecords.length - 1 - index;
    const t = new Date(now.getTime() - i * sampleIntervalSeconds * 1000);
    const timeLabel = t.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      time: timeLabel,
      value: r[field],
    };
  });

  let color = "#00eaff";
  if (field === "temp_mean") color = "#ffb347";
  else if (field === "Health_Index") color = "#00eaff";
  else if (field === "accel_rms") color = "#ff6bcb";
  else if (field === "hum_mean") color = "#8cc63f";
  else if (field === "door_count") color = "#d5a6bd";

  return (
    <div className="history-card">
      <h4>{title}</h4>
      <ResponsiveContainer width="100%" height={170}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid stroke="#333" strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fill: "#aaa", fontSize: 10 }} angle={-30} textAnchor="end" />
          <YAxis tick={{ fill: "#ccc", fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: "#111", border: "1px solid #333" }}
            labelStyle={{ color: "#fff" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.3}
            dot={false}
            activeDot={{ r: 4, stroke: "#fff", strokeWidth: 1 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
