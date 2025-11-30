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
import { IconWallet, IconChart, IconLoader } from "../../../icons/IconCommon";
import {
  useBookingRequests,
  useUpcomingBookings,
  useMonthlyEarnings,
} from "../../../features/guides/hooks";
import guidesApi from "../../../features/guides/api";
import { formatCurrency } from "../../../lib/formatters";

export default function GuideDashboard() {
  const [isOnline, setIsOnline] = useState(true);

  // Fetch data from API
  const {
    requests,
    isLoading: loadingRequests,
    refetch: refetchRequests,
  } = useBookingRequests();
  const { bookings: upcomingSchedule, isLoading: loadingSchedule } =
    useUpcomingBookings();
  const { data: earningsData, isLoading: loadingEarnings } = useMonthlyEarnings(
    new Date().getFullYear()
  );

  // Get user info
  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
  const guideName = userInfo.name || "Hướng dẫn viên";

  // Calculate stats from data
  const stats = {
    pendingBookings: requests.length,
    upcomingTours: upcomingSchedule.length,
    monthEarnings: earningsData
      ? formatCurrency(earningsData.months?.[new Date().getMonth()]?.total || 0)
      : "0đ",
    rating: 4.9, // TODO: Get from API
  };

  // Handle approve booking
  const handleApprove = async (bookingId) => {
    try {
      await guidesApi.approveBooking(bookingId);
      alert("Đã chấp nhận yêu cầu đặt tour!");
      refetchRequests();
    } catch (error) {
      alert(error.message || "Không thể chấp nhận yêu cầu");
    }
  };

  // Handle reject booking
  const handleReject = async (bookingId) => {
    const note = prompt("Lý do từ chối (không bắt buộc):");
    try {
      await guidesApi.rejectBooking(bookingId, note || "");
      alert("Đã từ chối yêu cầu đặt tour!");
      refetchRequests();
    } catch (error) {
      alert(error.message || "Không thể từ chối yêu cầu");
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Ngày mai";
    } else {
      return date.toLocaleDateString("vi-VN");
    }
  };

  // Format time ago
  const formatTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} ngày trước`;
    if (diffHours > 0) return `${diffHours} giờ trước`;
    if (diffMins > 0) return `${diffMins} phút trước`;
    return "Vừa xong";
  };

  return (
    <div className="space-y-8 w-full">
      {/* 1. HEADER & STATUS */}
      <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Xin chào, {guideName}!
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
              {stats.pendingBookings}
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
              {stats.upcomingTours}
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
              {stats.monthEarnings}
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
              {stats.rating}
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

          {loadingRequests ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-border-light">
              <IconLoader className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-text-secondary mt-2">Đang tải...</p>
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white p-5 rounded-3xl border border-border-light shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center">
                    {/* Info Block */}
                    <div className="flex gap-4 flex-1 min-w-0 w-full">
                      <img
                        src={
                          req.customer_id?.avatar_url ||
                          "https://i.pravatar.cc/150?img=11"
                        }
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-border-light shrink-0"
                        alt="Avatar"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-text-primary text-lg truncate max-w-full">
                            {req.customer_id?.name || "Khách hàng"}
                          </h3>
                          <span className="text-[10px] font-bold text-text-secondary bg-gray-100 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                            {formatTimeAgo(req.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-text-primary font-medium mb-2 break-words whitespace-normal">
                          Đặt tour:{" "}
                          <span className="text-primary font-bold">
                            {req.tour_id?.name || "Tour"}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary font-medium">
                          <span className="flex items-center gap-1 bg-bg-main px-2 py-1 rounded">
                            <IconCalendar className="w-3.5 h-3.5 text-primary" />{" "}
                            {new Date(req.start_date).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                          <span className="flex items-center gap-1 bg-bg-main px-2 py-1 rounded">
                            <IconUser className="w-3.5 h-3.5 text-primary" />{" "}
                            {req.participants?.filter((p) => p.count_slot)
                              .length || 0}{" "}
                            khách
                          </span>
                          <span className="font-bold text-green-600 px-2 py-1 bg-green-50 rounded">
                            {formatCurrency(req.total_price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Block */}
                    <div className="flex flex-col gap-2 w-full sm:w-36 shrink-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <button
                        onClick={() => handleApprove(req._id)}
                        className="w-full px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all whitespace-nowrap"
                      >
                        <IconCheck className="w-4 h-4" /> Chấp nhận
                      </button>
                      <button
                        onClick={() => handleReject(req._id)}
                        className="w-full px-4 py-2.5 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                      >
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
            {loadingSchedule ? (
              <div className="text-center py-8">
                <IconLoader className="w-6 h-6 text-primary animate-spin mx-auto" />
              </div>
            ) : upcomingSchedule.length > 0 ? (
              <div className="space-y-5">
                {upcomingSchedule.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-4 items-start relative"
                  >
                    <div className="absolute left-[22px] top-10 bottom-[-20px] w-0.5 bg-border-light last:hidden"></div>

                    <div className="w-12 h-12 rounded-xl bg-bg-main text-primary flex flex-col items-center justify-center shrink-0 border border-border-light z-10 relative">
                      <span className="text-[10px] font-bold uppercase">
                        {formatDate(item.start_date).slice(0, 2)}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {new Date(item.start_date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p
                        className="text-sm font-bold text-text-primary line-clamp-1"
                        title={item.tour_id?.name || "Tour"}
                      >
                        {item.tour_id?.name || "Tour"}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {item.start_time || "08:00"} •{" "}
                        {item.participants?.filter((p) => p.count_slot)
                          .length || 0}{" "}
                        khách
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
            ) : (
              <p className="text-sm text-text-secondary text-center py-8">
                Chưa có lịch trình nào
              </p>
            )}
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
