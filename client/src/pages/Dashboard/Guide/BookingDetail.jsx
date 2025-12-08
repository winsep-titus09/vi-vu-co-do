import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import { useBookingById } from "../../../features/guides/hooks";
import guidesApi from "../../../features/guides/api";
import { formatCurrency } from "../../../lib/formatters";
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
  IconLoader,
  IconShieldCheck,
} from "../../../icons/IconCommon";
import { useToast } from "../../../components/Toast/useToast";

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
        <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span> Chờ thanh toán
        </span>
      );
    case "paid":
      return (
        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span> Đã thanh toán
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
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    booking: bookingData,
    isLoading,
    error,
    refetch,
  } = useBookingById(id);

  // Handle approve
  const handleApprove = async () => {
    try {
      await guidesApi.approveBooking(id);
      toast.success("Thành công!", "Đã chấp nhận yêu cầu đặt tour.");
      refetch();
    } catch (error) {
      toast.error("Lỗi chấp nhận", error.message || "Không thể chấp nhận yêu cầu");
    }
  };

  // Handle reject
  const handleReject = async () => {
    const note = prompt("Lý do từ chối (không bắt buộc):");
    if (note === null) return;
    try {
      await guidesApi.rejectBooking(id, note || "");
      toast.success("Thành công!", "Đã từ chối yêu cầu đặt tour.");
      navigate("/dashboard/guide/requests");
    } catch (error) {
      toast.error("Lỗi từ chối", error.message || "Không thể từ chối yêu cầu");
    }
  };

  // Handle complete tour
  const handleComplete = async () => {
    if (!window.confirm("Xác nhận tour này đã hoàn thành?")) return;
    try {
      await guidesApi.completeBooking(id);
      toast.success("Thành công!", "Tour đã được đánh dấu hoàn thành.");
      refetch();
    } catch (error) {
      toast.error("Lỗi hoàn thành", error.message || "Không thể đánh dấu hoàn thành tour");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <IconLoader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 font-bold mb-2">
          Không thể tải thông tin booking
        </p>
        <p className="text-text-secondary text-sm">{error}</p>
      </div>
    );
  }

  const startDate = bookingData.start_date
    ? new Date(bookingData.start_date)
    : null;
  const createdAt = bookingData.createdAt || bookingData.created_at || null;
  const participants = bookingData.participants || [];
  const countedParticipants = participants.filter((p) => p.count_slot);
  const resolveAge = (participant) => {
    if (typeof participant?.age_at_departure === "number")
      return participant.age_at_departure;
    if (typeof participant?.age_provided === "number")
      return participant.age_provided;
    return participant?.age;
  };
  const adults = countedParticipants.filter(
    (p) => (resolveAge(p) ?? 0) >= 12
  ).length;
  const children = Math.max(countedParticipants.length - adults, 0);
  const paymentGateway =
    bookingData.payment_session?.gateway || bookingData.payment_method;

  // Map API data to display format
  const rawStatus = bookingData.status;
  const guideDecision = bookingData.guide_decision?.status;
  
  // Determine display status
  const getDisplayStatus = () => {
    if (rawStatus === "completed") return "completed";
    if (rawStatus === "paid") return "paid"; // Đã thanh toán - có thể hoàn thành
    if (rawStatus === "awaiting_payment" || guideDecision === "accepted") return "confirmed";
    if (rawStatus === "waiting_guide") return "pending";
    if (rawStatus === "rejected" || rawStatus === "canceled" || guideDecision === "rejected") return "cancelled";
    return "pending";
  };

  const booking = {
    id: bookingData._id,
    created_at: createdAt
      ? new Date(createdAt).toLocaleString("vi-VN")
      : "Không rõ thời gian",
    status: getDisplayStatus(),
    rawStatus: rawStatus, // Lưu status gốc để kiểm tra
    tour: {
      id: bookingData.tour_id?._id,
      name: bookingData.tour_id?.name || "Tour",
      image:
        bookingData.tour_id?.images?.[0] ||
        "/images/placeholders/tour-placeholder.jpg",
      duration: bookingData.tour_id?.duration || "4 giờ",
      location: bookingData.tour_id?.location?.name || "Huế",
    },
    tourist: {
      name: bookingData.customer_id?.name || "Khách hàng",
      avatar:
        bookingData.customer_id?.avatar_url ||
        "https://i.pravatar.cc/150?img=11",
      email: bookingData.customer_id?.email || "N/A",
      phone: bookingData.customer_id?.phone_number || "N/A",
      rating: 5.0,
      reviews: 0,
    },
    schedule: {
      date: startDate ? startDate.toLocaleDateString("vi-VN") : "Đang cập nhật",
      time:
        bookingData.start_time ||
        bookingData.tour_id?.fixed_departure_time ||
        "08:00",
      guests:
        bookingData.num_guests ||
        countedParticipants.reduce(
          (sum, p) => sum + (p.count_slot || p.quantity || 1),
          0
        ) ||
        bookingData.contact?.guest_count ||
        0,
      adults,
      children,
    },
    payment: {
      total: formatCurrency(bookingData.total_price),
      method:
        paymentGateway === "momo"
          ? "Ví MoMo"
          : paymentGateway === "vnpay"
          ? "VNPay"
          : "Tiền mặt",
      paymentStatus:
        bookingData.payment_session?.status ||
        bookingData.payment_status ||
        "pending",
    },
    note: bookingData.contact?.note?.trim() || "Không có ghi chú",
  };

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
            <div className="hidden md:flex gap-3">
              <button
                onClick={handleReject}
                className="px-6 py-2.5 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <IconX className="w-4 h-4" /> Từ chối
              </button>
              <button
                onClick={handleApprove}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
              >
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
                  to={`/tours/${booking.tour.slug || booking.tour.id}`}
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
          {booking.status === "pending" && (
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border-light p-4 z-40 md:hidden flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-pb">
              <button
                onClick={handleReject}
                className="flex-1 py-3 rounded-xl border border-red-100 text-red-600 bg-red-50 font-bold text-sm"
              >
                Từ chối
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg"
              >
                Chấp nhận
              </button>
            </div>
          )}

          {/* Action: Hoàn thành tour (khi đã thanh toán) */}
          {booking.status === "paid" && (
            <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <IconCheck className="w-5 h-5 text-primary" /> Thao tác
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                Sau khi tour kết thúc, bạn hãy đánh dấu hoàn thành để nhận thanh toán.
              </p>
              <button
                onClick={handleComplete}
                className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
              >
                <IconCheck className="w-4 h-4" /> Hoàn thành tour
              </button>
            </div>
          )}

          {/* Mobile Sticky Action Bar for Complete */}
          {booking.status === "paid" && (
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border-light p-4 z-40 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-pb">
              <button
                onClick={handleComplete}
                className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <IconCheck className="w-4 h-4" /> Hoàn thành tour
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
