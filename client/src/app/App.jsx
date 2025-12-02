// src/app/App.jsx

import React from "react";
import AppRouter from "../lib/router";
import { ToastProvider } from "../components/Toast/Toast";

/**
 * Root component:
 * Bọc router và các provider (nếu có).
 */
export default function App() {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
}
