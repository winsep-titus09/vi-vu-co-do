// src/layouts/TouristLayout.jsx

import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { IconUser } from "../icons/IconUser";
import { IconCalendar } from "../icons/IconBox";

// Icon Hamburger & Close (Dùng nội bộ cho layout này)
const IconMenu2 = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const IconX = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const IconDashboard = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

const IconWallet = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </svg>
);

const IconSettings = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconBell = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const MENU = [
  {
    label: "Tổng quan",
    path: "/dashboard/tourist",
    icon: IconDashboard,
    end: true,
  },
  {
    label: "Lịch sử chuyến đi",
    path: "/dashboard/tourist/history",
    icon: IconCalendar,
  },
  {
    label: "Hồ sơ cá nhân",
    path: "/dashboard/tourist/profile",
    icon: IconUser,
  },
  {
    label: "Cài đặt",
    path: "/dashboard/tourist/settings",
    icon: IconSettings,
  },
];

export default function TouristLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-main flex flex-col">
      <Navbar />

      <div className="flex-1 container-main py-8">
        {/* [NEW] Mobile Menu Toggle Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-border-light rounded-xl shadow-sm text-text-primary font-bold active:scale-95 transition-transform"
          >
            <IconMenu2 className="w-5 h-5" />
            <span>Menu tài khoản</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* [NEW] Overlay cho Mobile (Click để đóng) */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden animate-fade-in"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

          {/* SIDEBAR TRÁI (Responsive Drawer) */}
          <aside
            className={`
              fixed inset-y-0 left-0 z-[70] w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out h-full overflow-y-auto
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              lg:translate-x-0 lg:static lg:z-auto lg:w-auto lg:bg-transparent lg:shadow-none lg:h-auto lg:overflow-visible lg:col-span-3
            `}
          >
            {/* Wrapper Card (Giữ style cũ trên Desktop, thêm padding trên Mobile) */}
            <div className="bg-white lg:rounded-3xl lg:border border-border-light p-6 h-full lg:h-auto lg:sticky lg:top-24">
              {/* Mobile Header (Close Button) */}
              <div className="flex justify-end lg:hidden mb-2">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-text-secondary hover:text-primary bg-gray-100 rounded-full"
                >
                  <IconX className="w-5 h-5" />
                </button>
              </div>

              {/* User Info Summary */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border-light">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                  <img
                    src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_4.jpg"
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-heading font-bold text-text-primary truncate">
                    Hoàng Nam
                  </p>
                </div>
                <NavLink
                  to="/dashboard/tourist/notifications"
                  className="relative p-2 text-text-secondary hover:text-primary hover:bg-bg-main rounded-full transition-all"
                  title="Thông báo"
                >
                  <IconBell className="w-5 h-5" />
                  {/* Badge cho thông báo chưa đọc */}
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </NavLink>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-1">
                {MENU.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                        ${
                          isActive
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "text-text-secondary hover:bg-bg-main hover:text-primary"
                        }
                      `}
                    >
                      <IconComponent className="w-5 h-5" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="lg:col-span-9">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
