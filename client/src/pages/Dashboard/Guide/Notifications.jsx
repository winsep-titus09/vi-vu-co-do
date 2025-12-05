import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconCheck } from "../../../icons/IconBox";
import { IconUser } from "../../../icons/IconUser";
import {
  IconBell,
  IconWallet,
  IconInfo,
  IconTrash,
  IconStar,
} from "../../../icons/IconCommon";
import { useNotifications } from "../../../features/notifications/hooks";
import Spinner from "../../../components/Loaders/Spinner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function GuideNotifications() {
  const [filter, setFilter] = useState("all"); // all, unread

  // Fetch notifications from API
  const {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  } = useNotifications({ limit: 50 });

  // Filter notifications
  const filteredNotis = notifications.filter(
    (n) => filter === "all" || (filter === "unread" && !n.is_read)
  );

  // Format time helper
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "";
    }
  };

  // Get notification link based on type
  const getNotificationLink = (noti) => {
    switch (noti.type) {
      case "booking":
        return "/dashboard/guide/requests";
      case "payment":
        return "/dashboard/guide/earnings";
      case "review":
        return "/dashboard/guide/reviews";
      case "tour":
        return "/dashboard/guide/my-tours";
      default:
        return "#";
    }
  };

  // Helper render icon
  const getIcon = (type) => {
    switch (type) {
      case "booking":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <IconUser className="w-5 h-5" />
          </div>
        );
      case "payment":
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <IconWallet className="w-5 h-5" />
          </div>
        );
      case "review":
        return (
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
            <IconStar className="w-5 h-5" />
          </div>
        );
      case "system":
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
            <IconInfo className="w-5 h-5" />
          </div>
        );
      case "tour":
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <IconInfo className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <IconBell className="w-5 h-5" />
          </div>
        );
    }
  };

  // Handle mark as read
  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  // Handle delete notification
  const handleDelete = async (id) => {
    await deleteNotification(id);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="text-primary font-bold hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Thông báo
          </h1>
          <p className="text-text-secondary text-sm">
            Cập nhật mới nhất về hoạt động của bạn.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-white text-text-secondary hover:bg-bg-main"
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === "unread"
                ? "bg-primary text-white"
                : "bg-white text-text-secondary hover:bg-bg-main"
            }`}
          >
            Chưa đọc ({notifications.filter((n) => !n.is_read).length})
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      {notifications.some((n) => !n.is_read) && (
        <div className="flex justify-end">
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <IconCheck className="w-4 h-4" /> Đánh dấu tất cả là đã đọc
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filteredNotis.length > 0 ? (
          filteredNotis.map((noti) => (
            <div
              key={noti._id}
              className={`
                relative p-4 rounded-2xl border transition-all hover:shadow-md flex gap-4 items-start group
                ${
                  noti.is_read
                    ? "bg-white border-border-light"
                    : "bg-blue-50/50 border-blue-100"
                }
              `}
            >
              {/* Icon */}
              <div className="shrink-0">{getIcon(noti.type)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-start">
                  <h4
                    className={`text-sm font-bold mb-1 capitalize ${
                      noti.is_read ? "text-text-primary" : "text-blue-800"
                    }`}
                  >
                    {noti.type === "booking"
                      ? "Đặt tour"
                      : noti.type === "payment"
                      ? "Thanh toán"
                      : noti.type === "review"
                      ? "Đánh giá"
                      : noti.type === "tour"
                      ? "Tour"
                      : "Hệ thống"}
                  </h4>
                  <span className="text-[10px] text-text-secondary whitespace-nowrap ml-2">
                    {formatTime(noti.createdAt)}
                  </span>
                </div>
                <p
                  className={`text-sm mb-2 line-clamp-2 ${
                    noti.is_read ? "text-text-secondary" : "text-blue-900/80"
                  }`}
                >
                  {noti.content}
                </p>

                {/* Action Link */}
                <Link
                  to={getNotificationLink(noti)}
                  onClick={() => handleMarkAsRead(noti._id)}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Xem chi tiết
                </Link>
              </div>

              {/* Dot Unread */}
              {!noti.is_read && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}

              {/* Delete Button (Hover) */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(noti._id);
                }}
                className="absolute bottom-4 right-4 p-2 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Xóa thông báo"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <IconBell className="w-8 h-8" />
            </div>
            <p className="text-text-secondary text-sm">
              {filter === "unread"
                ? "Không có thông báo chưa đọc."
                : "Không có thông báo nào."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
