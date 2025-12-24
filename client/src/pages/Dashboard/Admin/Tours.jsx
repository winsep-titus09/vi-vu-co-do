import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../../components/Toast/useToast";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import { IconClock, IconMapPin, IconStar } from "../../../icons/IconBox";
import {
  IconEye,
  IconEyeOff,
  IconTrash,
  IconCheck,
  IconFileText,
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
  IconPlus,
} from "../../../icons/IconCommon";
import Spinner from "../../../components/Loaders/Spinner";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import Badge from "../../../components/Badges/Badge";
import {
  useAdminTours,
  useToggleTourVisibility,
  useDeleteTour,
  useToggleFeatured,
  useAdminTourEditRequests,
  useApproveTourEditRequest,
  useRejectTourEditRequest,
  useApproveTour,
  useRejectTour,
} from "../../../features/admin/hooks";
import {
  formatCurrency,
  formatDate,
  formatTourDuration,
} from "../../../lib/formatters";

const getTourImage = (tour) => {
  const candidate =
    tour.cover_image_url ||
    tour.cover_image ||
    tour.image_url ||
    tour.image ||
    tour.thumbnail ||
    (Array.isArray(tour.images) && tour.images[0]) ||
    (Array.isArray(tour.gallery) && tour.gallery[0]) ||
    null;

  if (!candidate) return "/images/placeholders/tour-placeholder.jpg";
  if (typeof candidate === "string") return candidate;
  if (candidate.url) return candidate.url;
  if (candidate.src) return candidate.src;
  if (candidate.path) return candidate.path;
  return "/images/placeholders/tour-placeholder.jpg";
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const STATUS_LABELS = {
  pending: { text: "Chờ duyệt", color: "yellow" },
  active: { text: "Hoạt động", color: "green" },
  hidden: { text: "Tạm ẩn", color: "gray" },
  rejected: { text: "Từ chối", color: "red" },
};

const REQUEST_TYPE_LABELS = {
  edit: { text: "Chỉnh sửa", color: "blue" },
  delete: { text: "Xóa tour", color: "red" },
};

// Xác định status từ approval và is_active
const getTourStatus = (tour) => {
  if (!tour) return "pending";
  if (tour.approval?.status === "pending") return "pending";
  if (tour.approval?.status === "rejected" || tour.is_active === false)
    return "hidden";
  if (tour.approval?.status === "approved" && tour.is_active !== false)
    return "active";
  return "pending";
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function Tours() {
  const toast = useToast();

  // Tab & search state
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const debouncedSearch = useDebounce(search, 400);

  // Modals
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    tour: null,
  });
  const [confirmToggle, setConfirmToggle] = useState({
    open: false,
    tour: null,
  });
  const [confirmApproveTour, setConfirmApproveTour] = useState({
    open: false,
    tour: null,
  });
  const [confirmRejectTour, setConfirmRejectTour] = useState({
    open: false,
    tour: null,
  });
  const [confirmApprove, setConfirmApprove] = useState({
    open: false,
    request: null,
  });
  const [confirmReject, setConfirmReject] = useState({
    open: false,
    request: null,
  });
  const [rejectNote, setRejectNote] = useState("");
  const [rejectTourNote, setRejectTourNote] = useState("");
  const [deleteTourReason, setDeleteTourReason] = useState("");
  const [deleteError, setDeleteError] = useState(null);
  const [viewDetails, setViewDetails] = useState({
    open: false,
    request: null,
  });
  const [previewTour, setPreviewTour] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Get status filter for API
  const getStatusFilter = () => {
    if (activeTab === "pending") return "pending";
    if (activeTab === "active") return "active";
    if (activeTab === "hidden") return "hidden";
    return undefined;
  };

  // Fetch tours
  const {
    tours,
    total: totalTours,
    counts,
    isLoading: toursLoading,
    error: toursError,
    refetch: refetchTours,
  } = useAdminTours({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: getStatusFilter(),
  });

  // Fetch edit requests
  const {
    requests: editRequests,
    total: totalRequests,
    isLoading: requestsLoading,
    error: requestsError,
    refetch: refetchRequests,
  } = useAdminTourEditRequests({
    page,
    limit,
    status: "pending",
  });

  // Mutations
  const { toggle: toggleVisibility, isLoading: toggleLoading } =
    useToggleTourVisibility();
  const { deleteTour, isLoading: deleteLoading } = useDeleteTour();
  const { toggle: toggleFeatured, isLoading: featuredLoading } =
    useToggleFeatured();
  const { approve: approveRequest, isLoading: approveLoading } =
    useApproveTourEditRequest();
  const { reject: rejectRequestFn, isLoading: rejectLoading } =
    useRejectTourEditRequest();
  const { approve: approveTourFn, isLoading: approveTourLoading } =
    useApproveTour();
  const { reject: rejectTourFn, isLoading: rejectTourLoading } =
    useRejectTour();

  // Pagination
  const totalPages = Math.ceil(totalTours / limit) || 1;
  const pendingCount = totalRequests || 0;

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleToggleVisibility = useCallback(async () => {
    if (!confirmToggle.tour) return;

    try {
      setActionLoading(confirmToggle.tour._id);
      await toggleVisibility(confirmToggle.tour._id);
      const currentStatus = getTourStatus(confirmToggle.tour);
      toast.success(
        "Thành công!",
        currentStatus === "hidden" ? "Đã hiện tour" : "Đã ẩn tour"
      );
      setConfirmToggle({ open: false, tour: null });
      refetchTours();
    } catch (error) {
      toast.error(
        "Lỗi ẩn/hiện tour",
        error.message || "Không thể thay đổi trạng thái hiển thị"
      );
    } finally {
      setActionLoading(null);
    }
  }, [confirmToggle.tour, toggleVisibility, toast, refetchTours]);

  const handleToggleFeatured = useCallback(
    async (tour) => {
      try {
        setActionLoading(tour._id);
        const result = await toggleFeatured(tour._id);
        toast.success("Thành công!", result.message);
        refetchTours();
      } catch (error) {
        toast.error(
          "Lỗi",
          error.message || "Không thể thay đổi trạng thái tiêu biểu"
        );
      } finally {
        setActionLoading(null);
      }
    },
    [toggleFeatured, toast, refetchTours]
  );

  const handleDeleteTour = useCallback(async () => {
    if (!confirmDelete.tour) return;

    try {
      setActionLoading(confirmDelete.tour._id);
      setDeleteError(null);
      const result = await deleteTour(confirmDelete.tour._id, deleteTourReason);

      // Hiển thị kết quả thành công
      const canceledCount = result?.canceledBookings || 0;
      toast.success(
        "Thành công!",
        canceledCount > 0
          ? `Đã xóa tour và hủy ${canceledCount} booking đang chờ`
          : "Đã xóa tour thành công"
      );
      setConfirmDelete({ open: false, tour: null });
      setDeleteTourReason("");
      refetchTours();
    } catch (error) {
      const errorData = error.response?.data;

      // Nếu có booking đã thanh toán, hiển thị chi tiết
      if (errorData?.hasBookings) {
        setDeleteError({
          message: errorData.message,
          bookings: errorData.bookings || [],
          bookingCount: errorData.bookingCount,
        });
      } else {
        toast.error(
          "Lỗi xóa tour",
          errorData?.message || error.message || "Không thể xóa tour"
        );
      }
    } finally {
      setActionLoading(null);
    }
  }, [confirmDelete.tour, deleteTour, deleteTourReason, toast, refetchTours]);

  // Handler duyệt tour pending
  const handleApproveTour = useCallback(async () => {
    if (!confirmApproveTour.tour) return;

    try {
      setActionLoading(confirmApproveTour.tour._id);
      await approveTourFn(confirmApproveTour.tour._id);
      toast.success("Thành công!", "Đã duyệt tour thành công");
      setConfirmApproveTour({ open: false, tour: null });
      refetchTours();
    } catch (error) {
      toast.error("Lỗi duyệt tour", error.message || "Không thể duyệt tour");
    } finally {
      setActionLoading(null);
    }
  }, [confirmApproveTour.tour, approveTourFn, toast, refetchTours]);

  // Handler từ chối tour pending
  const handleRejectTour = useCallback(async () => {
    if (!confirmRejectTour.tour) return;

    try {
      setActionLoading(confirmRejectTour.tour._id);
      await rejectTourFn(confirmRejectTour.tour._id, rejectTourNote);
      toast.success("Thành công!", "Đã từ chối tour");
      setConfirmRejectTour({ open: false, tour: null });
      setRejectTourNote("");
      refetchTours();
    } catch (error) {
      toast.error(
        "Lỗi từ chối tour",
        error.message || "Không thể từ chối tour"
      );
    } finally {
      setActionLoading(null);
    }
  }, [
    confirmRejectTour.tour,
    rejectTourFn,
    rejectTourNote,
    toast,
    refetchTours,
  ]);

  const handleApproveRequest = useCallback(async () => {
    if (!confirmApprove.request) return;

    try {
      setActionLoading(confirmApprove.request._id);
      await approveRequest(confirmApprove.request._id);
      toast.success("Thành công!", "Đã duyệt yêu cầu chỉnh sửa");
      setConfirmApprove({ open: false, request: null });
      refetchRequests();
      refetchTours();
    } catch (error) {
      toast.error(
        "Lỗi duyệt yêu cầu",
        error.message || "Không thể duyệt yêu cầu chỉnh sửa"
      );
    } finally {
      setActionLoading(null);
    }
  }, [
    confirmApprove.request,
    approveRequest,
    toast,
    refetchRequests,
    refetchTours,
  ]);

  const handleRejectRequest = useCallback(async () => {
    if (!confirmReject.request) return;

    try {
      setActionLoading(confirmReject.request._id);
      await rejectRequestFn(confirmReject.request._id, rejectNote);
      toast.success("Thành công!", "Đã từ chối yêu cầu chỉnh sửa");
      setConfirmReject({ open: false, request: null });
      setRejectNote("");
      refetchRequests();
    } catch (error) {
      toast.error(
        "Lỗi từ chối yêu cầu",
        error.message || "Không thể từ chối yêu cầu chỉnh sửa"
      );
    } finally {
      setActionLoading(null);
    }
  }, [
    confirmReject.request,
    rejectRequestFn,
    rejectNote,
    toast,
    refetchRequests,
  ]);

  // Tab change handler
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setPage(1);
  }, []);

  // Search handler
  const handleSearch = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Status badge
  const getStatusBadge = (status) => {
    const config = STATUS_LABELS[status] || STATUS_LABELS.pending;
    const colorClasses = {
      yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
      green: "bg-green-100 text-green-700 border-green-200",
      gray: "bg-gray-100 text-gray-700 border-gray-200",
      red: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
          colorClasses[config.color]
        }`}
      >
        {config.text}
      </span>
    );
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (toursLoading && tours.length === 0 && activeTab !== "requests") {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Quản lý Tour
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Kiểm duyệt và quản lý các tour du lịch trên hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard/admin/create-tour"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <IconPlus className="w-4 h-4" />
            Tạo tour mới
          </Link>
          <button
            onClick={() => {
              refetchTours();
              refetchRequests();
            }}
            disabled={toursLoading || requestsLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
          >
            <IconRefresh
              className={`w-4 h-4 ${toursLoading ? "animate-spin" : ""}`}
            />
            Làm mới
          </button>
        </div>
      </div>

      {/* Error message */}
      {(toursError || requestsError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {toursError || requestsError}
        </div>
      )}

      {/* Toolbar Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-border-light flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          {[
            { id: "all", label: "Tất cả" },
            { id: "pending", label: "Chờ duyệt" },
            { id: "active", label: "Đang hoạt động", count: counts?.active },
            { id: "hidden", label: "Tạm ẩn/Từ chối" },
            {
              id: "requests",
              label: "Yêu cầu chỉnh sửa",
              count: pendingCount,
              dot: true,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                ${
                  activeTab === tab.id
                    ? "bg-bg-main text-primary shadow-inner"
                    : "text-text-secondary hover:bg-gray-50"
                }
              `}
            >
              {tab.label}
              {tab.count > 0 && !tab.dot && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">
                  {tab.count}
                </span>
              )}
              {tab.dot && tab.count > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

        {activeTab !== "requests" && (
          <form onSubmit={handleSearch} className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Tìm tên tour..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          </form>
        )}
      </div>

      {/* Content */}
      {activeTab === "requests" ? (
        // Edit Requests Table
        <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
          {requestsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : editRequests.length === 0 ? (
            <div className="text-center py-16">
              <IconFileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-text-secondary font-medium">
                Không có yêu cầu nào
              </p>
              <p className="text-text-secondary text-sm mt-1">
                Các yêu cầu chỉnh sửa từ hướng dẫn viên sẽ hiển thị ở đây
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
                  <tr>
                    <th className="p-4 pl-6">Thông tin Tour</th>
                    <th className="p-4">Hướng dẫn viên</th>
                    <th className="p-4">Loại yêu cầu</th>
                    <th className="p-4">Mô tả</th>
                    <th className="p-4">Ngày gửi</th>
                    <th className="p-4 pr-6 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {editRequests.map((request) => {
                    const typeConfig =
                      REQUEST_TYPE_LABELS[request.request_type] ||
                      REQUEST_TYPE_LABELS.edit;
                    return (
                      <tr
                        key={request._id}
                        className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                      >
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-border-light shrink-0 bg-gray-100">
                              {request.tour_id?.cover_image_url ? (
                                <img
                                  src={request.tour_id.cover_image_url}
                                  alt={request.tour_id?.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <IconMapPin className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-text-primary max-w-[200px] truncate">
                                {request.tour_id?.name || "Tour không tồn tại"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                            <span className="font-medium text-text-primary">
                              {request.guide_id?.name || "Không xác định"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                              typeConfig.color === "blue"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {typeConfig.text}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="max-w-[200px] truncate text-text-secondary">
                            {request.description || "Không có mô tả"}
                          </p>
                        </td>
                        <td className="p-4 text-text-secondary text-xs">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                setViewDetails({ open: true, request })
                              }
                              className="p-2 rounded-lg bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
                              title="Xem chi tiết"
                            >
                              <IconFileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setConfirmApprove({ open: true, request })
                              }
                              disabled={actionLoading === request._id}
                              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                              title="Duyệt yêu cầu"
                            >
                              <IconCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setConfirmReject({ open: true, request })
                              }
                              disabled={actionLoading === request._id}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                              title="Từ chối yêu cầu"
                            >
                              <IconX className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Tours Table
        <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
          {toursLoading && tours.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-16">
              <IconEye className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-text-secondary font-medium">
                Không có tour nào
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
                    <tr>
                      <th className="p-4 pl-6">Thông tin Tour</th>
                      <th className="p-4">Người tạo</th>
                      <th className="p-4">Giá / Thời lượng</th>
                      <th className="p-4">Ngày tạo</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 pr-6 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tours.map((tour) => (
                      <tr
                        key={tour._id}
                        className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                      >
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-border-light shrink-0 bg-gray-100">
                              {tour.cover_image_url || tour.gallery?.[0] ? (
                                <img
                                  src={
                                    tour.cover_image_url || tour.gallery?.[0]
                                  }
                                  alt={tour.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <IconMapPin className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p
                                className="font-bold text-text-primary max-w-[200px] truncate"
                                title={tour.name}
                              >
                                {tour.name}
                              </p>
                              <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                                <IconMapPin className="w-3 h-3" />
                                {tour.locations?.[0]?.locationId?.name ||
                                  tour.category_id?.name ||
                                  "Không xác định"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {tour.created_by?.avatar_url ? (
                              <img
                                src={tour.created_by.avatar_url}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium text-text-primary">
                                {tour.created_by?.name || "Không xác định"}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase ${
                                  tour.created_by_role === "admin"
                                    ? "text-purple-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {tour.created_by_role === "admin"
                                  ? "Admin"
                                  : "HDV"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-primary">
                            {formatCurrency(tour.price)}
                          </p>
                          <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                            <IconClock className="w-3 h-3" />
                            {formatTourDuration(tour)}
                          </p>
                        </td>
                        <td className="p-4 text-text-secondary text-xs">
                          {formatDate(tour.createdAt)}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(getTourStatus(tour))}
                          {tour.featured && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                              <IconStar className="w-3 h-3 mr-0.5" /> Tiêu biểu
                            </span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            {getTourStatus(tour) === "pending" ? (
                              <button
                                onClick={() => setPreviewTour(tour)}
                                className="p-2 rounded-lg bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
                                title="Xem trước"
                              >
                                <IconEye className="w-4 h-4" />
                              </button>
                            ) : (
                              <Link
                                to={`/tours/${tour.slug || tour._id}`}
                                target="_blank"
                                className="p-2 rounded-lg bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
                                title="Xem chi tiết"
                              >
                                <IconEye className="w-4 h-4" />
                              </Link>
                            )}

                            {/* Edit button - opens admin create page with id param for editing */}
                            <Link
                              to={`/dashboard/admin/edit-tour/${tour._id}`}
                              className="p-2 rounded-lg bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
                              title="Chỉnh sửa tour"
                            >
                              <IconFileText className="w-4 h-4" />
                            </Link>
                            {/* Nút đánh dấu tiêu biểu */}
                            {getTourStatus(tour) === "active" && (
                              <button
                                onClick={() => handleToggleFeatured(tour)}
                                disabled={
                                  actionLoading === tour._id || featuredLoading
                                }
                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                  tour.featured
                                    ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                    : "bg-gray-50 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600"
                                }`}
                                title={
                                  tour.featured
                                    ? "Bỏ tiêu biểu"
                                    : "Đánh dấu tiêu biểu"
                                }
                              >
                                <IconStar className="w-4 h-4" />
                              </button>
                            )}
                            {/* Nút duyệt/từ chối cho tour pending */}
                            {getTourStatus(tour) === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    setConfirmApproveTour({ open: true, tour })
                                  }
                                  disabled={actionLoading === tour._id}
                                  className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                                  title="Duyệt tour"
                                >
                                  <IconCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setConfirmRejectTour({ open: true, tour })
                                  }
                                  disabled={actionLoading === tour._id}
                                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                  title="Từ chối tour"
                                >
                                  <IconX className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {/* Nút ẩn/hiện cho tour đã duyệt */}
                            {getTourStatus(tour) !== "pending" && (
                              <button
                                onClick={() =>
                                  setConfirmToggle({ open: true, tour })
                                }
                                disabled={actionLoading === tour._id}
                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                  getTourStatus(tour) === "hidden"
                                    ? "bg-green-50 text-green-600 hover:bg-green-100"
                                    : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                                }`}
                                title={
                                  getTourStatus(tour) === "hidden"
                                    ? "Hiện tour"
                                    : "Ẩn tour"
                                }
                              >
                                {getTourStatus(tour) === "hidden" ? (
                                  <IconEye className="w-4 h-4" />
                                ) : (
                                  <IconEyeOff className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setConfirmDelete({ open: true, tour })
                              }
                              disabled={actionLoading === tour._id}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                              title="Xóa tour"
                            >
                              <IconTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-border-light flex justify-between items-center text-xs text-text-secondary">
                <span>
                  Hiển thị{" "}
                  <strong>
                    {tours.length > 0 ? (page - 1) * limit + 1 : 0}-
                    {Math.min(page * limit, totalTours)}
                  </strong>{" "}
                  trên tổng số <strong>{totalTours}</strong>
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-50"
                  >
                    <IconChevronLeft className="w-3 h-3" />
                  </button>
                  <button className="px-2.5 py-1 rounded border bg-primary text-white font-bold">
                    {page}
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-50"
                  >
                    <IconChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODALS */}
      {/* ====================================================================== */}

      {/* Confirm Toggle Visibility Modal */}
      <ConfirmModal
        isOpen={confirmToggle.open}
        onClose={() => setConfirmToggle({ open: false, tour: null })}
        onConfirm={handleToggleVisibility}
        title={
          getTourStatus(confirmToggle.tour) === "hidden"
            ? "Hiện tour"
            : "Ẩn tour"
        }
        message={
          getTourStatus(confirmToggle.tour) === "hidden"
            ? `Bạn có chắc muốn hiện tour "${confirmToggle.tour?.name}"?`
            : `Bạn có chắc muốn ẩn tour "${confirmToggle.tour?.name}"? Tour sẽ không hiển thị với người dùng.`
        }
        confirmText={confirmToggle.tour?.status === "hidden" ? "Hiện" : "Ẩn"}
        isLoading={toggleLoading || actionLoading === confirmToggle.tour?._id}
      />

      {/* Confirm Delete Modal */}
      {confirmDelete.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-text-primary mb-4">
              Xóa tour
            </h2>

            {/* Error with bookings list */}
            {deleteError ? (
              <>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-red-700 font-medium mb-2">
                    ❌ {deleteError.message}
                  </p>
                  {deleteError.bookings?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-red-600 font-medium mb-2">
                        Danh sách {deleteError.bookingCount} booking:
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {deleteError.bookings.map((booking, idx) => (
                          <div
                            key={booking.id || idx}
                            className="text-xs bg-white rounded-lg p-2 border border-red-100"
                          >
                            <span className="font-medium">
                              {booking.customer}
                            </span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span
                              className={`${
                                booking.status === "paid"
                                  ? "text-green-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {booking.status === "paid"
                                ? "Đã thanh toán"
                                : "Hoàn thành"}
                            </span>
                            {booking.startDate && (
                              <>
                                <span className="mx-2 text-gray-400">•</span>
                                <span className="text-gray-500">
                                  {formatDate(booking.startDate)}
                                </span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-red-500 mt-3">
                    💡 Gợi ý: Hãy ẩn tour thay vì xóa, hoặc hoàn tiền cho khách
                    trước.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setConfirmDelete({ open: false, tour: null });
                      setDeleteTourReason("");
                      setDeleteError(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-border-light hover:bg-bg-main"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      setConfirmDelete({ open: false, tour: null });
                      setDeleteError(null);
                      setConfirmToggle({
                        open: true,
                        tour: confirmDelete.tour,
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600"
                  >
                    Ẩn tour thay thế
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-text-secondary mb-4">
                  Bạn có chắc muốn xóa tour{" "}
                  <strong>"{confirmDelete.tour?.name}"</strong>?
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Hành động này không thể hoàn tác.
                  </p>
                  <ul className="text-yellow-700 text-xs mt-2 space-y-1 list-disc list-inside">
                    <li>Booking đang chờ xử lý sẽ bị hủy tự động</li>
                    <li>HDV và khách hàng sẽ nhận được thông báo</li>
                    <li>Tour có booking đã thanh toán sẽ không thể xóa</li>
                  </ul>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Lý do xóa tour <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={deleteTourReason}
                    onChange={(e) => setDeleteTourReason(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-border-light px-3 py-2 focus:border-primary focus:outline-none"
                    placeholder="Nhập lý do xóa tour (sẽ gửi thông báo đến HDV và khách hàng)..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setConfirmDelete({ open: false, tour: null });
                      setDeleteTourReason("");
                      setDeleteError(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-border-light hover:bg-bg-main"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleDeleteTour}
                    disabled={
                      !deleteTourReason.trim() ||
                      deleteLoading ||
                      actionLoading === confirmDelete.tour?._id
                    }
                    className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleteLoading ? "Đang xử lý..." : "Xóa tour"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirm Approve Tour Modal */}
      <ConfirmModal
        isOpen={confirmApproveTour.open}
        onClose={() => setConfirmApproveTour({ open: false, tour: null })}
        onConfirm={handleApproveTour}
        title="Duyệt tour"
        message={`Bạn có chắc muốn duyệt tour "${confirmApproveTour.tour?.name}"? Tour sẽ được hiển thị công khai.`}
        confirmText="Duyệt"
        variant="success"
        isLoading={
          approveTourLoading || actionLoading === confirmApproveTour.tour?._id
        }
      />

      {/* Confirm Reject Tour Modal */}
      {confirmRejectTour.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">
              Từ chối tour
            </h2>
            <p className="text-text-secondary mb-4">
              Bạn có chắc muốn từ chối tour{" "}
              <strong>"{confirmRejectTour.tour?.name}"</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Lý do từ chối (tùy chọn)
              </label>
              <textarea
                value={rejectTourNote}
                onChange={(e) => setRejectTourNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border-light px-3 py-2 focus:border-primary focus:outline-none"
                placeholder="Nhập lý do từ chối..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmRejectTour({ open: false, tour: null });
                  setRejectTourNote("");
                }}
                className="px-4 py-2 rounded-xl border border-border-light hover:bg-bg-main"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectTour}
                disabled={
                  rejectTourLoading ||
                  actionLoading === confirmRejectTour.tour?._id
                }
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {rejectTourLoading ? "Đang xử lý..." : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Tour Modal */}
      {previewTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreviewTour(null)}
          ></div>

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden z-10 animate-fade-in-up">
            <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-border-light bg-gray-50">
              <div className="min-w-0">
                <p className="text-xs text-text-secondary uppercase font-bold">
                  Xem trước tour
                </p>
                <h3 className="text-xl font-heading font-bold text-text-primary truncate">
                  {previewTour.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-text-secondary">
                  <span className="px-2 py-0.5 rounded-full bg-bg-main text-text-primary font-bold">
                    Giá: {formatCurrency(previewTour.price || 0)} / khách
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-bg-main text-text-primary font-bold flex items-center gap-1">
                    <IconClock className="w-3 h-3" />
                    {formatTourDuration(previewTour)}
                  </span>
                  {previewTour.category_id?.name && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      {previewTour.category_id.name}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setPreviewTour(null)}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Đóng"
              >
                <IconX className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-5 space-y-5">
              <div className="rounded-2xl overflow-hidden border border-border-light">
                <img
                  src={getTourImage(previewTour)}
                  alt={previewTour.name}
                  className="w-full h-64 object-cover"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-bg-main rounded-xl border border-border-light">
                  <p className="text-text-secondary text-xs font-bold uppercase mb-1">
                    Giá
                  </p>
                  <p className="text-text-primary font-bold">
                    {formatCurrency(previewTour.price || 0)} / khách
                  </p>
                </div>
                <div className="p-4 bg-bg-main rounded-xl border border-border-light">
                  <p className="text-text-secondary text-xs font-bold uppercase mb-1">
                    Thời lượng
                  </p>
                  <p className="text-text-primary font-bold">
                    {formatTourDuration(previewTour)}
                  </p>
                </div>
                <div className="p-4 bg-bg-main rounded-xl border border-border-light">
                  <p className="text-text-secondary text-xs font-bold uppercase mb-1">
                    Số khách tối đa
                  </p>
                  <p className="text-text-primary font-bold">
                    {previewTour.max_guests || "—"}
                  </p>
                </div>
              </div>

              {previewTour.description && (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-text-primary">Mô tả</p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                    {previewTour.description}
                  </p>
                </div>
              )}

              {Array.isArray(previewTour.highlights) &&
                previewTour.highlights.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-text-primary">
                      Điểm nổi bật
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary">
                      {previewTour.highlights.map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {Array.isArray(previewTour.locations) &&
                previewTour.locations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-text-primary">
                      Địa điểm
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {previewTour.locations.map((loc, idx) => (
                        <span
                          key={loc._id || loc.locationId || idx}
                          className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold"
                        >
                          {loc.locationId?.name ||
                            loc.name ||
                            loc.title ||
                            "Địa điểm"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {Array.isArray(previewTour.itinerary) &&
                previewTour.itinerary.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-text-primary">
                      Lịch trình
                    </p>
                    <div className="space-y-2 text-sm text-text-secondary">
                      {previewTour.itinerary.slice(0, 6).map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-3 rounded-xl border border-border-light bg-bg-main flex items-start gap-3"
                        >
                          <span className="text-xs font-bold text-primary w-12 shrink-0">
                            {item.time || `#${idx + 1}`}
                          </span>
                          <div>
                            <p className="font-bold text-text-primary">
                              {item.title || "Hoạt động"}
                            </p>
                            <p className="text-sm text-text-secondary">
                              {item.details || item.description || ""}
                            </p>
                          </div>
                        </div>
                      ))}
                      {previewTour.itinerary.length > 6 && (
                        <p className="text-xs text-text-secondary italic">
                          … {previewTour.itinerary.length - 6} mục lịch trình
                          khác
                        </p>
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div className="px-6 py-4 border-t border-border-light bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setPreviewTour(null)}
                className="px-4 py-2 rounded-xl border border-border-light text-sm font-bold text-text-secondary hover:bg-gray-100"
              >
                Đóng
              </button>
              <Link
                to={`/tours/${previewTour.slug || previewTour._id}`}
                target="_blank"
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90"
              >
                Xem trang tour
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Approve Request Modal */}
      <ConfirmModal
        isOpen={confirmApprove.open}
        onClose={() => setConfirmApprove({ open: false, request: null })}
        onConfirm={handleApproveRequest}
        title="Duyệt yêu cầu"
        message={
          confirmApprove.request?.request_type === "delete"
            ? `Bạn có chắc muốn duyệt yêu cầu xóa tour "${confirmApprove.request?.tour_id?.name}"? Tour sẽ bị xóa vĩnh viễn.`
            : `Bạn có chắc muốn duyệt yêu cầu chỉnh sửa tour "${confirmApprove.request?.tour_id?.name}"?`
        }
        confirmText="Duyệt"
        variant="success"
        isLoading={
          approveLoading || actionLoading === confirmApprove.request?._id
        }
      />

      {/* Confirm Reject Request Modal */}
      {confirmReject.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 className="text-xl font-bold text-text-primary mb-4">
              Từ chối yêu cầu
            </h2>
            <p className="text-text-secondary mb-4">
              Bạn có chắc muốn từ chối yêu cầu của hướng dẫn viên{" "}
              <strong>{confirmReject.request?.guide_id?.name}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Lý do từ chối (tùy chọn)
              </label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border-light px-3 py-2 focus:border-primary focus:outline-none"
                placeholder="Nhập lý do từ chối..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmReject({ open: false, request: null });
                  setRejectNote("");
                }}
                className="px-4 py-2 rounded-xl border border-border-light hover:bg-bg-main"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectRequest}
                disabled={
                  rejectLoading || actionLoading === confirmReject.request?._id
                }
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {rejectLoading ? "Đang xử lý..." : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Request Details Modal */}
      {viewDetails.open && viewDetails.request && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">
                Chi tiết yêu cầu
              </h2>
              <button
                onClick={() => setViewDetails({ open: false, request: null })}
                className="p-2 rounded-lg text-text-secondary hover:bg-bg-main"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-border-light bg-gray-100">
                  {viewDetails.request.tour_id?.cover_image_url ? (
                    <img
                      src={viewDetails.request.tour_id.cover_image_url}
                      alt={viewDetails.request.tour_id?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <IconMapPin className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-lg">
                    {viewDetails.request.tour_id?.name}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Hướng dẫn viên: {viewDetails.request.guide_id?.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-text-secondary">
                    Loại yêu cầu
                  </span>
                  <div className="mt-1">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        viewDetails.request.request_type === "edit"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }`}
                    >
                      {REQUEST_TYPE_LABELS[viewDetails.request.request_type]
                        ?.text || viewDetails.request.request_type}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-text-secondary">
                    Trạng thái
                  </span>
                  <div className="mt-1">
                    {getStatusBadge(viewDetails.request.status)}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-sm text-text-secondary">
                  Mô tả yêu cầu
                </span>
                <p className="mt-1 text-text-primary bg-bg-main p-3 rounded-xl">
                  {viewDetails.request.description || "Không có mô tả"}
                </p>
              </div>

              {viewDetails.request.changes &&
                Object.keys(viewDetails.request.changes).length > 0 && (
                  <div>
                    <span className="text-sm text-text-secondary">
                      Thay đổi đề xuất
                    </span>
                    <div className="mt-2 rounded-xl bg-bg-main p-4">
                      <pre className="whitespace-pre-wrap text-sm text-text-primary">
                        {JSON.stringify(viewDetails.request.changes, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

              {viewDetails.request.admin_notes && (
                <div>
                  <span className="text-sm text-text-secondary">
                    Ghi chú từ Admin
                  </span>
                  <p className="mt-1 text-text-primary bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                    {viewDetails.request.admin_notes}
                  </p>
                </div>
              )}

              <div className="text-sm text-text-secondary">
                Ngày gửi: {formatDate(viewDetails.request.createdAt)}
              </div>
            </div>

            {viewDetails.request.status === "pending" && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setViewDetails({ open: false, request: null });
                    setConfirmReject({
                      open: true,
                      request: viewDetails.request,
                    });
                  }}
                  className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => {
                    setViewDetails({ open: false, request: null });
                    setConfirmApprove({
                      open: true,
                      request: viewDetails.request,
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                >
                  Duyệt yêu cầu
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
