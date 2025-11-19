// src/components/Hero/Hero.jsx

import React from "react";
import { Link } from "react-router-dom";
import IconArrowRight from "../../icons/IconArrowRight.jsx";
import IconBookOpen from "../../icons/IconBookOpen.jsx";
import IconShieldCheck from "../../icons/IconShieldCheck.jsx";
import Icon3D from "../../icons/Icon3D.jsx";
import IconLang from "../../icons/IconLang.jsx";
import IconStar from "../../icons/IconStar.jsx";
import IconArrowUpRight from "../../icons/IconArrowUpRight.jsx";

/**
 * Hero Section - Phong cách Heritage Trails
 */
export default function Hero() {
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

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-text-primary leading-[1.1]">
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
            {/* Card Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                  Tour Tiêu Biểu
                </p>
                <h2 className="!text-2xl font-heading font-bold text-text-primary">
                  Dạo bộ Đại Nội về đêm
                </h2>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#FEFAE0] text-[#BC4C00] text-xs font-bold px-2.5 py-1 border border-[#BC4C00]/10">
                <IconStar className="w-3 h-3 mr-1" />
                4.9
              </span>
            </div>

            {/* Card Image (Visual 3D) */}
            <div className="aspect-video rounded-xl bg-slate-100 overflow-hidden relative group">
              <img
                src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg"
                alt="Đại Nội Huế"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-5 px-5 text-center">
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

            {/* Stats Grid */}
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
                <dd className="font-bold text-text-primary">18:00 Tối nay</dd>
              </div>
            </dl>

            {/* CTA Button */}
            <Link
              to="/tours/dai-noi-dem"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-text-primary text-white text-sm font-bold px-4 py-3 hover:bg-primary transition-colors duration-300"
            >
              Xem chi tiết tour <IconArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Decorative Elements (Background blobs) */}
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-secondary/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary/20 rounded-full blur-3xl -z-10"></div>
        </div>
      </div>
    </section>
  );
}
