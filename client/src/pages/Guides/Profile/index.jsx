import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import TourCard from "../../../components/Cards/TourCard";
import Spinner from "../../../components/Loaders/Spinner";
import EmptyState from "../../../components/Loaders/EmptyState";
import {
  useGuideProfile,
  useGuideTours,
  useGuideBusyDates,
  useGuideReviews,
} from "../../../features/guides/hooks";
import { useCreateReview } from "../../../features/reviews/hooks";
import { useAuth } from "../../../features/auth/hooks";
import { useToast } from "../../../components/Toast/useToast";
import {
  IconStar,
  IconPlay,
  IconCalendar,
  IconCheck,
} from "../../../icons/IconBox";
import { IconLoader } from "../../../icons/IconCommon";
import { IconX } from "../../../icons/IconX";
import IconVerify from "../../../icons/IconVerify";
import IconShieldCheck from "../../../icons/IconShieldCheck";
import IconMail from "../../../icons/IconMail";
import IconLang from "../../../icons/IconLang";
import IconBookOpen from "../../../icons/IconBookOpen";
import IconCraft from "../../../icons/IconCraft";
import IconLotus from "../../../icons/IconLotus";

export default function GuideProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const { createGuideReview, isLoading: isSubmittingReview } = useCreateReview();
  
  const { guide: apiGuide, isLoading, error } = useGuideProfile(id);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Fetch guide's tours
  const { tours: apiTours, isLoading: toursLoading } = useGuideTours(id, {
    limit: 2,
  });

  // Fetch guide's busy dates for next 7 days
  const today = useMemo(() => new Date(), []);
  const nextWeek = useMemo(() => {
    const date = new Date(today);
    date.setDate(today.getDate() + 7);
    return date;
  }, [today]);

  const { busyDates } = useGuideBusyDates(
    id,
    today.toISOString().split("T")[0],
    nextWeek.toISOString().split("T")[0]
  );

  // Fetch guide's reviews
  const {
    reviews: apiReviews,
    stats: reviewStats,
    isLoading: reviewsLoading,
  } = useGuideReviews(id, { limit: 4 });

  // Map API data to component format
  const guideDetail = useMemo(() => {
    if (!apiGuide) return null;

    return {
      id: apiGuide._id,
      name: apiGuide.user_id?.name || "Guide",
      role: apiGuide.introduction || "",
      avatar:
        apiGuide.user_id?.avatar_url ||
        "/images/placeholders/avatar-placeholder.jpg",
      cover:
        apiGuide.user_id?.cover_image_url ||
        "/images/placeholders/cover-placeholder.jpg",
      rating: apiGuide.rating || 5.0,
      reviews: apiGuide.reviewCount || 0,
      experience: parseInt(apiGuide.experience) || 5,
      languages: (apiGuide.languages || []).map((l) =>
        l === "vi"
          ? "Tiếng Việt"
          : l === "en"
          ? "English"
          : l === "fr"
          ? "Français"
          : l.toUpperCase()
      ),
      cert: apiGuide.certificates?.[0]?.name || "",
      bio: apiGuide.user_id?.bio || apiGuide.experience || "",
      videoIntro:
        apiGuide.bio_video_url || "/images/placeholders/video-thumbnail.jpg",
    };
  }, [apiGuide]);

  // Map tours from API
  const tours = useMemo(() => {
    if (!apiTours?.length) return [];
    return apiTours.map((tour) => ({
      id: tour._id,
      name: tour.name,
      price: tour.price,
      duration: tour.duration_hours 
        ? `${tour.duration_hours} giờ`
        : `${tour.duration} ${tour.duration_unit === "hours" ? "giờ" : "ngày"}`,
      rating: tour.rating || 5.0,
      image:
        tour.cover_image_url ||
        tour.gallery?.[0] ||
        "https://via.placeholder.com/400x300",
      category: tour.category_id?.name || "Tour",
    }));
  }, [apiTours]);

  // Map availability calendar from busy dates
  const availability = useMemo(() => {
    const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const calendar = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split("T")[0];

      const isBusy = busyDates.some((bd) => {
        const busyDate = new Date(bd.date).toISOString().split("T")[0];
        return busyDate === dateStr;
      });

      calendar.push({
        day: weekDays[dayOfWeek],
        date: date.getDate().toString(),
        status: isBusy ? "busy" : "free",
      });
    }

    return calendar;
  }, [busyDates, today]);

  // Map reviews from API
  const reviews = useMemo(() => {
    if (!apiReviews?.length) return [];
    return apiReviews.slice(0, 2).map((review) => ({
      id: review._id,
      userName: review.user_id?.name || "",
      userInitial: (review.user_id?.name || "D")?.[0]?.toUpperCase(),
      date: new Date(review.createdAt).toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      }),
      rating: review.rating,
      comment: review.comment,
    }));
  }, [apiReviews]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !guideDetail) {
    return (
      <div className="min-h-screen bg-bg-main pt-20">
        <div className="container-main">
          <EmptyState
            title="Không tìm thấy hướng dẫn viên"
            message={error || "Hướng dẫn viên không tồn tại"}
            actionLabel="Quay lại danh sách"
            onAction={() => (window.location.href = "/guides")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main pb-24 pt-0 md:pb-20">
      {/* COVER IMAGE */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden group">
        <img
          src={guideDetail.cover}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt="Cover"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
      </div>

      <div className="container-main relative -mt-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT SIDEBAR (INFO) --- */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-border-light text-center relative ">
              <div className="absolute top-0 left-0 w-full h-24 bg-primary/5 pointer-events-none rounded-t-3xl"></div>

              {/* Avatar */}
              <div className="relative w-32 h-32 mx-auto -mt-20 mb-4 group cursor-pointer">
                <img
                  src={guideDetail.avatar}
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-md transition-transform group-hover:scale-105"
                  alt="Avatar"
                />
                <div
                  className="absolute bottom-1 right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white tooltip"
                  data-tip="Đã xác thực"
                >
                  <IconVerify className="w-4 h-4" />
                </div>
              </div>

              <h1 className="text-2xl font-heading font-bold text-text-primary mb-1">
                {guideDetail.name}
              </h1>
              <p className="text-sm text-primary font-bold uppercase tracking-wider mb-4 bg-primary/10 inline-block px-3 py-1 rounded-full">
                {guideDetail.role}
              </p>
              {id && (
                <p className="text-xs text-text-secondary mb-4">
                  Mã hồ sơ: #{id}
                </p>
              )}

              <div className="flex justify-center gap-2 mb-6">
                {guideDetail.languages.map((lang, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-bg-main rounded-lg text-xs font-bold text-text-secondary border border-border-light flex items-center gap-1"
                  >
                    <IconLang className="w-3 h-3" /> {lang}
                  </span>
                ))}
              </div>

              {/* Stats (Đã tăng padding-top lên 6) */}
              <div className="grid grid-cols-2 gap-4 border-t border-border-light pt-6 mb-6">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-text-primary">
                    {guideDetail.rating}
                  </span>
                  <span className="text-xs text-text-secondary flex justify-center items-center gap-1">
                    <IconStar className="w-3 h-3 text-secondary fill-current" />
                    Đánh giá
                  </span>
                </div>
                <div className="text-center border-l border-border-light">
                  <span className="block text-2xl font-bold text-text-primary">
                    {guideDetail.experience}+
                  </span>
                  <span className="text-xs text-text-secondary">Năm KN</span>
                </div>
              </div>

              {/* Desktop CTA */}
              <div className="hidden md:block space-y-3">
                <button className="w-full py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95">
                  Liên hệ ngay
                </button>
                <button className="w-full py-2.5 rounded-xl border border-border-light text-text-secondary hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2 bg-white">
                  <IconMail className="w-4 h-4" /> Nhắn tin
                </button>
              </div>
            </div>

            {/* 1. WIDGET: LỊCH TRỐNG TUẦN NÀY */}
            <div className="bg-white rounded-3xl p-6 border border-border-light shadow-sm">
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <IconCalendar className="w-5 h-5 text-primary" /> Lịch trình
                tuần này
              </h3>
              <div className="grid grid-cols-7 gap-2 text-center mb-4">
                {availability.map((slot, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-text-secondary font-bold uppercase">
                      {slot.day}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all cursor-pointer
                        ${
                          slot.status === "free"
                            ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                            : "bg-gray-50 text-gray-300 border-transparent cursor-not-allowed"
                        }`}
                    >
                      {slot.date}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Trống
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div> Bận
                </span>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-3xl p-6 border border-border-light shadow-sm">
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <IconShieldCheck className="w-5 h-5 text-green-500" /> Xác thực
                & Chứng chỉ
              </h3>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <IconCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Đã xác minh danh tính</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{guideDetail.cert}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* --- RIGHT CONTENT --- */}
          <div className="lg:col-span-8 space-y-10 pt-4 md:pt-24">
            {/* Bio & Video */}
            <section className="space-y-6">
              <h2 className="text-2xl font-heading font-bold text-text-primary">
                Giới thiệu
              </h2>
              <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
                <p className="text-text-secondary leading-relaxed text-lg mb-6">
                  "{guideDetail.bio}"
                </p>

                {/* Video Embed */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black group cursor-pointer">
                  <img
                    src={guideDetail.videoIntro}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                    alt="Video thumb"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border border-white/50 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <IconPlay className="w-8 h-8 fill-current ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tours Managed */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-text-primary mb-6">
                Các chuyến đi tôi dẫn ({tours.length})
              </h2>
              {toursLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : tours.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary text-center py-8">
                  Chưa có chuyến đi nào
                </p>
              )}
            </section>

            {/* Reviews */}
            <section className="border-t border-border-light pt-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-heading font-bold text-text-primary">
                  Đánh giá từ du khách
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.warning("Yêu cầu đăng nhập", "Vui lòng đăng nhập để viết đánh giá");
                        navigate("/sign-in", { state: { from: `/guides/${id}` } });
                        return;
                      }
                      setIsReviewModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-full border border-primary text-primary text-sm font-bold hover:bg-primary hover:text-white transition-all"
                  >
                    Viết đánh giá
                  </button>
                  {reviewStats && reviewStats.totalReviews > 2 && (
                    <button className="px-4 py-2 rounded-full border border-border-light text-sm font-bold hover:bg-white hover:border-primary transition-all">
                      Xem tất cả {reviewStats.totalReviews} đánh giá
                    </button>
                  )}
                </div>
              </div>
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white p-6 rounded-3xl border border-border-light shadow-sm"
                    >
                      <div className="flex justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-text-secondary">
                            {review.userInitial}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-text-primary">
                              {review.userName}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {review.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex text-[#BC4C00] text-xs gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <IconStar
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? "fill-current"
                                  : "stroke-current fill-none"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary italic leading-relaxed">
                        "{review.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary text-center py-8">
                  Chưa có đánh giá nào
                </p>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* 3. STICKY MOBILE ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border-light shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 z-40 md:hidden flex items-center gap-3 safe-area-pb">
        <button className="w-14 h-12 rounded-xl border border-border-light text-primary flex flex-col items-center justify-center hover:bg-bg-main">
          <IconMail className="w-5 h-5" />
        </button>
        <button className="flex-1 bg-primary text-white h-12 rounded-xl font-bold text-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-transform">
          Liên hệ / Đặt lịch
        </button>
      </div>

      {/* REVIEW MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-light">
              <h3 className="text-xl font-heading font-bold text-text-primary">
                Đánh giá hướng dẫn viên
              </h3>
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setReviewRating(5);
                  setReviewComment("");
                }}
                className="p-2 rounded-full hover:bg-bg-main transition-colors"
              >
                <IconX className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Guide info */}
              <div className="flex items-center gap-4 p-4 bg-bg-main rounded-2xl">
                <img
                  src={guideDetail?.avatar}
                  alt={guideDetail?.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                />
                <div>
                  <h4 className="font-bold text-text-primary">{guideDetail?.name}</h4>
                  <p className="text-sm text-text-secondary">{guideDetail?.role}</p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-bold text-text-secondary uppercase mb-3">
                  Đánh giá của bạn
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <IconStar
                        className={`w-8 h-8 ${
                          star <= reviewRating
                            ? "text-[#BC4C00] fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-text-secondary">
                    {reviewRating === 5
                      ? "Tuyệt vời"
                      : reviewRating === 4
                      ? "Rất tốt"
                      : reviewRating === 3
                      ? "Bình thường"
                      : reviewRating === 2
                      ? "Tệ"
                      : "Rất tệ"}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-bold text-text-secondary uppercase mb-2">
                  Nhận xét của bạn
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn với hướng dẫn viên này..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border-light bg-bg-main/30">
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setReviewRating(5);
                  setReviewComment("");
                }}
                className="px-6 py-2.5 rounded-xl border border-border-light text-text-secondary font-bold hover:bg-bg-main transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  if (!reviewComment.trim()) {
                    toast.warning("Thiếu thông tin", "Vui lòng nhập nhận xét");
                    return;
                  }

                  const result = await createGuideReview({
                    guide_id: id,
                    rating: reviewRating,
                    comment: reviewComment.trim(),
                  });

                  if (result.success) {
                    toast.success("Thành công!", "Cảm ơn bạn đã đánh giá hướng dẫn viên");
                    setIsReviewModalOpen(false);
                    setReviewRating(5);
                    setReviewComment("");
                    // Reload page to show new review
                    window.location.reload();
                  } else {
                    toast.error("Lỗi", result.error || "Không thể gửi đánh giá");
                  }
                }}
                disabled={isSubmittingReview || !reviewComment.trim()}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmittingReview ? (
                  <>
                    <IconLoader className="w-4 h-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi đánh giá"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
