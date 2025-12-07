// src/components/Hero/Hero.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import IconArrowRight from "../../icons/IconArrowRight.jsx";
import IconBookOpen from "../../icons/IconBookOpen.jsx";
import IconShieldCheck from "../../icons/IconShieldCheck.jsx";
import { Icon3D, IconStar } from "../../icons/IconBox.jsx";
import IconLang from "../../icons/IconLang.jsx";
import IconArrowUpRight from "../../icons/IconArrowUpRight.jsx";
import { toursApi } from "../../features/tours/api.js";
import { formatCurrency } from "../../lib/formatters.js";

// Helper to convert MongoDB Decimal128 to number
const toNumber = (val) => {
  if (val?.$numberDecimal) return parseFloat(val.$numberDecimal);
  return parseFloat(val) || 0;
};

// Normalize tour data from API
const normalizeTour = (tour) => ({
  _id: tour._id,
  slug: tour.slug,
  title: tour.name || tour.title,
  coverImage: tour.cover_image_url || tour.gallery?.[0] || tour.images?.[0],
  images: tour.gallery || tour.images || [],
  rating: toNumber(tour.average_rating || tour.rating || 0),
  price: toNumber(tour.price || 0),
  duration: tour.duration_hours || tour.duration || 0,
  durationUnit: tour.duration_unit || (tour.duration_hours ? "hours" : "days"),
  category: tour.category_id || tour.categories?.[0],
  subtitle: tour.description?.substring(0, 80),
  shortDescription: tour.description,
  fixedDepartureTime: tour.fixed_departure_time || "08:00",
  allowCustomDate: tour.allow_custom_date !== false,
  ...tour,
});

/**
 * Hero Section - Phong cách Heritage Trails
 */
export default function Hero() {
  const [featuredTour, setFeaturedTour] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTour = async () => {
      try {
        setIsLoading(true);
        const data = await toursApi.getFeaturedTours(1);
        // Lấy tour đầu tiên từ danh sách
        const tours = data?.items || data || [];
        if (tours.length > 0) {
          // Normalize tour data to match expected field names
          setFeaturedTour(normalizeTour(tours[0]));
        }
      } catch (error) {
        console.error("Error fetching featured tour:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedTour();
  }, []);

  // Format duration - ưu tiên duration_hours
  const formatDuration = (tour) => {
    // Ưu tiên duration_hours (đơn vị giờ)
    if (tour.duration_hours && tour.duration_hours > 0) {
      const hours = tour.duration_hours;
      const wholeHours = Math.floor(hours);
      const mins = Math.round((hours - wholeHours) * 60);
      
      if (wholeHours === 0) return `${mins} phút`;
      if (mins === 0) return `${wholeHours} giờ`;
      return `${wholeHours}h${mins}`;
    }
    
    // Fallback: duration + duration_unit
    const duration = tour.duration;
    const unit = tour.duration_unit || "days";
    
    if (!duration || duration <= 0) return "N/A";
    
    if (unit === "hours") {
      const wholeHours = Math.floor(duration);
      const mins = Math.round((duration - wholeHours) * 60);
      if (wholeHours === 0) return `${mins} phút`;
      if (mins === 0) return `${wholeHours} giờ`;
      return `${wholeHours}h${mins}`;
    }
    
    // Đơn vị là ngày
    if (duration === 1) return "1 ngày";
    return `${duration} ngày`;
  };

  // Get departure time display
  const getDepartureDisplay = () => {
    if (!featuredTour) return "Liên hệ";
    
    const time = featuredTour.fixedDepartureTime || "08:00";
    
    if (featuredTour.allowCustomDate) {
      // Cho phép chọn ngày tự do
      return (
        <>
          {time} <span className="text-text-secondary font-normal">· Tự chọn</span>
        </>
      );
    }
    
    // Giờ cố định hàng ngày
    return (
      <>
        {time} <span className="text-text-secondary font-normal">· Hàng ngày</span>
      </>
    );
  };

  return (
    // CẬP NHẬT:
    // - 'pt-5': Padding top 20px cố định.
    // - 'pb-10 lg:pb-20': Padding bottom thay đổi theo màn hình.
    // - Đã XÓA 'lg:py-20' để tránh ghi đè top.
    <section className="container-main pt-8 pb-10 lg:pb-20">
      <div className="grid gap-10 lg:gap-16 lg:grid-cols-2 items-center">
        {/* --- CỘT TRÁI: Nội dung chính --- */}
        <div className="space-y-6 lg:space-y-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
            Du lịch Văn hoá & Di sản
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-text-primary leading-tight">
            Khám phá những câu chuyện <br className="hidden sm:inline" />
            <span className="text-primary">vượt thời gian</span> cùng chuyên
            gia.
          </h1>

          <p className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed">
            Kết nối trực tiếp với hướng dẫn viên bản địa, trải nghiệm di sản Huế
            qua lăng kính chân thực và khám phá những góc khuất lịch sử ít người
            biết đến.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/tours"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-white text-sm font-bold px-6 py-3 shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
            >
              Khám phá Tour <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-border-light bg-white text-sm font-bold text-text-primary px-6 py-3 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200"
            >
              Cẩm nang du lịch <IconBookOpen className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-text-secondary pt-2">
            <div className="flex items-center gap-2">
              <IconShieldCheck className="w-4 h-4 text-secondary" />
              <span>HDV được xác thực</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon3D className="w-4 h-4 text-secondary" />
              <span>Trải nghiệm Di sản 3D</span>
            </div>
            <div className="flex items-center gap-2">
              <IconLang className="w-4 h-4 text-secondary" />
              <span>Đa ngôn ngữ</span>
            </div>
          </div>
        </div>

        {/* --- CỘT PHẢI: Featured Card --- */}
        <div className="relative mt-8 lg:mt-0 w-full lg:max-w-[560px] lg:mx-auto">
          {/* Card Container */}
          <div className="rounded-[28px] border border-white/50 bg-white/60 backdrop-blur-md shadow-2xl p-5 space-y-5 relative z-10">
            {isLoading ? (
              // Loading skeleton
              <div className="animate-pulse space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    <div className="h-6 w-48 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-14 bg-gray-200 rounded-full"></div>
                </div>
                <div className="aspect-video bg-gray-200 rounded-xl"></div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
                <div className="h-12 bg-gray-200 rounded-full"></div>
              </div>
            ) : featuredTour ? (
              <>
                {/* Card Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                      Tour Tiêu Biểu
                    </p>
                    <h2 className="text-2xl! font-heading font-bold text-text-primary line-clamp-1">
                      {featuredTour.title}
                    </h2>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#FEFAE0] text-[#BC4C00] text-xs font-bold px-2.5 py-1 border border-[#BC4C00]/10 shrink-0">
                    <IconStar filled className="w-3 h-3 mr-1 text-[#BC4C00]" />
                    {featuredTour.rating?.toFixed(1) || "5.0"}
                  </span>
                </div>

                {/* Card Image */}
                <div className="aspect-video rounded-xl bg-slate-100 overflow-hidden relative group">
                  <img
                    src={
                      featuredTour.coverImage ||
                      featuredTour.images?.[0] ||
                      "/images/placeholders/tour-placeholder.jpg"
                    }
                    alt={featuredTour.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-5 px-5 text-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondary mb-1">
                        {featuredTour.category?.name || "Trải nghiệm 3D"}
                      </p>
                      <p className="text-sm font-medium text-white line-clamp-1">
                        {featuredTour.subtitle ||
                          featuredTour.shortDescription ||
                          "Khám phá di sản văn hóa Huế"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <dl className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-bg-main border border-border-light text-center">
                    <dt className="text-text-secondary mb-1 text-[10px] uppercase">
                      Thời gian
                    </dt>
                    <dd className="font-bold text-text-primary">
                      ~{formatDuration(featuredTour)}
                    </dd>
                  </div>
                  <div className="p-2.5 rounded-xl bg-bg-main border border-border-light text-center">
                    <dt className="text-text-secondary mb-1 text-[10px] uppercase">
                      Giá từ
                    </dt>
                    <dd className="font-bold text-text-primary">
                      {formatCurrency(featuredTour.price)}
                    </dd>
                  </div>
                  <div className="p-2.5 rounded-xl bg-bg-main border border-border-light text-center">
                    <dt className="text-text-secondary mb-1 text-[10px] uppercase">
                      Giờ đi
                    </dt>
                    <dd className="font-bold text-text-primary text-[11px] leading-tight">
                      {getDepartureDisplay()}
                    </dd>
                  </div>
                </dl>

                {/* CTA Button */}
                <Link
                  to={`/tours/${featuredTour.slug || featuredTour._id}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-text-primary text-white text-sm font-bold px-4 py-3 hover:bg-primary transition-colors duration-300"
                >
                  Xem chi tiết tour <IconArrowUpRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              // Fallback static content
              <>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                      Tour Tiêu Biểu
                    </p>
                    <h2 className="text-2xl! font-heading font-bold text-text-primary">
                      Dạo bộ Đại Nội về đêm
                    </h2>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#FEFAE0] text-[#BC4C00] text-xs font-bold px-2.5 py-1 border border-[#BC4C00]/10">
                    <IconStar className="w-3 h-3 mr-1" />
                    4.9
                  </span>
                </div>

                <div className="aspect-video rounded-xl bg-slate-100 overflow-hidden relative group">
                  <img
                    src="/images/placeholders/tour-placeholder.jpg"
                    alt="Đại Nội Huế"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-5 px-5 text-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-secondary mb-1">
                        Trải nghiệm 3D
                      </p>
                      <p className="text-sm font-medium text-white">
                        Ngọ Môn Quan – Tương tác thực tế ảo
                      </p>
                    </div>
                  </div>
                </div>

                <dl className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-bg-main border border-border-light text-center">
                    <dt className="text-text-secondary mb-1 text-[10px] uppercase">
                      Thời lượng
                    </dt>
                    <dd className="font-bold text-text-primary">2.5 giờ</dd>
                  </div>
                  <div className="p-2.5 rounded-xl bg-bg-main border border-border-light text-center">
                    <dt className="text-text-secondary mb-1 text-[10px] uppercase">
                      Giá từ
                    </dt>
                    <dd className="font-bold text-text-primary">250k ₫</dd>
                  </div>
                  <div className="p-2.5 rounded-xl bg-bg-main border border-border-light text-center">
                    <dt className="text-text-secondary mb-1 text-[10px] uppercase">
                      Khởi hành
                    </dt>
                    <dd className="font-bold text-text-primary">
                      18:00 Tối nay
                    </dd>
                  </div>
                </dl>

                <Link
                  to="/tours"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-text-primary text-white text-sm font-bold px-4 py-3 hover:bg-primary transition-colors duration-300"
                >
                  Xem chi tiết tour <IconArrowUpRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Decorative Elements (Background blobs) */}
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-secondary/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary/20 rounded-full blur-3xl -z-10"></div>
        </div>
      </div>
    </section>
  );
}
