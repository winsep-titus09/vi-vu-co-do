import React from "react";
import { useParams, Link } from "react-router-dom";
import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
import TourCard from "../../../components/Cards/TourCard";
import {
  IconStar,
  IconPlay,
  IconCalendar,
  IconCheck,
} from "../../../icons/IconBox";
import IconVerify from "../../../icons/IconVerify";
import IconShieldCheck from "../../../icons/IconShieldCheck";
import IconMail from "../../../icons/IconMail";
import IconLang from "../../../icons/IconLang";
import IconBookOpen from "../../../icons/IconBookOpen";
import IconCraft from "../../../icons/IconCraft";
import IconLotus from "../../../icons/IconLotus";

// --- MOCK DATA ---
const guideDetail = {
  id: 1,
  name: "Minh Hương",
  role: "Nhà sử học & Văn hóa",
  avatar: "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/chandung/1.jpg",
  cover:
    "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
  rating: 4.9,
  reviews: 122,
  experience: 5,
  languages: ["Tiếng Việt", "English"],
  cert: "Thẻ HDV Quốc tế - Số: 123456",
  bio: "Xin chào! Tôi là Hương, người con của Thành Nội. Tôi không chỉ dẫn đường, tôi kể cho bạn nghe những câu chuyện lịch sử sống động đằng sau từng viên gạch của Cố đô.",
  videoIntro:
    "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/hoanghon.jpg",
  tours: [
    {
      id: 1,
      title: "Bí mật Hoàng cung Huế",
      location: "Đại Nội",
      duration: "4 giờ",
      rating: 4.8,
      price: 45,
      image:
        "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
    },
    {
      id: 5,
      title: "Thiền trà tại Chùa Từ Hiếu",
      location: "Dương Xuân",
      duration: "3 giờ",
      rating: 4.9,
      price: 30,
      image:
        "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuatuhieu1.jpg",
    },
  ],
  // Mock Availability (Lịch trống)
  availability: [
    { day: "T2", date: "20", status: "busy" },
    { day: "T3", date: "21", status: "free" },
    { day: "T4", date: "22", status: "free" },
    { day: "T5", date: "23", status: "busy" },
    { day: "T6", date: "24", status: "free" },
    { day: "T7", date: "25", status: "free" },
    { day: "CN", date: "26", status: "busy" },
  ],
};

export default function GuideProfile() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-bg-main pb-24 pt-0 md:pb-20">
      {/* 1. COVER IMAGE */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden group">
        <img
          src={guideDetail.cover}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt="Cover"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
      </div>

      <div className="container-main relative -mt-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT SIDEBAR (INFO) --- */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-3xl p-6 shadow-card border border-border-light text-center relative ">
              <div className="absolute top-0 left-0 w-full h-24 bg-primary/5 pointer-events-none rounded-t-3xl"></div>

              {/* Avatar */}
              <div className="relative w-32 h-32 mx-auto -mt-20 mb-4 group cursor-pointer">
                <img
                  src={guideDetail.avatar}
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-md transition-transform group-hover:scale-105"
                  alt="Avatar"
                />
                <div
                  className="absolute bottom-1 right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white tooltip"
                  data-tip="Đã xác thực"
                >
                  <IconVerify className="w-4 h-4" />
                </div>
              </div>

              <h1 className="text-2xl font-heading font-bold text-text-primary mb-1">
                {guideDetail.name}
              </h1>
              <p className="text-sm text-primary font-bold uppercase tracking-wider mb-4 bg-primary/10 inline-block px-3 py-1 rounded-full">
                {guideDetail.role}
              </p>
              {id && (
                <p className="text-xs text-text-secondary mb-4">
                  Mã hồ sơ: #{id}
                </p>
              )}

              <div className="flex justify-center gap-2 mb-6">
                {guideDetail.languages.map((lang, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-bg-main rounded-lg text-xs font-bold text-text-secondary border border-border-light flex items-center gap-1"
                  >
                    <IconLang className="w-3 h-3" /> {lang}
                  </span>
                ))}
              </div>

              {/* Stats (Đã tăng padding-top lên 6) */}
              <div className="grid grid-cols-2 gap-4 border-t border-border-light pt-6 mb-6">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-text-primary">
                    {guideDetail.rating}
                  </span>
                  <span className="text-xs text-text-secondary flex justify-center items-center gap-1">
                    <IconStar className="w-3 h-3 text-secondary fill-current" />
                    Đánh giá
                  </span>
                </div>
                <div className="text-center border-l border-border-light">
                  <span className="block text-2xl font-bold text-text-primary">
                    {guideDetail.experience}+
                  </span>
                  <span className="text-xs text-text-secondary">Năm KN</span>
                </div>
              </div>

              {/* Desktop CTA */}
              <div className="hidden md:block space-y-3">
                <button className="w-full py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95">
                  Liên hệ ngay
                </button>
                <button className="w-full py-2.5 rounded-xl border border-border-light text-text-secondary hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2 bg-white">
                  <IconMail className="w-4 h-4" /> Nhắn tin
                </button>
              </div>
            </div>

            {/* 1. WIDGET: LỊCH TRỐNG TUẦN NÀY */}
            <div className="bg-white rounded-3xl p-6 border border-border-light shadow-sm">
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <IconCalendar className="w-5 h-5 text-primary" /> Lịch trình
                tuần này
              </h3>
              <div className="grid grid-cols-7 gap-2 text-center mb-4">
                {guideDetail.availability.map((slot, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-text-secondary font-bold uppercase">
                      {slot.day}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all cursor-pointer
                        ${
                          slot.status === "free"
                            ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                            : "bg-gray-50 text-gray-300 border-transparent cursor-not-allowed"
                        }`}
                    >
                      {slot.date}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Trống
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div> Bận
                </span>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-3xl p-6 border border-border-light shadow-sm">
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <IconShieldCheck className="w-5 h-5 text-green-500" /> Xác thực
                & Chứng chỉ
              </h3>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <IconCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Đã xác minh danh tính</span>
                </li>
                <li className="flex items-start gap-2">
                  <IconCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{guideDetail.cert}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* --- RIGHT CONTENT --- */}
          <div className="lg:col-span-8 space-y-10 pt-4 md:pt-24">
            {/* 2. SECTION: USP (TẠI SAO CHỌN TÔI?) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-white text-primary shadow-sm flex items-center justify-center mb-3">
                  <IconBookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-text-primary mb-1">
                  Kiến thức sâu
                </h4>
                <p className="text-xs text-text-secondary">
                  Am hiểu lịch sử triều Nguyễn và văn hóa cung đình.
                </p>
              </div>
              <div className="bg-secondary/10 border border-secondary/20 p-5 rounded-2xl flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-white text-secondary shadow-sm flex items-center justify-center mb-3">
                  <IconCraft className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-text-primary mb-1">
                  Hỗ trợ chụp ảnh
                </h4>
                <p className="text-xs text-text-secondary">
                  Biết các góc chụp đẹp và hỗ trợ du khách lưu giữ khoảnh khắc.
                </p>
              </div>
              <div className="bg-green-50 border border-green-100 p-5 rounded-2xl flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-white text-green-600 shadow-sm flex items-center justify-center mb-3">
                  <IconLotus className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-text-primary mb-1">Tận tâm</h4>
                <p className="text-xs text-text-secondary">
                  Luôn lắng nghe và tùy chỉnh lịch trình theo sức khỏe khách.
                </p>
              </div>
            </div>

            {/* Bio & Video */}
            <section className="space-y-6">
              <h2 className="text-2xl font-heading font-bold text-text-primary">
                Giới thiệu
              </h2>
              <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
                <p className="text-text-secondary leading-relaxed text-lg mb-6">
                  "{guideDetail.bio}"
                </p>

                {/* Video Embed */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black group cursor-pointer">
                  <img
                    src={guideDetail.videoIntro}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                    alt="Video thumb"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border border-white/50 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <IconPlay className="w-8 h-8 fill-current ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tours Managed */}
            <section>
              <h2 className="text-2xl font-heading font-bold text-text-primary mb-6">
                Các chuyến đi tôi dẫn (2)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guideDetail.tours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section className="border-t border-border-light pt-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-heading font-bold text-text-primary">
                  Đánh giá từ du khách
                </h2>
                <button className="px-4 py-2 rounded-full border border-border-light text-sm font-bold hover:bg-white hover:border-primary transition-all">
                  Xem tất cả 122 đánh giá
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="bg-white p-6 rounded-3xl border border-border-light shadow-sm"
                  >
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-text-secondary">
                          H
                        </div>
                        <div>
                          <p className="font-bold text-sm text-text-primary">
                            Hoàng Nam
                          </p>
                          <p className="text-xs text-text-secondary">
                            Tháng 2, 2025
                          </p>
                        </div>
                      </div>
                      <div className="flex text-[#BC4C00] text-xs gap-0.5">
                        <IconStar className="w-3 h-3 fill-current" />
                        <IconStar className="w-3 h-3 fill-current" />
                        <IconStar className="w-3 h-3 fill-current" />
                        <IconStar className="w-3 h-3 fill-current" />
                        <IconStar className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary italic leading-relaxed">
                      "Chị Hương rất nhiệt tình và am hiểu lịch sử. Cách kể
                      chuyện lôi cuốn, không hề nhàm chán như mình nghĩ. Rất
                      đáng tiền!"
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* 3. STICKY MOBILE ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border-light shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 z-40 md:hidden flex items-center gap-3 safe-area-pb">
        <button className="w-14 h-12 rounded-xl border border-border-light text-primary flex flex-col items-center justify-center hover:bg-bg-main">
          <IconMail className="w-5 h-5" />
        </button>
        <button className="flex-1 bg-primary text-white h-12 rounded-xl font-bold text-sm shadow-lg shadow-primary/30 flex items-center justify-center gap-2 active:scale-95 transition-transform">
          Liên hệ / Đặt lịch
        </button>
      </div>
    </div>
  );
}
