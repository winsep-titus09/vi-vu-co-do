import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconStar, IconCheck } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import {
  IconFilter,
  IconMessage,
  IconArrowRight,
} from "../../../icons/IconCommon";

// --- MOCK DATA ---
const reviewsData = [
  {
    id: 1,
    tourName: "Bí mật Hoàng cung Huế",
    tourId: 1,
    user: "Nguyễn Văn A",
    avatar:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_3.jpg",
    rating: 5,
    date: "20/05/2025",
    comment:
      "Chị Hương hướng dẫn rất tận tình, kiến thức lịch sử uyên thâm. Gia đình mình rất thích cách chị kể chuyện về các vị vua triều Nguyễn.",
    reply: null, // Chưa trả lời
  },
  {
    id: 2,
    tourName: "Thiền trà tại Chùa Từ Hiếu",
    tourId: 5,
    user: "Sarah Jenkins",
    avatar:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_4.jpg",
    rating: 4,
    date: "18/05/2025",
    comment:
      "Great experience. The atmosphere was very peaceful. However, the pickup was a bit late due to traffic.",
    reply:
      "Thank you Sarah! I'm glad you enjoyed the peace at Tu Hieu Pagoda. Sorry again for the traffic delay, hope to see you again!",
  },
  {
    id: 3,
    tourName: "Bí mật Hoàng cung Huế",
    tourId: 1,
    user: "Trần Minh",
    avatar:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/guides/guide_female_1.jpg", // Placeholder
    rating: 5,
    date: "15/05/2025",
    comment: "Tuyệt vời! Rất đáng tiền. Chụp ảnh siêu đẹp.",
    reply: null,
  },
];

export default function GuideReviews() {
  const [filterRating, setFilterRating] = useState("all"); // all, 5, 4, 3...
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Tính toán thống kê
  const totalReviews = reviewsData.length;
  const averageRating = (
    reviewsData.reduce((acc, cur) => acc + cur.rating, 0) / totalReviews
  ).toFixed(1);

  // Logic Filter
  const filteredReviews = reviewsData.filter(
    (r) => filterRating === "all" || r.rating === parseInt(filterRating)
  );

  const handleSubmitReply = (id) => {
    // Call API here
    alert(`Đã gửi phản hồi cho đánh giá #${id}: ${replyText}`);
    setReplyingId(null);
    setReplyText("");
  };

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
            {averageRating}
          </div>
          <div className="flex text-[#BC4C00] gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <IconStar
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
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
            const count = reviewsData.filter((r) => r.rating === star).length;
            const percent = (count / totalReviews) * 100;
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
              onChange={(e) => setFilterRating(e.target.value)}
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

        {/* List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-3xl border border-border-light shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {/* User Info */}
                <div className="flex items-center md:flex-col md:items-start gap-3 md:w-48 shrink-0">
                  <img
                    src={review.avatar}
                    alt={review.user}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover bg-gray-200"
                  />
                  <div>
                    <p className="font-bold text-sm text-text-primary">
                      {review.user}
                    </p>
                    <p className="text-xs text-text-secondary">{review.date}</p>
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
                            i < review.rating ? "fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <Link
                      to={`/tours/${review.tourId}`}
                      className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded hover:bg-primary/10 transition-colors truncate max-w-[150px]"
                    >
                      {review.tourName}
                    </Link>
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed mb-4">
                    "{review.comment}"
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
                    </div>
                  ) : (
                    <div>
                      {!replyingId || replyingId !== review.id ? (
                        <button
                          onClick={() => setReplyingId(review.id)}
                          className="text-xs font-bold text-text-secondary flex items-center gap-2 hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-bg-main w-fit"
                        >
                          <IconMessage className="w-4 h-4" /> Trả lời đánh giá
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
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => handleSubmitReply(review.id)}
                              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90"
                            >
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
      </div>
    </div>
  );
}
