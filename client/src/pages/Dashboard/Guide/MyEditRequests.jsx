import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { IconMapPin, IconClock } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import {
  IconEye,
  IconPlus,
  IconInbox,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconTrash,
} from "../../../icons/IconCommon";
import Spinner from "../../../components/Loaders/Spinner";
import {
  useMyEditRequests,
  useCancelEditRequest,
} from "../../../features/tours/hooks";
import { formatDate } from "../../../lib/formatters";
import { useToast } from "../../../components/Toast/useToast";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import CreateEditRequestModal from "./components/CreateEditRequestModal";

const STATUS_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ duyệt", showDot: true },
  { id: "approved", label: "Đã duyệt" },
  { id: "rejected", label: "Từ chối" },
];

const REQUEST_TYPE_LABELS = {
  edit: { text: "Chỉnh sửa", color: "blue" },
  delete: { text: "Xóa tour", color: "red" },
};

export default function GuideMyEditRequests() {
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [cancelModal, setCancelModal] = useState({
    open: false,
    request: null,
  });
  const [createModal, setCreateModal] = useState({ open: false, tour: null });
  const [actionLoading, setActionLoading] = useState(null);
  const limit = 10;

  // API hooks
  const { requests, total, isLoading, error, refetch } = useMyEditRequests({
    status: activeTab === "all" ? undefined : activeTab,
    page,
    limit,
  });

  const { cancel } = useCancelEditRequest();
  const toast = useToast();

  // Pagination
  const totalPages = Math.ceil(total / limit) || 1;

  // Tab change
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setPage(1);
  }, []);

  // Status badge
  const getStatusBadge = (status) => {
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

  // Request type badge
  const getRequestTypeBadge = (type) => {
    const config = REQUEST_TYPE_LABELS[type] || { text: type, color: "gray" };
    const colorClasses = {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      red: "bg-red-100 text-red-700 border-red-200",
      gray: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
          colorClasses[config.color]
        }`}
      >
        {type === "edit" ? (
          <IconEdit className="w-3 h-3" />
        ) : (
          <IconTrash className="w-3 h-3" />
        )}
        {config.text}
      </span>
    );
  };

  // Cancel handler
  const handleCancelConfirm = useCallback(async () => {
    const request = cancelModal.request;
    if (!request) return;

    try {
      setActionLoading(request._id);
      await cancel(request._id);
      toast.success("Thành công!", "Đã hủy yêu cầu.");
      setCancelModal({ open: false, request: null });
      refetch();
    } catch (err) {
      toast.error("Lỗi hủy yêu cầu", err?.message || "Vui lòng thử lại");
    } finally {
      setActionLoading(null);
    }
  }, [cancelModal.request, cancel, refetch, toast]);

  // Handle create success
  const handleCreateSuccess = useCallback(() => {
    setCreateModal({ open: false, tour: null });
    toast.success("Thành công!", "Đã gửi yêu cầu. Vui lòng chờ admin duyệt.");
    refetch();
  }, [refetch, toast]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Yêu cầu chỉnh sửa Tour
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Theo dõi các yêu cầu chỉnh sửa/xóa tour đã gửi cho admin.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border-light text-text-secondary font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <IconRefresh
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Làm mới
          </button>
          <button
            onClick={() => setCreateModal({ open: true, tour: null })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            Gửi yêu cầu
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-border-light flex flex-col md:flex-row justify-between gap-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          {STATUS_TABS.map((tab) => (
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
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500">
            <p className="font-bold">Đã có lỗi xảy ra</p>
            <p className="text-sm">{error}</p>
            <button
              onClick={refetch}
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
                            <p
                              className="font-bold text-text-primary max-w-[200px] truncate"
                              title={req.tour_id?.name}
                            >
                              {req.tour_id?.name || "(Tour đã xóa)"}
                            </p>
                            <p className="text-xs text-text-secondary truncate max-w-[200px]">
                              {req.description?.substring(0, 40)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getRequestTypeBadge(req.request_type)}
                      </td>
                      <td className="p-4 text-text-secondary text-xs">
                        <div className="flex items-center gap-1">
                          <IconClock className="w-3 h-3" />
                          {formatDate(req.createdAt)}
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(req.status)}</td>
                      <td className="p-4">
                        {req.admin_notes ? (
                          <p
                            className="text-xs text-text-secondary max-w-[150px] truncate"
                            title={req.admin_notes}
                          >
                            {req.admin_notes}
                          </p>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
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
                              onClick={() =>
                                setCancelModal({ open: true, request: req })
                              }
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
            {totalPages > 1 && (
              <div className="p-4 border-t border-border-light flex justify-between items-center text-xs text-text-secondary">
                <span>
                  Hiển thị{" "}
                  <strong>
                    {(page - 1) * limit + 1}-{Math.min(page * limit, total)}
                  </strong>{" "}
                  trên tổng số <strong>{total}</strong>
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-50"
                    disabled={page === 1}
                  >
                    <IconChevronLeft className="w-3 h-3" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-2.5 py-1 rounded border ${
                          page === pageNum
                            ? "bg-primary text-white font-bold"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-50"
                    disabled={page === totalPages}
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
              onClick={() => setCreateModal({ open: true, tour: null })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              <IconPlus className="w-4 h-4" />
              Gửi yêu cầu đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, request: null })}
        onConfirm={handleCancelConfirm}
        title="Hủy yêu cầu"
        message={
          <>
            Bạn có chắc muốn hủy yêu cầu{" "}
            {cancelModal.request?.request_type === "delete"
              ? "xóa"
              : "chỉnh sửa"}{" "}
            tour <strong>"{cancelModal.request?.tour_id?.name}"</strong>?
          </>
        }
        confirmText="Hủy yêu cầu"
        confirmVariant="danger"
        isLoading={actionLoading === cancelModal.request?._id}
      />

      {/* Create Edit Request Modal */}
      <CreateEditRequestModal
        isOpen={createModal.open}
        onClose={() => setCreateModal({ open: false, tour: null })}
        onSuccess={handleCreateSuccess}
        selectedTour={createModal.tour}
      />
    </div>
  );
}
