// src/layouts/AdminLayout.jsx
import React from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { IconUser } from "../icons/IconUser";
import IconBookOpen from "../icons/IconBookOpen";
import IconArrowRight from "../icons/IconArrowRight";

const IconMapPin = ({ className }) => (
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
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const Icon3D = ({ className }) => (
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
    <path d="M12 3 2 8.5 12 14 22 8.5 12 3Z" />
    <path d="M2 8.5v11l10 5.5" />
    <path d="M22 8.5v11l-10 5.5" />
    <path d="m12 14 10-5.5" />
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

const MENU = [
  {
    label: "Tổng quan",
    path: "/dashboard/admin",
    icon: IconUser,
    end: true,
  },
  {
    label: "Quản lý Tour",
    path: "/dashboard/admin/tours",
    icon: IconMapPin,
  },
  {
    label: "Danh mục",
    path: "/dashboard/admin/categories",
    icon: IconBookOpen,
  },
  {
    label: "Mô hình 3D",
    path: "/dashboard/admin/models-3d",
    icon: Icon3D,
  },
  {
    label: "Cài đặt hệ thống",
    path: "/dashboard/admin/settings",
    icon: IconSettings,
  },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex font-body">
      {/* SIDEBAR ĐEN/TỐI CHO ADMIN (Phân biệt rõ ràng) */}
      <aside className="w-64 bg-[#1a1f2c] text-white flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <span className="text-xl font-heading font-bold text-white">
            VVCD Admin
          </span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {MENU.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }
               `}
              >
                <IconComponent className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full">
            <IconArrowRight className="w-4 h-4 rotate-180" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 sticky top-0 z-40">
          <h2 className="font-bold text-text-primary">Bảng quản trị</h2>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
            A
          </div>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
