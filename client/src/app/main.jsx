import React from "react";

import ReactDOM from "react-dom/client";

import App from "./App.jsx"; // 1. Import component App

import "../../styles/app.css"; // 2. Import file CSS (để chạy Tailwind)

// 3. Tìm 'root' và render component App vào đó

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
