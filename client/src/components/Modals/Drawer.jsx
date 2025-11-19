// src/components/Modals/Drawer.jsx

import React from "react";

/**
 * Component Ngăn kéo (Mobile Menu).
 * @param {boolean} isOpen - Trạng thái hiển thị
 * @param {function} onClose - Hàm gọi khi đóng
 * @param {React.ReactNode} children - Nội dung bên trong ngăn kéo
 */
export default function Drawer({ isOpen, onClose, children }) {
  // Lớp CSS cho panel trượt
  const panelClasses = isOpen
    ? "translate-x-0" // Hiển thị (trượt vào)
    : "translate-x-full"; // Ẩn (trượt ra)

  return (
    <>
      {/* 1. Lớp phủ nền (Overlay) */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Panel nội dung (Trượt từ phải sang) */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50
          w-[70%] /* <-- CẬP NHẬT: Chiếm 70% chiều rộng */
          bg-bg-card text-text-primary
          shadow-lg transition-transform duration-300 ease-in-out
          ${panelClasses}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        {children}
      </div>
    </>
  );
}
