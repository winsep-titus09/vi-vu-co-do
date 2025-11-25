// src/layouts/GuideLayout.jsx
import React from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { IconUser } from "../icons/IconUser";
import { IconCalendar } from "../icons/IconBox";
import IconShieldCheck from "../icons/IconShieldCheck";

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

const MENU = [
  {
    label: "Bảng điều khiển",
    path: "/dashboard/guide",
    icon: IconUser,
    end: true,
  },
  {
    label: "Tour của tôi",
    path: "/dashboard/guide/my-tours",
    icon: IconMapPin,
  },
  {
    label: "Lịch trình",
    path: "/dashboard/guide/schedule",
    icon: IconCalendar,
  },
  {
    label: "Thu nhập",
    path: "/dashboard/guide/earnings",
    icon: IconShieldCheck,
  },
];

export default function GuideLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR MÀU TRẮNG SẠCH SẼ */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <Link to="/" className="text-xl font-heading font-bold text-primary">
            Guide Partner
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {MENU.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                    ${
                      isActive
                        ? "bg-green-50 text-green-700"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }
                 `}
              >
                <IconComponent className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 ml-64">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-end sticky top-0 z-40">
          <span className="text-sm font-bold text-gray-600">
            Xin chào, Minh Hương
          </span>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
