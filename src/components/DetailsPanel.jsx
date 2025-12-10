// src/components/DetailsPanel.jsx
import React from "react";
import HistoryChart from "./HistoryChart.jsx";

export default function DetailsPanel({
  row,
  history,
  sampleIntervalSeconds
}) {
  if (!row) {
    return (
      <div className="details-panel">
        <h2>Bag Details</h2>
        <p>Select a bag from the left grid.</p>
      </div>
    );
  }

  // REAL TIME FOR DATASET TIMESTAMP
  const realtime = new Date().toLocaleString();

  return (
    <div className="details-panel">
      <h2>Bag Details</h2>

      <h3>
        {row.bag_id} ({row.blood_type})
      </h3>

      <p><strong>Timestamp:</strong> {realtime}</p>

      <p>
        <strong>Health Index:</strong> {row.Health_Index.toFixed(4)}
      </p>

      <p>
        <strong>Mean Temperature:</strong> {row.temp_mean.toFixed(4)} °C
      </p>

      <p>
        <strong>Mean Humidity:</strong> {row.hum_mean.toFixed(4)} %
      </p>

      <p>
        <strong>Mean Vibration (accel_rms):</strong> {row.accel_rms.toFixed(4)}
      </p>

      <p>
        <strong>Door Count:</strong> {row.door_count}
      </p>

      <div className="history-section">

        {/* Temperature */}
        <HistoryChart
          title="Temperature "
          field="temp_mean"
          records={history}
          sampleIntervalSeconds={sampleIntervalSeconds}
        />

        {/* Health Index */}
        <HistoryChart
          title="Health Index "
          field="Health_Index"
          records={history}
          sampleIntervalSeconds={sampleIntervalSeconds}
        />

        {/* Vibration */}
        <HistoryChart
          title="Vibration "
          field="accel_rms"
          records={history}
          sampleIntervalSeconds={sampleIntervalSeconds}
        />

        {/* NEW — Humidity */}
        <HistoryChart
          title="Humidity "
          field="hum_mean"
          records={history}
          sampleIntervalSeconds={sampleIntervalSeconds}
        />

        {/* NEW — Door Count */}
        <HistoryChart
          title="Door Count "
          field="door_count"
          records={history}
          sampleIntervalSeconds={sampleIntervalSeconds}
        />

      </div>
    </div>
  );
}
