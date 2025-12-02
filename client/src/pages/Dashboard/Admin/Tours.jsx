import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { IconCheck, IconClock, IconMapPin } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import {
  IconEye,
  IconChevronLeft,
  IconChevronRight,
  IconInbox,
  IconRefresh,
} from "../../../icons/IconCommon";
import Spinner from "../../../components/Loaders/Spinner";
import {
  useAdminTours,
  useApproveTour,
  useRejectTour,
} from "../../../features/admin/hooks";
import { formatCurrency, formatDate } from "../../../lib/formatters";
import { useToast } from "../../../components/Toast/useToast";

// Helper để convert Decimal128 sang number
const decimalToNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "object") {
    if (value.$numberDecimal) return Number(value.$numberDecimal);
    if (typeof value.toString === "function") {
      const parsed = Number(value.toString());
      return Number.isNaN(parsed) ? 0 : parsed;
    }
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const STATUS_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ duyệt", showDot: true },
  { id: "active", label: "Đang hoạt động" },
  { id: "hidden", label: "Tạm ẩn/Từ chối" },
];

export default function AdminTours() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const limit = 10;

  // API hooks
  const { tours, total, counts, isLoading, error, refetch } = useAdminTours({
    status: activeTab,
    search,
    page,
    limit,
  });

  const { approve } = useApproveTour();
  const { reject } = useRejectTour();
  const toast = useToast();

  // Pagination
  const totalPages = Math.ceil(total / limit) || 1;

  // Search handler
  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setSearch(searchInput);
      setPage(1);
    },
    [searchInput]
  );

  // Tab change
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setPage(1);
  }, []);

  // Status badge
  const getStatusBadge = (tour) => {
    const approvalStatus = tour.approval?.status;
    const isActive = tour.is_active !== false;

    if (approvalStatus === "approved" && isActive) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
          Hoạt động
        </span>
      );
    }
    if (approvalStatus === "pending") {
      return (
        <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
          Chờ duyệt
        </span>
      );
    }
    if (approvalStatus === "rejected") {
      return (
        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
          Từ chối
        </span>
      );
    }
    if (!isActive) {
      return (
        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
          Đã ẩn
        </span>
      );
    }
    return null;
  };

  // Approve handler
  const handleApprove = useCallback(
    async (id, name) => {
      if (
        !window.confirm(
          `Xác nhận duyệt tour "${name}"? Tour sẽ được hiển thị công khai.`
        )
      ) {
        return;
      }
      try {
        setActionLoading(id);
        await approve(id);
        toast.success("Thành công!", `Đã duyệt tour "${name}".`);
        refetch();
      } catch (err) {
        toast.error("Lỗi duyệt tour", err?.message || "Vui lòng thử lại");
      } finally {
        setActionLoading(null);
      }
    },
    [approve, refetch, toast]
  );

  // Reject handler
  const handleReject = useCallback(
    async (id, name) => {
      const notes = prompt(
        `Nhập lý do từ chối tour "${name}" (sẽ gửi cho HDV):`
      );
      if (!notes) return;

      try {
        setActionLoading(id);
        await reject(id, notes);
        toast.success("Thành công!", `Đã từ chối tour "${name}".`);
        refetch();
      } catch (err) {
        toast.error("Lỗi từ chối tour", err?.message || "Vui lòng thử lại");
      } finally {
        setActionLoading(null);
      }
    },
    [reject, refetch, toast]
  );

  // Get main guide name
  const getMainGuideName = (tour) => {
    if (!tour.guides || tour.guides.length === 0) return "Chưa có";
    const mainGuide = tour.guides.find((g) => g.isMain);
    return (
      mainGuide?.guideId?.name || tour.guides[0]?.guideId?.name || "Chưa có"
    );
  };

  // Get first location
  const getLocationName = (tour) => {
    if (!tour.locations || tour.locations.length === 0) return "—";
    return tour.locations[0]?.locationId?.name || "—";
  };

  // Duration display
  const getDuration = (tour) => {
    if (tour.duration_hours) return `${tour.duration_hours} giờ`;
    if (tour.duration) return `${tour.duration} ngày`;
    return "—";
  };

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
          onClick={refetch}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
        >
          <IconRefresh
            className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Làm mới
        </button>
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
              {tab.id !== "all" && counts[tab.id] > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    tab.showDot
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm tên tour..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm transition-all"
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </form>
      </div>

      {/* Table Content */}
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
        ) : tours.length > 0 ? (
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
                            {tour.cover_image_url ? (
                              <img
                                src={tour.cover_image_url}
                                className="w-full h-full object-cover"
                                alt={tour.name}
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
                              {tour.name || "(Chưa có tên)"}
                            </p>
                            <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                              <IconMapPin className="w-3 h-3" />
                              {getLocationName(tour)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {tour.created_by?.avatar_url ? (
                            <img
                              src={tour.created_by.avatar_url}
                              className="w-6 h-6 rounded-full object-cover"
                              alt=""
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                          )}
                          <span className="font-medium text-text-primary">
                            {tour.created_by?.name || getMainGuideName(tour)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-primary">
                          {formatCurrency(decimalToNumber(tour.price))}
                        </p>
                        <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                          <IconClock className="w-3 h-3" />
                          {getDuration(tour)}
                        </p>
                      </td>
                      <td className="p-4 text-text-secondary text-xs">
                        {formatDate(tour.createdAt)}
                      </td>
                      <td className="p-4">{getStatusBadge(tour)}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          {tour.approval?.status === "pending" ? (
                            <>
                              <button
                                onClick={() =>
                                  handleApprove(tour._id, tour.name)
                                }
                                disabled={actionLoading === tour._id}
                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                                title="Duyệt"
                              >
                                {actionLoading === tour._id ? (
                                  <Spinner className="w-4 h-4" />
                                ) : (
                                  <IconCheck className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleReject(tour._id, tour.name)
                                }
                                disabled={actionLoading === tour._id}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                title="Từ chối"
                              >
                                <IconX className="w-4 h-4" />
                              </button>
                              <Link
                                to={`/tours/${tour._id}`}
                                target="_blank"
                                className="p-2 rounded-lg bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
                                title="Xem chi tiết"
                              >
                                <IconEye className="w-4 h-4" />
                              </Link>
                            </>
                          ) : (
                            <Link
                              to={`/tours/${tour._id}`}
                              target="_blank"
                              className="px-3 py-1.5 rounded-lg border border-border-light text-text-secondary hover:text-primary hover:border-primary transition-colors flex items-center gap-1 text-xs font-bold"
                            >
                              <IconEye className="w-3 h-3" /> Chi tiết
                            </Link>
                          )}
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mb-4 text-gray-400">
              <IconInbox className="w-8 h-8" />
            </div>
            <p className="font-bold text-gray-500">Không tìm thấy tour nào</p>
            <p className="text-xs">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
