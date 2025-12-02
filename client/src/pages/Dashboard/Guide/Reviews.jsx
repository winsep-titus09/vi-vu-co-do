import { useState } from "react";
import { Link } from "react-router-dom";
import { IconStar, IconCheck } from "../../../icons/IconBox";
import { IconFilter, IconMessage } from "../../../icons/IconCommon";
import {
  useMyGuideReviews,
  useReplyToReview,
} from "../../../features/guides/hooks";
import Spinner from "../../../components/Loaders/Spinner";

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function GuideReviews() {
  const [filterRating, setFilterRating] = useState("all");
  const [page, setPage] = useState(1);
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Fetch reviews
  const { data, isLoading, error, refetch } = useMyGuideReviews({
    page,
    limit: 10,
    rating: filterRating,
  });

  // Reply hook
  const { replyToReview, isSubmitting: isReplying } = useReplyToReview();

  // Extract data
  const reviews = data?.items || [];
  const totalReviews = data?.total || 0;
  const avgRating = data?.avgRating || 0;
  const distribution = data?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  const handleSubmitReply = async (reviewId) => {
    if (!replyText.trim()) return;

    try {
      await replyToReview(reviewId, replyText);
      setReplyingId(null);
      setReplyText("");
      refetch(); // Refresh data
    } catch (err) {
      console.error("Reply failed:", err);
    }
  };

  const handleFilterChange = (value) => {
    setFilterRating(value);
    setPage(1); // Reset to first page when filter changes
  };

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Đánh giá & Phản hồi
        </h1>
        <p className="text-text-secondary text-sm">
          Xem ý kiến của khách hàng và phản hồi để nâng cao chất lượng dịch vụ.
        </p>
      </div>

      {/* 1. OVERVIEW STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rating Card */}
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm flex flex-col items-center justify-center text-center md:col-span-1">
          <div className="text-5xl font-heading font-bold text-text-primary mb-2">
            {avgRating.toFixed(1)}
          </div>
          <div className="flex text-[#BC4C00] gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <IconStar
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(avgRating)
                    ? "fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-text-secondary">
            Dựa trên {totalReviews} đánh giá
          </p>
        </div>

        {/* Progress Bars */}
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm md:col-span-2 flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div
                key={star}
                className="flex items-center gap-3 text-xs font-bold text-text-secondary"
              >
                <span className="w-3">{star}</span>
                <IconStar className="w-3 h-3 text-[#BC4C00] fill-current" />
                <div className="flex-1 h-2 bg-bg-main rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#BC4C00]"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <span className="w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. REVIEWS LIST */}
      <div className="space-y-6">
        {/* Filter Toolbar */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">
            Danh sách đánh giá
          </h3>
          <div className="relative">
            <select
              className="pl-9 pr-4 py-2 rounded-xl border border-border-light bg-white text-sm font-bold outline-none appearance-none cursor-pointer hover:border-primary focus:border-primary transition-colors"
              value={filterRating}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="all">Tất cả sao</option>
              <option value="5">5 Sao</option>
              <option value="4">4 Sao</option>
              <option value="3">3 Sao</option>
              <option value="2">2 Sao</option>
              <option value="1">1 Sao</option>
            </select>
            <IconFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          </div>
        </div>

        {/* Empty state */}
        {reviews.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-border-light text-center">
            <div className="text-gray-400 mb-4">
              <IconStar className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Chưa có đánh giá nào
            </h3>
            <p className="text-text-secondary text-sm">
              Các đánh giá từ khách hàng sẽ hiển thị ở đây sau khi tour kết
              thúc.
            </p>
          </div>
        ) : (
          <>
            {/* List */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white p-6 rounded-3xl border border-border-light shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {/* User Info */}
                    <div className="flex items-center md:flex-col md:items-start gap-3 md:w-48 shrink-0">
                      <img
                        src={
                          review.user?.avatar_url ||
                          "/images/placeholders/avatar.jpg"
                        }
                        alt={review.user?.name || "User"}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover bg-gray-200"
                      />
                      <div>
                        <p className="font-bold text-sm text-text-primary">
                          {review.user?.name || "Khách hàng"}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 border-l border-transparent md:border-border-light md:pl-6">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex text-[#BC4C00] text-xs gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <IconStar
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating
                                  ? "fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        {review.tour && (
                          <Link
                            to={`/tours/${review.tour.slug || review.tour._id}`}
                            className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded hover:bg-primary/10 transition-colors truncate max-w-[150px]"
                          >
                            {review.tour.name}
                          </Link>
                        )}
                      </div>

                      <p className="text-sm text-text-secondary leading-relaxed mb-4">
                        "{review.comment || "Không có nội dung đánh giá"}"
                      </p>

                      {/* Reply Section */}
                      {review.reply ? (
                        <div className="bg-bg-main p-4 rounded-2xl border border-border-light text-sm">
                          <div className="flex items-center gap-2 mb-1 font-bold text-primary">
                            <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                              <IconCheck className="w-3 h-3" />
                            </div>
                            Phản hồi của bạn:
                          </div>
                          <p className="text-text-secondary italic pl-7">
                            {review.reply}
                          </p>
                          {review.replyAt && (
                            <p className="text-xs text-text-secondary/60 pl-7 mt-1">
                              {formatDate(review.replyAt)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          {!replyingId || replyingId !== review._id ? (
                            <button
                              onClick={() => setReplyingId(review._id)}
                              className="text-xs font-bold text-text-secondary flex items-center gap-2 hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-bg-main w-fit"
                            >
                              <IconMessage className="w-4 h-4" /> Trả lời đánh
                              giá
                            </button>
                          ) : (
                            <div className="animate-fade-in">
                              <textarea
                                rows="3"
                                className="w-full p-3 rounded-xl border border-primary focus:ring-1 focus:ring-primary outline-none text-sm mb-2 resize-none"
                                placeholder="Nhập nội dung phản hồi..."
                                autoFocus
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                              ></textarea>
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    setReplyingId(null);
                                    setReplyText("");
                                  }}
                                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-text-secondary hover:bg-bg-main"
                                  disabled={isReplying}
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={() => handleSubmitReply(review._id)}
                                  disabled={isReplying || !replyText.trim()}
                                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {isReplying && (
                                    <Spinner size="sm" className="w-3 h-3" />
                                  )}
                                  Gửi phản hồi
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data?.total > 10 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-border-light bg-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-main transition-colors"
                >
                  Trước
                </button>
                <span className="px-4 py-2 text-sm text-text-secondary">
                  Trang {page} / {Math.ceil(data.total / 10)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(data.total / 10)}
                  className="px-4 py-2 rounded-xl border border-border-light bg-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-main transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
