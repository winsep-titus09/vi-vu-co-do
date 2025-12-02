import React, { useState } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { IconMenu } from "../icons/IconMenu";
import { IconX } from "../icons/IconX";
import { IconChevronDown } from "../icons/IconChevronDown";
import { IconSearch } from "../icons/IconSearch";
import {
  IconDashboard,
  IconBell,
  IconWallet,
  IconSettings,
  IconFlag,
  IconLogout,
  IconUsers,
  IconMap,
  IconLayers,
  IconBox3D,
  IconBook,
  IconStar,
} from "../icons/IconCommon";

// ============================================================================
// MENU CONFIG
// ============================================================================
const MENU_GROUPS = [
  {
    title: "Tổng quan",
    items: [
      {
        label: "Dashboard",
        path: "/dashboard/admin",
        icon: IconDashboard,
        end: true,
      },
    ],
  },
  {
    title: "Quản lý nội dung",
    items: [
      { label: "Tour du lịch", path: "/dashboard/admin/tours", icon: IconFlag },
      { label: "Địa điểm", path: "/dashboard/admin/places", icon: IconMap },
      {
        label: "Danh mục",
        path: "/dashboard/admin/categories",
        icon: IconLayers,
      },
      { label: "Bài viết", path: "/dashboard/admin/posts", icon: IconBook },
      {
        label: "Thư viện 3D",
        path: "/dashboard/admin/models-3d",
        icon: IconBox3D,
      },
      { label: "Đánh giá", path: "/dashboard/admin/reviews", icon: IconStar },
    ],
  },
  {
    title: "Người dùng & Hệ thống",
    items: [
      { label: "Người dùng", path: "/dashboard/admin/users", icon: IconUsers },
      {
        label: "Thông báo",
        path: "/dashboard/admin/notifications",
        icon: IconBell,
      },
      {
        label: "Tài chính",
        path: "/dashboard/admin/finance",
        icon: IconWallet,
      },
      {
        label: "Cài đặt",
        path: "/dashboard/admin/settings",
        icon: IconSettings,
      },
    ],
  },
];

// Map path to Readable Name for Breadcrumbs
const PATH_MAP = {
  dashboard: "Hệ thống",
  admin: "Quản trị",
  tours: "Tour du lịch",
  places: "Địa điểm",
  categories: "Danh mục",
  posts: "Bài viết",
  "models-3d": "Thư viện 3D",
  reviews: "Đánh giá",
  users: "Người dùng",
  notifications: "Thông báo",
  finance: "Tài chính",
  settings: "Cài đặt",
};

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();

  // Helper: Breadcrumbs Logic
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    return pathnames.map((value, index) => {
      const name = PATH_MAP[value] || value; // Fallback to raw path if not found
      return { name, isLast: index === pathnames.length - 1 };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-slate-50 flex font-body text-sm">
      {/* 1. DARK SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static shrink-0
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-[#020617]">
          <Link
            to="/"
            className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-heading font-bold text-lg text-white shadow-lg shadow-primary/30">
              V
            </div>
            <span className="font-heading font-bold text-lg text-white tracking-wide">
              Admin<span className="text-primary">Panel</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto text-slate-400 hover:text-white transition-colors"
          >
            <IconX className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar-dark">
          {MENU_GROUPS.map((group, idx) => (
            <div key={idx}>
              {/* [GẠCH NGANG]: Phân tầng các nhóm (trừ nhóm đầu) */}
              {idx > 0 && (
                <div className="my-4 mx-3 border-t border-slate-800/60"></div>
              )}

              {/* [TITLE]: Cỡ chữ nhỏ (text-[10px]) nhưng giữ màu sáng cũ (text-slate-500) */}
              <h3 className="text-[10px] font-bold text-slate-500 tracking-wider mb-2 px-3">
                {group.title}
              </h3>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) => `
                         flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
                         ${
                           isActive
                             ? "bg-primary text-white shadow-md shadow-primary/20" // Style Active
                             : "text-slate-400 hover:bg-slate-800 hover:text-white" // Style Inactive (Màu cũ)
                         }
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active Indicator Line */}
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/30 rounded-r-full" />
                          )}
                          {/* [ICON]: Giữ nguyên kích thước chuẩn w-5 h-5 */}
                          <Icon className="w-5 h-5 shrink-0" />
                          {/* [TEXT]: Giữ nguyên kích thước chuẩn (font-medium), không thu nhỏ */}
                          <span className="font-medium">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin Footer / Profile Summary */}
        <div className="p-4 border-t border-slate-800 bg-[#020617]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-[#020617]">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                Super Admin
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                admin@vivucodo.com
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm sticky top-0 z-30 transition-all">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 lg:hidden text-slate-600 transition-colors"
            >
              <IconMenu className="w-6 h-6" />
            </button>

            {/* Dynamic breadcrumbs */}
            <nav className="hidden md:flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-300">/</span>}
                  <span
                    className={`capitalize ${
                      crumb.isLast
                        ? "font-bold text-slate-800"
                        : "text-slate-500"
                    }`}
                  >
                    {crumb.name}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Global search bar (desktop) */}
            <div className="hidden md:flex items-center relative w-64">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                className="w-full pl-9 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Notification */}
            <button className="p-2 text-slate-500 hover:text-primary relative transition-colors rounded-full hover:bg-slate-50">
              <IconBell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
            </button>

            <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

            {/* User menu dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all"
              >
                <span className="text-xs font-bold text-slate-700 hidden md:block">
                  Admin
                </span>
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                  A
                </div>
                <IconChevronDown
                  className={`w-3 h-3 text-slate-400 mr-2 transition-transform duration-200 ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Content */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-slate-50">
                      <p className="text-xs font-bold text-slate-800">
                        Tài khoản
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Quản trị viên
                      </p>
                    </div>
                    <Link
                      to="/dashboard/admin/settings"
                      className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      Cài đặt tài khoản
                    </Link>
                    <Link
                      to="/"
                      className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      Về trang chủ
                    </Link>
                    <div className="border-t border-slate-50 mt-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2">
                        <IconLogout className="w-4 h-4" /> Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
