import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IconCalendar,
  IconClock,
  IconCheck,
  IconStar,
  IconMapPin,
} from "../../../icons/IconBox";
import { IconUser } from "../../../icons/IconUser";
import { IconX } from "../../../icons/IconX";

// Inline Icons cho phần này
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
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);

const IconChart = ({ className }) => (
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
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

// --- MOCK DATA ---
const guideInfo = {
  name: "Minh Hương",
  status: "active", // active | busy | offline
  stats: {
    pendingBookings: 3,
    upcomingTours: 2,
    monthEarnings: "8.500.000đ",
    rating: 4.9,
  },
};

const bookingRequests = [
  {
    id: "BK-901",
    tourName: "Bí mật Hoàng cung Huế",
    tourist: {
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/150?img=11",
    },
    date: "22/05/2025",
    guests: 4,
    totalPrice: "3.600.000đ",
    time: "2 giờ trước",
  },
  {
    id: "BK-902",
    tourName: "Food Tour: Ẩm thực đường phố",
    tourist: {
      name: "Sarah Jenkins",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    date: "25/05/2025",
    guests: 2,
    totalPrice: "1.000.000đ",
    time: "5 giờ trước",
  },
];

const upcomingSchedule = [
  {
    id: 1,
    tourName: "Thiền trà tại Chùa Từ Hiếu",
    date: "Ngày mai, 20/05",
    time: "08:00 - 11:00",
    guests: 2,
    status: "confirmed",
  },
  {
    id: 2,
    tourName: "Bí mật Hoàng cung Huế",
    date: "T6, 23/05",
    time: "14:00 - 18:00",
    guests: 6,
    status: "confirmed",
  },
];

export default function GuideDashboard() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="space-y-8 w-full">
      {/* 1. HEADER & STATUS */}
      <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Xin chào, {guideInfo.name}!
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Chúc bạn một ngày làm việc hiệu quả.
          </p>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center gap-3 bg-bg-main px-4 py-2 rounded-xl border border-border-light self-start md:self-center">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Trạng thái:
          </span>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
              isOnline ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                isOnline ? "translate-x-5" : "translate-x-0"
              }`}
            ></div>
          </button>
          <span
            className={`text-sm font-bold ${
              isOnline ? "text-green-600" : "text-gray-500"
            }`}
          >
            {isOnline ? "Đang nhận tour" : "Tạm nghỉ"}
          </span>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm">
              <IconUser className="w-5 h-5" />
            </div>
            <span className="text-3xl font-bold text-blue-700">
              {guideInfo.stats.pendingBookings}
            </span>
          </div>
          <p className="text-sm font-bold text-blue-800">Yêu cầu mới</p>
        </div>
        <div className="bg-purple-50 p-5 rounded-3xl border border-purple-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white rounded-xl text-purple-600 shadow-sm">
              <IconCalendar className="w-5 h-5" />
            </div>
            <span className="text-3xl font-bold text-purple-700">
              {guideInfo.stats.upcomingTours}
            </span>
          </div>
          <p className="text-sm font-bold text-purple-800">Tour sắp tới</p>
        </div>
        <div className="bg-green-50 p-5 rounded-3xl border border-green-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white rounded-xl text-green-600 shadow-sm">
              <IconWallet className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-green-700 mt-1">
              {guideInfo.stats.monthEarnings}
            </span>
          </div>
          <p className="text-sm font-bold text-green-800">Thu nhập tháng</p>
        </div>
        <div className="bg-orange-50 p-5 rounded-3xl border border-orange-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white rounded-xl text-orange-500 shadow-sm">
              <IconStar className="w-5 h-5 fill-current" />
            </div>
            <span className="text-3xl font-bold text-orange-600">
              {guideInfo.stats.rating}
            </span>
          </div>
          <p className="text-sm font-bold text-orange-700">Đánh giá</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* --- LEFT COLUMN: BOOKING REQUESTS --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-text-primary flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              Yêu cầu đặt tour
            </h2>
            <Link
              to="/dashboard/guide/requests"
              className="text-sm font-bold text-primary hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          {bookingRequests.length > 0 ? (
            <div className="space-y-4">
              {bookingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-3xl border border-border-light shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center">
                    {/* Info Block */}
                    <div className="flex gap-4 flex-1 min-w-0 w-full">
                      {" "}
                      {/* [FIX] w-full để flex hoạt động đúng trên mobile */}
                      <img
                        src={req.tourist.avatar}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-border-light shrink-0"
                        alt="Avatar"
                      />
                      <div className="min-w-0 flex-1">
                        {" "}
                        {/* [FIX] min-w-0 để text con truncate được */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-text-primary text-lg truncate max-w-full">
                            {req.tourist.name}
                          </h3>
                          <span className="text-[10px] font-bold text-text-secondary bg-gray-100 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                            {req.time}
                          </span>
                        </div>
                        {/* [FIX] break-words và whitespace-normal để tên tour dài tự xuống dòng */}
                        <p className="text-sm text-text-primary font-medium mb-2 break-words whitespace-normal">
                          Đặt tour:{" "}
                          <span className="text-primary font-bold">
                            {req.tourName}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary font-medium">
                          <span className="flex items-center gap-1 bg-bg-main px-2 py-1 rounded">
                            <IconCalendar className="w-3.5 h-3.5 text-primary" />{" "}
                            {req.date}
                          </span>
                          <span className="flex items-center gap-1 bg-bg-main px-2 py-1 rounded">
                            <IconUser className="w-3.5 h-3.5 text-primary" />{" "}
                            {req.guests} khách
                          </span>
                          <span className="font-bold text-green-600 px-2 py-1 bg-green-50 rounded">
                            {req.totalPrice}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Block (Chấp nhận trên, Từ chối dưới) */}
                    <div className="flex flex-col gap-2 w-full sm:w-36 shrink-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <button className="w-full px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all whitespace-nowrap">
                        <IconCheck className="w-4 h-4" /> Chấp nhận
                      </button>
                      <button className="w-full px-4 py-2.5 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
                        <IconX className="w-4 h-4" /> Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-white rounded-3xl border border-dashed border-border-light">
              <p className="text-text-secondary">
                Hiện không có yêu cầu nào mới.
              </p>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: SCHEDULE --- */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm sticky top-24">
            <h3 className="font-bold text-text-primary mb-5 flex items-center gap-2">
              <IconClock className="w-5 h-5 text-primary" /> Lịch trình sắp tới
            </h3>
            <div className="space-y-5">
              {upcomingSchedule.map((item) => (
                <div key={item.id} className="flex gap-4 items-start relative">
                  <div className="absolute left-[22px] top-10 bottom-[-20px] w-0.5 bg-border-light last:hidden"></div>

                  <div className="w-12 h-12 rounded-xl bg-bg-main text-primary flex flex-col items-center justify-center shrink-0 border border-border-light z-10 relative">
                    <span className="text-[10px] font-bold uppercase">
                      {item.date.split(", ")[0]}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {item.date.split("/")[0].slice(-2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p
                      className="text-sm font-bold text-text-primary line-clamp-1"
                      title={item.tourName}
                    >
                      {item.tourName}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {item.time} • {item.guests} khách
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                        Sắp diễn ra
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border-light text-center">
              <Link
                to="#"
                className="text-sm font-bold text-primary hover:underline"
              >
                Xem toàn bộ lịch trình →
              </Link>
            </div>
          </div>

          {/* Quick Report */}
          <div className="bg-gradient-to-br from-[#2C3E50] to-[#34495E] p-6 rounded-3xl text-white relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <IconChart className="w-5 h-5 text-secondary" /> Hiệu quả tuần
                này
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider">
                    <span className="text-white/70">Phản hồi</span>
                    <span className="text-green-400">92%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 w-[92%] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider">
                    <span className="text-white/70">Hoàn thành</span>
                    <span className="text-secondary">4/5</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[80%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
