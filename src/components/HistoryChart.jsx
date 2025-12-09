import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function HistoryChart({ title, field, records }) {
  if (!records || records.length === 0) return null;

  const data = records.map((r) => ({
    time: r.timestamp.slice(11, 16), // "HH:MM"
    value: r[field],
  }));

  const color =
    field === "temp_mean"
      ? "#ffb347"
      : field === "Health_Index"
      ? "#00eaff"
      : "#ff6bcb";

  return (
    <div className="history-card">
      <h4>{title}</h4>

      <ResponsiveContainer width="100%" height={170}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
        >
          <CartesianGrid stroke="#333" strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fill: "#aaa", fontSize: 10 }}
            angle={-30}
            textAnchor="end"
          />
          <YAxis
            tick={{ fill: "#ccc", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{ background: "#111", border: "1px solid #333" }}
            labelStyle={{ color: "#fff" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 2 }}
            activeDot={{ r: 5, stroke: "#fff", strokeWidth: 1 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
