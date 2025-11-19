// src/pages/Home/Heritage3DSection.jsx

import React from "react";
import { Link } from "react-router-dom";
import ButtonSvgMask from "../../components/Forms/ButtonSvgMask";
import Icon360 from "../../icons/Icon360.jsx";
import IconMouse from "../../icons/IconMouse.jsx";

export default function Heritage3DSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-[#1a1a1a]">
      {/* Background Image (Giả lập không gian 3D) */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img
          src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/ngomon_3d_placeholder.jpg"
          alt="Ngọ Môn 3D"
          className="w-full h-full object-cover"
        />
        {/* Gradient phủ mờ để làm nổi bật text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent"></div>
      </div>

      <div className="container-main relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Cột Trái: Nội dung dẫn dắt */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-secondary/30 bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">
              <Icon360 className="w-4 h-4" />
              <span>Công nghệ thực tế ảo</span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-heading font-bold text-white leading-tight">
              Chạm vào quá khứ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-[#f3e5ab]">
                trong không gian 3D
              </span>
            </h2>

            <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
              Không chỉ là hình ảnh. Hãy tự do xoay, phóng to và khám phá từng
              chi tiết kiến trúc của Đại Nội, Lăng Tự Đức... ngay trên màn hình
              của bạn trước khi đặt chân đến.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <ButtonSvgMask href="/3d-tours" className="inline-flex">
                Trải nghiệm ngay
              </ButtonSvgMask>

              {/* Hướng dẫn nhỏ */}
              <div className="flex items-center gap-3 text-gray-500 text-sm">
                <IconMouse className="w-6 h-6 animate-bounce" />
                <span>Kéo để xoay • Cuộn để phóng to</span>
              </div>
            </div>
          </div>

          {/* Cột Phải: Demo tương tác giả lập */}
          <div className="relative w-full aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/50 group cursor-move">
            {/* Ảnh tĩnh giả lập 3D Model */}
            <img
              src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/model_3d_preview.png"
              alt="3D Model Preview"
              className="w-full h-full object-contain opacity-90 transition-transform duration-1000 group-hover:scale-110"
            />

            {/* Hotspot (Điểm nóng) - Hiệu ứng Pulse */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 group">
              <span className="relative flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-secondary border-2 border-black"></span>
              </span>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1 bg-white/90 text-black text-xs font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                Lầu Ngũ Phụng
              </div>
            </div>

            {/* UI Controls giả */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur px-4 py-2 rounded-full border border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer text-white font-bold">
                -
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer text-white font-bold">
                +
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary text-black flex items-center justify-center font-bold text-xs">
                3D
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
