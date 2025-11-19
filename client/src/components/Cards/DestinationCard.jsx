// src/components/Cards/DestinationCard.jsx

import React from "react";

/**
 * Thẻ Địa điểm (Destination Card) - Dạng bo tròn (theo image_dedcd9.jpg).
 *
 * @param {object} props
 * @param {string} props.imageUrl - Link ảnh
 * @param {string} props.title - Tên địa điểm
 */
export default function DestinationCard({ imageUrl, title }) {
  return (
    <a
      href="#"
      className="block w-full h-full rounded-[40px] overflow-hidden relative group"
    >
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      {/* Lớp phủ và Text (Tùy chọn - ảnh của bạn không có) */}
      <div className="absolute inset-0 bg-black/20"></div>
      <span className="absolute bottom-4 left-4 text-white font-medium text-lg">
        {title}
      </span>
    </a>
  );
}
