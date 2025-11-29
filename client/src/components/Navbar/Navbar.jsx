// src/components/Navbar/Navbar.jsx

import React, { useState } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { IconSearch } from "../../icons/IconSearch";
import { IconUser } from "../../icons/IconUser";
import { IconMenu } from "../../icons/IconMenu";
import { IconX } from "../../icons/IconX";
import { IconChevronDown } from "../../icons/IconChevronDown";
import { IconSettings, IconHistory, IconLogout } from "../../icons/IconCommon";
import Drawer from "../Modals/Drawer";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState(null);

  // Mock logged-in state
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const user = {
    name: "Hoàng Nam",
    avatar:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_4.jpg",
    role: "tourist", // 'tourist' | 'guide' | 'admin'
  };

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

  const handleLogout = () => {
    setIsLoggedIn(false);
    alert("Đã đăng xuất!");
  };

  // ============================================================================
  // STYLES
  // ============================================================================
  const navLinkClasses = ({ isActive }) =>
    `text-base px-3 py-2 rounded-btn transition-all duration-200 ${
      isActive
        ? "bg-primary/10 text-primary font-semibold shadow-sm"
        : "text-text-primary hover:bg-gray-100 hover:text-primary font-medium"
    }`;

  const dropdownBtnClasses = (isActive) =>
    `text-base px-3 py-2 rounded-btn flex items-center gap-1 transition-all duration-200 ${
      isActive
        ? "bg-primary/10 text-primary font-semibold shadow-sm"
        : "text-text-primary hover:bg-gray-100 hover:text-primary font-medium"
    }`;

  return (
    <>
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
            <NavLink to="/tours" className={navLinkClasses}>
              Chuyến tham quan
            </NavLink>

            {/* Dropdown "Cẩm nang" */}
            <div className="relative group">
              <button
                type="button"
                className={dropdownBtnClasses(isBlogActive)}
              >
                Cẩm nang <IconChevronDown className="h-4 w-4 opacity-70" />
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
                Địa điểm <IconChevronDown className="h-4 w-4 opacity-70" />
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
            <div className="h-5 w-px bg-border-light"></div>

            {/* LOGGED IN USER MENU */}
            {isLoggedIn ? (
              <div className="relative group z-50">
                <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-transparent hover:bg-gray-100 transition-all group-hover:border-border-light">
                  <span className="text-sm font-bold text-text-primary">
                    {user.name}
                  </span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-border-light">
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>

                {/* User Dropdown Content */}
                <div className="absolute top-full right-0 w-56 pt-3 opacity-0 pointer-events-none scale-95 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:scale-100 transition-all duration-200 ease-out">
                  <div className="bg-white rounded-xl shadow-xl border border-border-light py-2 overflow-hidden">
                    <div className="px-4 py-2 border-b border-border-light mb-1">
                      <p className="text-xs text-text-secondary">Xin chào,</p>
                      <p className="font-bold text-text-primary truncate">
                        {user.name}
                      </p>
                    </div>

                    {/* Conditional Dashboard Link */}
                    {user.role === "tourist" && (
                      <Link
                        to="/dashboard/tourist"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-primary-light hover:text-primary font-medium"
                      >
                        <div className="w-4 h-4">
                          <IconSettings className="w-full h-full" />
                        </div>{" "}
                        Dashboard
                      </Link>
                    )}
                    {user.role === "guide" && (
                      <Link
                        to="/dashboard/guide"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-primary-light hover:text-primary font-medium"
                      >
                        <div className="w-4 h-4">
                          <IconSettings className="w-full h-full" />
                        </div>{" "}
                        Kênh HDV
                      </Link>
                    )}

                    <Link
                      to="/dashboard/tourist/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-primary-light hover:text-primary font-medium"
                    >
                      <div className="w-4 h-4">
                        <IconSettings className="w-full h-full" />
                      </div>{" "}
                      Hồ sơ của tôi
                    </Link>
                    <Link
                      to="/dashboard/tourist/history"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-primary-light hover:text-primary font-medium"
                    >
                      <div className="w-4 h-4">
                        <IconHistory className="w-full h-full" />
                      </div>{" "}
                      Lịch sử đặt chỗ
                    </Link>

                    <div className="my-1 border-t border-border-light"></div>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-bold"
                    >
                      <div className="w-4 h-4">
                        <IconLogout className="w-full h-full" />
                      </div>{" "}
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Guest: Show Login Icon
              <NavLink
                to="/auth/signin"
                className="btn-icon btn-ghost text-text-primary hover:bg-primary-light hover:text-primary transition-colors"
                aria-label="Đăng nhập"
              >
                <IconUser className="h-6 w-6" />
              </NavLink>
            )}
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
          <div className="flex items-center justify-between p-5 border-b border-border-light">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-border-light">
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {user.name}
                  </p>
                  <p className="text-xs text-text-secondary">Thành viên</p>
                </div>
              </div>
            ) : (
              <span className="font-heading font-bold text-lg text-primary">
                Menu
              </span>
            )}
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

            {/* Mobile Accordions - Blog */}
            <div>
              <button
                type="button"
                onClick={() => handleSubmenuToggle("blog")}
                className={`w-full flex justify-between items-center p-3 rounded-lg text-base font-medium ${
                  isBlogActive ? "text-primary" : "text-text-primary"
                }`}
              >
                Cẩm nang{" "}
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

            {/* Mobile Accordions - Places */}
            <div>
              <button
                type="button"
                onClick={() => handleSubmenuToggle("places")}
                className={`w-full flex justify-between items-center p-3 rounded-lg text-base font-medium ${
                  isPlacesActive ? "text-primary" : "text-text-primary"
                }`}
              >
                Địa điểm{" "}
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

            {/* Mobile Auth Links */}
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard/tourist"
                  onClick={toggleMenu}
                  className="flex items-center gap-3 p-3 text-base font-medium text-text-primary hover:bg-gray-50 rounded-lg"
                >
                  <IconSettings className="w-5 h-5" /> Quản lý tài khoản
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="flex w-full items-center gap-3 p-3 text-base font-bold text-red-500 hover:bg-red-50 rounded-lg text-left"
                >
                  <IconLogout className="w-5 h-5" /> Đăng xuất
                </button>
              </>
            ) : (
              <NavLink
                to="/auth/signin"
                onClick={toggleMenu}
                className="block p-3 text-base font-medium text-text-primary bg-primary/5 rounded-lg text-center mt-2"
              >
                Đăng nhập / Đăng ký
              </NavLink>
            )}
          </nav>
        </div>
      </Drawer>
    </>
  );
}
