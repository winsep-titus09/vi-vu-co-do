// src/pages/Home/FeaturedGuides.jsx

import React from "react";
import GuideCard from "../../components/Cards/GuideCard";
import ButtonSvgMask from "../../components/Forms/ButtonSvgMask";
import IconArrowRight from "../../icons/IconArrowRight.jsx";

// Mock Data: Hướng dẫn viên
const guides = [
  {
    id: 1,
    name: "Minh Hương",
    specialty: "Chuyên gia Lịch sử",
    rating: 4.9,
    languages: ["VN", "EN"],
    bio: "10 năm nghiên cứu về triều Nguyễn. Tôi sẽ kể cho bạn nghe những bí mật chưa từng được viết trong sách sử.",
    image: "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/chandung/1.jpg", // Bạn cần thay ảnh thật
  },
  {
    id: 2,
    name: "Đức Hiếu",
    specialty: "Nhiếp ảnh & Đời sống",
    rating: 5.0,
    languages: ["VN", "FR"],
    bio: "Đam mê ghi lại những khoảnh khắc đời thường. Cùng tôi săn những góc ảnh đẹp nhất tại Huế.",
    image: "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/chandung/3.jpg", // Bạn cần thay ảnh thật
  },
  {
    id: 3,
    name: "Thanh Trúc",
    specialty: "Ẩm thực Cung đình",
    rating: 4.8,
    languages: ["VN", "EN", "JP"],
    bio: "Sinh ra trong gia đình có truyền thống nấu ăn. Tôi sẽ đưa bạn đi nếm trọn vẹn hương vị Cố đô.",
    image: "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/chandung/2.jpg", // Bạn cần thay ảnh thật
  },
  {
    id: 4,
    name: "Hoàng Tùng",
    specialty: "Khám phá Thiên nhiên",
    rating: 4.9,
    languages: ["VN", "EN"],
    bio: "Yêu thích trekking và chèo SUP. Khám phá một Huế xanh mát và hùng vĩ cùng tôi.",
    image: "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/chandung/4.jpg", // Bạn cần thay ảnh thật
  },
];

export default function FeaturedGuides() {
  return (
    // CẬP NHẬT: Thêm bg-bg-main và overflow-hidden
    <section className="container-main py-16 lg:py-24 bg-bg-main relative overflow-hidden">
      {/* --- 1. BACKGROUND DECOR (Mới) --- */}
      {/* Blob Tím nhạt ở góc trên trái */}
      <div className="absolute top-[-10%] left-[-5%] w-[30%] h-[40%] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Blob Vàng nhạt ở góc dưới phải */}
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      {/* --- 2. Nội dung chính (z-10 để nổi lên trên nền) --- */}
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-2">
            Người kể chuyện Cố đô
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
            Gặp gỡ Thổ địa
          </h2>
          <p className="text-text-secondary text-sm md:text-base">
            Kết nối với những hướng dẫn viên bản địa đầy đam mê, được xác thực
            và sẵn sàng thiết kế hành trình riêng cho bạn.
          </p>
        </div>

        {/* Grid Guides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {guides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>

        {/* Bottom Action */}
        <div className="mt-12 text-center">
          <ButtonSvgMask href="/guides" className="inline-flex">
            <span className="flex items-center gap-2">
              Xem thêm <IconArrowRight className="w-4 h-4" />
            </span>
          </ButtonSvgMask>
        </div>
      </div>
    </section>
  );
}
