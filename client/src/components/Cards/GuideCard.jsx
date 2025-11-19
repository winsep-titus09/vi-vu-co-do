// src/components/Cards/GuideCard.jsx

import React from "react";
import { Link } from "react-router-dom";
import IconStarSolid from "../../icons/IconStarSolid.jsx";
import IconVerify from "../../icons/IconVerify.jsx";

/**
 * GuideCard - Style: Portrait & Reveal Bio on Hover
 */
export default function GuideCard({ guide }) {
  return (
    <Link
      to={`/guides/${guide.id}`}
      className="group relative block h-full overflow-hidden rounded-2xl cursor-pointer"
    >
      {/* 1. Ảnh Chân Dung (Tỷ lệ 3:4) */}
      <div className="relative aspect-[3/4] w-full">
        <img
          src={guide.image}
          alt={guide.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient mờ ở đáy để làm nổi bật text */}
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

      {/* 2. Thông tin nổi (Floating Card) */}
      {/* CẬP NHẬT: Vị trí absolute bottom-4 */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/50 transition-all duration-300 group-hover:-translate-y-1">
          {/* Header: Tên + Verify */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-heading font-bold text-text-primary flex items-center gap-1">
              {guide.name}
              <IconVerify className="w-4 h-4 text-blue-500" />
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-[#BC4C00]">
              <IconStarSolid className="w-3.5 h-3.5 fill-[#BC4C00]" />
              {guide.rating}
            </div>
          </div>

          {/* Chuyên môn (Luôn hiển thị) */}
          <p className="text-xs font-medium text-primary uppercase tracking-wide">
            {guide.specialty}
          </p>

          {/* === CẬP NHẬT: Bio Section (Chỉ hiện khi Hover) === */}
          {/* Sử dụng kỹ thuật grid-rows để animate height từ 0 -> auto */}
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
            <div className="overflow-hidden">
              <div className="pt-3 mt-2 border-t border-border-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                {/* Bio hiển thị đầy đủ (không dùng line-clamp) */}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {guide.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
