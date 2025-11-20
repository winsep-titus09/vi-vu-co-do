// src/pages/Home/FeaturedPosts.jsx

import React from "react";
import { Link } from "react-router-dom";
import BlogCard from "../../components/Cards/BlogCard";
import { IconMapPin } from "../../icons/IconBox.jsx"; // Dùng icon Map Pin làm điểm nhấn header

// Mock Data: Bài viết (Cập nhật nội dung du lịch)
const posts = [
  {
    id: 1,
    slug: "huong-dan-du-lich-quoc-te",
    title: "Hướng Dẫn Du Lịch Quốc Tế: Những điều cần biết khi đến Huế",
    date: "27 Tháng 4 2023",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg", // Ảnh placeholder
  },
  {
    id: 2,
    slug: "meo-cho-ky-nghi-gia-dinh",
    title: "Mẹo Về Điểm Đến Cho Kỳ Nghỉ Gia Đình Tại Cố Đô",
    date: "02 Tháng 5 2023",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
  },
  {
    id: 3,
    slug: "goi-du-lich-gia-re",
    title: "Gói Du Lịch Trải Nghiệm Văn Hóa Giá Rẻ Mùa Hè Này",
    date: "15 Tháng 6 2023",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
  },
  {
    id: 4,
    slug: "diem-den-tiep-theo",
    title: "Điểm Đến Cho Chuyến Du Ngoạn Tiếp Theo: Phá Tam Giang",
    date: "20 Tháng 8 2023",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
  },
];

export default function FeaturedPosts() {
  return (
    // Sử dụng nền map-bg như mẫu
    <section className="relative py-20 lg:py-28 bg-[#fcfaf5] overflow-hidden">
      {/* Background Map (Mờ) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: "url('/images/placeholders/map-bg.png')" }}
      />

      <div className="container-main relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex flex-col items-center justify-center gap-2 mb-2">
            {/* Icon trang trí */}
            <IconMapPin className="w-8 h-8 text-text-primary" />
            {/* Subtitle (Font viết tay hoặc serif nghiêng) */}
            <p className="font-serif italic text-xl text-text-primary">
              Thông tin du lịch
            </p>
          </div>

          {/* Main Title */}
          <h2 className="!text-3xl md:text-4xl lg:text-5xl font-heading font-black text-text-primary uppercase tracking-tight">
            Tin tức & Cập nhật Du lịch
          </h2>
        </div>

        {/* Grid Posts (4 cột theo mẫu) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
