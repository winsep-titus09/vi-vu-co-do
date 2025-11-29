import React from "react";
import { useParams, Link } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconCheck,
} from "../../../icons/IconBox";
import { IconUser } from "../../../icons/IconUser";
import { IconX } from "../../../icons/IconX";
import IconMail from "../../../icons/IconMail";
import IconPhone from "../../../icons/IconPhone";
import {
  IconMessage,
  IconArrowRight,
  IconShield,
  IconWallet,
  IconInfo,
} from "../../../icons/IconCommon";

// ============================================================================
// MOCK DATA
// ============================================================================
// Mock data: Booking details
const booking = {
  id: "BK-901",
  created_at: "22/05/2025 09:30",
  status: "pending", // pending, confirmed, completed, cancelled
  tour: {
    id: 1,
    name: "Bí mật Hoàng cung Huế & Trải nghiệm trà chiều",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
    duration: "4 giờ",
    location: "Đại Nội, Huế",
  },
  tourist: {
    name: "Nguyễn Văn A",
    avatar:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_3.jpg",
    email: "nguyenvana@email.com",
    phone: "0905 *** *** (Hiện sau khi chấp nhận)",
    rating: 5.0,
    reviews: 3,
  },
  schedule: {
    date: "25/05/2025",
    time: "08:00 - 12:00",
    guests: 4,
    adults: 2,
    children: 2,
  },
  payment: {
    total: "3.600.000đ",
    method: "Ví MoMo",
    paymentStatus: "pending", // pending (chờ HDV duyệt), paid, refunded
  },
  note: "Gia đình tôi có người lớn tuổi, mong HDV di chuyển chậm và chuẩn bị xe điện nếu có thể trong Đại Nội.",
};

// Helper Badge
const getStatusBadge = (status) => {
  switch (status) {
    case "pending":
      return (
        <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Chờ duyệt
        </span>
      );
    case "confirmed":
      return (
        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span> Đã chấp
          nhận
        </span>
      );
    case "completed":
      return (
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span> Hoàn thành
        </span>
      );
    case "cancelled":
      return (
        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500"></span> Đã hủy
        </span>
      );
    default:
      return null;
  }
};

export default function GuideBookingDetail() {
  const { id: _id } = useParams(); // Lấy ID từ URL (nếu có)

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Header & Breadcrumbs */}
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Bảng điều khiển", href: "/dashboard/guide" },
            { label: "Yêu cầu đặt tour", href: "/dashboard/guide/requests" },
            { label: `#${booking.id}` },
          ]}
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-heading font-bold text-text-primary">
                Yêu cầu #{booking.id}
              </h1>
              {getStatusBadge(booking.status)}
            </div>
            <p className="text-text-secondary text-sm">
              Tạo lúc: {booking.created_at}
            </p>
          </div>

          {/* Quick Actions (Desktop) */}
          {booking.status === "pending" && (
            <div className="flex gap-3 hidden md:flex">
              <button className="px-6 py-2.5 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-sm flex items-center gap-2 transition-colors">
                <IconX className="w-4 h-4" /> Từ chối
              </button>
              <button className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
                <IconCheck className="w-4 h-4" /> Chấp nhận ngay
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- LEFT COLUMN (8/12): CHI TIẾT --- */}
        <div className="lg:col-span-8 space-y-8">
          {/* 2. Tourist Info */}
          <section className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
            <h3 className="font-bold text-text-primary mb-6 flex items-center gap-2 text-lg">
              <IconUser className="w-5 h-5 text-primary" /> Thông tin du khách
            </h3>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <img
                src={booking.tourist.avatar}
                alt={booking.tourist.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-border-light"
              />
              <div className="flex-1 w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-bold text-text-primary">
                      {booking.tourist.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold border border-green-200 flex items-center gap-1">
                        <IconShieldCheck className="w-3 h-3" /> Đã xác thực
                      </span>
                      <span className="text-xs text-text-secondary">
                        ★ {booking.tourist.rating} ({booking.tourist.reviews}{" "}
                        đánh giá)
                      </span>
                    </div>
                  </div>
                  <button className="p-2 rounded-full bg-bg-main text-primary hover:bg-primary/10 transition-colors">
                    <IconMessage className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-main/50">
                    <IconMail className="w-5 h-5 text-text-secondary" />
                    <div>
                      <p className="text-[10px] text-text-secondary uppercase font-bold">
                        Email
                      </p>
                      <p className="text-sm font-medium text-text-primary">
                        {booking.tourist.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-main/50">
                    <IconPhone className="w-5 h-5 text-text-secondary" />
                    <div>
                      <p className="text-[10px] text-text-secondary uppercase font-bold">
                        Số điện thoại
                      </p>
                      <p className="text-sm font-medium text-text-primary">
                        {booking.tourist.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex gap-3 items-start">
              <IconInfo className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-yellow-700 uppercase mb-1">
                  Ghi chú từ khách
                </p>
                <p className="text-sm text-yellow-800 italic">
                  "{booking.note}"
                </p>
              </div>
            </div>
          </section>

          {/* 3. Tour Info */}
          <section className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
            <h3 className="font-bold text-text-primary mb-6 flex items-center gap-2 text-lg">
              <IconMapPin className="w-5 h-5 text-primary" /> Chi tiết chuyến đi
            </h3>

            <div className="flex gap-4 mb-6">
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                <img
                  src={booking.tour.image}
                  className="w-full h-full object-cover"
                  alt="Tour"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-text-primary mb-1">
                  {booking.tour.name}
                </h4>
                <p className="text-sm text-text-secondary flex items-center gap-1">
                  <IconClock className="w-4 h-4" /> {booking.tour.duration} •{" "}
                  {booking.tour.location}
                </p>
                <Link
                  to={`/tours/${booking.tour.id}`}
                  className="text-sm font-bold text-primary hover:underline mt-2 inline-block"
                >
                  Xem chi tiết tour
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border-light pt-6">
              <div>
                <p className="text-xs text-text-secondary uppercase font-bold mb-1">
                  Ngày khởi hành
                </p>
                <p className="text-base font-bold text-text-primary flex items-center gap-2">
                  <IconCalendar className="w-4 h-4 text-primary" />{" "}
                  {booking.schedule.date}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase font-bold mb-1">
                  Thời gian
                </p>
                <p className="text-base font-bold text-text-primary flex items-center gap-2">
                  <IconClock className="w-4 h-4 text-primary" />{" "}
                  {booking.schedule.time}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase font-bold mb-1">
                  Số lượng khách
                </p>
                <p className="text-base font-bold text-text-primary flex items-center gap-2">
                  <IconUser className="w-4 h-4 text-primary" />{" "}
                  {booking.schedule.guests} người
                </p>
                <p className="text-xs text-text-secondary">
                  ({booking.schedule.adults} lớn, {booking.schedule.children}{" "}
                  trẻ em)
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* --- RIGHT COLUMN (4/12): THANH TOÁN & ACTION --- */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment Card */}
          <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
            <h3 className="font-bold text-text-primary mb-6 flex items-center gap-2">
              <IconWallet className="w-5 h-5 text-primary" /> Thanh toán
            </h3>

            <div className="space-y-3 pb-6 border-b border-border-light">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">
                  Giá tour (x{booking.schedule.guests})
                </span>
                <span className="font-medium text-text-primary">
                  3.600.000đ
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Phí dịch vụ</span>
                <span className="font-medium text-text-primary">0đ</span>
              </div>
            </div>

            <div className="py-4 flex justify-between items-center">
              <span className="font-bold text-text-primary">Tổng cộng</span>
              <span className="text-2xl font-heading font-bold text-primary">
                {booking.payment.total}
              </span>
            </div>

            <div className="bg-bg-main p-3 rounded-xl flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-secondary">
                  Phương thức:
                </span>
                <span className="text-xs font-bold text-text-primary">
                  {booking.payment.method}
                </span>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded">
                Chờ thanh toán
              </span>
            </div>
          </div>

          {/* Help Box */}
          <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 text-center">
            <p className="text-sm font-bold text-primary mb-2">Cần hỗ trợ?</p>
            <p className="text-xs text-text-secondary mb-4">
              Nếu bạn gặp vấn đề với yêu cầu này, hãy liên hệ CSKH.
            </p>
            <button className="text-xs font-bold text-text-primary underline hover:text-primary">
              Gọi hotline 1900 1234
            </button>
          </div>

          {/* Mobile Sticky Action Bar (Only visible on mobile) */}
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border-light p-4 z-40 md:hidden flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-pb">
            <button className="flex-1 py-3 rounded-xl border border-red-100 text-red-600 bg-red-50 font-bold text-sm">
              Từ chối
            </button>
            <button className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg">
              Chấp nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
