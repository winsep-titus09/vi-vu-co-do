// src/layouts/MainLayout.jsx

import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

/**
 * Layout công khai:
 * Navbar sẽ được định vị 'absolute' đè lên content (ví dụ: Hero section).
 */
export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-main">
      {/* Navbar nằm ở root của layout để kiểm soát position 'absolute' */}
      <Navbar />

      {/* Main content area */}
      <main className="flex-1">
        {/* Outlet renders trang hiện tại (ví dụ: Home/index.jsx) */}
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
