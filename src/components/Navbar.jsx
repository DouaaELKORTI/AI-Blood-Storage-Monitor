import React from "react";

export default function Navbar({ lastUpdate }) {
  return (
    <div className="navbar">
      <div className="left">
        <span className="dot"></span>
        <span className="title">AI Blood Storage Monitor</span>
      </div>
      <div className="right">Monitoring step: {lastUpdate}</div>
    </div>
  );
}
