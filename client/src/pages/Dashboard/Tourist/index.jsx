import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IconClock,
  IconStar,
  IconCalendar,
  IconCheck,
} from "../../../icons/IconBox";
import IconArrowRight from "../../../icons/IconArrowRight";
import { IconUser } from "../../../icons/IconUser";
import TicketModal from "../../../components/Modals/TicketModal";
import { IconTicket } from "../../../icons/IconCommon";

// --- MOCK DATA ---
const userInfo = {
  name: "Hoàng Nam",
  avatar:
    "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_4.jpg",
  // Đã ẩn points và type vì không có trong yêu cầu FC-TOURIST
};

const upcomingTrip = {
  id: 101,
  tourName: "Bí mật Hoàng cung Huế & Trải nghiệm trà chiều",
  date: "20/05/2025",
  time: "08:00 AM",
  guide: "Minh Hương",
  guests: 2,
  status: "confirmed", // confirmed, pending, completed, cancelled
  image:
    "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
};

const recentBookings = [
  {
    id: 99,
    name: "Food Tour: Ẩm thực đường phố",
    date: "15/04/2025",
    price: "$25",
    status: "completed",
  },
  {
    id: 98,
    name: "Lăng Tự Đức & Đồi Vọng Cảnh",
    date: "10/02/2025",
    price: "$35",
    status: "completed",
  },
  {
    id: 97,
    name: "Sông Hương ca Huế",
    date: "01/01/2025",
    price: "$15",
    status: "cancelled",
  },
];

// Helper function badge (FC-TOURIST-03: Hiển thị trạng thái)
const getStatusBadge = (status) => {
  switch (status) {
    case "confirmed":
      return (
        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
          Đã xác nhận
        </span>
      );
    case "completed":
      return (
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
          Hoàn thành
        </span>
      );
    case "cancelled":
      return (
        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
          Đã hủy
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
          Chờ xử lý
        </span>
      );
  }
};

export default function TouristDashboard() {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* pb-20 removed to avoid huge bottom spacing */}
      {/* 1. WELCOME HEADER */}
      {/* Loại bỏ thống kê điểm thưởng để bám sát FC-TOURIST */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-border-light shadow-sm">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Xin chào, {userInfo.name}! 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Quản lý chuyến đi và trải nghiệm khám phá Huế của bạn.
          </p>
        </div>

        {/* Chỉ giữ nút đặt tour mới - Call to action chính */}
        <Link
          to="/tours"
          className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          + Đặt chuyến đi mới
        </Link>
      </div>

      <div className="space-y-8">
        {/* 2. UPCOMING TRIP (FC-TOURIST-03: Quản lý chuyến đi) */}
        <section>
          <h2 className="text-xl font-heading font-bold text-text-primary mb-4 flex items-center gap-2">
            <IconTicket className="w-5 h-5 text-primary" /> Chuyến đi sắp tới
          </h2>

          {upcomingTrip ? (
            <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-card hover:shadow-lg transition-shadow group">
              <div className="grid grid-cols-1 md:grid-cols-3 h-full">
                {/* Image */}
                <div className="md:col-span-1 h-48 md:h-full relative overflow-hidden">
                  <img
                    src={upcomingTrip.image}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Tour"
                  />
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(upcomingTrip.status)}
                  </div>
                </div>

                {/* Content */}
                <div className="md:col-span-2 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-text-primary line-clamp-1">
                        {upcomingTrip.tourName}
                      </h3>
                      <Link
                        to={`/tours/${upcomingTrip.id}`}
                        className="bg-primary/5 text-primary p-2 rounded-lg hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        <IconArrowRight className="w-5 h-5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-4">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <IconCalendar className="w-4 h-4 text-primary" />
                        <span className="font-medium text-text-primary">
                          {upcomingTrip.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <IconClock className="w-4 h-4 text-primary" />
                        <span>{upcomingTrip.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <IconUser className="w-4 h-4 text-primary" />
                        <span>HDV: {upcomingTrip.guide}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        {/* Guest Icon inline */}
                        <svg
                          className="w-4 h-4 text-primary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          ></path>
                        </svg>
                        <span>{upcomingTrip.guests} Khách</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border-light flex gap-3">
                    {/* FC-TOURIST-07: Xem hóa đơn/Vé */}
                    <button
                      onClick={() => setIsTicketModalOpen(true)}
                      className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all"
                    >
                      Xem vé điện tử
                    </button>
                    {/* FC-TOURIST-08: Liên hệ HDV */}
                    <button className="px-4 py-2 rounded-xl border border-border-light text-text-secondary hover:text-primary hover:border-primary transition-all text-sm font-bold">
                      Liên hệ HDV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-border-light text-center">
              <p className="text-text-secondary mb-4">
                Bạn chưa có chuyến đi nào sắp tới.
              </p>
              <Link
                to="/tours"
                className="text-primary font-bold hover:underline"
              >
                Khám phá tour ngay
              </Link>
            </div>
          )}
        </section>

        {/* 3. RECENT BOOKINGS (FC-TOURIST-03) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-bold text-text-primary">
              Lịch sử đặt chỗ
            </h2>
            <Link
              to="/dashboard/tourist/history"
              className="text-sm font-bold text-primary hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-border-light overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-bg-main/50 text-xs uppercase text-text-secondary font-bold">
                  <tr>
                    <th className="p-4 whitespace-nowrap">Tên Tour</th>
                    <th className="p-4 whitespace-nowrap">Ngày đi</th>
                    <th className="p-4 whitespace-nowrap">Tổng tiền</th>
                    <th className="p-4 whitespace-nowrap">Trạng thái</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                    >
                      <td className="p-4 font-bold text-text-primary min-w-[200px]">
                        {booking.name}
                      </td>
                      <td className="p-4 text-text-secondary">
                        {booking.date}
                      </td>
                      <td className="p-4 font-bold text-primary">
                        {booking.price}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button className="text-xs font-bold text-text-secondary hover:text-primary underline whitespace-nowrap">
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        booking={upcomingTrip}
      />
    </div>
  );
}
