import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../../features/notifications/hooks";
import Spinner from "../../../components/Loaders/Spinner";
import { IconCheck, IconClock } from "../../../icons/IconBox";
import { IconUser } from "../../../icons/IconUser";
import {
  IconBell,
  IconWallet,
  IconInfo,
  IconTrash,
  IconTicket,
} from "../../../icons/IconCommon";

export default function TouristNotifications() {
  const [filter, setFilter] = useState("all");

  // Fetch notifications from API
  const {
    notifications: apiNotifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const getNotificationTitle = (type) => {
    const titles = {
      booking_confirmed: "Xác nhận đặt tour",
      booking_cancelled: "Hủy đặt tour",
      payment_success: "Thanh toán",
      reminder: "Nhắc nhở",
      system: "Thông báo hệ thống",
    };
    return titles[type] || "Thông báo";
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now - past) / 1000); // seconds

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return `${Math.floor(diff / 604800)} tuần trước`;
  };

  // Transform notifications
  const notifications = useMemo(() => {
    if (!apiNotifications) return [];

    return apiNotifications.map((n) => ({
      id: n._id,
      type: n.type || "system",
      title: getNotificationTitle(n.type),
      message: n.content || n.message || "",
      time: n.timeAgo || formatTimeAgo(n.createdAt),
      isRead: n.is_read || n.isRead || false,
      link: n.url || n.link || n.actionUrl || null,
    }));
  }, [apiNotifications]);

  const filteredNotis = notifications.filter(
    (n) => filter === "all" || (filter === "unread" && !n.isRead)
  );

  const handleMarkAsRead = (id) => {
    markAsRead(id);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleDelete = (id) => {
    deleteNotification(id);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

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
          onClick={handleMarkAllRead}
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
                    onClick={() => handleMarkAsRead(noti.id)}
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
                  handleDelete(noti.id);
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
