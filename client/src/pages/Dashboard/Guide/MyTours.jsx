import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { IconSearch } from "../../../icons/IconSearch";
import { IconMapPin, IconClock, IconStar } from "../../../icons/IconBox";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconDots,
  IconRefresh,
  IconInbox,
  IconChevronLeft,
  IconChevronRight,
  IconLoader,
} from "../../../icons/IconCommon";
import { IconX } from "../../../icons/IconX";
import { useMyTours } from "../../../features/guides/hooks";
import {
  useMyEditRequests,
  useCancelEditRequest,
} from "../../../features/tours/hooks";
import guidesApi from "../../../features/guides/api";
import { formatCurrency, formatDate } from "../../../lib/formatters";
import { useToast } from "../../../components/Toast/useToast";
import CreateEditRequestModal from "./components/CreateEditRequestModal";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import Spinner from "../../../components/Loaders/Spinner";

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "approved", label: "Đang hoạt động" },
  { id: "pending", label: "Chờ duyệt" },
  { id: "rejected", label: "Bị từ chối" },
  { id: "edit-requests", label: "Yêu cầu sửa", showDot: true },
];

const REQUEST_TYPE_LABELS = {
  edit: { text: "Chỉnh sửa", color: "blue" },
  delete: { text: "Xóa tour", color: "red" },
};

export default function GuideMyTours() {
  const [activeTab, setActiveTab] = useState("all");
  const [requestStatusFilter, setRequestStatusFilter] = useState("all");
  const [requestPage, setRequestPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editRequestModal, setEditRequestModal] = useState({ open: false, tour: null });
  const [cancelModal, setCancelModal] = useState({ open: false, request: null });
  const [actionLoading, setActionLoading] = useState(null);
  const toast = useToast();
  const requestLimit = 10;

  // Fetch tours from API
  const { tours, isLoading, error, refetch } = useMyTours({
    status: activeTab === "all" || activeTab === "edit-requests" ? undefined : activeTab,
    limit: 50,
  });

  // Fetch edit requests
  const { 
    requests, 
    total: requestTotal, 
    isLoading: requestsLoading, 
    error: requestsError, 
    refetch: refetchRequests 
  } = useMyEditRequests({
    status: requestStatusFilter === "all" ? undefined : requestStatusFilter,
    page: requestPage,
    limit: requestLimit,
  });

  const { cancel } = useCancelEditRequest();
  const requestTotalPages = Math.ceil(requestTotal / requestLimit) || 1;

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
      toast.error("Lỗi xóa tour", err.message || "Không thể xóa tour");
    }
  };

  // Handle cancel edit request
  const handleCancelRequest = useCallback(async () => {
    const request = cancelModal.request;
    if (!request) return;

    try {
      setActionLoading(request._id);
      await cancel(request._id);
      toast.success("Thành công!", "Đã hủy yêu cầu.");
      setCancelModal({ open: false, request: null });
      refetchRequests();
    } catch (err) {
      toast.error("Lỗi hủy yêu cầu", err?.message || "Vui lòng thử lại");
    } finally {
      setActionLoading(null);
    }
  }, [cancelModal.request, cancel, refetchRequests, toast]);

  // Get request status badge
  const getRequestStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
            Chờ duyệt
          </span>
        );
      case "approved":
        return (
          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
            Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  // Get request type badge
  const getRequestTypeBadge = (type) => {
    const config = REQUEST_TYPE_LABELS[type] || { text: type, color: "gray" };
    const colorClasses = {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      red: "bg-red-100 text-red-700 border-red-200",
      gray: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${colorClasses[config.color]}`}>
        {type === "edit" ? <IconEdit className="w-3 h-3" /> : <IconTrash className="w-3 h-3" />}
        {config.text}
      </span>
    );
  };

  // Map API status to display status
  const getDisplayStatus = (tour) => {
    // Server returns displayStatus directly
    if (tour.displayStatus) return tour.displayStatus;

    // Fallback: Check approval status
    const approvalStatus = tour.approval?.status;
    if (approvalStatus === "pending") return "pending";
    if (approvalStatus === "rejected") return "rejected";
    if (approvalStatus === "approved") {
      // If approved, check if tour is active
      if (tour.status === "inactive" || tour.is_active === false)
        return "hidden";
      return "active";
    }
    // Fallback for legacy data
    const status = tour.status;
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
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "edit-requests") {
                  setRequestStatusFilter("all");
                  setRequestPage(1);
                }
              }}
              className={`
                        whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                        ${
                          activeTab === tab.id
                            ? "bg-bg-main text-primary"
                            : "text-text-secondary hover:bg-gray-50"
                        }
                    `}
            >
              {tab.label}
              {tab.showDot && requests.some(r => r.status === "pending") && (
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

        {activeTab !== "edit-requests" ? (
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Tìm kiếm tour..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-light bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
              onChange={(e) => setSearch(e.target.value)}
            />
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          </div>
        ) : (
          <div className="flex gap-2">
            {[
              { id: "all", label: "Tất cả" },
              { id: "pending", label: "Chờ duyệt" },
              { id: "approved", label: "Đã duyệt" },
              { id: "rejected", label: "Từ chối" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  setRequestStatusFilter(filter.id);
                  setRequestPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  requestStatusFilter === filter.id
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-gray-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. CONTENT */}
      {activeTab === "edit-requests" ? (
        /* EDIT REQUESTS LIST */
        <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
          {requestsLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner />
            </div>
          ) : requestsError ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <p className="font-bold">Đã có lỗi xảy ra</p>
              <p className="text-sm">{requestsError}</p>
              <button
                onClick={refetchRequests}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold"
              >
                Thử lại
              </button>
            </div>
          ) : requests.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
                    <tr>
                      <th className="p-4 pl-6">Tour</th>
                      <th className="p-4">Loại yêu cầu</th>
                      <th className="p-4">Ngày gửi</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4">Ghi chú admin</th>
                      <th className="p-4 pr-6 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr
                        key={req._id}
                        className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                      >
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-border-light shrink-0 bg-gray-100">
                              {req.tour_id?.cover_image_url ? (
                                <img
                                  src={req.tour_id.cover_image_url}
                                  className="w-full h-full object-cover"
                                  alt={req.tour_id?.name}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <IconMapPin className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-text-primary max-w-[200px] truncate" title={req.tour_id?.name}>
                                {req.tour_id?.name || "(Tour đã xóa)"}
                              </p>
                              <p className="text-xs text-text-secondary truncate max-w-[200px]">
                                {req.description?.substring(0, 40)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">{getRequestTypeBadge(req.request_type)}</td>
                        <td className="p-4 text-text-secondary text-xs">
                          <div className="flex items-center gap-1">
                            <IconClock className="w-3 h-3" />
                            {formatDate(req.createdAt)}
                          </div>
                        </td>
                        <td className="p-4">{getRequestStatusBadge(req.status)}</td>
                        <td className="p-4">
                          {req.admin_notes ? (
                            <p className="text-xs text-text-secondary max-w-[150px] truncate" title={req.admin_notes}>
                              {req.admin_notes}
                            </p>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            {req.status === "approved" && req.request_type === "edit" && (
                              <Link
                                to={`/dashboard/guide/edit-tour/${req.tour_id?._id}`}
                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Chỉnh sửa tour"
                              >
                                <IconEdit className="w-4 h-4" />
                              </Link>
                            )}
                            <Link
                              to={`/tours/${req.tour_id?._id}`}
                              target="_blank"
                              className="p-2 rounded-lg bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
                              title="Xem tour"
                            >
                              <IconEye className="w-4 h-4" />
                            </Link>
                            {req.status === "pending" && (
                              <button
                                onClick={() => setCancelModal({ open: true, request: req })}
                                disabled={actionLoading === req._id}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                title="Hủy yêu cầu"
                              >
                                {actionLoading === req._id ? (
                                  <Spinner className="w-4 h-4" />
                                ) : (
                                  <IconX className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {requestTotalPages > 1 && (
                <div className="p-4 border-t border-border-light flex justify-between items-center text-xs text-text-secondary">
                  <span>
                    Hiển thị{" "}
                    <strong>
                      {(requestPage - 1) * requestLimit + 1}-{Math.min(requestPage * requestLimit, requestTotal)}
                    </strong>{" "}
                    trên tổng số <strong>{requestTotal}</strong>
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setRequestPage((p) => Math.max(1, p - 1))}
                      className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-50"
                      disabled={requestPage === 1}
                    >
                      <IconChevronLeft className="w-3 h-3" />
                    </button>
                    {Array.from({ length: Math.min(requestTotalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (requestTotalPages <= 5) {
                        pageNum = i + 1;
                      } else if (requestPage <= 3) {
                        pageNum = i + 1;
                      } else if (requestPage >= requestTotalPages - 2) {
                        pageNum = requestTotalPages - 4 + i;
                      } else {
                        pageNum = requestPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setRequestPage(pageNum)}
                          className={`px-2.5 py-1 rounded border ${
                            requestPage === pageNum
                              ? "bg-primary text-white font-bold"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setRequestPage((p) => Math.min(requestTotalPages, p + 1))}
                      className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-50"
                      disabled={requestPage === requestTotalPages}
                    >
                      <IconChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
              <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mb-4 text-gray-400">
                <IconInbox className="w-8 h-8" />
              </div>
              <p className="font-bold text-gray-500">Chưa có yêu cầu nào</p>
              <p className="text-xs mb-4">
                Gửi yêu cầu chỉnh sửa/xóa tour cho admin khi cần.
              </p>
              <button
                onClick={() => setEditRequestModal({ open: true, tour: null })}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                <IconPlus className="w-4 h-4" />
                Gửi yêu cầu đầu tiên
              </button>
            </div>
          )}
        </div>
      ) : (
        /* TOURS LIST */
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

            // Kiểm tra quyền chỉnh sửa
            const hasEditPermission = tour.edit_allowed_until && new Date(tour.edit_allowed_until) > new Date();
            const canEdit = tour.canEdit || hasEditPermission;

            const tourData = {
              id: tour._id || tour.id,
              type: tour.type || "tour", // "tour" or "request"
              title: tour.name || tour.title || "Tour",
              image:
                tour.cover_image_url ||
                tour.images?.[0] ||
                tour.gallery?.[0] ||
                "/images/placeholders/tour-placeholder.jpg",
              price: formatCurrency(tour.price || tour.base_price || 0),
              duration: durationText,
              location: locationName,
              status: getDisplayStatus(tour),
              stats: {
                bookings: tour.booking_count || 0,
                rating: tour.average_rating || 0,
                revenue: formatCurrency(tour.total_revenue || 0),
              },
              canEdit: canEdit,
              editAllowedUntil: tour.edit_allowed_until,
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
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {getStatusBadge(tourData.status)}
                      {/* Badge hiển thị quyền chỉnh sửa */}
                      {tourData.status === "active" && tourData.canEdit && tourData.editAllowedUntil && (
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 w-fit">
                          <IconEdit className="w-3 h-3" /> Có thể sửa
                        </span>
                      )}
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
                      
                      {/* Hiển thị thời hạn chỉnh sửa */}
                      {tourData.status === "active" && tourData.canEdit && tourData.editAllowedUntil && (
                        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs text-blue-700">
                            <span className="font-bold">⏰ Quyền chỉnh sửa:</span> Hết hạn {formatDate(tourData.editAllowedUntil)}
                          </p>
                        </div>
                      )}
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

                      {/* Edit - for approved tours WITH edit permission */}
                      {tourData.status === "active" && tourData.canEdit && (
                        <Link
                          to={`/dashboard/guide/edit-tour/${tourData.id}`}
                          className="flex-1 py-2.5 rounded-lg border border-blue-300 text-sm font-bold text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 bg-white"
                        >
                          <IconEdit className="w-4 h-4" />
                          <span className="hidden sm:inline">Chỉnh sửa</span>
                          <span className="sm:hidden">Sửa</span>
                        </Link>
                      )}

                      {/* Request Edit - for approved tours WITHOUT edit permission */}
                      {tourData.status === "active" && !tourData.canEdit && (
                        <button
                          onClick={() => setEditRequestModal({ open: true, tour: tour })}
                          className="flex-1 py-2.5 rounded-lg border border-border-light text-sm font-bold text-text-secondary hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 bg-white"
                        >
                          <IconEdit className="w-4 h-4" />
                          <span className="hidden sm:inline">Yêu cầu sửa</span>
                          <span className="sm:hidden">Yêu cầu</span>
                        </button>
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
      )}

      {/* Create Edit Request Modal */}
      <CreateEditRequestModal
        isOpen={editRequestModal.open}
        onClose={() => setEditRequestModal({ open: false, tour: null })}
        selectedTour={editRequestModal.tour}
        onSuccess={() => {
          setEditRequestModal({ open: false, tour: null });
          toast.success("Thành công!", "Yêu cầu chỉnh sửa đã được gửi. Vui lòng chờ admin duyệt.");
          refetch();
          refetchRequests();
        }}
      />

      {/* Cancel Request Modal */}
      <ConfirmModal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, request: null })}
        onConfirm={handleCancelRequest}
        title="Hủy yêu cầu"
        message={
          <>
            Bạn có chắc muốn hủy yêu cầu{" "}
            {cancelModal.request?.request_type === "delete" ? "xóa" : "chỉnh sửa"}{" "}
            tour <strong>"{cancelModal.request?.tour_id?.name}"</strong>?
          </>
        }
        confirmText="Hủy yêu cầu"
        confirmVariant="danger"
        isLoading={actionLoading === cancelModal.request?._id}
      />
    </div>
  );
}
