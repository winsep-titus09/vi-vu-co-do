import React from "react";
import { Link } from "react-router-dom";
import { IconCalendar, IconMapPin } from "../../icons/IconBox";

// --- INLINE ICONS ---
const IconCheckCircle = ({ className }) => (
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
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconDownload = ({ className }) => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);
const IconHome = ({ className }) => (
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
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// --- MOCK DATA ---
const successData = {
  id: "BK-2025-001",
  tourName: "Bí mật Hoàng cung Huế & Trải nghiệm trà chiều",
  image:
    "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
  date: "20/05/2025",
  time: "08:00 AM",
  location: "Đại Nội Huế",
  totalPaid: "1.700.000đ",
  paymentMethod: "Ví MoMo",
  email: "hoangnam@email.com",
};

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-bg-main py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* SUCCESS MESSAGE */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <IconCheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary mb-2">
            Thanh toán thành công!
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            Mã đặt chỗ{" "}
            <span className="font-bold text-primary">#{successData.id}</span> đã
            được xác nhận.
            <br className="hidden md:block" /> Thông tin vé đã được gửi đến{" "}
            <span className="font-bold">{successData.email}</span>.
          </p>
        </div>

        {/* TICKET CARD VISUAL */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl animate-fade-in-up delay-100 relative">
          {/* Top Decorative Border (Optional) */}
          <div className="h-2 bg-primary w-full"></div>

          {/* Ticket Header (Tour Info) */}
          <div className="p-6 md:p-8 pb-6">
            <div className="flex gap-4 items-start mb-6">
              <img
                src={successData.image}
                alt="Tour"
                className="w-24 h-24 rounded-2xl object-cover shadow-sm shrink-0"
              />
              <div>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-2">
                  Đã thanh toán
                </span>
                <h2 className="text-lg font-bold text-text-primary line-clamp-2 leading-tight">
                  {successData.tourName}
                </h2>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 bg-bg-main/50 p-4 rounded-2xl border border-border-light">
              <div>
                <p className="text-xs text-text-secondary uppercase font-bold mb-1 flex items-center gap-1">
                  <IconCalendar className="w-3 h-3" /> Ngày khởi hành
                </p>
                <p className="text-sm font-bold text-text-primary">
                  {successData.date}
                </p>
                <p className="text-xs text-text-secondary">
                  {successData.time}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary uppercase font-bold mb-1 flex items-center gap-1">
                  <IconMapPin className="w-3 h-3" /> Địa điểm
                </p>
                <p className="text-sm font-bold text-text-primary truncate">
                  {successData.location}
                </p>
              </div>
            </div>
          </div>

          {/* PERFORATED LINE EFFECT (Hiệu ứng đường cắt vé) */}
          <div className="relative flex items-center justify-between">
            <div className="w-6 h-6 bg-bg-main rounded-full -ml-3"></div>
            <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-2"></div>
            <div className="w-6 h-6 bg-bg-main rounded-full -mr-3"></div>
          </div>

          {/* Ticket Body (QR & Total) */}
          <div className="p-6 md:p-8 pt-6 flex flex-col items-center text-center">
            <p className="text-xs text-text-secondary mb-3 uppercase tracking-widest font-bold">
              Quét mã để check-in
            </p>
            <div className="bg-white p-2 rounded-xl border border-border-light shadow-sm mb-6">
              {/* QR Code Placeholder - Bạn có thể dùng thư viện qrcode.react */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${successData.id}`}
                alt="QR Code"
                className="w-32 h-32 md:w-40 md:h-40"
              />
            </div>

            <div className="w-full flex justify-between items-center bg-bg-main p-4 rounded-xl">
              <span className="text-sm text-text-secondary font-medium">
                Tổng thanh toán
              </span>
              <div className="text-right">
                <span className="block text-lg font-bold text-primary">
                  {successData.totalPaid}
                </span>
                <span className="text-[10px] text-text-secondary italic">
                  qua {successData.paymentMethod}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-8 space-y-3 md:space-y-0 md:flex md:gap-4">
          <Link
            to="/"
            className="w-full py-3.5 rounded-xl border border-border-light bg-white text-text-primary font-bold text-sm hover:bg-bg-main hover:border-primary/50 transition-all flex items-center justify-center gap-2"
          >
            <IconHome className="w-4 h-4" /> Về trang chủ
          </Link>

          <Link
            to="/dashboard/tourist/history"
            className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <IconDownload className="w-4 h-4" /> Tải vé & Xem chuyến đi
          </Link>
        </div>
      </div>
    </div>
  );
}
