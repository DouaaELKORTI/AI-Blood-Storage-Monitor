import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import rawData from "./data/blood_storage_first_8_bags_full_records.json";
import Navbar from "./components/Navbar.jsx";
import DetailsPanel from "./components/DetailsPanel.jsx";
import "./App.css";

// --------------------
// Anomaly detection
// --------------------
function detectAnomaly(row) {
  if (!row) return false;
  const tooHot = row.temp_mean > 6;
  const badHealth = row.Health_Index < 0.96;
  const highVib = row.accel_rms > 0.08;
  const frequentDoor = row.door_count > 3;
  return tooHot || badHealth || highVib || frequentDoor;
}

// --------------------
// Group data by bag_id
// --------------------
function prepareBags(data) {
  const byBag = {};

  data.forEach((row) => {
    if (!byBag[row.bag_id]) byBag[row.bag_id] = [];
    byBag[row.bag_id].push(row);
  });

  Object.values(byBag).forEach((list) => {
    list.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  });

  const bagsArray = Object.keys(byBag)
    .sort()
    .slice(0, 8) // 8 bags
    .map((id) => ({
      bag_id: id,
      records: byBag[id],
    }));

  const maxLen = bagsArray.reduce(
    (max, b) => Math.max(max, b.records.length),
    0
  );

  return { bagsArray, maxLen };
}

export default function App() {
  const [bags, setBags] = useState([]);
  const [maxSteps, setMaxSteps] = useState(0);
  const [step, setStep] = useState(0);
  const [selectedBagId, setSelectedBagId] = useState(null);
  const [lastUpdate, setLastUpdate] = useState("");

  // 1) Load + group data once
  useEffect(() => {
    const { bagsArray, maxLen } = prepareBags(rawData);
    setBags(bagsArray);
    setMaxSteps(maxLen);
    setSelectedBagId(bagsArray[0]?.bag_id || null);
    setLastUpdate("Not started yet");
  }, []);

  // 2) Real-time simulation: advance one row every 10 seconds
  useEffect(() => {
    if (!maxSteps) return;

    const interval = setInterval(() => {
      setStep((prev) => {
        const next = (prev + 1) % maxSteps;
        setLastUpdate(`Step: ${next}`);
        return next;
      });
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [maxSteps]);

  // 3) Global anomaly status
  const globalCritical = bags.some((b) => {
    const idx = Math.min(step, b.records.length - 1);
    const row = b.records[idx];
    return detectAnomaly(row);
  });

  // 4) Selected bag + history (last 24 hours / rows)
  const selectedBag = bags.find((b) => b.bag_id === selectedBagId);
  let currentRow = null;
  let history = [];

  if (selectedBag) {
    const idx = Math.min(step, selectedBag.records.length - 1);
    currentRow = selectedBag.records[idx];

    const start = Math.max(0, idx - 23); // last 24 rows
    history = selectedBag.records.slice(start, idx + 1);
  }

  return (
    <div className="app">
      <Navbar lastUpdate={lastUpdate} />

      <div className={globalCritical ? "alert critical" : "alert safe"}>
        {globalCritical
          ? "⚠ Critical anomalies detected"
          : "✓ No active anomalies detected"}
      </div>

      <div className="dashboard">
        {/* LEFT: QR GRID */}
        <div className="grid-container">
          <h2>Blood Bag Real-Time Monitoring (From JSON Dataset)</h2>

          <div className="grid">
            {bags.map((bag) => {
              const idx = Math.min(step, bag.records.length - 1);
              const row = bag.records[idx];
              const anomaly = detectAnomaly(row);

              // JSON snapshot that goes inside QR
              const qrPayload = {
                bag_id: row.bag_id,
                timestamp: row.timestamp,
                route: row.route,
                blood_type: row.blood_type,
                product_type: row.product_type,
                temp_mean: row.temp_mean,
                hum_mean: row.hum_mean,
                accel_rms: row.accel_rms,
                door_count: row.door_count,
                Health_Index: row.Health_Index,
                anomaly,
              };

              return (
                <div
                  key={bag.bag_id}
                  className={`card ${
                    selectedBagId === bag.bag_id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedBagId(bag.bag_id)}
                >
                  <QRCodeCanvas
                    value={JSON.stringify(qrPayload, null, 2)}
                    size={150}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />

                  <div className="bag-id">{bag.bag_id}</div>

                  <div className={`status ${anomaly ? "critical" : "safe"}`}>
                    {anomaly ? "CRITICAL" : "SAFE"}
                  </div>

                  <div className="mini-stats">
                    <span>HI: {row.Health_Index.toFixed(4)}</span>
                    <span>T: {row.temp_mean.toFixed(2)}°C</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: DETAILS + CHARTS */}
        <DetailsPanel row={currentRow} history={history} />
      </div>
    </div>
  );
}
