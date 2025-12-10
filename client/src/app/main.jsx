// src/app/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
// 1. Import CSS Tailwind (RẤT QUAN TRỌNG)
import "../../styles/app.css";

import "react-day-picker/dist/style.css";
// 2. Import file App (file chứa Router)
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

// 3. Render ứng dụng
const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
} else {
  console.error("Không tìm thấy element #root để render React.");
}
