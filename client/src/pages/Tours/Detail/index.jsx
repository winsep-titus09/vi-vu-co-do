// src/pages/Tours/Detail/index.jsx

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../../components/Toast/useToast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import { toursApi } from "../../../features/tours/api";
import { reviewsApi } from "../../../features/reviews/api";
import { IconLoader } from "../../../icons/IconCommon";
import { IconX } from "../../../icons/IconX";
// Removed: import TourCard from "../../../components/Cards/TourCard"; // Không dùng TourCard trong gợi ý mới này

// Import icons
import {
  IconClock,
  IconMapPin,
  IconStar,
  IconPlay,
  Icon3D,
  IconCalendar,
  IconCheck,
} from "../../../icons/IconBox";
import IconArrowRight from "../../../icons/IconArrowRight";
import { IconChevronDown } from "../../../icons/IconChevronDown";

// Helper to convert MongoDB Decimal128 to number
const toNumber = (val) => {
  if (val?.$numberDecimal) return parseFloat(val.$numberDecimal);
  return parseFloat(val) || 0;
};

// ============================================================================
// CONSTANTS
// ============================================================================
const defaultGuideOption = {
  value: "random",
  label: "Ngẫu nhiên (Mặc định)",
  guide: null,
};

// Default amenities nếu tour không có dữ liệu
const defaultAmenities = [
  "Hướng dẫn viên chuyên nghiệp",
  "Lịch trình linh hoạt",
  "Gặp mặt tại trung tâm",
];

// Default rules nếu tour không có dữ liệu
const defaultRules = [
  "Đến điểm tập trung đúng giờ (15 phút trước giờ khởi hành)",
  "Mặc trang phục lịch sự, phù hợp khi thăm các địa điểm tôn giáo",
  "Không vứt rác, giữ gìn vệ sinh chung",
  "Tuân thủ hướng dẫn của HDV trong suốt hành trình",
  "Trẻ em dưới 12 tuổi phải có người lớn đi kèm",
];

export default function TourDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get tour ID from URL

  // Tour data state
  const [tour, setTour] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedGuide, setSelectedGuide] = useState(defaultGuideOption);
  const [note, setNote] = useState("");

  // UI state
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  
  // Availability state
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const dateRef = useRef(null);
  const guideRef = useRef(null);

  // Fetch tour details from API
  useEffect(() => {
    const fetchTour = async () => {
      try {
        setIsLoading(true);
        const response = await toursApi.getTour(id);
        setTour(response);
      } catch (err) {
        console.error("Fetch tour error:", err);
        setError(err.message || "Không thể tải thông tin tour");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTour();
    }
  }, [id]);

  // Fetch reviews for tour
  useEffect(() => {
    const fetchReviews = async () => {
      if (!tour?._id) return;
      try {
        setReviewsLoading(true);
        const response = await reviewsApi.listTourReviews(tour._id, {
          limit: 6,
        });
        setReviews(response?.items || []);
      } catch (err) {
        console.error("Fetch reviews error:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [tour?._id]);

  const BASE_PRICE = tour ? toNumber(tour.price) : 42;
  const CHILD_PRICE = Math.round(BASE_PRICE / 2); // Trẻ em giảm 50%
  const totalPrice = adults * BASE_PRICE + children * CHILD_PRICE;
  
  // Check availability when date/guests change
  const checkAvailability = useCallback(async (date, numAdults, numChildren) => {
    if (!tour?._id || !date) return;
    
    try {
      setAvailabilityLoading(true);
      const dateStr = format(date, "yyyy-MM-dd");
      const totalGuests = numAdults + numChildren;
      const response = await toursApi.checkAvailability(tour._id, dateStr, totalGuests);
      setAvailabilityStatus(response);
    } catch (error) {
      console.error("Check availability error:", error);
      setAvailabilityStatus({ available: false, reason: "error", message: "Không thể kiểm tra" });
    } finally {
      setAvailabilityLoading(false);
    }
  }, [tour?._id]);
  
  // Re-check when guests change
  useEffect(() => {
    if (selectedDate) {
      const timer = setTimeout(() => {
        checkAvailability(selectedDate, adults, children);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [adults, children, selectedDate, checkAvailability]);

  // Click Outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setIsDateOpen(false);
      }
      if (guideRef.current && !guideRef.current.contains(event.target)) {
        setIsGuideOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle 3D modal - ESC key and body scroll
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIs3DModalOpen(false);
    };
    if (is3DModalOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [is3DModalOpen]);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setIsDateOpen(false);
    // Check availability for selected date
    if (date) {
      checkAvailability(date, adults, children);
    } else {
      setAvailabilityStatus(null);
    }
  };

  const handleSelectGuide = (option) => {
    setSelectedGuide(option);
    setIsGuideOpen(false);
  };

  // Submit Handler
  const toast = useToast();
  const handleBooking = () => {
    if (!selectedDate) {
      toast.warning(
        "Chưa chọn ngày",
        "Vui lòng chọn ngày khởi hành để tiếp tục!"
      );
      setIsDateOpen(true);
      return;
    }
    
    // Check if date is available
    if (availabilityStatus && !availabilityStatus.available) {
      const reasonMessages = {
        past_date: "Ngày đã qua, vui lòng chọn ngày khác",
        closed_weekdays: "Tour không hoạt động vào ngày này",
        blackout_date: "Ngày này không khả dụng",
        min_days_before_start: "Cần đặt trước số ngày quy định",
        max_days_advance: "Không thể đặt quá xa trong tương lai",
        insufficient_slots: "Không đủ chỗ cho số lượng khách",
        no_availability: "Ngày này không có chỗ trống",
      };
      toast.error(
        "Không thể đặt tour",
        reasonMessages[availabilityStatus.reason] || availabilityStatus.message || "Ngày này không khả dụng"
      );
      return;
    }
    
    const bookingData = {
      tourId: tour?._id || "tour_hue_night_01",
      tourName: tour?.name || "Dạo bộ Phố Cổ về đêm",
      tourImage: tour?.cover_image_url || tour?.gallery?.[0] || null,
      date: format(selectedDate, "yyyy-MM-dd"),
      guests: { adults, children },
      totalPrice,
      guidePreference: selectedGuide.value,
      selectedGuideId:
        selectedGuide.value !== "random" ? selectedGuide.value : null,
      selectedGuideName:
        selectedGuide.guide?.guideId?.name || selectedGuide.guide?.name || null,
      note: note.trim(),
    };
    navigate("/booking/review", { state: bookingData });
  };

  // Đếm tổng số ảnh panorama từ tất cả locations (đặt trước early return để tuân thủ Rules of Hooks)
  const total3DModels = useMemo(() => {
    if (!tour) return 0;
    let count = 0;
    // Từ threeDModels trực tiếp
    count += tour.threeDModels?.length || 0;
    // Từ locations
    for (const loc of tour.locations || []) {
      count += loc.locationId?.threeDModels?.length || 0;
    }
    // Từ itinerary
    for (const item of tour.itinerary || []) {
      count += item.locationId?.threeDModels?.length || 0;
    }
    return count;
  }, [tour]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <IconLoader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !tour) {
    return (
      <div className="min-h-screen bg-bg-main pb-20 pt-6">
        <div className="container-main">
          <Breadcrumbs
            items={[
              { label: "Chuyến tham quan", href: "/tours" },
              { label: "Không tìm thấy" },
            ]}
          />
          <div className="mt-20 text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-4">
              Không tìm thấy tour
            </h1>
            <p className="text-text-secondary mb-6">
              {error || "Tour bạn tìm kiếm không tồn tại hoặc đã bị xóa."}
            </p>
            <Link
              to="/tours"
              className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              Quay lại danh sách tour
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract data from tour (đồng bộ với Tour model)
  const tourName = tour.name || "Dạo bộ Phố Cổ về đêm";
  const tourDescription = tour.description || "";
  const tourLocation =
    tour.locations?.[0]?.locationId?.name || "Phố cổ, trung tâm";

  // Format duration: ưu tiên duration_hours, fallback duration (days)
  const formatTourDuration = () => {
    if (tour.duration_hours && tour.duration_hours > 0) {
      const hours = tour.duration_hours;
      if (hours < 1) return `${Math.round(hours * 60)} phút`;
      if (hours % 1 === 0) return `${hours} giờ`;
      return `${hours.toFixed(1)} giờ`;
    }
    if (tour.duration) {
      return `${tour.duration} ${
        tour.duration_unit === "hours" ? "giờ" : "ngày"
      }`;
    }
    return "3 giờ";
  };
  const tourDuration = formatTourDuration();

  // Rating - từ reviews aggregate hoặc mặc định
  const tourRating = toNumber(tour.average_rating || tour.avgRating || 0);
  const tourReviewCount =
    tour.review_count || tour.reviewCount || reviews.length || 0;

  // Category
  const tourCategory =
    tour.category_id?.name || tour.categories?.[0]?.name || "Lịch sử";

  // Cover image
  const tourImage =
    tour.cover_image_url ||
    tour.gallery?.[0] ||
    "/images/placeholders/tour-placeholder.jpg";

  // Main guide (người đầu tiên có isMain hoặc isPrimary)
  const mainGuide =
    tour.guides?.find((g) => g.isMain || g.isPrimary) ||
    tour.guides?.[0] ||
    tour.guide_id;

  // Build guide options from tour.guides
  const guideOptions = [
    defaultGuideOption,
    ...(tour.guides || []).map((g) => {
      const guideData = g.guideId || g;
      const guideName = guideData?.name || "HDV";
      const isMain = g.isMain || g.isPrimary;
      return {
        value: guideData?._id || g._id,
        label: `${guideName}${isMain ? " (Chính)" : ""}`,
        guide: g,
      };
    }),
  ];

  // Itinerary - sắp xếp theo order nếu có
  const tourItinerary = [...(tour.itinerary || [])].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  // Lấy 3D model đầu tiên từ tour (ưu tiên từ locations hoặc itinerary)
  const getFirst3DModel = () => {
    // Từ tour.threeDModels (tổng hợp từ backend)
    if (tour.threeDModels?.length > 0) {
      return tour.threeDModels[0];
    }
    // Từ locations
    for (const loc of tour.locations || []) {
      if (loc.locationId?.threeDModels?.length > 0) {
        return loc.locationId.threeDModels[0];
      }
    }
    // Từ itinerary
    for (const item of tour.itinerary || []) {
      if (item.locationId?.threeDModels?.length > 0) {
        return item.locationId.threeDModels[0];
      }
    }
    return null;
  };

  const first3DModel = getFirst3DModel();
  const has3DModel = !!first3DModel;

  return (
    <div className="min-h-screen bg-bg-main pb-20 pt-6">
      <div className="container-main space-y-8">
        <Breadcrumbs
          items={[
            { label: "Chuyến tham quan", href: "/tours" },
            { label: tourName },
          ]}
        />

        <div className="flex flex-col gap-10">
          {/* 1. HEADER INFO */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  {tourCategory} • Đi bộ đêm • Nhóm nhỏ
                </p>
                <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-text-primary leading-tight">
                  {tourName}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <IconMapPin className="w-4 h-4" />
                    {tourLocation}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border-light"></span>
                  <span className="inline-flex items-center gap-1.5">
                    <IconClock className="w-4 h-4" />
                    {tourDuration}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border-light"></span>
                  <span className="inline-flex items-center gap-1.5 text-[#BC4C00]">
                    <IconStar className="w-4 h-4" />
                    <span className="underline decoration-[#BC4C00]/30 underline-offset-2">
                      {tourRating.toFixed(1)} ({tourReviewCount} đánh giá)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. MEDIA GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[550px]">
            <div className="flex flex-col gap-3 w-full lg:h-full">
              {/* Video Section */}
              <div className="relative w-full aspect-video lg:aspect-auto lg:flex-1 min-h-0 rounded-2xl overflow-hidden bg-black group cursor-pointer">
                {tour?.video_url ? (
                  // Embed YouTube/Vimeo video
                  <iframe
                    src={
                      tour.video_url.includes("youtube.com/watch")
                        ? tour.video_url.replace("watch?v=", "embed/")
                        : tour.video_url.includes("youtu.be")
                        ? `https://www.youtube.com/embed/${tour.video_url
                            .split("/")
                            .pop()}`
                        : tour.video_url.includes("vimeo.com")
                        ? tour.video_url.replace(
                            "vimeo.com",
                            "player.vimeo.com/video"
                          )
                        : tour.video_url
                    }
                    title={tourName}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  // Fallback to cover image with play button
                  <>
                    <img
                      src={tourImage}
                      alt={tourName}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition-opacity duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/40 text-white shadow-xl transition-transform duration-300 group-hover:scale-110 pl-1">
                        <IconPlay className="w-6 h-6 fill-current" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wide border border-white/10">
                      {tour?.video_url ? "Video giới thiệu" : "Ảnh bìa tour"}
                    </div>
                  </>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 h-16 sm:h-20 shrink-0">
                {/* Gallery Thumbnails from API */}
                {tour?.gallery?.slice(0, 3).map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all"
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt={`Gallery ${idx + 1}`}
                    />
                  </div>
                ))}
                {tour?.gallery?.length > 3 && (
                  <div className="rounded-xl overflow-hidden cursor-pointer bg-gray-100 flex items-center justify-center text-xs font-bold text-text-secondary border-2 border-transparent hover:border-primary transition-all hover:bg-primary/5 hover:text-primary">
                    +{tour.gallery.length - 3} ảnh
                  </div>
                )}
                {/* Fallback if no gallery */}
                {(!tour?.gallery || tour.gallery.length === 0) && (
                  <div className="col-span-4 text-center text-xs text-text-secondary py-4">
                    Chưa có ảnh bổ sung
                  </div>
                )}
              </div>
            </div>
            <div className="w-full aspect-video lg:aspect-auto lg:h-full rounded-3xl border border-primary/20 bg-primary/5 p-1">
              <div className="h-full w-full rounded-[20px] bg-white border border-white/50 overflow-hidden relative group cursor-pointer" onClick={() => has3DModel && setIs3DModalOpen(true)}>
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm border border-primary/10">
                    <Icon3D className="w-3.5 h-3.5" /> {first3DModel?.file_type === "panorama" ? "Panorama 360°" : "3D Model"}
                  </span>
                  {total3DModels > 1 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-black/50 backdrop-blur text-[10px] font-bold text-white">
                      {total3DModels} ảnh
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 bg-gray-900">
                  {has3DModel ? (
                    // Hiển thị ảnh 3D thực từ dữ liệu
                    first3DModel.file_type === "panorama" ? (
                      <img
                        src={first3DModel.file_url}
                        alt={first3DModel.name || "Panorama 360°"}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                      />
                    ) : (
                      // GLB/GLTF - hiển thị thumbnail hoặc placeholder
                      <img
                        src={first3DModel.thumbnail_url || "/images/placeholders/3d-model-placeholder.jpg"}
                        alt={first3DModel.name || "3D Model"}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                      />
                    )
                  ) : (
                    // Placeholder khi không có 3D model
                    <img
                      src="/images/placeholders/3d-model-placeholder.jpg"
                      alt="3D Model"
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      className={`px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all backdrop-blur-sm border border-white/20 ${
                        has3DModel 
                          ? "bg-primary/90 text-white hover:bg-primary hover:scale-105" 
                          : "bg-gray-500/70 text-white/80 cursor-not-allowed"
                      }`}
                      disabled={!has3DModel}
                    >
                      {has3DModel ? (first3DModel.file_type === "panorama" ? "Xem Panorama 360°" : "Tương tác 3D") : "Chưa có 3D"}
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-white/60 text-[10px] font-medium uppercase tracking-wider">
                      {has3DModel ? (first3DModel.name || "Nhấn để xem chi tiết") : "Sắp có"}
                    </span>
                    {has3DModel && total3DModels > 1 && (
                      <span className="text-white/80 text-[10px] font-medium">
                        Xem tất cả {total3DModels} ảnh 360° →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. MAIN CONTENT (Overview & Itinerary) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 relative z-10 pt-6">
            <div className="md:col-span-7 space-y-8">
              <section className="space-y-3">
                <h2 className="text-2xl font-heading font-bold text-text-primary">
                  Tổng quan
                </h2>
                <div className="prose prose-sm text-text-secondary leading-relaxed space-y-3">
                  <p>
                    {tourDescription ||
                      "Khám phá những câu chuyện lịch sử và văn hóa của Huế thông qua chuyến tham quan độc đáo này."}
                  </p>
                </div>
              </section>
              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-text-primary">
                  Lịch trình
                </h2>
                {tourItinerary?.length > 0 ? (
                  <div className="relative border-l-2 border-border-light ml-3 space-y-6 pb-2">
                    {tourItinerary.map((item, idx) => (
                      <div key={idx} className="relative pl-6 group">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-primary group-hover:bg-primary transition-colors"></div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-primary uppercase tracking-wide">
                            {item.time || `Điểm ${item.order || idx + 1}`}
                          </span>
                          {item.locationId?.name && (
                            <span className="text-xs text-text-secondary bg-bg-main px-2 py-0.5 rounded-full flex items-center gap-1">
                              <IconMapPin className="w-3 h-3" />
                              {item.locationId.name}
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-text-primary mt-0.5">
                          {item.title || "Hoạt động"}
                        </h4>
                        <p className="text-sm text-text-secondary mt-1">
                          {item.details || "Chi tiết sẽ được cung cấp sau."}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary italic">
                    Lịch trình chi tiết sẽ được gửi sau khi đặt tour.
                  </p>
                )}
              </section>

              {/* Điểm nổi bật */}
              {tour.highlights?.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-2xl font-heading font-bold text-text-primary">
                    Điểm nổi bật
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tour.highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <IconCheck className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-sm text-text-primary">
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* 4. SIDEBAR (Guide & Booking Form) */}
            <div className="md:col-span-5 space-y-6 h-fit md:sticky md:top-24">
              {(() => {
                // Hiển thị HDV được chọn, nếu chọn "random" thì hiển thị mainGuide
                const displayGuide =
                  selectedGuide.value !== "random" && selectedGuide.guide
                    ? selectedGuide.guide
                    : mainGuide;

                if (!displayGuide) return null;

                const guideData = displayGuide.guideId || displayGuide;
                const isMain = displayGuide.isMain || displayGuide.isPrimary;

                return (
                  <div className="rounded-3xl border border-border-light bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-text-primary font-heading">
                        Hướng dẫn viên
                        {selectedGuide.value !== "random" && (
                          <span className="ml-2 text-[10px] font-normal text-primary">
                            (Đã chọn)
                          </span>
                        )}
                      </h3>
                      <Link
                        to={`/guides/${guideData?._id || displayGuide._id}`}
                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        Xem hồ sơ <IconArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                        <img
                          src={
                            guideData?.avatar_url ||
                            "/images/placeholders/avatar.png"
                          }
                          className="w-full h-full object-cover"
                          alt="Guide"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">
                          {guideData?.name || "Hướng dẫn viên"}
                        </p>
                        <p className="text-[10px] text-text-secondary uppercase tracking-wide">
                          {isMain ? "HDV Chính" : "HDV"} • VI / EN
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-[#BC4C00] font-bold mt-0.5">
                          <IconStar className="w-3 h-3" />{" "}
                          {guideData?.rating?.toFixed(1) || "5.0"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="rounded-3xl border border-border-light bg-white p-5 shadow-lg shadow-black/5 space-y-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-text-secondary">Giá từ</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-heading font-bold text-primary">
                        {BASE_PRICE.toLocaleString("vi-VN")}₫
                      </span>
                      <span className="text-xs text-text-secondary">
                        / người
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-[10px] font-bold">
                      Miễn phí hủy 24h
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1" ref={dateRef}>
                    <label className="text-xs font-bold text-text-secondary uppercase">
                      Ngày đi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div
                        onClick={() => setIsDateOpen(!isDateOpen)}
                        className={`w-full rounded-xl border px-3 py-2.5 text-sm text-left cursor-pointer transition-all select-none bg-bg-main/50 hover:border-primary/50 ${
                          isDateOpen
                            ? "border-primary ring-1 ring-primary bg-white"
                            : "border-border-light"
                        }`}
                      >
                        <span
                          className={
                            selectedDate
                              ? "text-text-primary"
                              : "text-text-secondary/60"
                          }
                        >
                          {selectedDate
                            ? format(selectedDate, "dd/MM/yyyy")
                            : "Chọn ngày"}
                        </span>
                      </div>
                      {isDateOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 z-50 animate-fade-in-up">
                          <div className="bg-white rounded-xl shadow-xl border border-border-light p-3">
                            <DayPicker
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleSelectDate}
                              locale={vi}
                              disabled={{ before: new Date() }}
                              fromDate={new Date()}
                              modifiersClassNames={{
                                selected:
                                  "bg-primary text-white rounded-full hover:bg-primary",
                                today: "text-primary font-bold",
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Availability Status */}
                  {selectedDate && (
                    <div className="mt-2">
                      {availabilityLoading ? (
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <IconLoader className="w-3 h-3 animate-spin" />
                          <span>Đang kiểm tra...</span>
                        </div>
                      ) : availabilityStatus && (
                        <div className={`text-xs p-2 rounded-lg ${
                          availabilityStatus.available 
                            ? "bg-green-50 text-green-700 border border-green-200" 
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {availabilityStatus.available ? (
                            <div className="flex items-center gap-1.5">
                              <IconCheck className="w-3.5 h-3.5" />
                              <span>
                                {availabilityStatus.remainingSlots !== undefined 
                                  ? `Còn ${availabilityStatus.remainingSlots} chỗ trống`
                                  : "Ngày này khả dụng"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <IconX className="w-3.5 h-3.5" />
                              <span>{availabilityStatus.message || "Ngày này không khả dụng"}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-secondary uppercase">
                        Người lớn ({BASE_PRICE.toLocaleString("vi-VN")}₫)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={adults}
                        onChange={(e) =>
                          setAdults(Math.max(1, parseInt(e.target.value) || 0))
                        }
                        className="w-full rounded-xl border border-border-light bg-bg-main/50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-secondary uppercase">
                        Trẻ em ({CHILD_PRICE.toLocaleString("vi-VN")}₫)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={children}
                        onChange={(e) =>
                          setChildren(
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="w-full rounded-xl border border-border-light bg-bg-main/50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1" ref={guideRef}>
                    <label className="text-xs font-bold text-text-secondary uppercase">
                      Ưu tiên hướng dẫn viên
                    </label>
                    <div className="relative">
                      <div
                        onClick={() => setIsGuideOpen(!isGuideOpen)}
                        className={`w-full rounded-xl border px-3 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-all select-none bg-bg-main/50 hover:border-primary/50 ${
                          isGuideOpen
                            ? "border-primary ring-1 ring-primary bg-white"
                            : "border-border-light"
                        }`}
                      >
                        <span className="text-text-primary truncate">
                          {selectedGuide.label}
                        </span>
                        <IconChevronDown
                          className={`h-4 w-4 text-text-secondary transition-transform duration-200 ${
                            isGuideOpen ? "rotate-180 text-primary" : ""
                          }`}
                        />
                      </div>
                      {isGuideOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 z-50 animate-fade-in-up">
                          <div className="bg-white rounded-xl shadow-xl border border-border-light py-1 overflow-hidden max-h-60 overflow-y-auto">
                            {guideOptions.map((option) => (
                              <div
                                key={option.value}
                                onClick={() => handleSelectGuide(option)}
                                className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                                  selectedGuide.value === option.value
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-text-primary hover:bg-bg-main hover:text-primary"
                                }`}
                              >
                                {option.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-secondary uppercase">
                      Ghi chú
                    </label>
                    <textarea
                      rows="2"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full rounded-xl border border-border-light bg-bg-main/50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-all placeholder:text-text-secondary/60"
                      placeholder="Yêu cầu đặc biệt (ăn chay, xe lăn...)"
                    ></textarea>
                  </div>
                </div>
                <div className="pt-3 border-t border-border-light">
                  <div className="flex justify-between text-sm font-medium text-text-primary mb-4">
                    <span>Tổng cộng</span>
                    <span className="font-bold text-lg text-primary">
                      {totalPrice.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <button
                    onClick={handleBooking}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary text-white font-bold py-3.5 hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                  >
                    Đặt ngay <IconArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-center text-text-secondary mt-2">
                    Thanh toán an toàn qua VNPay / MoMo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 6. TOUR DETAILS SECTION - Tiện ích, Dịch vụ & Quy tắc */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-border-light">
            {/* Left Column: Image with overlay */}
            <div className="relative rounded-3xl overflow-hidden bg-bg-main shadow-xl min-h-[300px] md:min-h-[400px]">
              <img
                src={tour?.gallery?.[1] || tour?.cover_image_url || "/images/placeholders/scenic-placeholder.jpg"}
                alt={tourName}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              {/* Guide/Expert Card Overlay (Top Right) */}
              {mainGuide && (
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-3 flex items-center space-x-3 shadow-lg border border-white/20">
                  <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    <img
                      src={(mainGuide.guideId || mainGuide)?.avatar_url || "/images/placeholders/avatar.png"}
                      alt={(mainGuide.guideId || mainGuide)?.name || "HDV"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary leading-tight">
                      {(mainGuide.guideId || mainGuide)?.name || "Hướng dẫn viên"}
                    </p>
                    <div className="flex text-[#BC4C00] text-xs mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <IconStar key={i} className="w-3 h-3" />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Video thumbnail with play button (Bottom Left) - link to guide's video */}
              {tour?.guide_video_url && (
                <a
                  href={tour.guide_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-6 left-6 w-32 h-32 rounded-xl overflow-hidden shadow-2xl border-4 border-white group cursor-pointer block"
                >
                  <img
                    src={tour?.gallery?.[0] || tour?.cover_image_url || "/images/placeholders/video-thumbnail.jpg"}
                    alt="Video giới thiệu HDV"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-sm text-white border border-white/50 transition-transform group-hover:scale-110">
                      <IconPlay className="w-5 h-5 fill-current pl-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1 font-medium">
                    Video giới thiệu HDV
                  </div>
                </a>
              )}
            </div>

            {/* Right Column: Service Details, Amenities & Rules */}
            <div className="space-y-8">
              {/* Tiện ích */}
              <div>
                <h3 className="text-xl font-heading font-bold text-text-primary mb-4 flex items-center gap-2">
                  🎁 Tiện ích tour
                </h3>
                {(() => {
                  const amenitiesList = tour?.amenities?.length > 0 ? tour.amenities : defaultAmenities;
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {amenitiesList.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-text-secondary"
                        >
                          <IconCheck className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Bao gồm / Không bao gồm */}
              {(tour?.includes?.length > 0 || tour?.excludes?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Bao gồm */}
                  {tour.includes?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-green-600 uppercase flex items-center gap-1.5">
                        <IconCheck className="w-4 h-4" /> Bao gồm
                      </h3>
                      <ul className="space-y-2">
                        {tour.includes.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-text-secondary"
                          >
                            <IconCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Không bao gồm */}
                  {tour.excludes?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-red-500 uppercase flex items-center gap-1.5">
                        <IconX className="w-4 h-4" /> Không bao gồm
                      </h3>
                      <ul className="space-y-2">
                        {tour.excludes.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-text-secondary"
                          >
                            <IconX className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Quy tắc Tour */}
              <div>
                <h3 className="text-xl font-heading font-bold text-text-primary mb-4 flex items-center gap-2">
                  📋 Quy tắc tour
                </h3>
                <div className="space-y-2">
                  {(tour?.rules?.length > 0 ? tour.rules : defaultRules).map((rule, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-text-secondary mt-4 italic">
                  Mọi thắc mắc hoặc yêu cầu đặc biệt, vui lòng liên hệ trước với chúng tôi.
                </p>
              </div>

              {/* Contact Button */}
              <button className="w-full px-6 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-md hover:bg-orange-600 transition-colors">
                TƯ VẤN TỪ CHUYÊN GIA CỦA CHÚNG TÔI
              </button>
            </div>
          </div>

          {/* 5. REVIEWS */}
          <div className="pt-10 border-t border-border-light">
            <h2 className="text-2xl font-heading font-bold text-text-primary mb-6">
              Đánh giá{" "}
              <span className="text-lg font-normal text-text-secondary">
                ({tourReviewCount})
              </span>
            </h2>
            {reviewsLoading ? (
              <div className="text-center py-8">
                <IconLoader className="w-6 h-6 text-primary animate-spin mx-auto" />
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {reviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-border-light p-5 rounded-2xl shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          {review.reviewer?.avatar_url && (
                            <img
                              src={review.reviewer.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary">
                            {review.reviewer?.name || "Khách hàng"}
                          </p>
                          <p className="text-[10px] text-text-secondary">
                            {review.createdAt
                              ? format(
                                  new Date(review.createdAt),
                                  "dd/MM/yyyy",
                                  { locale: vi }
                                )
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex text-[#BC4C00]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <IconStar
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating ? "" : "opacity-30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed italic">
                      "{review.comment || "Trải nghiệm tuyệt vời!"}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary italic text-center py-8">
                Chưa có đánh giá nào. Hãy là người đầu tiên!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3D/PANORAMA VIEWER MODAL */}
      {is3DModalOpen && tour?.threeDModels?.length > 0 && (
        <PanoramaViewerModal
          models={tour.threeDModels}
          locations={tour.locations}
          onClose={() => setIs3DModalOpen(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// PANORAMA VIEWER MODAL COMPONENT (using Photo Sphere Viewer)
// ============================================================================
function PanoramaViewerModal({ models, locations, onClose }) {
  const viewerRef = useRef(null);
  const viewerInstance = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Group models by location
  const modelsByLocation = useMemo(() => {
    const groups = {};
    
    // Group models that have locationId
    models.forEach(model => {
      if (model.file_type !== "panorama") return;
      
      const locId = model.locationId?._id || model.locationId || "unknown";
      if (!groups[locId]) {
        // Find location info
        const locInfo = locations?.find(l => 
          (l.locationId?._id || l.locationId) === locId
        );
        groups[locId] = {
          id: locId,
          name: locInfo?.locationId?.name || model.name || "Địa điểm",
          models: []
        };
      }
      groups[locId].models.push(model);
    });

    // If no groups, create one default group
    if (Object.keys(groups).length === 0) {
      const panoramas = models.filter(m => m.file_type === "panorama");
      if (panoramas.length > 0) {
        groups["default"] = {
          id: "default",
          name: "Ảnh Panorama 360°",
          models: panoramas
        };
      }
    }

    return groups;
  }, [models, locations]);

  const locationKeys = Object.keys(modelsByLocation);
  const [currentLocationKey, setCurrentLocationKey] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Update currentLocationKey when locationKeys change
  useEffect(() => {
    if (locationKeys.length > 0 && !currentLocationKey) {
      setCurrentLocationKey(locationKeys[0]);
    }
  }, [locationKeys, currentLocationKey]);

  const currentLocation = modelsByLocation[currentLocationKey];
  const currentModel = currentLocation?.models?.[currentImageIndex];
  const totalImages = currentLocation?.models?.length || 0;

  // Initialize Photo Sphere Viewer
  useEffect(() => {
    if (!viewerRef.current || !currentModel?.file_url) return;

    const initViewer = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamically import to avoid SSR issues
        const { Viewer } = await import("@photo-sphere-viewer/core");
        await import("@photo-sphere-viewer/core/index.css");

        // Destroy existing viewer
        if (viewerInstance.current) {
          viewerInstance.current.destroy();
        }

        viewerInstance.current = new Viewer({
          container: viewerRef.current,
          panorama: currentModel.file_url,
          navbar: ["zoom", "fullscreen"],
          defaultZoomLvl: 50,
          touchmoveTwoFingers: false,
          mousewheelCtrlKey: false,
          loadingTxt: "Đang tải ảnh 360°...",
        });

        viewerInstance.current.addEventListener("ready", () => {
          setIsLoading(false);
        });

        viewerInstance.current.addEventListener("error", (e) => {
          console.error("Panorama error:", e);
          setError("Không thể tải ảnh panorama");
          setIsLoading(false);
        });

      } catch (err) {
        console.error("Failed to init viewer:", err);
        setError("Không thể khởi tạo trình xem 360°");
        setIsLoading(false);
      }
    };

    initViewer();

    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.destroy();
        viewerInstance.current = null;
      }
    };
  }, [currentModel?.file_url]);

  // Change panorama without reinitializing
  const changePanorama = async (imageUrl) => {
    if (!viewerInstance.current || !imageUrl) return;
    
    try {
      setIsLoading(true);
      await viewerInstance.current.setPanorama(imageUrl, {
        transition: 1000,
        showLoader: true,
      });
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to change panorama:", err);
      setError("Không thể chuyển ảnh");
      setIsLoading(false);
    }
  };

  // Navigation handlers
  const goToImage = (index) => {
    if (index < 0 || index >= totalImages) return;
    setCurrentImageIndex(index);
    const model = currentLocation?.models?.[index];
    if (model?.file_url && viewerInstance.current) {
      changePanorama(model.file_url);
    }
  };

  const nextImage = () => goToImage(currentImageIndex + 1);
  const prevImage = () => goToImage(currentImageIndex - 1);

  const changeLocation = (key) => {
    setCurrentLocationKey(key);
    setCurrentImageIndex(0);
    const firstModel = modelsByLocation[key]?.models?.[0];
    if (firstModel?.file_url && viewerInstance.current) {
      changePanorama(firstModel.file_url);
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  // Handle arrow keys for navigation
  useEffect(() => {
    const handleKeys = (e) => {
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    document.addEventListener("keydown", handleKeys);
    return () => document.removeEventListener("keydown", handleKeys);
  }, [currentImageIndex, totalImages]);

  if (locationKeys.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
        <div className="text-white text-center">
          <Icon3D className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Không có ảnh panorama 360°</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-start justify-between">
          <div className="text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Icon3D className="w-5 h-5" />
              {currentLocation?.name || "Panorama 360°"}
            </h3>
            {currentModel?.description && (
              <p className="text-sm text-white/70 mt-1 max-w-lg">{currentModel.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <IconX className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Viewer Container */}
      <div ref={viewerRef} className="flex-1 w-full" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
          <div className="text-center text-white">
            <IconLoader className="w-10 h-10 animate-spin mx-auto mb-2" />
            <p className="text-sm">Đang tải ảnh 360°...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40">
          <div className="text-center text-white">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => { setError(null); goToImage(currentImageIndex); }}
              className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/90"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          
          {/* Location selector (if multiple locations) */}
          {locationKeys.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {locationKeys.map((key) => {
                const loc = modelsByLocation[key];
                const isActive = key === currentLocationKey;
                return (
                  <button
                    key={key}
                    onClick={() => changeLocation(key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? "bg-primary text-white border-primary"
                        : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                    } border`}
                  >
                    {loc.name} ({loc.models.length})
                  </button>
                );
              })}
            </div>
          )}

          {/* Image navigation */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prevImage}
              disabled={currentImageIndex === 0}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <span>◀</span> Ảnh trước
            </button>

            <div className="text-white text-sm font-medium bg-white/10 px-4 py-2 rounded-full">
              {currentImageIndex + 1} / {totalImages}
            </div>

            <button
              onClick={nextImage}
              disabled={currentImageIndex >= totalImages - 1}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              Ảnh tiếp <span>▶</span>
            </button>
          </div>

          {/* Thumbnail strip (if more than 1 image) */}
          {totalImages > 1 && (
            <div className="flex gap-2 justify-center overflow-x-auto py-2 px-4 -mx-4">
              {currentLocation?.models?.map((model, idx) => (
                <button
                  key={model._id || idx}
                  onClick={() => goToImage(idx)}
                  className={`flex-shrink-0 w-16 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === currentImageIndex
                      ? "border-primary ring-2 ring-primary/50"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={model.thumbnail_url || model.file_url}
                    alt={`Ảnh ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Instructions */}
          <p className="text-white/50 text-xs text-center">
            Kéo để xoay 360° • Cuộn để zoom • Mũi tên ←→ để chuyển ảnh • ESC để đóng
          </p>
        </div>
      </div>
    </div>
  );
}
