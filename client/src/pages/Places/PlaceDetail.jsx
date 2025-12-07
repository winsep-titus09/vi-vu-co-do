import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { placesApi } from "../../features/places/api";
import { toursApi } from "../../features/tours/api";
import { reviewsApi } from "../../features/reviews/api";
import { useCreateReview } from "../../features/reviews/hooks";
import { useAuth } from "../../features/auth/hooks";
import { useToast } from "../../components/Toast/useToast";
import {
  IconLoader,
  IconDirection,
  IconHeart,
  IconTicketAlt,
  IconArrowRight,
} from "../../icons/IconCommon";
import {
  IconMapPin,
  IconClock,
  Icon3D,
  IconCheck,
  IconStar,
  IconShare,
} from "../../icons/IconBox";
import IconInfo from "../../icons/IconInfo";
import { IconX } from "../../icons/IconX";
import { IconSun } from "../../icons/IconSun";

// Helper to convert MongoDB Decimal128 to number
const toNumber = (val) => {
  if (val?.$numberDecimal) return parseFloat(val.$numberDecimal);
  return parseFloat(val) || 0;
};

// Helper function to format VND
const formatVND = (price) => {
  const amount = toNumber(price);
  if (amount === 0) return "Miễn phí";
  return amount.toLocaleString("vi-VN") + "đ";
};

// Helper function to format ticket price
const formatTicketPrice = (price, currency = "VND") => {
  const amount = toNumber(price);
  if (amount === 0) return "Miễn phí";
  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }
  return `${amount} ${currency}`;
};

const normalizeImage = (url) => {
  if (!url) return "/images/placeholders/place-placeholder.jpg";
  const lower = url.toString().toLowerCase();
  if (lower.startsWith("http") || url.startsWith("/")) return url;
  return "/images/placeholders/place-placeholder.jpg";
};

export default function PlaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const { createLocationReview, isLoading: isSubmittingReview } = useCreateReview();

  // State management
  const [location, setLocation] = useState(null);
  const [relatedTours, setRelatedTours] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toursLoading, setToursLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState("");
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewVisitDate, setReviewVisitDate] = useState("");

  // Fetch location details
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setIsLoading(true);
        const response = await placesApi.getLocation(id);
        setLocation(response);
      } catch (err) {
        console.error("Fetch location error:", err);
        setError(err.message || "Không thể tải thông tin địa điểm");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchLocation();
    }
  }, [id]);

  // Fetch related tours - filtered by location
  useEffect(() => {
    const fetchRelatedTours = async () => {
      if (!location?._id) return;
      try {
        setToursLoading(true);
        const response = await toursApi.listTours({
          location_id: location._id,
          limit: 3,
        });
        setRelatedTours(response?.items || []);
      } catch (err) {
        console.error("Fetch tours error:", err);
      } finally {
        setToursLoading(false);
      }
    };

    fetchRelatedTours();
  }, [location?._id]);

  // Fetch location reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!location?._id) return;
      try {
        setReviewsLoading(true);
        const response = await reviewsApi.listLocationReviews(location._id, {
          limit: 6,
          sort: "-createdAt",
        });
        setReviews(response?.items || []);
      } catch (err) {
        console.error("Fetch reviews error:", err);
        // Don't show error, just leave reviews empty
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [location?._id]);

  useEffect(() => {
    document.body.style.overflow = is3DModalOpen ? "hidden" : "auto";
  }, [is3DModalOpen]);

  // Prepare dynamic data
  const placeDetail = location
    ? {
        id: location._id,
        name: location.name,
        category: location.category_id?.name || "Địa điểm",
        address: location.address || "Huế",
        description: location.description || "",
        images:
          location.images?.length > 0
            ? location.images.map(normalizeImage)
            : ["/images/placeholders/place-placeholder.jpg"],
        info: {
          openTime: location.opening_hours || "Liên hệ",
          ticket: formatTicketPrice(
            location.ticket_price,
            location.ticket_price_currency
          ),
          bestTime: location.best_visit_time || "Cả ngày",
        },
        weather: { temp: 28, condition: "Nắng đẹp", humidity: "65%" }, // Mock - optional
        has3D: location.threeDModels?.length > 0,
        threeDModels: location.threeDModels || [],
        rating: toNumber(location.average_rating) || 0,
        reviewsCount: location.review_count || 0,
      }
    : null;

  const visitingRoute =
    location?.highlights?.map((h, idx) => ({
      id: idx + 1,
      title: h.name,
      description: h.description || "",
      duration: h.duration || "",
      tip: h.tip || "",
      image: normalizeImage(h.image_url),
    })) || [];

  const secondaryImage = placeDetail?.images?.[1] || placeDetail?.images?.[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <IconLoader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen bg-bg-main pb-20 pt-6">
        <div className="container-main">
          <Breadcrumbs
            items={[
              { label: "Điểm đến", href: "/places" },
              { label: "Không tìm thấy" },
            ]}
          />
          <div className="mt-20 text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              Không tìm thấy địa điểm
            </h1>
            <p className="text-text-secondary mb-6">
              {error || "Địa điểm bạn tìm kiếm không tồn tại hoặc đã bị xóa."}
            </p>
            <button
              onClick={() => navigate("/places")}
              className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-main pb-24 pt-6 md:pb-20">
      <div className="container-main space-y-10">
        <Breadcrumbs
          items={[
            { label: "Điểm đến", href: "/places" },
            { label: placeDetail.name },
          ]}
        />

        {/* 1. HERO SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px] md:h-[500px] rounded-3xl overflow-hidden relative group">
          <div className="md:col-span-2 h-full relative cursor-pointer overflow-hidden">
            <img
              src={placeDetail.images[0]}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              alt="Main"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold uppercase tracking-wider">
                  {placeDetail.category}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold bg-secondary px-2 py-1 rounded-full text-white">
                  <IconStar className="w-3 h-3 fill-current" />{" "}
                  {placeDetail.rating}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-bold leading-tight shadow-sm">
                {placeDetail.name}
              </h1>
              <div className="flex items-center gap-2 mt-3 text-white/90 text-sm font-medium">
                <IconMapPin className="w-5 h-5" />{" "}
                <span>{placeDetail.address}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-4 h-full">
            <div className="flex-1 overflow-hidden rounded-2xl">
              <img
                src={secondaryImage}
                className="w-full h-full object-cover hover:scale-110 transition-transform"
                alt="Sub"
              />
            </div>
            <div
              onClick={() => placeDetail.has3D && setIs3DModalOpen(true)}
              className={`flex-1 bg-primary relative rounded-2xl flex flex-col items-center justify-center overflow-hidden group/btn shadow-inner ${
                placeDetail.has3D
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-60"
              }`}
            >
              <img
                src={
                  placeDetail.threeDModels?.[0]?.thumbnail_url ||
                  secondaryImage ||
                  placeDetail.images[0]
                }
                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                alt="3D"
              />
              <div className="relative z-10 flex flex-col items-center text-white transition-transform group-hover/btn:scale-110">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-2 border border-white/30">
                  <Icon3D className="w-7 h-7 animate-pulse" />
                </div>
                <span className="font-bold font-heading text-lg">
                  {placeDetail.has3D ? "Tham quan 3D" : "Chưa có 3D"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Intro & Article */}
            <div className="space-y-6">
              {placeDetail.description && (
                <>
                  <p className="text-lg md:text-xl text-text-primary font-medium leading-relaxed border-l-4 border-secondary pl-6 py-1">
                    {placeDetail.description}
                  </p>
                  <hr className="border-border-light" />
                </>
              )}
              {!placeDetail.description && (
                <p className="text-text-secondary italic text-center py-8">
                  Thông tin chi tiết đang được cập nhật.
                </p>
              )}
            </div>

            {/* Visiting route with 3 key points */}
            {/* Visiting route with 3 key points */}
            {visitingRoute.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-border-light shadow-sm">
                <h3 className="text-2xl font-heading font-bold text-text-primary mb-8 flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-white">
                    <IconMapPin className="w-5 h-5" />
                  </span>{" "}
                  Lộ trình gợi ý
                </h3>
                <div className="relative pl-4 md:pl-6 border-l-2 border-dashed border-border-light space-y-10">
                  {visitingRoute.map((point, idx) => (
                    <div key={idx} className="relative pl-6 md:pl-8 group">
                      <div className="absolute -left-[9px] md:-left-[11px] top-0 w-4 h-4 md:w-5 md:h-5 rounded-full bg-white border-4 border-secondary group-hover:scale-125 transition-transform"></div>
                      <div className="flex flex-col md:flex-row gap-5">
                        <div className="flex-1 order-2 md:order-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-xl font-bold text-text-primary">
                              {point.title}
                            </h4>
                            <span className="text-xs font-bold text-text-secondary bg-bg-main px-2 py-0.5 rounded border border-border-light">
                              ~{point.duration}
                            </span>
                          </div>
                          <p className="text-text-secondary text-sm mb-3 leading-relaxed">
                            {point.description}
                          </p>
                          <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl flex gap-3 items-start">
                            <IconStar className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-0.5">
                                Mẹo nhỏ
                              </p>
                              <p className="text-xs text-text-secondary italic">
                                "{point.tip}"
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden shrink-0 order-1 md:order-2 shadow-sm group-hover:shadow-md transition-shadow">
                          <img
                            src={point.image}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEWS SECTION */}
            <div className="pt-8 border-t border-border-light">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-heading font-bold text-text-primary">
                  Đánh giá & Bình luận
                </h3>
                <button 
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.warning("Yêu cầu đăng nhập", "Vui lòng đăng nhập để viết đánh giá");
                      navigate("/sign-in", { state: { from: `/places/${id}` } });
                      return;
                    }
                    setIsReviewModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-full border border-border-light text-sm font-bold hover:bg-bg-main transition-colors"
                >
                  Viết đánh giá
                </button>
              </div>

              <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-2xl border border-border-light">
                <div className="text-center px-4 border-r border-border-light">
                  <span className="text-4xl font-heading font-bold text-primary block">
                    {placeDetail.rating}
                  </span>
                  <div className="flex text-[#BC4C00] text-xs gap-0.5 justify-center my-1">
                    {[...Array(5)].map((_, i) => (
                      <IconStar key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-text-secondary">
                    {placeDetail.reviewsCount} bài viết
                  </span>
                </div>
                <div className="flex-1 pl-4">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div
                      key={star}
                      className="flex items-center gap-3 text-xs text-text-secondary mb-1"
                    >
                      <span className="w-2">{star}</span>
                      <div className="flex-1 h-1.5 bg-bg-main rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary"
                          style={{
                            width:
                              star === 5 ? "70%" : star === 4 ? "20%" : "5%",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <IconLoader className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="flex gap-4 pb-6 border-b border-border-light last:border-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                        {review.reviewer?.avatar_url ? (
                          <img
                            src={review.reviewer.avatar_url}
                            alt={review.reviewer.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          review.reviewer?.name?.charAt(0)?.toUpperCase() || "U"
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-text-primary">
                            {review.reviewer?.name || "Khách tham quan"}
                          </h4>
                          <span className="text-xs text-text-secondary">
                            •{" "}
                            {new Date(review.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                        <div className="flex text-[#BC4C00] gap-0.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <IconStar
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating
                                  ? "fill-current"
                                  : "fill-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                        {review.visit_date && (
                          <p className="text-xs text-text-tertiary mt-2">
                            Thời gian tham quan:{" "}
                            {new Date(review.visit_date).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {placeDetail.reviewsCount > 6 && (
                    <button className="w-full py-3 text-sm font-bold text-primary border border-border-light rounded-xl hover:bg-bg-main">
                      Xem thêm đánh giá
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-text-secondary italic text-center py-8">
                  Chưa có đánh giá nào. Hãy là người đầu tiên!
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: SIDEBAR (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* WEATHER & UTILITY WIDGET */}
              <div className="rounded-3xl overflow-hidden shadow-lg shadow-blue-500/10">
                <div className="bg-linear-to-br from-blue-500 to-blue-600 p-5 text-white relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <p className="text-3xl font-bold">
                        {placeDetail.weather.temp}°
                      </p>
                      <p className="text-sm opacity-90 font-medium">
                        {placeDetail.weather.condition}
                      </p>
                      <p className="text-xs opacity-70 mt-1">
                        Độ ẩm: {placeDetail.weather.humidity}
                      </p>
                    </div>
                    <IconSun className="w-12 h-12 text-yellow-300 animate-spin-slow" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                </div>
                <div className="bg-white p-4 grid grid-cols-3 gap-2 border border-t-0 border-border-light rounded-b-3xl">
                  <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-bg-main transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconDirection className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary">
                      Chỉ đường
                    </span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-bg-main transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconHeart className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary">
                      Lưu lại
                    </span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-bg-main transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconShare className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary">
                      Chia sẻ
                    </span>
                  </button>
                </div>
              </div>

              {/* INFO CARD */}
              <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <IconInfo className="w-5 h-5 text-secondary" />
                  Thông tin tham quan
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-main/50">
                    <IconClock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-text-secondary uppercase">
                        Giờ mở cửa
                      </p>
                      <p className="text-sm font-bold text-text-primary">
                        {placeDetail.info.openTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-main/50">
                    <IconTicketAlt className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-text-secondary uppercase">
                        Giá vé tham khảo
                      </p>
                      <p className="text-sm font-bold text-text-primary">
                        {placeDetail.info.ticket}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-main/50">
                    <IconCheck className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-text-secondary uppercase">
                        Thời điểm lý tưởng
                      </p>
                      <p className="text-sm font-bold text-text-primary">
                        {placeDetail.info.bestTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RELATED TOURS */}
              <div className="bg-[#2C3E50] p-6 rounded-3xl text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-heading font-bold mb-2">
                    Bạn muốn đến đây?
                  </h3>
                  <p className="text-sm text-white/70 mb-6">
                    Khám phá địa điểm này trọn vẹn nhất cùng hướng dẫn viên.
                  </p>
                  {toursLoading ? (
                    <div className="text-center py-8">
                      <IconLoader className="w-6 h-6 text-white/60 animate-spin mx-auto" />
                    </div>
                  ) : relatedTours.length > 0 ? (
                    <div className="space-y-4">
                      {relatedTours.map((tour) => (
                        <Link
                          key={tour._id}
                          to={`/tours/${tour._id}`}
                          className="flex gap-4 group p-3 rounded-2xl hover:bg-white/10 transition-colors border border-white/10 hover:border-white/20"
                        >
                          <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-white/5">
                            <img
                              src={
                                tour.cover_image_url ||
                                tour.image_url ||
                                tour.images?.[0] ||
                                "/images/placeholders/tour-placeholder.jpg"
                              }
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              alt={tour.name}
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <h4 className="text-white font-bold text-base mb-1 group-hover:text-secondary transition-colors">
                              {tour.name}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-white/60">
                              <span>{formatVND(tour.price)}</span>
                              <span>•</span>
                              <span>
                                {tour.duration_hours 
                                  ? `${tour.duration_hours} giờ`
                                  : `${tour.duration} ${tour.duration_unit === "hours" ? "giờ" : "ngày"}`
                                }
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/60 text-sm text-center py-8">
                      Chưa có tour liên quan.
                    </p>
                  )}
                  <Link
                    to="/tours"
                    className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-secondary hover:text-white transition-colors"
                  >
                    Xem tất cả tour <IconArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY MOBILE ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border-light shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 z-40 md:hidden flex items-center justify-between gap-4 safe-area-pb">
        <div className="flex flex-col">
          <span className="text-[10px] text-text-secondary font-bold uppercase">
            Giá vé
          </span>
          <span className="text-lg font-bold text-primary">
            {placeDetail.info.ticket}
          </span>
        </div>
        <div className="flex gap-3">
          <button className="w-12 h-12 rounded-full bg-bg-main text-primary border border-border-light flex items-center justify-center hover:bg-primary/10">
            <IconDirection className="w-6 h-6" />
          </button>
          <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/30 flex items-center gap-2 active:scale-95 transition-transform">
            Đặt Tour Ngay <IconArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D VIEWER MODAL */}
      {is3DModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <button
            onClick={() => setIs3DModalOpen(false)}
            className="absolute top-6 right-6 z-50 text-white/60 hover:text-white hover:rotate-90 transition-all duration-300"
          >
            <IconX className="w-10 h-10" />
          </button>
          <div className="relative w-full h-full max-w-6xl max-h-[85vh] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
            <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-linear-to-b from-black/80 to-transparent pointer-events-none">
              <h3 className="text-white font-heading font-bold text-xl text-center">
                {placeDetail.name} - Mô hình 3D
              </h3>
            </div>
            <div className="flex-1 relative flex items-center justify-center group">
              <img
                src={secondaryImage}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[20s]"
                alt="3D Placeholder"
              />
              <div className="relative z-10 text-center space-y-4">
                <div className="w-20 h-20 border-4 border-white/30 rounded-full flex items-center justify-center mx-auto animate-spin-slow">
                  <Icon3D className="w-10 h-10 text-white" />
                </div>
                <p className="text-white text-lg font-medium">
                  Đang tải mô hình 3D...
                </p>
                <p className="text-white/50 text-sm">(Demo UI)</p>
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                <button className="px-4 py-2 bg-white/10 backdrop-blur rounded-lg text-white text-sm hover:bg-white/20">
                  Xoay trái
                </button>
                <button className="px-4 py-2 bg-white/10 backdrop-blur rounded-lg text-white text-sm hover:bg-white/20">
                  Tự động
                </button>
                <button className="px-4 py-2 bg-white/10 backdrop-blur rounded-lg text-white text-sm hover:bg-white/20">
                  Xoay phải
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-light">
              <h3 className="text-xl font-heading font-bold text-text-primary">
                Viết đánh giá
              </h3>
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setReviewRating(5);
                  setReviewComment("");
                  setReviewVisitDate("");
                }}
                className="p-2 rounded-full hover:bg-bg-main transition-colors"
              >
                <IconX className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Place info */}
              <div className="flex items-center gap-4 p-4 bg-bg-main rounded-2xl">
                <img
                  src={placeDetail?.images?.[0]}
                  alt={placeDetail?.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <h4 className="font-bold text-text-primary">{placeDetail?.name}</h4>
                  <p className="text-sm text-text-secondary">{placeDetail?.category}</p>
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

              {/* Visit date */}
              <div>
                <label className="block text-sm font-bold text-text-secondary uppercase mb-2">
                  Ngày tham quan (tùy chọn)
                </label>
                <input
                  type="date"
                  value={reviewVisitDate}
                  onChange={(e) => setReviewVisitDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-bold text-text-secondary uppercase mb-2">
                  Nhận xét của bạn
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn tại địa điểm này..."
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
                  setReviewVisitDate("");
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

                  const result = await createLocationReview(location._id, {
                    rating: reviewRating,
                    comment: reviewComment.trim(),
                    visit_date: reviewVisitDate || undefined,
                  });

                  if (result.success) {
                    toast.success("Thành công!", "Cảm ơn bạn đã đánh giá địa điểm này");
                    setIsReviewModalOpen(false);
                    setReviewRating(5);
                    setReviewComment("");
                    setReviewVisitDate("");
                    // Refresh reviews
                    const response = await reviewsApi.listLocationReviews(location._id, {
                      limit: 6,
                      sort: "-createdAt",
                    });
                    setReviews(response?.items || []);
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
