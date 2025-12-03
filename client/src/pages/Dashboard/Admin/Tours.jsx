import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../../components/Toast/useToast";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import { IconClock, IconMapPin } from "../../../icons/IconBox";
import {
  IconEye,
  IconEyeOff,
  IconTrash,
  IconCheck,
  IconFileText,
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
} from "../../../icons/IconCommon";
import Spinner from "../../../components/Loaders/Spinner";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import Badge from "../../../components/Badges/Badge";
import {
  useAdminTours,
  useToggleTourVisibility,
  useDeleteTour,
  useAdminTourEditRequests,
  useApproveTourEditRequest,
  useRejectTourEditRequest,
} from "../../../features/admin/hooks";
import { formatCurrency, formatDate } from "../../../lib/formatters";

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
  const [confirmApprove, setConfirmApprove] = useState({
    open: false,
    request: null,
  });
  const [confirmReject, setConfirmReject] = useState({
    open: false,
    request: null,
  });
  const [rejectNote, setRejectNote] = useState("");
  const [viewDetails, setViewDetails] = useState({
    open: false,
    request: null,
  });
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
  const { approve: approveRequest, isLoading: approveLoading } =
    useApproveTourEditRequest();
  const { reject: rejectRequestFn, isLoading: rejectLoading } =
    useRejectTourEditRequest();

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
      toast.error("Lỗi", error.message || "Có lỗi xảy ra");
    } finally {
      setActionLoading(null);
    }
  }, [confirmToggle.tour, toggleVisibility, toast, refetchTours]);

  const handleDeleteTour = useCallback(async () => {
    if (!confirmDelete.tour) return;

    try {
      setActionLoading(confirmDelete.tour._id);
      await deleteTour(confirmDelete.tour._id);
      toast.success("Thành công!", "Đã xóa tour thành công");
      setConfirmDelete({ open: false, tour: null });
      refetchTours();
    } catch (error) {
      toast.error("Lỗi", error.message || "Có lỗi xảy ra");
    } finally {
      setActionLoading(null);
    }
  }, [confirmDelete.tour, deleteTour, toast, refetchTours]);

  const handleApproveRequest = useCallback(async () => {
    if (!confirmApprove.request) return;

    try {
      setActionLoading(confirmApprove.request._id);
      await approveRequest(confirmApprove.request._id);
      toast.success("Thành công!", "Đã duyệt yêu cầu");
      setConfirmApprove({ open: false, request: null });
      refetchRequests();
      refetchTours();
    } catch (error) {
      toast.error("Lỗi", error.message || "Có lỗi xảy ra");
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
      toast.success("Thành công!", "Đã từ chối yêu cầu");
      setConfirmReject({ open: false, request: null });
      setRejectNote("");
      refetchRequests();
    } catch (error) {
      toast.error("Lỗi", error.message || "Có lỗi xảy ra");
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

      {/* Error message */}
      {(toursError || requestsError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {toursError || requestsError}
        </div>
      )}

      {/* Toolbar Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-border-light flex flex-col md:flex-row justify-between gap-4 shadow-sm">
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
                      <th className="p-4">Hướng dẫn viên</th>
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
                            {tour.guides?.[0]?.guideId?.avatar_url ||
                            tour.created_by?.avatar_url ? (
                              <img
                                src={
                                  tour.guides?.[0]?.guideId?.avatar_url ||
                                  tour.created_by?.avatar_url
                                }
                                alt=""
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                            )}
                            <span className="font-medium text-text-primary">
                              {tour.guides?.[0]?.guideId?.name ||
                                tour.created_by?.name ||
                                "Chưa có"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-primary">
                            {formatCurrency(
                              tour.price?.$numberDecimal || tour.price || 0
                            )}
                          </p>
                          <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                            <IconClock className="w-3 h-3" />
                            {tour.duration_hours || tour.duration || "N/A"}{" "}
                            {tour.duration_unit === "hours" ? "giờ" : "ngày"}
                          </p>
                        </td>
                        <td className="p-4 text-text-secondary text-xs">
                          {formatDate(tour.createdAt)}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(getTourStatus(tour))}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/tours/${tour._id}`}
                              target="_blank"
                              className="p-2 rounded-lg bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
                              title="Xem chi tiết"
                            >
                              <IconEye className="w-4 h-4" />
                            </Link>
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
      <ConfirmModal
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, tour: null })}
        onConfirm={handleDeleteTour}
        title="Xóa tour"
        message={`Bạn có chắc muốn xóa tour "${confirmDelete.tour?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
        isLoading={deleteLoading || actionLoading === confirmDelete.tour?._id}
      />

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
