import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconSearch } from "../../../icons/IconSearch";
import { IconMapPin, IconClock, IconStar } from "../../../icons/IconBox";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconDots,
} from "../../../icons/IconCommon";
import { useMyTours } from "../../../features/guides/hooks";
import guidesApi from "../../../features/guides/api";
import { formatCurrency } from "../../../lib/formatters";
import { useToast } from "../../../components/Toast/useToast";

// Inline Icons
const IconLoader = ({ className }) => (
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
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "approved", label: "Đang hoạt động" },
  { id: "pending", label: "Chờ duyệt" },
  { id: "rejected", label: "Bị từ chối" },
];

export default function GuideMyTours() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const toast = useToast();

  // Fetch tours from API
  const { tours, isLoading, error, refetch } = useMyTours({
    status: activeTab === "all" ? undefined : activeTab,
    limit: 50,
  });

  // Filter by search (client-side)
  const filteredTours = tours.filter((tour) => {
    if (!search) return true;
    const tourName = tour.name || tour.title || "";
    return tourName.toLowerCase().includes(search.toLowerCase());
  });

  // Handle delete tour
  const handleDelete = async (tourId) => {
    if (!window.confirm("Bạn có chắc muốn xóa tour này?")) return;
    try {
      await guidesApi.deleteTour(tourId);
      toast.success("Thành công!", "Đã xóa tour khỏi hệ thống.");
      refetch();
    } catch (err) {
      toast.error("Lỗi", err.message || "Không thể xóa tour");
    }
  };

  // Map API status to display status
  const getDisplayStatus = (status) => {
    if (status === "approved" || status === "active") return "active";
    if (status === "pending") return "pending";
    if (status === "rejected") return "rejected";
    if (status === "draft") return "draft";
    if (status === "hidden" || status === "inactive") return "hidden";
    return "pending";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1 w-fit">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Hoạt
            động
          </span>
        );
      case "pending":
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center gap-1 w-fit">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Chờ
            duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 w-fit">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Bị từ chối
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
        {isLoading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-border-light">
            <IconLoader className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-text-secondary text-sm mt-4">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-red-100">
            <p className="text-red-600 font-bold mb-1">Lỗi tải dữ liệu</p>
            <p className="text-text-secondary text-sm">{error}</p>
          </div>
        ) : filteredTours.length > 0 ? (
          filteredTours.map((tour) => {
            // Get first location name from locations array
            const locationName =
              tour.locations?.[0]?.locationId?.name ||
              tour.locations?.[0]?.name ||
              tour.location?.name ||
              tour.location ||
              "Huế";

            // Format duration
            const durationText = tour.duration_hours
              ? `${tour.duration_hours} giờ`
              : tour.duration
              ? `${tour.duration} ngày`
              : "4 giờ";

            const tourData = {
              id: tour._id || tour.id,
              type: tour.type || "tour", // "tour" or "request"
              title: tour.name || tour.title || "Tour",
              image:
                tour.cover_image_url ||
                tour.images?.[0] ||
                tour.gallery?.[0] ||
                "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
              price: formatCurrency(tour.price || tour.base_price || 0),
              duration: durationText,
              location: locationName,
              status: getDisplayStatus(tour.status),
              stats: {
                bookings: tour.booking_count || 0,
                rating: tour.average_rating || 0,
                revenue: formatCurrency(tour.total_revenue || 0),
              },
            };
            return (
              <div
                key={tourData.id}
                className="bg-white rounded-3xl border border-border-light p-4 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image */}
                  <div className="relative w-full md:w-64 h-48 md:h-54 rounded-2xl overflow-hidden shrink-0">
                    <img
                      src={tourData.image}
                      alt={tourData.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(tourData.status)}
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg md:text-xl font-heading font-bold text-text-primary line-clamp-2 group-hover:text-primary transition-colors pr-2">
                          {tourData.title}
                        </h3>
                        <button className="p-1 text-text-secondary hover:bg-gray-100 rounded-lg shrink-0">
                          <IconDots className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-text-secondary mb-4">
                        <span className="flex items-center gap-1">
                          <IconMapPin className="w-4 h-4 text-primary" />{" "}
                          {tourData.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconClock className="w-4 h-4 text-primary" />{" "}
                          {tourData.duration}
                        </span>
                        <span className="font-bold text-primary">
                          {tourData.price}
                        </span>
                      </div>
                    </div>

                    {/* Stats Bar - Only show for approved tours */}
                    {tourData.type === "tour" &&
                    tourData.status === "active" ? (
                      <div className="grid grid-cols-3 gap-2 md:gap-4 py-3 border-t border-b border-border-light/50 bg-bg-main/30 rounded-xl px-2 md:px-4 mb-4">
                        <div className="text-center border-r border-border-light/50">
                          <p className="text-[9px] md:text-[10px] text-text-secondary uppercase font-bold truncate">
                            Lượt đặt
                          </p>
                          <p className="font-bold text-text-primary text-base md:text-lg">
                            {tourData.stats.bookings}
                          </p>
                        </div>
                        <div className="text-center border-r border-border-light/50">
                          <p className="text-[9px] md:text-[10px] text-text-secondary uppercase font-bold truncate">
                            Đánh giá
                          </p>
                          <div className="flex items-center justify-center gap-1 font-bold text-text-primary text-base md:text-lg">
                            {tourData.stats.rating.toFixed(1)}{" "}
                            <IconStar className="w-3 h-3 md:w-3.5 md:h-3.5 text-secondary fill-current" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] md:text-[10px] text-text-secondary uppercase font-bold truncate">
                            Doanh thu
                          </p>
                          <p className="font-bold text-green-600 text-sm md:text-lg truncate">
                            {tourData.stats.revenue}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-3 border-t border-b border-border-light/50 bg-bg-main/30 rounded-xl px-4 mb-4 text-center">
                        <p className="text-sm text-text-secondary">
                          {tourData.status === "pending" &&
                            "Tour đang chờ admin duyệt"}
                          {tourData.status === "rejected" &&
                            "Tour đã bị từ chối"}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 md:gap-3">
                      {/* Edit - only for pending requests */}
                      {tourData.status === "pending" && (
                        <Link
                          to={`/dashboard/guide/edit-tour-request/${tourData.id}`}
                          className="flex-1 py-2.5 rounded-lg border border-border-light text-sm font-bold text-text-secondary hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 bg-white"
                        >
                          <IconEdit className="w-4 h-4" />
                          <span className="hidden sm:inline">Chỉnh sửa</span>
                          <span className="sm:hidden">Sửa</span>
                        </Link>
                      )}

                      {/* Edit - for approved tours */}
                      {tourData.status === "active" && (
                        <Link
                          to={`/dashboard/guide/edit-tour/${tourData.id}`}
                          className="flex-1 py-2.5 rounded-lg border border-border-light text-sm font-bold text-text-secondary hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 bg-white"
                        >
                          <IconEdit className="w-4 h-4" />
                          <span className="hidden sm:inline">Chỉnh sửa</span>
                          <span className="sm:hidden">Sửa</span>
                        </Link>
                      )}

                      {/* View - only for approved tours */}
                      {tourData.status === "active" && (
                        <Link
                          to={`/tours/${tourData.id}`}
                          className="flex-1 py-2.5 rounded-lg border border-border-light text-sm font-bold text-text-secondary hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 bg-white"
                        >
                          <IconEye className="w-4 h-4" />
                          <span className="hidden sm:inline">Xem trước</span>
                          <span className="sm:hidden">Xem</span>
                        </Link>
                      )}

                      {/* Delete - only for pending requests */}
                      {tourData.status === "pending" && (
                        <button
                          onClick={() => handleDelete(tourData.id)}
                          className="px-3 md:px-4 py-2.5 rounded-lg border border-border-light text-text-secondary hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
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
