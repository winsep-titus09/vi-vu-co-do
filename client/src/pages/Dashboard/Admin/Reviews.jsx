import React, { useState } from "react";
import { IconCheck, IconStar } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import { IconTrash, IconEyeOff, IconFlag } from "../../../icons/IconCommon";

// ============================================================================
// MOCK DATA
// ============================================================================
const reviewsData = [
  {
    id: 1,
    user: "Nguyễn Văn A",
    tour: "Bí mật Hoàng cung Huế",
    rating: 5,
    comment:
      "Chuyến đi tuyệt vời! HDV Minh Hương rất am hiểu lịch sử và nhiệt tình. Đồ ăn trong tour trà chiều cũng rất ngon.",
    date: "20/05/2025",
    status: "published", // published, hidden, reported
  },
  {
    id: 2,
    user: "Sarah Jenkins",
    tour: "Food Tour Huế",
    rating: 4,
    comment:
      "Great food, but the walking distance was a bit long for my kids. Still recommended.",
    date: "19/05/2025",
    status: "published",
  },
  {
    id: 3,
    user: "Trần B",
    tour: "Lăng Tự Đức",
    rating: 1,
    comment:
      "Dịch vụ quá tệ! HDV đến muộn 30 phút và không xin lỗi. Yêu cầu hoàn tiền ngay lập tức!!!",
    date: "18/05/2025",
    status: "reported", // Bị HDV báo cáo hoặc hệ thống flag
  },
  {
    id: 4,
    user: "Spam Bot 123",
    tour: "Sông Hương Ca Huế",
    rating: 5,
    comment: "Click link này để nhận voucher miễn phí: http://spam-link.com",
    date: "15/05/2025",
    status: "hidden",
  },
];

export default function AdminReviews() {
  const [filter, setFilter] = useState("all"); // all, reported, hidden
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState(reviewsData);

  // Filter Logic
  const filteredReviews = reviews.filter((item) => {
    const matchSearch =
      item.user.toLowerCase().includes(search.toLowerCase()) ||
      item.tour.toLowerCase().includes(search.toLowerCase()) ||
      item.comment.toLowerCase().includes(search.toLowerCase());

    if (filter === "all") return matchSearch;
    return matchSearch && item.status === filter;
  });

  // Actions
  const handleHide = (id) => {
    if (
      window.confirm("Bạn có chắc muốn ẩn đánh giá này khỏi trang công khai?")
    ) {
      setReviews(
        reviews.map((r) => (r.id === id ? { ...r, status: "hidden" } : r))
      );
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Xóa vĩnh viễn đánh giá này?")) {
      setReviews(reviews.filter((r) => r.id !== id));
    }
  };

  const handleApprove = (id) => {
    // Dùng cho trường hợp gỡ cờ báo cáo (Reported -> Published)
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, status: "published" } : r))
    );
    alert("Đã duyệt đánh giá.");
  };

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
          </p>
        </div>
      </div>

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
              onClick={() => setFilter(tab.id)}
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
              key={review.id}
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
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-text-secondary">
                      {review.user.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-text-primary text-sm line-clamp-1">
                        {review.user}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {review.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <IconStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? "fill-current" : "text-gray-300"
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
                    Tour: {review.tour}
                  </p>
                  <p className="text-text-primary text-sm leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>

                {/* Actions Column */}
                <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-border-light pt-4 md:pt-0 md:pl-6">
                  {review.status === "reported" ? (
                    <>
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <IconCheck className="w-3.5 h-3.5" /> Giữ lại
                      </button>
                      <button
                        onClick={() => handleHide(review.id)}
                        className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <IconEyeOff className="w-3.5 h-3.5" /> Ẩn đi
                      </button>
                    </>
                  ) : (
                    <>
                      {review.status !== "hidden" && (
                        <button
                          onClick={() => handleHide(review.id)}
                          className="p-2 text-text-secondary hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                          title="Ẩn đánh giá"
                        >
                          <IconEyeOff className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
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
    </div>
  );
}
