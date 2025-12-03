import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { vi } from "date-fns/locale";
import { useGuideCalendar, useBusyDates } from "../../../features/guides/hooks";
import Spinner from "../../../components/Loaders/Spinner";
import { IconCalendar } from "../../../icons/IconCalendar";
import IconChevronLeft from "../../../icons/IconChevronLeft";
import IconChevronRight from "../../../icons/IconChevronRight";
import { IconClock } from "../../../icons/IconBox";
import { IconUser } from "../../../icons/IconUser";
import { IconX } from "../../../icons/IconX";
import { IconPlus } from "../../../icons/IconPlus";
import { useToast } from "../../../components/Toast/useToast";

// Helper function to format date to yyyy-MM-dd in local timezone
const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function Schedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBusyModal, setShowBusyModal] = useState(false);
  const [busyReason, setBusyReason] = useState("");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  const toast = useToast();

  const { calendarData, isLoading, error, refetch } = useGuideCalendar(
    year,
    month
  );
  const { addBusyDates, removeBusyDates, isSubmitting } = useBusyDates();

  // Build calendar grid
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const range = eachDayOfInterval({ start, end });
    const startPad = getDay(start);
    const paddedDays = [];
    for (let i = 0; i < startPad; i++) paddedDays.push(null);
    return [...paddedDays, ...range];
  }, [currentMonth]);

  // Format selected date key for lookup - use local timezone
  const selectedDateKey = formatDateKey(selectedDate);
  const dayData = calendarData[selectedDateKey] || {
    bookings: [],
    isBusy: false,
    busyReason: null,
  };

  // Get status for a day
  const getDayStatus = (date) => {
    if (!date) return "empty";
    const key = formatDateKey(date);
    const data = calendarData[key];
    if (!data) return "free";
    if (data.isBusy) return "busy";
    if (data.bookings && data.bookings.length > 0) return "tour";
    return "free";
  };

  // Handle add busy date
  const handleAddBusy = async () => {
    if (isSubmitting) return;
    try {
      await addBusyDates([selectedDateKey], busyReason || "Nghỉ cá nhân");
      setBusyReason("");
      setShowBusyModal(false);
      await refetch();
    } catch (err) {
      console.error("Failed to add busy date:", err);
      toast.error(
        "Lỗi",
        "Không thể đánh dấu ngày nghỉ: " + (err.message || "Lỗi không xác định")
      );
    }
  };

  // Handle remove busy date
  const handleRemoveBusy = async () => {
    if (isSubmitting) return;
    try {
      await removeBusyDates([selectedDateKey]);
      await refetch();
    } catch (err) {
      console.error("Failed to remove busy date:", err);
      toast.error(
        "Lỗi",
        "Không thể bỏ đánh dấu ngày nghỉ: " +
          (err.message || "Lỗi không xác định")
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Lịch làm việc</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Quản lý lịch trình tour và ngày nghỉ
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-4">
        {/* --- LEFT: CALENDAR --- */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-card border border-border-light p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-text-primary capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: vi })}
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 rounded-full hover:bg-bg-main transition-colors"
              >
                <IconChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 rounded-full hover:bg-bg-main transition-colors"
              >
                <IconChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
              <div
                key={d}
                className="text-[10px] font-semibold text-text-secondary py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid - smaller cells */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const status = getDayStatus(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              let dotColor = "";
              if (status === "tour") dotColor = "bg-green-400";
              else if (status === "busy") dotColor = "bg-red-400";

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center
                    text-xs font-medium transition-all relative
                    ${!isCurrentMonth ? "opacity-40" : ""}
                    ${
                      isSelected
                        ? "bg-primary text-white shadow-md ring-1 ring-primary/30"
                        : isToday
                        ? "bg-accent/20 text-primary font-bold"
                        : "hover:bg-bg-main"
                    }
                  `}
                >
                  <span>{format(day, "d")}</span>
                  {dotColor && !isSelected && (
                    <span
                      className={`w-1 h-1 rounded-full ${dotColor} absolute bottom-0.5`}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend - compact */}
          <div className="mt-3 pt-2 border-t border-border-light flex flex-wrap gap-3 text-[10px] text-text-secondary">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
              Có tour
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              Bận / Nghỉ
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-200 border border-gray-300"></span>
              Trống
            </div>
          </div>
        </div>

        {/* --- RIGHT: TIMELINE --- */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <IconCalendar className="w-4 h-4 text-primary" />
              {format(selectedDate, "EEEE, d/M", { locale: vi })}
            </h3>

            {/* Add/Remove busy button */}
            {!dayData.isBusy ? (
              <button
                onClick={() => {
                  console.log("Opening busy modal for date:", selectedDateKey);
                  setShowBusyModal(true);
                }}
                disabled={isSubmitting}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                <IconPlus className="w-3.5 h-3.5" />
                Đánh dấu nghỉ
              </button>
            ) : (
              <button
                onClick={handleRemoveBusy}
                disabled={isSubmitting}
                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Spinner size="sm" />
                ) : (
                  <IconX className="w-3.5 h-3.5" />
                )}
                Bỏ đánh dấu
              </button>
            )}
          </div>

          {/* Busy indicator */}
          {dayData.isBusy && (
            <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex gap-3 relative overflow-hidden">
              <div className="flex items-center justify-center px-2 border-r border-red-200">
                <IconX className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-bold text-red-700 text-sm">Ngày nghỉ</h4>
                <p className="text-xs text-red-600">
                  {dayData.busyReason || "Nghỉ cá nhân"}
                </p>
              </div>
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            </div>
          )}

          {/* Bookings */}
          {dayData.bookings && dayData.bookings.length > 0 ? (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {dayData.bookings.map((booking) => (
                <Link
                  to={`/dashboard/guide/requests/${booking._id}`}
                  key={booking._id}
                  className="bg-white p-3 rounded-xl border border-border-light shadow-sm flex gap-3 relative overflow-hidden group hover:border-primary/50 transition-all"
                >
                  {/* Time Sidebar */}
                  <div className="flex flex-col items-center justify-center pr-2 border-r border-border-light min-w-[50px]">
                    <span className="text-sm font-bold text-text-primary">
                      {booking.start_time || "08:00"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-text-primary text-sm truncate group-hover:text-primary transition-colors">
                      {booking.tour_name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                      <IconUser className="w-3 h-3 text-primary" />
                      <span className="truncate">{booking.customer_name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                          booking.status === "confirmed" ||
                          booking.status === "paid" ||
                          booking.guide_decision?.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "pending" ||
                              booking.status === "awaiting_payment" ||
                              booking.status === "waiting_guide" ||
                              booking.guide_decision?.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {booking.status === "confirmed" ||
                        booking.status === "paid" ||
                        booking.guide_decision?.status === "accepted"
                          ? "Đã TT"
                          : booking.status === "pending" ||
                            booking.status === "awaiting_payment" ||
                            booking.status === "waiting_guide" ||
                            booking.guide_decision?.status === "pending"
                          ? "Chờ TT"
                          : booking.status === "completed"
                          ? "Xong"
                          : booking.status}
                      </span>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div
                    className={`absolute top-0 left-0 w-0.5 h-full ${
                      booking.status === "confirmed" ||
                      booking.status === "paid" ||
                      booking.guide_decision?.status === "accepted"
                        ? "bg-green-500"
                        : booking.status === "pending" ||
                          booking.status === "awaiting_payment" ||
                          booking.status === "waiting_guide" ||
                          booking.guide_decision?.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                    }`}
                  ></div>
                </Link>
              ))}
            </div>
          ) : !dayData.isBusy ? (
            <div className="bg-bg-main/50 rounded-2xl border border-dashed border-border-light h-40 flex flex-col items-center justify-center text-center p-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                <IconClock className="w-5 h-5 text-text-secondary/50" />
              </div>
              <p className="text-text-secondary font-medium text-xs">
                Không có lịch trình.
              </p>
              <p className="text-[10px] text-text-secondary mt-0.5">
                Bạn có thể nhận thêm tour hoặc nghỉ ngơi!
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Busy Modal */}
      {showBusyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-full max-w-sm mx-4 shadow-xl">
            <h3 className="text-base font-bold text-text-primary mb-3">
              Đánh dấu ngày nghỉ
            </h3>
            <p className="text-xs text-text-secondary mb-3">
              Ngày:{" "}
              <span className="font-medium text-text-primary">
                {format(selectedDate, "dd/MM/yyyy")}
              </span>
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-text-primary mb-1">
                Lý do (tùy chọn)
              </label>
              <input
                type="text"
                value={busyReason}
                onChange={(e) => setBusyReason(e.target.value)}
                placeholder="VD: Nghỉ phép, việc gia đình..."
                className="w-full px-3 py-2 text-sm border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowBusyModal(false);
                  setBusyReason("");
                }}
                className="flex-1 px-3 py-2 text-sm border border-border-light rounded-lg text-text-secondary hover:bg-bg-main transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAddBusy}
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" /> Đang xử lý...
                  </>
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
