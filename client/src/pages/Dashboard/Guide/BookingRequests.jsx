import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IconCheck,
  IconCalendar,
  IconClock,
  IconMapPin,
} from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconUser } from "../../../icons/IconUser";
import { useGuideBookings } from "../../../features/guides/hooks";
import guidesApi from "../../../features/guides/api";
import { formatCurrency, formatTimeAgo } from "../../../lib/formatters";
import { useToast } from "../../../components/Toast/useToast";

// Inline Icons
const IconLoader = ({ className }) => (
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
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconMessage = ({ className }) => (
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
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconFilter = ({ className }) => (
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
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ duyệt", count: 2 },
  { id: "accepted", label: "Đã nhận", count: 1 },
  { id: "rejected", label: "Đã từ chối" },
];

export default function BookingRequests() {
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const toast = useToast();

  // Determine status filter based on active tab
  const getStatusFilter = () => {
    if (activeTab === "all") return undefined;
    if (activeTab === "pending") return "waiting_guide";
    if (activeTab === "accepted") return "accepted,paid";
    if (activeTab === "rejected") return "rejected";
    return undefined;
  };

  // Fetch bookings from API
  const { bookings, isLoading, error, refetch } = useGuideBookings({
    status: getStatusFilter(),
    limit: 50,
  });

  // Filter by search
  const filteredRequests = bookings.filter((booking) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const tourName = booking.tour_id?.name || "";
    const customerName = booking.customer_id?.name || "";
    return (
      tourName.toLowerCase().includes(searchLower) ||
      customerName.toLowerCase().includes(searchLower)
    );
  });

  // Map booking status to display status
  const getDisplayStatus = (booking) => {
    if (booking.status === "waiting_guide") return "pending";
    if (booking.status === "accepted" || booking.status === "paid")
      return "accepted";
    if (booking.status === "rejected") return "rejected";
    if (booking.status === "completed") return "completed";
    return "pending";
  };

  // Handle approve booking
  const handleApprove = async (bookingId) => {
    try {
      await guidesApi.approveBooking(bookingId);
      toast.success("Thành công!", "Đã chấp nhận yêu cầu đặt tour.");
      refetch();
    } catch (error) {
      toast.error("Lỗi", error.message || "Không thể chấp nhận yêu cầu");
    }
  };

  // Handle reject booking
  const handleReject = async (bookingId) => {
    const note = prompt("Lý do từ chối (không bắt buộc):");
    if (note === null) return; // User cancelled
    try {
      await guidesApi.rejectBooking(bookingId, note || "");
      toast.success("Thành công!", "Đã từ chối yêu cầu đặt tour.");
      refetch();
    } catch (error) {
      toast.error("Lỗi", error.message || "Không thể từ chối yêu cầu");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200 whitespace-nowrap">
            Chờ duyệt
          </span>
        );
      case "accepted":
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200 whitespace-nowrap">
            Đã chấp nhận
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200 whitespace-nowrap">
            Đã từ chối
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 whitespace-nowrap">
            Hoàn thành
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
            Yêu cầu đặt tour
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Quản lý và phản hồi các yêu cầu từ du khách.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-border-light flex flex-col md:flex-row justify-between gap-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                        whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                        ${
                          activeTab === tab.id
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "text-text-secondary hover:bg-gray-50"
                        }
                    `}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    activeTab === tab.id
                      ? "bg-white text-primary"
                      : "bg-gray-200 text-text-secondary"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm tên khách hoặc tour..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-light bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
            onChange={(e) => setSearch(e.target.value)}
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-border-light">
            <IconLoader className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-text-secondary text-sm mt-4">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-red-100">
            <p className="text-red-600 font-bold mb-1">Lỗi tải dữ liệu</p>
            <p className="text-text-secondary text-sm">{error}</p>
          </div>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((booking) => {
            const startDate = booking.start_date
              ? new Date(booking.start_date)
              : null;
            const createdAt = booking.createdAt || booking.created_at || null;
            const req = {
              id: booking._id,
              tourName: booking.tour_id?.name || "Tour",
              tourist: {
                name: booking.customer_id?.name || "Khách hàng",
                avatar:
                  booking.customer_id?.avatar_url ||
                  "https://i.pravatar.cc/150?img=11",
              },
              date: startDate
                ? startDate.toLocaleDateString("vi-VN")
                : "Đang cập nhật",
              time: startDate
                ? startDate.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : booking.tour_id?.fixed_departure_time || "--:--",
              guests:
                booking.participants?.filter((p) => p.count_slot).length ||
                booking.contact?.guest_count ||
                0,
              totalPrice: formatCurrency(booking.total_price),
              note: booking.contact?.note?.trim() || "",
              requestTime: createdAt ? formatTimeAgo(createdAt) : "--",
              status: getDisplayStatus(booking),
            };
            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-border-light p-6 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Tourist Info */}
                  <div className="lg:w-64 shrink-0 flex lg:flex-col items-center lg:items-start gap-4 border-b lg:border-b-0 lg:border-r border-border-light pb-4 lg:pb-0 lg:pr-6">
                    <div className="relative">
                      {req.tourist.avatar ? (
                        <img
                          src={req.tourist.avatar}
                          className="w-16 h-16 rounded-full object-cover border border-border-light"
                          alt="Avatar"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-bg-main flex items-center justify-center text-text-secondary font-bold text-xl border border-border-light">
                          {req.tourist.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-primary">
                        {req.tourist.name}
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Yêu cầu: {req.requestTime}
                      </p>
                      {req.status === "accepted" && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>{" "}
                          Đã liên hệ
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle: Tour Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2 gap-3">
                      {/* [LINKED] Nhấn vào tên tour để xem chi tiết */}
                      <Link
                        to={`/dashboard/guide/requests/${req.id}`}
                        className="text-2xl font-heading font-bold text-text-primary line-clamp-2 text-primary group-hover:underline cursor-pointer hover:text-primary-dark transition-colors"
                      >
                        {req.tourName}
                      </Link>
                      <div className="lg:hidden shrink-0">
                        {getStatusBadge(req.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-sm text-text-secondary mb-4">
                      <div className="flex items-center gap-2">
                        <IconCalendar className="w-4 h-4 text-primary" />
                        <span className="font-medium text-text-primary">
                          {req.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconClock className="w-4 h-4 text-primary" />{" "}
                        {req.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <IconUser className="w-4 h-4 text-primary" />{" "}
                        {req.guests} khách
                      </div>
                    </div>

                    {req.note && (
                      <div className="bg-bg-main/50 p-3 rounded-xl border border-border-light flex gap-3 items-start">
                        <IconMessage className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-secondary uppercase block mb-0.5">
                            Ghi chú từ khách:
                          </span>
                          <p className="text-sm text-text-primary italic">
                            "{req.note}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Action & Price */}
                  <div className="lg:w-48 shrink-0 flex flex-col justify-between items-end border-t lg:border-t-0 border-border-light pt-4 lg:pt-0 lg:pl-6 min-h-[140px]">
                    <div className="text-right hidden lg:block mb-4">
                      {getStatusBadge(req.status)}
                    </div>

                    <div className="w-full mt-auto text-right">
                      <p className="text-xs text-text-secondary uppercase font-bold">
                        Tổng tiền
                      </p>
                      <p className="text-xl font-bold text-primary mb-4">
                        {req.totalPrice}
                      </p>

                      {req.status === "pending" && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleApprove(booking._id)}
                            className="w-full px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            <IconCheck className="w-4 h-4" /> Chấp nhận
                          </button>
                          <button
                            onClick={() => handleReject(booking._id)}
                            className="w-full px-4 py-2 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-sm transition-colors whitespace-nowrap"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}

                      {req.status === "accepted" && (
                        <button className="w-full px-4 py-2 rounded-xl border border-primary text-primary bg-white hover:bg-primary/5 font-bold text-sm transition-colors whitespace-nowrap">
                          Nhắn tin
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-border-light">
            <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
              <IconUser className="w-8 h-8" />
            </div>
            <p className="text-text-primary font-bold mb-1">
              Chưa có yêu cầu nào
            </p>
            <p className="text-text-secondary text-sm">
              Danh sách trống ở trạng thái này.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
