// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import BagView from "./BagView.jsx";
import "./App.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

if (window.location.pathname.startsWith("/bag")) {
  root.render(<BagView />);
} else {
  root.render(<App />);
}
