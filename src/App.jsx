// src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import QRious from "qrious";
import rawData from "./data/blood_storage_first_8_bags_full_records.json";
import Navbar from "./components/Navbar.jsx";
import DetailsPanel from "./components/DetailsPanel.jsx";
import "./App.css";

// -------------------------
// Detect anomaly
// -------------------------
function detectAnomaly(row) {
  if (!row) return false;
  return (
    row.temp_mean > 6 ||
    row.Health_Index < 0.96 ||
    row.accel_rms > 0.08 ||
    row.door_count > 3
  );
}

// -------------------------
// Group data by bag
// -------------------------
function prepareBags(data) {
  const bags = {};

  data.forEach((row) => {
    if (!bags[row.bag_id]) bags[row.bag_id] = [];
    bags[row.bag_id].push(row);
  });

  Object.values(bags).forEach((list) => {
    list.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  });

  return Object.keys(bags)
    .sort()
    .slice(0, 8)
    .map((id) => ({
      bag_id: id,
      records: bags[id]
    }));
}

const HISTORY_SECONDS = 24 * 60 * 60;
const SAMPLE_INTERVAL_SECONDS = 10;
const MAX_HISTORY_POINTS = HISTORY_SECONDS / SAMPLE_INTERVAL_SECONDS;

export default function App() {
  const [bags, setBags] = useState([]);
  const [maxSteps, setMaxSteps] = useState(0);
  const [step, setStep] = useState(0);
  const [selectedBag, setSelectedBag] = useState(null);

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [qrTimestamp, setQrTimestamp] = useState(new Date().toLocaleString());

  // For QR refs — CREATE AFTER bags loaded
  const qrRefs = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const bagList = prepareBags(rawData);
    setBags(bagList);

    setMaxSteps(bagList.reduce(
      (m, b) => Math.max(m, b.records.length),
      0
    ));

    setSelectedBag(bagList[0]?.bag_id || null);

    qrRefs.current = bagList.map(() => React.createRef());
  }, []);

  // Advance dataset every 10 sec
  useEffect(() => {
    if (!maxSteps) return;

    const interval = setInterval(() => {
      setStep((prev) => {
        const next = (prev + 1) % maxSteps;
        setQrTimestamp(new Date().toLocaleString());
        return next;
      });
    }, SAMPLE_INTERVAL_SECONDS * 1000);

    return () => clearInterval(interval);
  }, [maxSteps]);

  const globalCritical = bags.some((b) => {
    const idx = Math.min(step, b.records.length - 1);
    return detectAnomaly(b.records[idx]);
  });

  // selected bag row
  const currentBag = bags.find((b) => b.bag_id === selectedBag);
  let currentRow = null;
  let history = [];

  if (currentBag) {
    const idx = Math.min(step, currentBag.records.length - 1);
    currentRow = currentBag.records[idx];
    const start = Math.max(0, idx - (MAX_HISTORY_POINTS - 1));
    history = currentBag.records.slice(start, idx + 1);
  }

  // -----------------------------
  // QR GENERATION EFFECT
  // -----------------------------
  useEffect(() => {
    bags.forEach((b, index) => {
      const canvas = qrRefs.current[index]?.current;
      if (!canvas) return;

      const idx = Math.min(step, b.records.length - 1);
      const row = b.records[idx];
      if (!row) return;

      const qrText =
        `Bag: ${row.bag_id} (${row.blood_type})\n` +
        `Updated: ${qrTimestamp}\n\n` +
        `HI: ${row.Health_Index.toFixed(4)}\n` +
        `Temp: ${row.temp_mean.toFixed(2)}°C\n` +
        `Hum: ${row.hum_mean.toFixed(2)}%\n` +
        `Vibration: ${row.accel_rms.toFixed(4)}\n` +
        `Door Count: ${row.door_count}`;

      new QRious({
        element: canvas,
        value: qrText,
        size: 240,
        level: "H",
        background: "white",
        foreground: "black"
      });
    });
  }, [bags, step, qrTimestamp]);

  // -----------------------------
  // RENDER UI
  // -----------------------------
  return (
    <div className="app">
      <Navbar currentTime={currentTime} />

      <div className={globalCritical ? "alert critical" : "alert safe"}>
        {globalCritical ? "⚠ Critical anomalies detected" : "✓ No active anomalies detected"}
      </div>

      <div className="dashboard">
        
        {/* LEFT GRID */}
        <div className="grid-container">
          <h2>Blood Bag Monitoring – Dynamic QR E-Ink</h2>

          <div className="grid">
            {bags.map((b, index) => {
              const idx = Math.min(step, b.records.length - 1);
              const row = b.records[idx];
              const anomaly = detectAnomaly(row);

              return (
                <div
                  key={b.bag_id}
                  className={`card ${selectedBag === b.bag_id ? "selected" : ""}`}
                  onClick={() => setSelectedBag(b.bag_id)}
                >
                  <canvas ref={qrRefs.current[index]} width="240" height="240" />

                  <div className="bag-id">{b.bag_id}</div>

                  <div className={`status ${anomaly ? "critical" : "safe"}`}>
                    {anomaly ? "CRITICAL" : "SAFE"}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        <DetailsPanel
          row={currentRow}
          history={history}
          sampleIntervalSeconds={SAMPLE_INTERVAL_SECONDS}
        />
      </div>
    </div>
  );
}
