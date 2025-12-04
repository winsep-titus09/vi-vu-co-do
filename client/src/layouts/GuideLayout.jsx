import React, { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { IconMenu } from "../icons/IconMenu";
import { IconX } from "../icons/IconX";
import { IconMapPin, IconCalendar, IconStar } from "../icons/IconBox";
import {
  IconBell,
  IconDashboard,
  IconInbox,
  IconWallet,
  IconSettings,
  IconEdit,
  IconPlus,
  IconFileText,
  IconLogout,
  IconPlusCircle,
} from "../icons/IconCommon";
import { authApi } from "../features/auth/api";
import {
  useBookingRequests,
  useMyGuideProfile,
} from "../features/guides/hooks";
import { useNotifications } from "../features/notifications/hooks";

export default function GuideLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch guide profile (includes user info)
  const { profile: guideProfile } = useMyGuideProfile();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/sign-in");
    }
  }, [navigate]);

  // Fetch pending booking requests count
  const { requests } = useBookingRequests();
  const pendingCount = requests?.length || 0;

  // Fetch unread notifications count
  const { notifications } = useNotifications({ limit: 50 });
  const unreadCount = notifications?.filter((n) => !n.is_read)?.length || 0;

  // Handle logout
  const handleLogout = async () => {
    try {
      await authApi.logout();
      localStorage.removeItem("token");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  // Dynamic menu with badge from API
  const menuItems = [
    {
      label: "Bảng điều khiển",
      path: "/dashboard/guide",
      icon: IconDashboard,
      end: true,
    },
    {
      label: "Yêu cầu đặt tour",
      path: "/dashboard/guide/requests",
      icon: IconInbox,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      label: "Tour của tôi",
      path: "/dashboard/guide/my-tours",
      icon: IconMapPin,
    },
    {
      label: "Tạo tour mới",
      path: "/dashboard/guide/create-tour",
      icon: IconPlus,
    },
    {
      label: "Lịch trình",
      path: "/dashboard/guide/schedule",
      icon: IconCalendar,
    },
    { label: "Thu nhập", path: "/dashboard/guide/earnings", icon: IconWallet },
    {
      label: "Đánh giá",
      path: "/dashboard/guide/reviews",
      icon: IconStar,
    },
    {
      label: "Bài viết",
      path: "/dashboard/guide/posts",
      icon: IconEdit,
    },
    {
      label: "Hồ sơ & Cài đặt",
      path: "/dashboard/guide/profile-settings",
      icon: IconSettings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-body">
      {/* 1. SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
        `}
      >
        {/* Logo header */}
        <div className="h-20 flex items-center justify-center border-b border-gray-100 px-4 relative">
          <Link
            to="/"
            className="flex items-center gap-2 group"
            title="Về trang chủ"
          >
            <img
              src="/images/uploads/logo-hue.png"
              alt="Vi Vu Cố Đô"
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute right-4 p-1 text-gray-500 hover:text-primary"
          >
            <IconX className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group
                  ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-5 h-5" />
                      {item.label}
                    </div>

                    {/* Badge display */}
                    {item.badge && (
                      <span
                        className={`
                          px-2 py-0.5 rounded-full text-[10px] font-bold
                          ${
                            isActive
                              ? "bg-white text-primary"
                              : "bg-red-500 text-white"
                          }
                        `}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
            >
              <IconLogout className="w-5 h-5" />
              Đăng xuất
            </button>
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
              <img
                src={
                  guideProfile?.avatar_url || "https://i.pravatar.cc/150?img=25"
                }
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">
                {guideProfile?.name || "Hướng dẫn viên"}
              </p>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>{" "}
                Online
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay (Mobile Only) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <IconMenu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-bold text-gray-800 hidden md:block">
              Workspace
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard/guide/notifications"
              className="p-2 text-gray-400 hover:text-primary relative"
              title="Thông báo"
            >
              <IconBell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
