import React from "react";
import HistoryChart from "./HistoryChart.jsx";

export default function DetailsPanel({ row, history }) {
  if (!row) {
    return (
      <div className="details-panel">
        <h2>Bag Details</h2>
        <p>Select a bag from the left grid.</p>
      </div>
    );
  }

  const last = history[history.length - 1] || row;

  return (
    <div className="details-panel">
      <h2>Bag Details</h2>

      <h3>
        {row.bag_id} ({row.blood_type} – {row.product_type})
      </h3>

      <p>
        <strong>Route:</strong> {row.route}
      </p>
      <p>
        <strong>Timestamp:</strong> {row.timestamp}
      </p>
      <p>
        <strong>Health Index:</strong> {row.Health_Index}
      </p>
      <p>
        <strong>Temperature:</strong> {row.temp_mean} °C
      </p>
      <p>
        <strong>Humidity:</strong> {row.hum_mean} %
      </p>
      <p>
        <strong>Vibration (accel_rms):</strong> {row.accel_rms}
      </p>
      <p>
        <strong>Door Count:</strong> {row.door_count}
      </p>

      <div className="history-section">
        <HistoryChart
          title="Temperature (last 24 hours)"
          field="temp_mean"
          records={history}
        />
        <HistoryChart
          title="Health Index (last 24 hours)"
          field="Health_Index"
          records={history}
        />
        <HistoryChart
          title="Vibration (last 24 hours)"
          field="accel_rms"
          records={history}
        />
      </div>
    </div>
  );
}
