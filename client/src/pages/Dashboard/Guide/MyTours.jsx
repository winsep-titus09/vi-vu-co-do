import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconSearch } from "../../../icons/IconSearch";
import { IconMapPin, IconClock, IconStar } from "../../../icons/IconBox";

// Inline Icons
const IconPlus = ({ className }) => (
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
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const IconEdit = ({ className }) => (
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
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
);

const IconTrash = ({ className }) => (
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
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const IconEye = ({ className }) => (
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
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// --- ICONS INLINE (Nếu thiếu trong IconBox) ---
const IconDots = ({ className }) => (
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
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

// --- MOCK DATA ---
const myTours = [
  {
    id: 1,
    title: "Bí mật Hoàng cung Huế & Trải nghiệm trà chiều",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
    price: "1.800.000đ",
    duration: "4 giờ",
    location: "Đại Nội",
    status: "active", // active, draft, hidden
    stats: {
      bookings: 45,
      rating: 4.8,
      revenue: "81.000.000đ",
    },
  },
  {
    id: 2,
    title: "Thiền trà tại Chùa Từ Hiếu - Tìm về an yên",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuatuhieu1.jpg",
    price: "600.000đ",
    duration: "3 giờ",
    location: "Dương Xuân",
    status: "active",
    stats: {
      bookings: 28,
      rating: 4.9,
      revenue: "16.800.000đ",
    },
  },
  {
    id: 3,
    title: "[Bản nháp] Khám phá đầm phá Tam Giang mùa nước nổi",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/hoanghon.jpg",
    price: "900.000đ",
    duration: "5 giờ",
    location: "Quảng Điền",
    status: "draft",
    stats: {
      bookings: 0,
      rating: 0,
      revenue: "0đ",
    },
  },
];

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đang hoạt động" },
  { id: "draft", label: "Bản nháp" },
  { id: "hidden", label: "Tạm ẩn" },
];

export default function GuideMyTours() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filteredTours = myTours.filter((tour) => {
    const matchTab = activeTab === "all" || tour.status === activeTab;
    const matchSearch = tour.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1 w-fit">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Hoạt
            động
          </span>
        );
      case "draft":
        return (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center gap-1 w-fit">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span> Bản nháp
          </span>
        );
      case "hidden":
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center gap-1 w-fit">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Tạm ẩn
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Tour của tôi
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Quản lý, chỉnh sửa và theo dõi hiệu quả các tour.
          </p>
        </div>

        {/* [LINKED] Nút Tạo tour mới -> Chuyển hướng sang trang CreateTour */}
        <Link
          to="/dashboard/guide/create-tour"
          className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
        >
          <IconPlus className="w-5 h-5" /> Tạo tour mới
        </Link>
      </div>

      {/* 2. TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-border-light flex flex-col md:flex-row justify-between gap-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                        whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all
                        ${
                          activeTab === tab.id
                            ? "bg-bg-main text-primary"
                            : "text-text-secondary hover:bg-gray-50"
                        }
                    `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm kiếm tour..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-light bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
            onChange={(e) => setSearch(e.target.value)}
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>
      </div>

      {/* 3. TOUR LIST */}
      <div className="space-y-6">
        {filteredTours.length > 0 ? (
          filteredTours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-3xl border border-border-light p-4 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="relative w-full md:w-64 h-48 md:h-54 rounded-2xl overflow-hidden shrink-0">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(tour.status)}
                  </div>
                </div>

                {/* Content Info */}
                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg md:text-xl font-heading font-bold text-text-primary line-clamp-2 group-hover:text-primary transition-colors pr-2">
                        {tour.title}
                      </h3>
                      <button className="p-1 text-text-secondary hover:bg-gray-100 rounded-lg shrink-0">
                        <IconDots className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-text-secondary mb-4">
                      <span className="flex items-center gap-1">
                        <IconMapPin className="w-4 h-4 text-primary" />{" "}
                        {tour.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconClock className="w-4 h-4 text-primary" />{" "}
                        {tour.duration}
                      </span>
                      <span className="font-bold text-primary">
                        {tour.price}
                      </span>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="grid grid-cols-3 gap-2 md:gap-4 py-3 border-t border-b border-border-light/50 bg-bg-main/30 rounded-xl px-2 md:px-4 mb-4">
                    <div className="text-center border-r border-border-light/50">
                      <p className="text-[9px] md:text-[10px] text-text-secondary uppercase font-bold truncate">
                        Lượt đặt
                      </p>
                      <p className="font-bold text-text-primary text-base md:text-lg">
                        {tour.stats.bookings}
                      </p>
                    </div>
                    <div className="text-center border-r border-border-light/50">
                      <p className="text-[9px] md:text-[10px] text-text-secondary uppercase font-bold truncate">
                        Đánh giá
                      </p>
                      <div className="flex items-center justify-center gap-1 font-bold text-text-primary text-base md:text-lg">
                        {tour.stats.rating}{" "}
                        <IconStar className="w-3 h-3 md:w-3.5 md:h-3.5 text-secondary fill-current" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] md:text-[10px] text-text-secondary uppercase font-bold truncate">
                        Doanh thu
                      </p>
                      <p className="font-bold text-green-600 text-sm md:text-lg truncate">
                        {tour.stats.revenue}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 md:gap-3">
                    <Link
                      to={`/dashboard/guide/edit-tour/${tour.id}`}
                      className="flex-1 py-2.5 rounded-lg border border-border-light text-sm font-bold text-text-secondary hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 bg-white"
                    >
                      <IconEdit className="w-4 h-4" />
                      <span className="hidden sm:inline">Chỉnh sửa</span>
                      <span className="sm:hidden">Sửa</span>
                    </Link>
                    <Link
                      to={`/tours/${tour.id}`}
                      className="flex-1 py-2.5 rounded-lg border border-border-light text-sm font-bold text-text-secondary hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 bg-white"
                    >
                      <IconEye className="w-4 h-4" />
                      <span className="hidden sm:inline">Xem trước</span>
                      <span className="sm:hidden">Xem</span>
                    </Link>
                    <button className="px-3 md:px-4 py-2.5 rounded-lg border border-border-light text-text-secondary hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all shrink-0">
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-border-light">
            <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
              <IconMapPin className="w-8 h-8" />
            </div>
            <p className="text-text-primary font-bold mb-1">Chưa có tour nào</p>
            <p className="text-text-secondary text-sm mb-6">
              Hãy tạo tour du lịch đầu tiên của bạn để bắt đầu đón khách.
            </p>

            {/* [LINKED] Nút Tạo tour ngay trong Empty State */}
            <Link
              to="/dashboard/guide/create-tour"
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto w-fit"
            >
              <IconPlus className="w-4 h-4" /> Tạo tour ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
