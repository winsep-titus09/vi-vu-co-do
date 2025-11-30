// src/layouts/TouristLayout.jsx

import React, { useState, useMemo } from "react";
import { Outlet, NavLink } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { useNotifications } from "../features/notifications/hooks";
import { IconUser } from "../icons/IconUser";
import { IconCalendar } from "../icons/IconBox";
import { IconX } from "../icons/IconX";
import { IconMenu } from "../icons/IconMenu";
import {
  IconDashboard,
  IconWallet,
  IconSettings,
  IconBell,
} from "../icons/IconCommon";

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
    label: "Giao dịch",
    path: "/dashboard/tourist/invoices",
    icon: IconWallet,
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

  // Fetch notifications to get unread count
  const { notifications } = useNotifications();

  // Get user info from localStorage
  const userInfo = useMemo(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return {
          name: user.name || "Khách hàng",
          avatar:
            user.avatar_url ||
            user.avatar ||
            "/images/placeholders/hero_slide_4.jpg",
        };
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    return {
      name: "Khách hàng",
      avatar: "/images/placeholders/hero_slide_4.jpg",
    };
  }, []);

  // Count unread notifications
  const unreadCount = useMemo(() => {
    if (!notifications) return 0;
    return notifications.filter((n) => !n.isRead && !n.is_read).length;
  }, [notifications]);

  return (
    <div className="min-h-screen bg-bg-main flex flex-col">
      <Navbar />

      <div className="flex-1 container-main py-8">
        {/* Mobile menu toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-border-light rounded-xl shadow-sm text-text-primary font-bold active:scale-95 transition-transform"
          >
            <IconMenu className="w-5 h-5" />
            <span>Menu tài khoản</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Mobile overlay */}
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
                    src={userInfo.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-heading font-bold text-text-primary truncate">
                    {userInfo.name}
                  </p>
                </div>
                <NavLink
                  to="/dashboard/tourist/notifications"
                  className="relative p-2 text-text-secondary hover:text-primary hover:bg-bg-main rounded-full transition-all"
                  title="Thông báo"
                >
                  <IconBell className="w-5 h-5" />
                  {/* Badge cho thông báo chưa đọc */}
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
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
