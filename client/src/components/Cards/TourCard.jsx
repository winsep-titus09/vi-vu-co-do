// src/components/Cards/TourCard.jsx

import React from "react";
import { Link } from "react-router-dom";
import {
  IconMapPin,
  IconClock,
  IconStar,
  Icon3D,
  IconCheck,
} from "../../icons/IconBox.jsx";
import IconArrowRight from "../../icons/IconArrowRight.jsx";

/**
 * TourCard - Style: Transparent + Border + Artistic Image
 * Wrapped with React.memo for performance optimization
 */

// Helper to safely convert values to numbers (handle MongoDB Decimal128)
const toNumber = (val) => {
  if (val?.$numberDecimal) return parseFloat(val.$numberDecimal);
  return parseFloat(val) || 0;
};

const TourCard = React.memo(function TourCard({ tour }) {
  // Safely convert rating and price
  const rating = toNumber(tour.rating);
  // Fallback to average rating fields if rating missing
  const ratingValue = toNumber(
    tour.rating ?? tour.average_rating ?? tour.avgRating ?? tour.avg_rating ?? 0
  );
  const price = toNumber(tour.price);
  
  // Format duration: ưu tiên duration_hours, fallback duration (days)
  const formatDuration = () => {
    if (tour.duration_hours && tour.duration_hours > 0) {
      const hours = tour.duration_hours;
      if (hours < 1) return `${Math.round(hours * 60)} phút`;
      if (hours % 1 === 0) return `${hours} giờ`;
      return `${hours.toFixed(1)} giờ`;
    }
    if (tour.duration) {
      if (typeof tour.duration === "number") {
        return `${tour.duration} ${tour.duration_unit === "hours" ? "giờ" : "ngày"}`;
      }
      return tour.duration;
    }
    return "N/A";
  };
  
  // Lấy highlights hoặc fallback về description
  const highlights = tour.highlights || [];
  const displayHighlights = highlights.slice(0, 2);

  return (
    // 1. WRAPPER:
    // - Thêm border mỏng (border-border-light)
    // - Bỏ bg-white (để trùng màu nền section)
    // - Bỏ shadow mặc định (giữ cho nhẹ nhàng)
    <Link
      to={`/tours/${tour.slug || tour.id || tour._id}`}
      className="group flex flex-col h-full rounded-2xl border border-border-light hover:border-primary/50 transition-all duration-300"
    >
      {/* 2. ẢNH TOUR: Style nghệ thuật (Phiên bản đầu tiên) */}
      <div className="relative p-3 mb-2">
        {/* Viền brush giả lập (Border không đều, xoay nhẹ) */}
        <div className="absolute inset-0 border-2 border-text-primary/10 rounded-4xl rotate-1 group-hover:rotate-0 group-hover:border-primary/30 transition-all duration-300"></div>
        <div className="absolute inset-0 border-2 border-text-primary/5 rounded-4xl -rotate-1 group-hover:rotate-0 transition-all duration-300"></div>

        {/* Ảnh chính */}
        <div className="aspect-4/3 rounded-3xl overflow-hidden relative z-10">
          <img
            src={tour.image}
            alt={tour.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
          {/* === CẬP NHẬT: Badge 3D (Góc trên trái) === */}
          {/* Giả sử data tour có trường 'has3D' hoặc ta mặc định hiện để demo */}
          <div className="absolute top-3 left-3 z-20">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
              <Icon3D className="w-3 h-3" /> 3D View
            </span>
          </div>
          {/* Badges (Vị trí & Thời gian) */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-medium">
            <span className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/10">
              <IconMapPin className="w-3.5 h-3.5" />
              {tour.location}
            </span>
            <span className="inline-flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/10">
              <IconClock className="w-3.5 h-3.5" />
              {formatDuration()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. NỘI DUNG */}
      <div className="flex-1 flex flex-col space-y-3 px-4 pb-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg! font-heading font-bold text-text-primary leading-tight group-hover:text-primary transition-colors">
            {tour.title}
          </h3>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#BC4C00] bg-[#FEFAE0] rounded-full px-2 py-0.5 border border-[#BC4C00]/10 shrink-0">
            <IconStar filled className="w-3 h-3 text-[#BC4C00]" />
            {ratingValue.toFixed(1)}
          </span>
        </div>

        {/* Hiển thị highlights nếu có, fallback về description */}
        {displayHighlights.length > 0 ? (
          <div className="space-y-1.5 flex-1">
            {displayHighlights.map((highlight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-1.5 text-sm text-text-secondary"
              >
                <IconCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span className="line-clamp-1">{highlight}</span>
              </div>
            ))}
            {highlights.length > 2 && (
              <span className="text-xs text-primary font-medium">
                +{highlights.length - 2} điểm nổi bật khác
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-text-secondary line-clamp-2 flex-1">
            {tour.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border-light mt-auto">
          <span className="text-base font-bold text-primary">
            {price.toLocaleString("vi-VN")}₫{" "}
            <span className="text-xs font-normal text-text-secondary">
              / người
            </span>
          </span>

          <span className="inline-flex items-center gap-1 text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
            Chi tiết
            <IconArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
});

export default TourCard;
