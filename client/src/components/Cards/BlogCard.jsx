// src/components/Cards/BlogCard.jsx

import React from "react";
import { Link } from "react-router-dom";

export default function BlogCard({ post }) {
  // Tách ngày tháng để hiển thị theo style Badge dọc
  // Giả sử format date là "27 Th4, 2023"
  const [day, ...rest] = post.date.split(" ");
  const restDate = rest.join(" ");

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group relative block h-full overflow-hidden cursor-pointer"
    >
      {/* 1. Wrapper tạo hình dáng viền xước nghệ thuật (Giả lập bằng border border-white dày) */}
      <div className="relative h-[400px] w-full overflow-hidden transition-transform duration-500 hover:-translate-y-2">
        {/* Lớp viền trắng giả lập khung tranh (Tạo cảm giác ảnh được dán lên tường) */}
        <div className="absolute inset-0 border-[6px] border-white/40 z-20 pointer-events-none rounded-[2px]"></div>

        {/* Ảnh Background */}
        <img
          src={post.image}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Gradient Overlay (Để đọc chữ) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>

        {/* 2. Badge Ngày tháng (Góc trên phải - Giống tờ giấy dán) */}
        <div className="absolute top-4 right-4 z-30 bg-[#fcfaf5] text-text-primary px-3 py-2 text-center shadow-md rotate-3 group-hover:rotate-0 transition-transform duration-300">
          <span className="block text-xl font-heading font-bold leading-none text-secondary">
            {day}
          </span>
          <span className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            {restDate}
          </span>
        </div>

        {/* 3. Nội dung (Nằm đè lên ảnh ở dưới cùng) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
          <h3 className="!text-xl font-heading font-bold text-white mb-3 leading-tight line-clamp-3 group-hover:text-secondary transition-colors">
            {post.title}
          </h3>

          <div className="inline-flex items-center text-sm font-bold text-white border-b-2 border-secondary pb-0.5 hover:text-secondary transition-colors">
            Đọc Thêm
          </div>
        </div>
      </div>
    </Link>
  );
}
