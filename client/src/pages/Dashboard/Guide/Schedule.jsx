import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IconCalendar,
  IconClock,
  IconMapPin,
  IconCheck,
} from "../../../icons/IconBox";
import { IconUser } from "../../../icons/IconUser";
import { IconX } from "../../../icons/IconX";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { vi } from "date-fns/locale";

// ============================================================================
// MOCK DATA
// ============================================================================
// Mock data: Schedule (includes 'blocked' type)
const scheduleData = [
  {
    id: 1,
    bookingId: "BK-901", // ID của booking để link đến detail
    date: new Date(2025, 4, 20),
    time: "08:00 - 12:00",
    type: "tour", // tour | blocked
    tourName: "Bí mật Hoàng cung Huế",
    location: "Đại Nội",
    guests: 4,
    status: "confirmed",
    tourist: "Nguyễn Văn A",
  },
  {
    id: 2,
    bookingId: "BK-902",
    date: new Date(2025, 4, 20),
    time: "14:00 - 17:00",
    type: "tour",
    tourName: "Food Tour: Ẩm thực chiều",
    location: "Chợ Đông Ba",
    guests: 2,
    status: "confirmed",
    tourist: "Sarah J.",
  },
  {
    id: 3,
    bookingId: "BK-880",
    date: new Date(2025, 4, 22),
    time: "09:00 - 11:00",
    type: "tour",
    tourName: "Thiền trà tại Chùa Từ Hiếu",
    location: "Chùa Từ Hiếu",
    guests: 1,
    status: "confirmed",
    tourist: "Lê Bình",
  },
  // Personal blocked schedule
  {
    id: 4,
    date: new Date(2025, 4, 25),
    type: "blocked",
    title: "Nghỉ phép cá nhân",
    note: "Đi đám cưới",
  },
];

export default function GuideSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 20));
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 4, 20));

  // Logic tạo lịch
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Lọc sự kiện theo ngày chọn
  const eventsOnDate = scheduleData.filter((item) =>
    isSameDay(item.date, selectedDate)
  );

  // Helper: Kiểm tra loại sự kiện trong ngày để hiện chấm màu
  const getDayStatus = (date) => {
    const events = scheduleData.filter((item) => isSameDay(item.date, date));
    if (events.length === 0) return null;
    if (events.some((e) => e.type === "tour")) return "has-tour";
    return "blocked";
  };

  return (
    <div className="space-y-8 h-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Lịch trình
          </h1>
          <p className="text-text-secondary text-sm">
            Quản lý thời gian và tránh trùng lịch.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDate(new Date());
            }}
            className="px-4 py-2 rounded-xl border border-border-light bg-white text-sm font-bold hover:border-primary hover:text-primary transition-colors"
          >
            Hôm nay
          </button>
          <button className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold hover:bg-red-100 transition-colors flex items-center gap-2">
            <IconX className="w-4 h-4" /> Báo bận
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- LEFT: CALENDAR --- */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-border-light p-6 shadow-sm h-fit">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary capitalize">
              {format(currentDate, "MMMM yyyy", { locale: vi })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-bg-main rounded-lg text-text-secondary"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-bg-main rounded-lg text-text-secondary"
              >
                →
              </button>
            </div>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 mb-2">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
              <div
                key={d}
                className="text-center text-xs font-bold text-text-secondary py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Padding days */}
            {Array.from({
              length: (startOfMonth(currentDate).getDay() + 6) % 7,
            }).map((_, i) => (
              <div key={`empty-${i}`}></div>
            ))}

            {daysInMonth.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const status = getDayStatus(day); // 'has-tour' | 'blocked' | null

              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                           h-14 rounded-xl flex flex-col items-center justify-center relative transition-all border
                           ${
                             isSelected
                               ? "bg-primary text-white border-primary shadow-md"
                               : "bg-white text-text-primary border-transparent hover:bg-bg-main hover:border-border-light"
                           }
                           ${
                             isToday && !isSelected
                               ? "text-primary font-bold border-primary/30"
                               : ""
                           }
                        `}
                >
                  <span className="text-sm">{format(day, "d")}</span>

                  {/* Dot indicator */}
                  {status === "has-tour" && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        isSelected ? "bg-white" : "bg-green-500"
                      }`}
                    ></span>
                  )}
                  {status === "blocked" && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        isSelected ? "bg-white" : "bg-red-400"
                      }`}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-6 pt-4 border-t border-border-light justify-center text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Có
              Tour
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span> Bận /
              Nghỉ
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-200 border border-gray-300"></span>{" "}
              Trống
            </div>
          </div>
        </div>

        {/* --- RIGHT: TIMELINE --- */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <IconCalendar className="w-5 h-5 text-primary" />
            {format(selectedDate, "EEEE, d 'tháng' M", { locale: vi })}
          </h3>

          {eventsOnDate.length > 0 ? (
            <div className="space-y-4">
              {eventsOnDate.map((item) =>
                item.type === "tour" ? (
                  // Tour card with booking link
                  <Link
                    to={`/dashboard/guide/requests/${item.bookingId}`}
                    key={item.id}
                    className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex gap-4 relative overflow-hidden group hover:border-primary/50 transition-all"
                  >
                    {/* Time Sidebar */}
                    <div className="flex flex-col items-center justify-center pr-4 border-r border-border-light min-w-[80px]">
                      <span className="text-lg font-bold text-text-primary">
                        {item.time.split(" - ")[0]}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {item.time.split(" - ")[1]}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-text-primary truncate mb-1 group-hover:text-primary transition-colors">
                          {item.tourName}
                        </h4>
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-text-secondary">
                        <div className="flex items-center gap-2">
                          <IconMapPin className="w-4 h-4 text-primary" />{" "}
                          {item.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <IconUser className="w-4 h-4 text-primary" />{" "}
                          {item.tourist} • {item.guests} khách
                        </div>
                      </div>
                    </div>

                    {/* Status Bar Green */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                  </Link>
                ) : (
                  // Blocked date card
                  <div
                    key={item.id}
                    className="bg-red-50 p-5 rounded-2xl border border-red-100 flex gap-4 relative overflow-hidden opacity-80"
                  >
                    <div className="flex items-center justify-center px-4 border-r border-red-200">
                      <IconX className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-red-700">{item.title}</h4>
                      <p className="text-sm text-red-600">{item.note}</p>
                    </div>
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  </div>
                )
              )}
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
