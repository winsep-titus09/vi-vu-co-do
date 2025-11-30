import React from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { IconCheck, IconMapPin, IconCalendar } from "../../../icons/IconBox";
import { IconUser } from "../../../icons/IconUser";
import { IconX } from "../../../icons/IconX";
import {
  IconWallet,
  IconArrowUpRight,
  IconEye,
  IconFlag,
  IconShield,
  IconSettings,
  IconTicket,
  IconAlert,
} from "../../../icons/IconCommon";

// ============================================================================
// MOCK DATA
// ============================================================================
const stats = {
  totalUsers: 1240,
  newUsers: 45,
  tourists: 1150,
  guides: 90,
  totalRevenue: "452.500.000đ",
  revenueGrowth: 12.5,
  totalTours: 68,
  activeTours: 52,
  newBookings: 24,
};

const revenueData = [
  { name: "Th1", value: 120 },
  { name: "Th2", value: 180 },
  { name: "Th3", value: 150 },
  { name: "Th4", value: 250 },
  { name: "Th5", value: 320 },
  { name: "Th6", value: 452 },
];

const userDistribution = [
  { name: "Du khách", value: 1150, color: "#5b3d7c" },
  { name: "Ước dẫn viên", value: 90, color: "#d4af37" },
];

// Mock data: Recent bookings
const recentBookings = [
  {
    id: "#BK-902",
    user: "Sarah Jenkins",
    tour: "Food Tour: Ẩm thực đường phố",
    amount: "1.000.000đ",
    status: "pending",
    time: "5 phút trước",
  },
  {
    id: "#BK-901",
    user: "Nguyễn Văn A",
    tour: "Bí mật Hoàng cung Huế",
    amount: "3.600.000đ",
    status: "confirmed",
    time: "2 giờ trước",
  },
  {
    id: "#BK-899",
    user: "Lê Bình",
    tour: "Thiền trà tại Chùa Từ Hiếu",
    amount: "600.000đ",
    status: "completed",
    time: "1 ngày trước",
  },
  {
    id: "#BK-898",
    user: "Trần Tuấn",
    tour: "Khám phá phá Tam Giang",
    amount: "5.000.000đ",
    status: "cancelled",
    time: "2 ngày trước",
  },
];

// Mock data: Pending tasks
const pendingTasks = [
  { id: 1, title: "Duyệt hồ sơ HDV: Phạm Lan", type: "user", urgency: "high" },
  {
    id: 2,
    title: "Duyệt Tour mới: 'Huế by Night'",
    type: "tour",
    urgency: "medium",
  },
  {
    id: 3,
    title: "Khiếu nại: Booking #BK-880",
    type: "report",
    urgency: "high",
  },
];

export default function AdminDashboard() {
  // Helper Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase">
            Chờ duyệt
          </span>
        );
      case "confirmed":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
            Đã nhận
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">
            Hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Tổng quan hệ thống
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Chào mừng quay trở lại, Administrator.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-text-secondary bg-white px-4 py-2 rounded-xl border border-border-light shadow-sm">
          <IconCalendar className="w-4 h-4" />
          <span>Tháng 6, 2025</span>
        </div>
      </div>

      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ... (Giữ nguyên phần Stats Cards như cũ) ... */}
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <IconUser className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <IconArrowUpRight className="w-3 h-3" /> +{stats.newUsers}
            </span>
          </div>
          <div>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">
              Tổng người dùng
            </p>
            <h3 className="text-3xl font-bold text-text-primary mt-1">
              {stats.totalUsers.toLocaleString()}
            </h3>
            <div className="flex items-center gap-3 mt-3 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary"></div>{" "}
                {stats.tourists} Khách
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>{" "}
                {stats.guides} HDV
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-green-50 text-green-600">
              <IconWallet className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <IconArrowUpRight className="w-3 h-3" /> +{stats.revenueGrowth}%
            </span>
          </div>
          <div>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">
              Tổng doanh thu
            </p>
            <h3 className="text-3xl font-bold text-text-primary mt-1">
              {stats.totalRevenue}
            </h3>
            <p className="text-xs text-text-secondary mt-2">
              Đã trừ phí hoa hồng nền tảng
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
              <IconMapPin className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">
              Tổng số Tour
            </p>
            <h3 className="text-3xl font-bold text-text-primary mt-1">
              {stats.totalTours}
            </h3>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-purple-500 h-1.5 rounded-full"
                style={{
                  width: `${(stats.activeTours / stats.totalTours) * 100}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              {stats.activeTours} tour đang hoạt động
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-orange-50 text-orange-500">
              <IconTicket className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-lg animate-pulse">
              Mới
            </span>
          </div>
          <div>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">
              Booking hôm nay
            </p>
            <h3 className="text-3xl font-bold text-text-primary mt-1">
              {stats.newBookings}
            </h3>
            <p className="text-xs text-text-secondary mt-2">
              Cần xử lý tranh chấp: <strong>0</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ... (Giữ nguyên phần Charts) ... */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-border-light shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">
              Biểu đồ doanh thu
            </h3>
            <select className="bg-bg-main px-3 py-1.5 rounded-lg text-xs font-bold border border-border-light outline-none cursor-pointer">
              <option>6 tháng qua</option>
              <option>Năm nay</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5b3d7c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#5b3d7c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  formatter={(value) => [`${value} triệu`, "Doanh thu"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#5b3d7c"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-border-light shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-text-primary mb-6">
            Cơ cấu người dùng
          </h3>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-2xl font-bold text-text-primary block">
                  {stats.totalUsers}
                </span>
                <span className="text-[10px] text-text-secondary uppercase tracking-wider">
                  Users
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {userDistribution.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-text-secondary">{item.name}</span>
                </div>
                <span className="font-bold text-text-primary">
                  {((item.value / stats.totalUsers) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable section: Latest bookings and tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Latest Bookings Table (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border-light flex justify-between items-center">
            <h3 className="text-lg font-bold text-text-primary">
              Booking mới nhất
            </h3>
            <Link
              to="/dashboard/admin/bookings"
              className="text-xs font-bold text-primary hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase">
                <tr>
                  <th className="p-4 pl-6">Mã #</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Tour</th>
                  <th className="p-4">Tổng tiền</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 pr-6"></th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((bk, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                  >
                    <td className="p-4 pl-6 font-mono font-bold text-text-secondary text-xs">
                      {bk.id}
                    </td>
                    <td className="p-4 font-bold text-text-primary">
                      {bk.user}
                    </td>
                    <td
                      className="p-4 text-text-secondary truncate max-w-[150px]"
                      title={bk.tour}
                    >
                      {bk.tour}
                    </td>
                    <td className="p-4 font-bold text-text-primary">
                      {bk.amount}
                    </td>
                    <td className="p-4">{getStatusBadge(bk.status)}</td>
                    <td className="p-4 pr-6 text-right text-xs text-text-secondary">
                      {bk.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Actions (1/3) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-border-light shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <IconAlert className="w-5 h-5 text-red-500" /> Cần xử lý ngay
          </h3>

          <div className="flex-1 space-y-3">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl border border-border-light hover:border-primary/30 hover:shadow-md transition-all bg-bg-main/30 group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      task.type === "report"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {task.type === "report" ? "Khiếu nại" : "Duyệt"}
                  </span>
                  <IconEye className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-text-primary line-clamp-2">
                  {task.title}
                </h4>
                <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      task.urgency === "high" ? "bg-red-500" : "bg-yellow-500"
                    }`}
                  ></span>
                  Ưu tiên: {task.urgency === "high" ? "Cao" : "Trung bình"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border-light grid grid-cols-2 gap-3">
            <button className="py-2.5 rounded-xl bg-primary/5 text-primary font-bold text-xs hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2">
              <IconUser className="w-4 h-4" /> Duyệt HDV
            </button>
            <button className="py-2.5 rounded-xl bg-primary/5 text-primary font-bold text-xs hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2">
              <IconFlag className="w-4 h-4" /> Duyệt Tour
            </button>
            <button className="col-span-2 py-2.5 rounded-xl border border-border-light text-text-secondary font-bold text-xs hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
              <IconSettings className="w-4 h-4" /> Cấu hình hệ thống
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
