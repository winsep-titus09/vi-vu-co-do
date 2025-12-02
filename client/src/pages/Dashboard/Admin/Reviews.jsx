import React, { useState, useMemo, useEffect, useRef } from "react";
import { useToast } from "../../../components/Toast/useToast";
import { IconCheck, IconStar } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconTrash, IconEyeOff, IconFlag } from "../../../icons/IconCommon";
import Spinner from "../../../components/Loaders/Spinner";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import {
  useAdminReviews,
  useAdminReviewActions,
} from "../../../features/reviews/hooks";

// ============================================================================
// HELPER: Format date
// ============================================================================
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

// ============================================================================
// HOOK: useDebounce - Debounce value for search
// ============================================================================
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function AdminReviews() {
  const toast = useToast();

  // Filter & search state
  const [filter, setFilter] = useState("all"); // all, reported, hidden
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 400);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Cache previous results to show while loading
  const cacheRef = useRef({});
  const cacheKey = `${filter}-${page}-${debouncedSearch}`;

  // Fetch reviews
  const { reviews, total, totalPages, isLoading, error, refetch } =
    useAdminReviews({
      page,
      limit: 20,
      status: filter !== "all" ? filter : undefined,
      search: debouncedSearch || undefined,
    });

  // Update cache when data loads
  useEffect(() => {
    if (reviews.length > 0 && !isLoading) {
      cacheRef.current[cacheKey] = { reviews, total, totalPages };
    }
  }, [reviews, total, totalPages, isLoading, cacheKey]);

  // Use cached data while loading
  const displayData = useMemo(() => {
    if (!isLoading) return { reviews, total, totalPages };
    const cached = cacheRef.current[cacheKey];
    if (cached) return cached;
    // Show previous filter's data while loading new filter
    return { reviews, total, totalPages };
  }, [isLoading, reviews, total, totalPages, cacheKey]);

  // Actions
  const {
    updateStatus,
    deleteReview,
    isLoading: actionLoading,
  } = useAdminReviewActions();

  // Use displayData for showing cached content while loading
  const displayReviews = displayData.reviews;
  const displayTotal = displayData.total;
  const displayTotalPages = displayData.totalPages;

  // Filter reviews by search (client-side additional filter for instant feedback)
  const filteredReviews = useMemo(() => {
    if (!search.trim()) return displayReviews;
    const searchLower = search.toLowerCase();
    return displayReviews.filter((r) => {
      const userName = r.user?.name?.toLowerCase() || "";
      const tourName = r.tour?.name?.toLowerCase() || "";
      const tourComment = r.tour_comment?.toLowerCase() || "";
      const guideComment = r.guide_comment?.toLowerCase() || "";
      return (
        userName.includes(searchLower) ||
        tourName.includes(searchLower) ||
        tourComment.includes(searchLower) ||
        guideComment.includes(searchLower)
      );
    });
  }, [displayReviews, search]);

  // Handlers
  const handleHide = async (review) => {
    try {
      await updateStatus(review._id, "hidden");
      toast.success("Thành công", "Đã ẩn đánh giá.");
      refetch();
    } catch (err) {
      toast.error("Lỗi", err.message || "Không thể ẩn đánh giá.");
    }
  };

  const handleApprove = async (review) => {
    try {
      await updateStatus(review._id, "published");
      toast.success("Thành công", "Đã duyệt đánh giá.");
      refetch();
    } catch (err) {
      toast.error("Lỗi", err.message || "Không thể duyệt đánh giá.");
    }
  };

  const handleDelete = (review) => {
    setDeleteConfirm(review);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteReview(deleteConfirm._id);
      toast.success("Thành công", "Đã xóa đánh giá vĩnh viễn.");
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      toast.error("Lỗi", err.message || "Không thể xóa đánh giá.");
    }
  };

  // Get rating to display (tour_rating or guide_rating)
  const getRating = (review) => {
    return review.tour_rating || review.guide_rating || 0;
  };

  // Get comment to display
  const getComment = (review) => {
    return review.tour_comment || review.guide_comment || "Không có bình luận";
  };

  // Loading state
  if (isLoading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Quản lý Đánh giá
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Kiểm duyệt phản hồi từ du khách và xử lý báo cáo.
            {displayTotal > 0 && (
              <span className="ml-2 font-bold">
                Tổng: {displayTotal} đánh giá
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-border-light flex flex-col md:flex-row justify-between gap-4 shadow-sm">
        <div className="flex gap-2">
          {[
            { id: "all", label: "Tất cả" },
            { id: "reported", label: "Bị báo cáo", icon: true },
            { id: "hidden", label: "Đã ẩn" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilter(tab.id);
                setPage(1);
              }}
              className={`
                px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
                ${
                  filter === tab.id
                    ? "bg-bg-main text-primary shadow-inner"
                    : "text-text-secondary hover:bg-gray-50"
                }
              `}
            >
              {tab.label}
              {tab.icon && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm nội dung đánh giá..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div
              key={review._id}
              className={`bg-white p-6 rounded-3xl border transition-all ${
                review.status === "reported"
                  ? "border-red-200 bg-red-50/30"
                  : "border-border-light hover:shadow-md"
              }`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Rating Column */}
                <div className="w-full md:w-48 shrink-0 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    {review.user?.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={review.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-text-secondary">
                        {review.user?.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-text-primary text-sm line-clamp-1">
                        {review.user?.name || "Ẩn danh"}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <IconStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < getRating(review)
                            ? "fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {review.status === "reported" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded w-fit mt-1">
                      <IconFlag className="w-3 h-3" /> Bị báo cáo
                    </span>
                  )}
                  {review.status === "hidden" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded w-fit mt-1">
                      <IconEyeOff className="w-3 h-3" /> Đã ẩn
                    </span>
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1">
                  <p className="text-xs font-bold text-text-secondary mb-1 uppercase">
                    Tour: {review.tour?.name || "Không xác định"}
                  </p>
                  <p className="text-text-primary text-sm leading-relaxed">
                    "{getComment(review)}"
                  </p>
                  {review.guide_reply && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-bold text-blue-600 mb-1">
                        Phản hồi từ HDV:
                      </p>
                      <p className="text-sm text-blue-800">
                        {review.guide_reply}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions Column */}
                <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-border-light pt-4 md:pt-0 md:pl-6">
                  {review.status === "reported" ? (
                    <>
                      <button
                        onClick={() => handleApprove(review)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <IconCheck className="w-3.5 h-3.5" /> Giữ lại
                      </button>
                      <button
                        onClick={() => handleHide(review)}
                        disabled={actionLoading}
                        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <IconEyeOff className="w-3.5 h-3.5" /> Ẩn đi
                      </button>
                    </>
                  ) : (
                    <>
                      {review.status === "hidden" ? (
                        <button
                          onClick={() => handleApprove(review)}
                          disabled={actionLoading}
                          className="p-2 text-text-secondary hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Hiển thị lại"
                        >
                          <IconCheck className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleHide(review)}
                          disabled={actionLoading}
                          className="p-2 text-text-secondary hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                          title="Ẩn đánh giá"
                        >
                          <IconEyeOff className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review)}
                        disabled={actionLoading}
                        className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa vĩnh viễn"
                      >
                        <IconTrash className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-text-secondary">
            <p className="font-bold">Không tìm thấy đánh giá nào.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {displayTotalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-border-light bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm font-medium text-text-secondary">
            Trang {page} / {displayTotalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(displayTotalPages, p + 1))}
            disabled={page === displayTotalPages}
            className="px-4 py-2 rounded-lg border border-border-light bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium"
          >
            Sau
          </button>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Xóa đánh giá"
        message={`Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmVariant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
}
