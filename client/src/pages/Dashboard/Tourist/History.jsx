import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../../components/Toast/useToast";
import {
  useMyBookings,
  useBookingActions,
} from "../../../features/booking/hooks";
import Spinner from "../../../components/Loaders/Spinner";
import EmptyState from "../../../components/Loaders/EmptyState";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import apiClient from "../../../lib/api-client";
import {
  IconCalendar,
  IconMapPin,
  IconClock,
  IconStar,
} from "../../../icons/IconBox";
import { IconUser } from "../../../icons/IconUser";
import { IconSearch } from "../../../icons/IconSearch";
import ReviewModal from "../../../components/Modals/ReviewModal";
import TicketModal from "../../../components/Modals/TicketModal";

// ============================================================================
// TAB CONFIGURATION
// ============================================================================
const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "confirmed", label: "Sắp tới" },
  { id: "completed", label: "Hoàn thành" },
  { id: "canceled", label: "Đã hủy" },
];

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const navigate = useNavigate();
  const toast = useToast();
  const { cancelBooking, isProcessing } = useBookingActions();

  // Fetch bookings from API
  const { bookings: apiBookings, isLoading, error } = useMyBookings();

  // Transform API bookings to UI format
  const bookings = useMemo(() => {
    if (!apiBookings) return [];

    // Map booking status to display status
    const mapStatus = (booking) => {
      const status = booking.status;
      const guideDecision = booking.guide_decision?.status;

      if (status === "completed") return "completed";
      if (
        status === "canceled" ||
        status === "cancelled" ||
        status === "rejected"
      )
        return "cancelled";
      if (
        status === "paid" ||
        status === "awaiting_payment" ||
        guideDecision === "accepted"
      )
        return "confirmed";
      if (status === "waiting_guide") return "pending";
      return "pending";
    };

    return apiBookings.map((b) => ({
      id: b._id,
      tourId: b.tour_id?._id,
      tourName: b.tour_id?.name || "Chuyến tham quan",
      image:
        b.tour_id?.cover_image_url || "/images/placeholders/hero_slide_4.jpg",
      date: new Date(b.start_date).toLocaleDateString("vi-VN"),
      time: b.start_time || "08:00",
      duration: b.tour_id?.duration_hours
        ? `${b.tour_id.duration_hours} giờ`
        : "Chưa xác định",
      guide:
        b.intended_guide_id?.name ||
        b.tour_id?.guide_id?.name ||
        "Chưa phân công",
      price: (b.total_price || 0).toLocaleString() + "đ",
      guests:
        b.num_guests ||
        b.participants?.reduce(
          (sum, p) => sum + (p.count_slot || p.quantity || 1),
          0
        ) ||
        1,
      status: mapStatus(b),
    }));
  }, [apiBookings]);

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason.trim()) {
      toast.warning("Thiếu thông tin", "Vui lòng nhập lý do hủy tour");
      return;
    }

    const result = await cancelBooking(selectedBooking.id, cancelReason);
    if (result.success) {
      setIsCancelModalOpen(false);
      setSelectedBooking(null);
      setCancelReason("");
      toast.success(
        "Hủy tour thành công",
        "Tiền sẽ được hoàn lại trong 3-5 ngày làm việc."
      );
      window.location.reload();
    } else {
      toast.error("Không thể hủy tour", result.error || "Vui lòng thử lại.");
    }
  };

  const handleRebook = (booking) => {
    // Navigate to tour detail page to book again
    navigate(`/tours/${booking.tourId}`);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      // Call review API using apiClient (has built-in auth)
      await apiClient.post("/reviews/tour", {
        bookingId: selectedBooking.id,
        tour_rating: reviewData.rating,
        tour_comment: reviewData.comment,
      });

      setIsReviewModalOpen(false);
      setSelectedBooking(null);
      toast.success("Cảm ơn bạn!", "Đã gửi đánh giá thành công!");
      window.location.reload();
    } catch (error) {
      console.error("Submit review error:", error);
      toast.error(
        "Lỗi gửi đánh giá",
        error.message ||
          error.response?.data?.message ||
          "Không thể gửi đánh giá. Vui lòng thử lại."
      );
    }
  };

  const filteredBookings = bookings.filter((item) => {
    const matchTab = activeTab === "all" || item.status === activeTab;
    const matchSearch =
      item.tourName.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const renderStatus = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200 whitespace-nowrap">
            Sắp khởi hành
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 whitespace-nowrap">
            Đã hoàn thành
          </span>
        );
      case "canceled":
      case "cancelled":
        return (
          <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100 whitespace-nowrap">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold border border-yellow-100 whitespace-nowrap">
            Chờ xử lý
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <EmptyState message={error} />;
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Chuyến đi của tôi
          </h1>
          <p className="text-text-secondary text-sm">
            Quản lý và xem lại lịch sử đặt tour.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm theo tên tour hoặc mã..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
            onChange={(e) => setSearch(e.target.value)}
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border-light scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all border
              ${
                activeTab === tab.id
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                  : "bg-white text-text-secondary border-border-light hover:border-primary hover:text-primary"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-4 w-full">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((item) => (
            <div
              key={item.id}
              // [FIX QUAN TRỌNG]:
              // 1. Chuyển sang GRID layout: 'grid grid-cols-1 md:grid-cols-[16rem_1fr]'
              //    - 16rem (256px) cứng cho cột ảnh.
              //    - 1fr cho cột nội dung.
              // 2. min-h-[240px]: Đảm bảo chiều cao tối thiểu không đổi.
              className="group w-full bg-white p-4 rounded-3xl border border-border-light hover:border-primary/30 hover:shadow-md transition-all grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-6 md:min-h-[240px]"
            >
              {/* Image Column */}
              <div className="relative w-full h-48 md:h-full rounded-2xl overflow-hidden">
                <img
                  src={item.image}
                  alt={item.tourName}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 md:hidden">
                  {renderStatus(item.status)}
                </div>
              </div>

              {/* Content Column */}
              <div className="flex flex-col justify-between min-w-0 py-1">
                {/* Top Section */}
                <div className="w-full">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text-secondary font-bold mb-1 uppercase tracking-wider truncate">
                        #{item.id}
                      </p>
                      <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {item.tourName}
                      </h3>
                    </div>
                    <div className="hidden md:block shrink-0">
                      {renderStatus(item.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 mt-3 w-full">
                    <div className="flex items-center gap-2 text-sm text-text-secondary truncate">
                      <IconCalendar className="w-4 h-4 text-primary shrink-0" />{" "}
                      {item.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary truncate">
                      <IconClock className="w-4 h-4 text-primary shrink-0" />{" "}
                      {item.time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary truncate">
                      <IconUser className="w-4 h-4 text-primary shrink-0" />{" "}
                      {item.guide}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary truncate">
                      <IconMapPin className="w-4 h-4 text-primary shrink-0" />{" "}
                      {item.duration}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-border-light/60 w-full">
                  <div className="text-lg font-bold text-primary">
                    {item.price}
                    <span className="text-xs font-normal text-text-secondary ml-1">
                      / {item.guests} khách
                    </span>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto justify-end">
                    {item.status === "confirmed" && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedBooking(item);
                            setIsCancelModalOpen(true);
                          }}
                          className="flex-1 md:flex-none px-5 py-2 rounded-xl border border-border-light text-sm font-bold text-text-secondary hover:text-red-500 hover:border-red-200 transition-colors whitespace-nowrap"
                        >
                          Hủy tour
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(item);
                            setIsTicketModalOpen(true);
                          }}
                          className="flex-1 md:flex-none px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 whitespace-nowrap"
                        >
                          Xem vé điện tử
                        </button>
                      </>
                    )}

                    {item.status === "completed" && (
                      <>
                        <button
                          onClick={() => handleRebook(item)}
                          className="flex-1 md:flex-none px-5 py-2 rounded-xl border border-border-light text-sm font-bold text-text-secondary hover:text-primary hover:border-primary transition-colors whitespace-nowrap"
                        >
                          Đặt lại
                        </button>
                        {!item.isRated ? (
                          <button
                            onClick={() => {
                              setSelectedBooking(item);
                              setIsReviewModalOpen(true);
                            }}
                            className="flex-1 md:flex-none px-5 py-2 rounded-xl bg-secondary text-white text-sm font-bold hover:bg-secondary/90 transition-colors shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            <IconStar className="w-4 h-4" /> Viết đánh giá
                          </button>
                        ) : (
                          <span className="flex items-center justify-center gap-1 text-sm font-bold text-secondary px-4 py-2 bg-secondary/10 rounded-xl whitespace-nowrap flex-1 md:flex-none">
                            <IconStar className="w-4 h-4 fill-current" /> Đã
                            đánh giá
                          </span>
                        )}
                      </>
                    )}

                    {item.status === "cancelled" && (
                      <button className="flex-1 md:flex-none px-5 py-2 rounded-xl bg-bg-main text-text-primary text-sm font-bold hover:bg-gray-200 transition-colors whitespace-nowrap">
                        Xem chi tiết
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-border-light w-full">
            <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
              <IconCalendar className="w-8 h-8" />
            </div>
            <p className="text-text-primary font-bold mb-1">
              Không tìm thấy chuyến đi nào
            </p>
            <p className="text-text-secondary text-sm mb-6">
              Bạn chưa có chuyến đi nào ở trạng thái này.
            </p>
            <Link
              to="/tours"
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              Đặt chuyến đi ngay
            </Link>
          </div>
        )}
      </div>

      {/* Cancel Booking Modal */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedBooking(null);
          setCancelReason("");
        }}
        onConfirm={handleCancelBooking}
        title="Xác nhận hủy tour"
        message={
          <div className="space-y-4">
            <p className="text-text-secondary">
              Bạn có chắc chắn muốn hủy tour{" "}
              <strong>{selectedBooking?.tourName}</strong>?
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">
                Lý do hủy tour:
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Vui lòng nhập lý do hủy tour..."
                className="w-full px-4 py-2 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={4}
                required
              />
            </div>
            <p className="text-sm text-text-secondary">
              Tiền sẽ được hoàn lại vào tài khoản của bạn trong vòng 3-5 ngày
              làm việc.
            </p>
          </div>
        }
        confirmText={isProcessing ? "Đang xử lý..." : "Xác nhận hủy"}
        cancelText="Đóng"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
        disabled={isProcessing}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onSubmit={handleSubmitReview}
      />

      {/* Ticket Modal */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
        }}
        booking={selectedBooking}
      />
    </div>
  );
}
