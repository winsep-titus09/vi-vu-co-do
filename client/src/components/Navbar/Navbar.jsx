// src/components/Navbar/Navbar.jsx

import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

// Imports các icon
import { IconSearch } from "../../icons/IconSearch";
import { IconUser } from "../../icons/IconUser";
import { IconMenu } from "../../icons/IconMenu";
import { IconX } from "../../icons/IconX";
import { IconChevronDown } from "../../icons/IconChevronDown";

// Import components
import Drawer from "../Modals/Drawer";
// (Đã xóa import ButtonSvgMask vì không còn dùng nút Đặt chuyến đi)

/**
 * Thanh điều hướng chính.
 * Style: Heritage Trails.
 * Updates: Tăng padding, Thêm menu Tours, Font to hơn, User Icon, Bỏ CTA.
 */
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState(null);

  // Hooks để kiểm tra link active
  const location = useLocation();
  const isBlogActive = location.pathname.startsWith("/blog");
  const isPlacesActive = location.pathname.startsWith("/places");

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setOpenMobileSubmenu(null);
  };

  const handleSubmenuToggle = (menuName) => {
    setOpenMobileSubmenu(openMobileSubmenu === menuName ? null : menuName);
  };

  // --- CẬP NHẬT STYLE: Soft Pill (Nền nhẹ + Chữ đậm) ---

  // 1. Class chung cho Link thường
  const navLinkClasses = ({ isActive }) =>
    `text-base px-3 py-2 rounded-btn transition-all duration-200 ${
      isActive
        ? "bg-primary/10 text-primary font-semibold shadow-sm" // Active: Nền tím nhạt, chữ đậm
        : "text-text-primary hover:bg-gray-100 hover:text-primary font-medium" // Inactive: Hover xám nhẹ
    }`;

  // 2. Class chung cho Dropdown Button
  const dropdownBtnClasses = (isActive) =>
    `text-base px-3 py-2 rounded-btn flex items-center gap-1 transition-all duration-200 ${
      isActive
        ? "bg-primary/10 text-primary font-semibold shadow-sm"
        : "text-text-primary hover:bg-gray-100 hover:text-primary font-medium"
    }`;

  return (
    <>
      {/* === HEADER === */}
      {/* CẬP NHẬT: Tăng padding py-3 -> py-5 (hoặc py-4 = 16px) */}
      <header className="border-b border-border-light bg-bg-main/95 backdrop-blur-sm sticky top-0 z-40 transition-all">
        <div className="container-main flex items-center justify-between gap-4 py-5">
          {/* 1. Logo Area */}
          <NavLink to="/" className="inline-flex items-center gap-3 group">
            <img
              src="/images/uploads/logo-hue.png"
              alt="Vi Vu Cố Đô"
              className="h-12 w-auto object-contain"
            />
          </NavLink>

          {/* 2. Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-2">
            <NavLink to="/" className={navLinkClasses}>
              Trang chủ
            </NavLink>

            {/* CẬP NHẬT: Thêm menu "Chuyến tham quan" */}
            <NavLink to="/tours" className={navLinkClasses}>
              Chuyến tham quan
            </NavLink>

            {/* Dropdown "Cẩm nang" */}
            <div className="relative group">
              <button
                type="button"
                className={dropdownBtnClasses(isBlogActive)}
              >
                Cẩm nang
                <IconChevronDown className="h-4 w-4 opacity-70" />
              </button>
              <div className="absolute top-full left-0 w-48 pt-4 opacity-0 pointer-events-none scale-95 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:scale-100 transition-all duration-200 ease-out">
                <div className="bg-white rounded-card shadow-card border border-border-light py-2 overflow-hidden">
                  <NavLink
                    to="/blog/am-thuc"
                    className="block px-4 py-2.5 text-base text-text-primary hover:bg-primary-light hover:text-primary"
                  >
                    Ẩm thực
                  </NavLink>
                  <NavLink
                    to="/blog/di-san"
                    className="block px-4 py-2.5 text-base text-text-primary hover:bg-primary-light hover:text-primary"
                  >
                    Di sản
                  </NavLink>
                </div>
              </div>
            </div>

            {/* Dropdown "Địa điểm" */}
            <div className="relative group">
              <button
                type="button"
                className={dropdownBtnClasses(isPlacesActive)}
              >
                Địa điểm
                <IconChevronDown className="h-4 w-4 opacity-70" />
              </button>
              <div className="absolute top-full left-0 w-48 pt-4 opacity-0 pointer-events-none scale-95 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:scale-100 transition-all duration-200 ease-out">
                <div className="bg-white rounded-card shadow-card border border-border-light py-2 overflow-hidden">
                  <NavLink
                    to="/places/lang-tam"
                    className="block px-4 py-2.5 text-base text-text-primary hover:bg-primary-light hover:text-primary"
                  >
                    Lăng tẩm
                  </NavLink>
                  <NavLink
                    to="/places/chua"
                    className="block px-4 py-2.5 text-base text-text-primary hover:bg-primary-light hover:text-primary"
                  >
                    Chùa
                  </NavLink>
                  <NavLink
                    to="/places/check-in"
                    className="block px-4 py-2.5 text-base text-text-primary hover:bg-primary-light hover:text-primary"
                  >
                    Check-in
                  </NavLink>
                  <NavLink
                    to="/places/song-huong"
                    className="block px-4 py-2.5 text-base text-text-primary hover:bg-primary-light hover:text-primary"
                  >
                    Sông Hương
                  </NavLink>
                </div>
              </div>
            </div>

            <NavLink to="/guides" className={navLinkClasses}>
              Hướng dẫn viên
            </NavLink>
          </nav>

          {/* 3. Actions (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              type="button"
              className="btn-icon btn-ghost text-text-primary hover:bg-primary-light hover:text-primary transition-colors"
              aria-label="Tìm kiếm"
            >
              <IconSearch className="h-6 w-6" />
            </button>
            <div className="h-5 w-px bg-border-light"></div> {/* Divider */}
            {/* CẬP NHẬT: Chuyển "Đăng nhập" thành Icon User */}
            <NavLink
              to="/auth/signin"
              className="btn-icon btn-ghost text-text-primary hover:bg-primary-light hover:text-primary transition-colors"
              aria-label="Đăng nhập"
            >
              <IconUser className="h-6 w-6" />
            </NavLink>
            {/* CẬP NHẬT: Đã xóa nút "Đặt Chuyến đi" */}
          </div>

          {/* 4. Mobile Menu Toggle */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-full border border-border-light w-10 h-10 text-text-primary hover:bg-primary-light hover:border-primary/30 transition-colors"
            aria-label="Mở menu"
            onClick={toggleMenu}
          >
            <IconMenu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* === DRAWER (MOBILE) === */}
      <Drawer isOpen={isMobileMenuOpen} onClose={toggleMenu}>
        <div className="flex flex-col h-full bg-bg-main">
          {/* Header Drawer */}
          <div className="flex items-center justify-center p-5 border-b border-border-light">
            <button
              type="button"
              className="btn-icon btn-ghost text-text-primary"
              onClick={toggleMenu}
              aria-label="Đóng menu"
            >
              <IconX className="h-6 w-6" />
            </button>
          </div>

          {/* Nội dung Drawer */}
          <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
            <NavLink
              to="/"
              onClick={toggleMenu}
              className={({ isActive }) =>
                `block p-3 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-text-primary"
                }`
              }
            >
              Trang chủ
            </NavLink>

            {/* CẬP NHẬT: Thêm Link Mobile "Chuyến tham quan" */}
            <NavLink
              to="/tours"
              onClick={toggleMenu}
              className={({ isActive }) =>
                `block p-3 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-text-primary"
                }`
              }
            >
              Chuyến tham quan
            </NavLink>

            {/* Accordion Cẩm nang */}
            <div>
              <button
                type="button"
                onClick={() => handleSubmenuToggle("blog")}
                className={`w-full flex justify-between items-center p-3 rounded-lg text-base font-medium ${
                  isBlogActive ? "text-primary" : "text-text-primary"
                }`}
              >
                Cẩm nang
                <IconChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openMobileSubmenu === "blog" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openMobileSubmenu === "blog" && (
                <div className="ml-4 pl-4 border-l border-border-light flex flex-col gap-1 my-1">
                  <NavLink
                    to="/blog/am-thuc"
                    onClick={toggleMenu}
                    className="block p-2 text-sm text-text-secondary hover:text-primary"
                  >
                    Ẩm thực
                  </NavLink>
                  <NavLink
                    to="/blog/di-san"
                    onClick={toggleMenu}
                    className="block p-2 text-sm text-text-secondary hover:text-primary"
                  >
                    Di sản
                  </NavLink>
                </div>
              )}
            </div>

            {/* Accordion Địa điểm */}
            <div>
              <button
                type="button"
                onClick={() => handleSubmenuToggle("places")}
                className={`w-full flex justify-between items-center p-3 rounded-lg text-base font-medium ${
                  isPlacesActive ? "text-primary" : "text-text-primary"
                }`}
              >
                Địa điểm
                <IconChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openMobileSubmenu === "places" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openMobileSubmenu === "places" && (
                <div className="ml-4 pl-4 border-l border-border-light flex flex-col gap-1 my-1">
                  <NavLink
                    to="/places/lang-tam"
                    onClick={toggleMenu}
                    className="block p-2 text-sm text-text-secondary hover:text-primary"
                  >
                    Lăng tẩm
                  </NavLink>
                  <NavLink
                    to="/places/chua"
                    onClick={toggleMenu}
                    className="block p-2 text-sm text-text-secondary hover:text-primary"
                  >
                    Chùa
                  </NavLink>
                  <NavLink
                    to="/places/check-in"
                    onClick={toggleMenu}
                    className="block p-2 text-sm text-text-secondary hover:text-primary"
                  >
                    Check-in
                  </NavLink>
                  <NavLink
                    to="/places/song-huong"
                    onClick={toggleMenu}
                    className="block p-2 text-sm text-text-secondary hover:text-primary"
                  >
                    Sông Hương
                  </NavLink>
                </div>
              )}
            </div>

            <NavLink
              to="/guides"
              onClick={toggleMenu}
              className={({ isActive }) =>
                `block p-3 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-text-primary"
                }`
              }
            >
              Hướng dẫn viên
            </NavLink>

            <div className="my-2 border-t border-border-light" />

            <NavLink
              to="/auth/signin"
              onClick={toggleMenu}
              className="block p-3 text-base font-medium text-text-primary"
            >
              Đăng nhập
            </NavLink>
          </nav>
        </div>
      </Drawer>
    </>
  );
}
