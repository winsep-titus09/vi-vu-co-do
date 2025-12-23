// src/components/Cards/GuideCard.jsx

import React from "react";
import { Link } from "react-router-dom";
import IconStarSolid from "../../icons/IconStarSolid.jsx";
import IconVerify from "../../icons/IconVerify.jsx";

/**
 * GuideCard - Style: Portrait & Reveal Bio on Hover
 * Wrapped with React.memo for performance optimization
 */
const GuideCard = React.memo(function GuideCard({ guide }) {
  const ratingValue = (() => {
    const n = Number(guide.rating);
    return Number.isFinite(n) ? n : 0;
  })();

  const formattedRating = (() => {
    if (!Number.isFinite(ratingValue)) return "0";
    if (Number.isInteger(ratingValue)) return String(ratingValue);
    return ratingValue.toFixed(1);
  })();

  const experienceLabel = (() => {
    const yearsRaw = guide.experienceYears ?? guide.experience;
    const years = Number(yearsRaw);
    if (Number.isFinite(years) && years > 0) return `${years} năm kinh nghiệm`;
    return "Kinh nghiệm: chưa cập nhật";
  })();

  return (
    <Link
      to={`/guides/${guide.id}`}
      className="group relative block h-full overflow-hidden rounded-2xl cursor-pointer"
    >
      {/* Image: Portrait (3:4 ratio) */}
      <div className="relative aspect-[3/4] w-full">
        <img
          src={guide.image}
          alt={guide.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>

        {/* Badge: Ngôn ngữ (Góc trên phải) */}
        <div className="absolute top-3 right-3 flex gap-1 z-10">
          {guide.languages.map((lang, index) => (
            <span
              key={index}
              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/90 backdrop-blur shadow-sm text-[10px] font-bold text-text-primary uppercase"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Floating info card */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/50 transition-all duration-300 group-hover:-translate-y-1">
          {/* Header: Name + Verification badge */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-heading font-bold text-text-primary flex items-center gap-1 min-w-0 pr-2">
              <span className="truncate">{guide.name}</span>
              <IconVerify className="w-4 h-4 text-blue-500 shrink-0" />
            </h3>

            <div className="flex items-center gap-1 text-xs font-bold text-[#BC4C00] shrink-0">
              <IconStarSolid className="w-3.5 h-3.5 fill-[#BC4C00]" />
              {formattedRating}
            </div>
          </div>

          {/* Specialty (always visible) */}
          <p className="text-xs font-medium text-primary uppercase tracking-wide truncate">
            {guide.specialty}
          </p>

          {/* Bio section (visible on hover) */}
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
            <div className="overflow-hidden">
              <div className="pt-3 mt-2 border-t border-border-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <p className="text-[11px] font-semibold text-primary mb-1">
                  {experienceLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default GuideCard;
