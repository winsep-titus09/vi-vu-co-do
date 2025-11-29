import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconCheck, IconClock } from "../../../icons/IconBox";
import { IconUser } from "../../../icons/IconUser";
import {
  IconBell,
  IconWallet,
  IconInfo,
  IconTrash,
  IconTicket,
} from "../../../icons/IconCommon";

// ============================================================================
// MOCK DATA
// ============================================================================
// Mock data: Tourist notifications
const notificationsData = [
  {
    id: 1,
    type: "booking_confirmed",
    title: "Đặt tour thành công!",
    message:
      "Hướng dẫn viên Minh Hương đã chấp nhận yêu cầu đặt tour 'Bí mật Hoàng cung Huế'. Vui lòng thanh toán để giữ chỗ.",
    time: "10 phút trước",
    isRead: false,
    link: "/dashboard/tourist/history", // Link tới lịch sử để thanh toán
  },
  {
    id: 2,
    type: "payment_success",
    title: "Thanh toán thành công",
    message:
      "Bạn đã thanh toán 500.000đ cho tour 'Food Tour: Ẩm thực đường phố'.",
    time: "1 ngày trước",
    isRead: false,
    link: "/dashboard/tourist/history",
  },
  {
    id: 3,
    type: "reminder",
    title: "Nhắc nhở lịch trình",
    message:
      "Ngày mai (20/05) bạn có chuyến tham quan Đại Nội lúc 08:00. Hãy chuẩn bị sẵn sàng nhé!",
    time: "2 ngày trước",
    isRead: true,
    link: "/dashboard/tourist",
  },
  {
    id: 4,
    type: "system",
    title: "Chào mừng bạn mới",
    message:
      "Cảm ơn bạn đã tham gia Vi Vu Cố Đô. Hãy cập nhật hồ sơ để có trải nghiệm tốt nhất.",
    time: "1 tuần trước",
    isRead: true,
    link: "/dashboard/tourist/profile",
  },
];

export default function TouristNotifications() {
  const [notifications, setNotifications] = useState(notificationsData);
  const [filter, setFilter] = useState("all");

  const filteredNotis = notifications.filter(
    (n) => filter === "all" || (filter === "unread" && !n.isRead)
  );

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNoti = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case "booking_confirmed":
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <IconCheck className="w-5 h-5" />
          </div>
        );
      case "booking_cancelled":
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <IconTrash className="w-5 h-5" />
          </div>
        );
      case "payment_success":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <IconWallet className="w-5 h-5" />
          </div>
        );
      case "reminder":
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0">
            <IconClock className="w-5 h-5" />
          </div>
        );
      case "system":
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
            <IconInfo className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <IconBell className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Thông báo
          </h1>
          <p className="text-text-secondary text-sm">
            Cập nhật quan trọng về chuyến đi của bạn.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-white border border-border-light text-text-secondary hover:bg-bg-main"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === "unread"
                ? "bg-primary text-white"
                : "bg-white border border-border-light text-text-secondary hover:bg-bg-main"
            }`}
          >
            Chưa đọc
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-end border-b border-border-light pb-2">
        <button
          onClick={markAllRead}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <IconCheck className="w-4 h-4" /> Đánh dấu tất cả là đã đọc
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredNotis.length > 0 ? (
          filteredNotis.map((noti) => (
            <div
              key={noti.id}
              className={`
                        relative p-4 rounded-2xl border transition-all hover:shadow-md flex gap-4 items-start group
                        ${
                          noti.isRead
                            ? "bg-white border-border-light"
                            : "bg-blue-50/50 border-blue-100"
                        }
                    `}
            >
              {/* Icon */}
              {getIcon(noti.type)}

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-start">
                  <h4
                    className={`text-sm font-bold mb-1 ${
                      noti.isRead ? "text-text-primary" : "text-blue-900"
                    }`}
                  >
                    {noti.title}
                  </h4>
                  <span className="text-[10px] text-text-secondary whitespace-nowrap ml-2">
                    {noti.time}
                  </span>
                </div>
                <p
                  className={`text-sm mb-2 line-clamp-2 ${
                    noti.isRead ? "text-text-secondary" : "text-blue-900/80"
                  }`}
                >
                  {noti.message}
                </p>

                {/* Action Link */}
                {noti.link && (
                  <Link
                    to={noti.link}
                    onClick={() => markAsRead(noti.id)}
                    className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Xem chi tiết
                  </Link>
                )}
              </div>

              {/* Dot Unread */}
              {!noti.isRead && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}

              {/* Delete Button (Hover) */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  deleteNoti(noti.id);
                }}
                className="absolute bottom-4 right-4 p-2 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Xóa thông báo"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-border-light">
            <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-3 text-text-secondary">
              <IconBell className="w-8 h-8" />
            </div>
            <p className="text-text-primary font-bold">
              Bạn không có thông báo nào.
            </p>
            <p className="text-text-secondary text-sm">
              Các cập nhật về chuyến đi sẽ xuất hiện ở đây.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
