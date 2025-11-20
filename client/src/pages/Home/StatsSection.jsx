// src/pages/Home/StatsSection.jsx

import React from "react";
import ButtonSvgMask from "../../components/Forms/ButtonSvgMask";
import { IconMapPin } from "../../icons/IconBox.jsx";

// Dữ liệu thống kê (Mock data phù hợp với Vi Vu Cố Đô)
const stats = [
  {
    id: 1,
    number: "50+",
    label: "Hướng dẫn viên bản địa", // [cite: 1]
    desc: "Am hiểu sâu sắc văn hóa Huế",
  },
  {
    id: 2,
    number: "120+",
    label: "Di tích & Điểm đến", // [cite: 30]
    desc: "Từ Đại Nội đến phá Tam Giang",
  },
  {
    id: 3,
    number: "1,500+",
    label: "Du khách hài lòng", // [cite: 130]
    desc: "Đánh giá 5 sao về trải nghiệm",
  },
  {
    id: 4,
    number: "300+",
    label: "Lộ trình độc bản", // [cite: 20]
    desc: "Thiết kế riêng theo sở thích",
  },
];

export default function StatsSection() {
  return (
    <section className="relative pb-20 lg:pb-28 bg-bg-main overflow-hidden group">
      {/* 1. Background Map */}
      {/* CẬP NHẬT:
          - Thay 'group-hover:scale-110' thành 'group-hover:translate-x-10'.
          - Tăng thời gian duration-[5s] để di chuyển mượt mà hơn.
          - Thêm 'scale-105' mặc định để ảnh to hơn khung một chút, 
            tránh bị hở viền khi di chuyển.
      */}
      <div
        className="
          absolute inset-0 z-0 pointer-events-none 
          bg-center bg-no-repeat bg-contain
          scale-105 
          transition-transform duration-[2s] ease-in-out
          group-hover:translate-x-10
        "
        style={{ backgroundImage: "url('/images/placeholders/map-bg.png')" }}
      />

      <div className="container-main relative z-10 pt-10">
        {/* 2. Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-secondary">
              <IconMapPin className="w-8 h-8" />
            </div>
            <p className="font-heading font-bold text-xl text-text-primary italic">
              Vi Vu Cố Đô
            </p>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-text-primary leading-tight">
            Kết nối đam mê, <br />
            <span className="text-primary">Kiến tạo trải nghiệm</span>
          </h2>
        </div>

        {/* 3. Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16">
          {stats.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center text-center group/item"
            >
              {/* Vòng tròn trang trí */}
              <div className="relative w-32 h-32 flex items-center justify-center mb-6 transition-transform duration-500 group-hover/item:-translate-y-2">
                {/* Vòng tròn xoay nhẹ */}
                <div className="absolute inset-0 rounded-full border-4 border-secondary/30 border-dashed animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border-2 border-secondary/60" />

                <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary relative z-10">
                  {item.number}
                </span>
              </div>

              <h3 className="!text-lg font-bold text-text-primary mb-2">
                {item.label}
              </h3>
              <p className="text-sm text-text-secondary font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* 4. CTA Button */}
        <div className="flex justify-center">
          <ButtonSvgMask href="/blog" className="inline-flex">
            Cẩm nang
          </ButtonSvgMask>
        </div>
      </div>
    </section>
  );
}
