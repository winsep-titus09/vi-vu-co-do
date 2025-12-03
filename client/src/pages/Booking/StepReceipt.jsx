import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { bookingsApi } from "../../features/booking/api";
import { paymentsApi } from "../../features/payments/api";
import { IconCalendar, IconMapPin, IconClock } from "../../icons/IconBox";
import {
  IconCheckCircle,
  IconDownload,
  IconHome,
  IconLoader,
} from "../../icons/IconCommon";

// Helper to convert MongoDB Decimal128 to number
const toNumber = (val) => {
  if (val?.$numberDecimal) return parseFloat(val.$numberDecimal);
  return parseFloat(val) || 0;
};

export default function BookingSuccessPage() {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Data từ navigation state (từ trang payment)
  const stateData = location.state;

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const response = await bookingsApi.getBooking(id);
        setBooking(response);
      } catch (err) {
        console.error("Fetch booking error:", err);
        setError(err.message || "Không thể tải thông tin booking");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <IconLoader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-bg-main py-10 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Không tìm thấy booking
          </h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Extract booking data
  const successData = {
    id: booking._id,
    tourName: booking.tour_id?.name || stateData?.tourName || "Tour",
    image:
      booking.tour_id?.cover_image_url ||
      stateData?.tourImage ||
      "/images/placeholders/tour-placeholder.jpg",
    date: booking.start_date
      ? new Date(booking.start_date).toLocaleDateString("vi-VN")
      : stateData?.date || "",
    time:
      booking.start_time || booking.tour_id?.fixed_departure_time || "08:00",
    location:
      booking.tour_id?.locations?.[0]?.locationId?.name || "Đại Nội Huế",
    totalPaid: `${toNumber(booking.total_price).toLocaleString("vi-VN")}đ`,
    paymentMethod: stateData?.paymentMethod || "Thanh toán trực tuyến",
    email: booking.contact?.email || stateData?.contact?.email || "",
    status: booking.status,
  };

  // Xác định icon và message dựa trên status
  const getStatusDisplay = () => {
    switch (successData.status) {
      case "paid":
        return {
          icon: <IconCheckCircle className="w-10 h-10" />,
          iconBg: "bg-green-100 text-green-600",
          title: "Thanh toán thành công!",
          message: (
            <>
              Mã đặt chỗ{" "}
              <span className="font-bold text-primary">
                #{successData.id?.slice(-8)}
              </span>{" "}
              đã được xác nhận.
              <br className="hidden md:block" /> Thông tin vé đã được gửi đến{" "}
              <span className="font-bold">{successData.email}</span>.
            </>
          ),
        };
      case "awaiting_payment":
        return {
          icon: <IconClock className="w-10 h-10" />,
          iconBg: "bg-blue-100 text-blue-600",
          title: "Chờ thanh toán",
          message: (
            <>
              Booking{" "}
              <span className="font-bold text-primary">
                #{successData.id?.slice(-8)}
              </span>{" "}
              đã được HDV xác nhận.
              <br className="hidden md:block" /> Vui lòng thanh toán để hoàn tất
              đặt tour.
            </>
          ),
        };
      case "waiting_guide":
      default:
        return {
          icon: <IconClock className="w-10 h-10" />,
          iconBg: "bg-yellow-100 text-yellow-600",
          title: "Đặt tour thành công!",
          message: (
            <>
              Booking{" "}
              <span className="font-bold text-primary">
                #{successData.id?.slice(-8)}
              </span>{" "}
              đang chờ HDV xác nhận.
              <br className="hidden md:block" /> Bạn sẽ nhận được thông báo khi
              có thể thanh toán.
            </>
          ),
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-bg-main py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* SUCCESS MESSAGE */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div
            className={`w-20 h-20 ${statusDisplay.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm`}
          >
            {statusDisplay.icon}
          </div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary mb-2">
            {statusDisplay.title}
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            {statusDisplay.message}
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
                <span
                  className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-2 ${
                    successData.status === "paid"
                      ? "bg-green-100 text-green-700"
                      : successData.status === "waiting_guide"
                      ? "bg-yellow-100 text-yellow-700"
                      : successData.status === "awaiting_payment"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {successData.status === "paid" && "Đã thanh toán"}
                  {successData.status === "waiting_guide" && "Chờ HDV xác nhận"}
                  {successData.status === "awaiting_payment" &&
                    "Chờ thanh toán"}
                  {!successData.status && "Đã đặt"}
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

        {/* PAYMENT BUTTON for awaiting_payment status */}
        {successData.status === "awaiting_payment" && (
          <div className="mt-6">
            <button
              onClick={async () => {
                try {
                  const checkoutRes = await paymentsApi.createCheckout(
                    booking._id,
                    "wallet"
                  );
                  if (checkoutRes.payUrl) {
                    window.location.href = checkoutRes.payUrl;
                  }
                } catch (err) {
                  console.error("Checkout error:", err);
                  alert(
                    "Không thể kết nối cổng thanh toán. Vui lòng thử lại sau."
                  );
                }
              }}
              className="w-full py-4 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              Thanh toán ngay
            </button>
          </div>
        )}

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
