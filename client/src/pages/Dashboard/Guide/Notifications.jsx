import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconCheck, IconClock } from "../../../icons/IconBox";
import { IconUser } from "../../../icons/IconUser";
import {
  IconBell,
  IconWallet,
  IconInfo,
  IconTrash,
} from "../../../icons/IconCommon";

// --- MOCK DATA ---
const notificationsData = [
  {
    id: 1,
    type: "booking", // booking, payment, system, review
    title: "Yêu cầu đặt tour mới",
    message:
      "Du khách Nguyễn Văn A đã đặt tour 'Bí mật Hoàng cung Huế'. Chờ xác nhận.",
    time: "15 phút trước",
    isRead: false,
    link: "/dashboard/guide/booking/BK-901",
  },
  {
    id: 2,
    type: "payment",
    title: "Tiền đã về ví",
    message: "Bạn nhận được 1.620.000đ từ tour 'Thiền trà tại Chùa Từ Hiếu'.",
    time: "2 giờ trước",
    isRead: false,
    link: "/dashboard/guide/earnings",
  },
  {
    id: 3,
    type: "review",
    title: "Đánh giá mới 5 sao",
    message:
      "Sarah Jenkins đã viết nhận xét về tour của bạn: 'Amazing experience...'",
    time: "1 ngày trước",
    isRead: true,
    link: "/dashboard/guide/reviews",
  },
  {
    id: 4,
    type: "system",
    title: "Cập nhật chính sách",
    message: "Hệ thống sẽ bảo trì vào lúc 02:00 AM ngày mai. Vui lòng lưu ý.",
    time: "3 ngày trước",
    isRead: true,
    link: "#",
  },
  {
    id: 5,
    type: "booking",
    title: "Tour sắp diễn ra",
    message:
      "Đừng quên tour 'Bí mật Hoàng cung' sẽ bắt đầu vào 08:00 sáng mai.",
    time: "1 ngày trước",
    isRead: true,
    link: "/dashboard/guide/schedule",
  },
];

export default function GuideNotifications() {
  const [notifications, setNotifications] = useState(notificationsData);
  const [filter, setFilter] = useState("all"); // all, unread

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
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <IconBell className="w-5 h-5" />
          </div>
        );
    }
  };

  // Helper icon star inline
  const IconStar = ({ className }) => (
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

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
            Tất cả
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              filter === "unread"
                ? "bg-primary text-white"
                : "bg-white text-text-secondary hover:bg-bg-main"
            }`}
          >
            Chưa đọc
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-end">
        <button
          onClick={markAllRead}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <IconCheck className="w-4 h-4" /> Đánh dấu tất cả là đã đọc
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
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
              <div className="shrink-0">{getIcon(noti.type)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex justify-between items-start">
                  <h4
                    className={`text-sm font-bold mb-1 ${
                      noti.isRead ? "text-text-primary" : "text-blue-800"
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
                <Link
                  to={noti.link}
                  onClick={() => markAsRead(noti.id)}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Xem chi tiết
                </Link>
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
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <IconBell className="w-8 h-8" />
            </div>
            <p className="text-text-secondary text-sm">
              Không có thông báo nào.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
