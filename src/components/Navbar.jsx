import React from "react";

export default function Navbar({ currentTime }) {
  return (
    <div className="navbar">
      <div className="left">
        <span className="dot"></span>
        <span className="title">AI Blood Storage Monitor -Dynamic QR E-Ink</span>
      </div>
      <div className="right">
        Real Time: {currentTime}
      </div>
    </div>
  );
}
