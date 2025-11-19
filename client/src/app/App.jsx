// src/app/App.jsx

import React from "react";
import AppRouter from "../lib/router";
// Import các providers (nếu có, ví dụ: QueryClientProvider)
// import AppProviders from './providers';

/**
 * Root component:
 * Bọc router và các provider (nếu có).
 */
export default function App() {
  // Nếu bạn dùng Query...
  // return (
  //   <AppProviders>
  //     <AppRouter />
  //   </AppProviders>
  // );

  // Nếu chỉ dùng Router
  return <AppRouter />;
}
