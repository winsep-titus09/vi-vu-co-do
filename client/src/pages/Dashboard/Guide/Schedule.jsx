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
import { IconMapPin, IconClock } from "../../../icons/IconBox";
import { IconUser } from "../../../icons/IconUser";
import { IconX } from "../../../icons/IconX";
import { IconPlus } from "../../../icons/IconPlus";

export default function Schedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBusyModal, setShowBusyModal] = useState(false);
  const [busyReason, setBusyReason] = useState("");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;

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

    // Pad start of week
    const startPad = getDay(start);
    const paddedDays = [];
    for (let i = 0; i < startPad; i++) paddedDays.push(null);
    return [...paddedDays, ...range];
  }, [currentMonth]);

  // Format selected date key for lookup
  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const dayData = calendarData[selectedDateKey] || {
    bookings: [],
    isBusy: false,
    busyReason: null,
  };

  // Get status for a day
  const getDayStatus = (date) => {
    if (!date) return "empty";
    const key = format(date, "yyyy-MM-dd");
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
      refetch();
    } catch (err) {
      console.error("Failed to add busy date:", err);
    }
  };

  // Handle remove busy date
  const handleRemoveBusy = async () => {
    if (isSubmitting) return;
    try {
      await removeBusyDates([selectedDateKey]);
      refetch();
    } catch (err) {
      console.error("Failed to remove busy date:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Lịch làm việc
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Quản lý lịch trình tour và ngày nghỉ của bạn
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* --- LEFT: CALENDAR --- */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-card border border-border-light p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">
              {format(currentMonth, "MMMM yyyy", { locale: vi })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-full hover:bg-bg-main transition-colors"
              >
                <IconChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-full hover:bg-bg-main transition-colors"
              >
                <IconChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
              <div
                key={d}
                className="text-xs font-semibold text-text-secondary py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
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
                    aspect-square rounded-xl flex flex-col items-center justify-center
                    text-sm font-medium transition-all relative
                    ${!isCurrentMonth ? "opacity-40" : ""}
                    ${
                      isSelected
                        ? "bg-primary text-white shadow-lg ring-2 ring-primary/30"
                        : isToday
                        ? "bg-accent/20 text-primary font-bold"
                        : "hover:bg-bg-main"
                    }
                  `}
                >
                  <span>{format(day, "d")}</span>
                  {dotColor && !isSelected && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${dotColor} absolute bottom-1`}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-border-light flex flex-wrap gap-4 text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              Có tour
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              Bận / Nghỉ
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-200 border border-gray-300"></span>
              Trống
            </div>
          </div>
        </div>

        {/* --- RIGHT: TIMELINE --- */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <IconCalendar className="w-5 h-5 text-primary" />
              {format(selectedDate, "EEEE, d 'tháng' M", { locale: vi })}
            </h3>

            {/* Add/Remove busy button */}
            {!dayData.isBusy ? (
              <button
                onClick={() => setShowBusyModal(true)}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                <IconPlus className="w-4 h-4" />
                Đánh dấu nghỉ
              </button>
            ) : (
              <button
                onClick={handleRemoveBusy}
                disabled={isSubmitting}
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
              >
                <IconX className="w-4 h-4" />
                Bỏ đánh dấu nghỉ
              </button>
            )}
          </div>

          {/* Busy indicator */}
          {dayData.isBusy && (
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-4 relative overflow-hidden">
              <div className="flex items-center justify-center px-4 border-r border-red-200">
                <IconX className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h4 className="font-bold text-red-700">Ngày nghỉ</h4>
                <p className="text-sm text-red-600">
                  {dayData.busyReason || "Nghỉ cá nhân"}
                </p>
              </div>
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            </div>
          )}

          {/* Bookings */}
          {dayData.bookings && dayData.bookings.length > 0 ? (
            <div className="space-y-4">
              {dayData.bookings.map((booking) => (
                <Link
                  to={`/dashboard/guide/requests/${booking._id}`}
                  key={booking._id}
                  className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex gap-4 relative overflow-hidden group hover:border-primary/50 transition-all"
                >
                  {/* Time Sidebar */}
                  <div className="flex flex-col items-center justify-center pr-4 border-r border-border-light min-w-[80px]">
                    <span className="text-lg font-bold text-text-primary">
                      {booking.start_time || "08:00"}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {booking.end_time || "Cả ngày"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-text-primary truncate mb-1 group-hover:text-primary transition-colors">
                        {booking.tour_name}
                      </h4>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-text-secondary">
                      <div className="flex items-center gap-2">
                        <IconUser className="w-4 h-4 text-primary" />
                        {booking.customer_name} {booking.num_guests || 1} khách
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {booking.status === "confirmed"
                            ? "Đã xác nhận"
                            : booking.status === "pending"
                            ? "Chờ xác nhận"
                            : booking.status === "completed"
                            ? "Hoàn thành"
                            : booking.status}
                        </span>
                        <span className="text-primary font-medium">
                          {booking.total_price?.toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div
                    className={`absolute top-0 left-0 w-1 h-full ${
                      booking.status === "confirmed"
                        ? "bg-green-500"
                        : booking.status === "pending"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                    }`}
                  ></div>
                </Link>
              ))}
            </div>
          ) : !dayData.isBusy ? (
            <div className="bg-bg-main/50 rounded-3xl border border-dashed border-border-light h-64 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                <IconClock className="w-8 h-8 text-text-secondary/50" />
              </div>
              <p className="text-text-secondary font-medium">
                Không có lịch trình.
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Bạn có thể nhận thêm tour hoặc nghỉ ngơi!
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Busy Modal */}
      {showBusyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              Đánh dấu ngày nghỉ
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Ngày:{" "}
              <span className="font-medium text-text-primary">
                {format(selectedDate, "dd/MM/yyyy")}
              </span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                Lý do (tùy chọn)
              </label>
              <input
                type="text"
                value={busyReason}
                onChange={(e) => setBusyReason(e.target.value)}
                placeholder="VD: Nghỉ phép, việc gia đình..."
                className="w-full px-4 py-2 border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBusyModal(false);
                  setBusyReason("");
                }}
                className="flex-1 px-4 py-2 border border-border-light rounded-xl text-text-secondary hover:bg-bg-main transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAddBusy}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
