// src/pages/Home/FeaturedTours.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import TourCard from "../../components/Cards/TourCard";
import ButtonSvgMask from "../../components/Forms/ButtonSvgMask";
import IconArrowRight from "../../icons/IconArrowRight.jsx";

// --- Dữ liệu Mock (Giữ nguyên) ---
const allTours = [
  {
    id: 1,
    title: "Bí mật Hoàng thành",
    location: "Phố cổ",
    duration: "4 giờ",
    rating: 4.8,
    price: 58,
    category: "history",
    description:
      "Dạo qua hành lang được UNESCO công nhận, hầm chiến tranh bí mật và sân điện với nhà sử học.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
  },
  {
    id: 2,
    title: "Đền ven sông lúc hoàng hôn",
    location: "Khu ven sông",
    duration: "2.5 giờ",
    rating: 5.0,
    price: 35,
    category: "culture",
    description:
      "Các miếu thắp nến, nghi lễ ven sông và truyền thuyết địa phương do người kể chuyện bản địa chia sẻ.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg",
  },
  {
    id: 3,
    title: "Làng nghề & quán trà",
    location: "Ngõ nghệ nhân",
    duration: "Cả ngày",
    rating: 4.7,
    price: 95,
    category: "culture",
    description:
      "Gặp gỡ nghệ nhân, thử thủ công truyền thống và thưởng trà trong những nếp nhà cổ hàng thế kỷ.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuatuhieu1.jpg",
  },
  {
    id: 4,
    title: "Phá Tam Giang mùa nước nổi",
    location: "Ngoại ô",
    duration: "5 giờ",
    rating: 4.9,
    price: 45,
    category: "nature",
    description:
      "Ngắm hoàng hôn trên đầm phá lớn nhất Đông Nam Á và trải nghiệm cuộc sống ngư dân.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/cautrangtien1.jpg",
  },
  {
    id: 5,
    title: "Ẩm thực đường phố Huế",
    location: "Chợ Đông Ba",
    duration: "3 giờ",
    rating: 4.9,
    price: 30,
    category: "food",
    description:
      "Khám phá hương vị đậm đà của bún bò, bánh bèo, nậm, lọc tại những quán ăn lâu đời nhất.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_3.jpg",
  },
  {
    id: 6,
    title: "Thiền viện trúc lâm Bạch Mã",
    location: "Vườn quốc gia",
    duration: "6 giờ",
    rating: 4.8,
    price: 60,
    category: "nature",
    description:
      "Tìm về sự tĩnh lặng giữa thiên nhiên hùng vĩ và kiến trúc thiền phái Trúc Lâm đặc sắc.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_2.jpg",
  },
];

const categories = [
  { id: "all", label: "Tất cả" },
  { id: "history", label: "Di sản & Lịch sử" },
  { id: "culture", label: "Văn hóa & Ẩm thực" },
  { id: "nature", label: "Thiên nhiên" },
];

export default function FeaturedTours() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredTours =
    activeTab === "all"
      ? allTours
      : allTours.filter((tour) => {
          if (activeTab === "culture")
            return tour.category === "culture" || tour.category === "food";
          return tour.category === activeTab;
        });

  const displayTours = filteredTours.slice(0, 6);

  return (
    <section className="container-main py-8 lg:py-12 relative overflow-hidden">
      {/* --- BACKGROUND DECOR --- */}

      {/* 1. Dải màu mờ trên cùng (Fade-in từ section trên) */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white via-white/60 to-transparent z-0 pointer-events-none" />

      {/* 2. CẬP NHẬT: Bản đồ nền mờ (Map Background) */}
      {/* Đặt ở giữa (top-20) để làm nền cho tiêu đề và phần đầu của grid card */}
      <div
        className="absolute top-20 left-0 w-full h-[600px] bg-center bg-no-repeat bg-contain pointer-events-none z-0"
        style={{ backgroundImage: "url('/images/placeholders/map-bg.png')" }}
      />

      {/* --- 2. Header & Filter Tabs --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
            Bộ sưu tập độc quyền
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary">
            Tour Nổi Bật
          </h2>
          <p className="text-text-secondary max-w-md text-sm md:text-base mt-2">
            Những hành trình được yêu thích nhất, đưa bạn đi sâu vào lòng Cố đô.
          </p>
        </div>

        {/* Tabs lọc */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer
                ${
                  activeTab === cat.id
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                    : "bg-white/80 backdrop-blur-sm border border-border-light text-text-secondary hover:text-primary hover:border-primary/50"
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- 3. Grid Tours --- */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
        {displayTours.map((tour) => (
          <div key={tour.id} className="transition-all duration-500 ease-out">
            <TourCard tour={tour} />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayTours.length === 0 && (
        <div className="text-center py-20 relative z-10">
          <p className="text-text-secondary">
            Chưa có tour nào trong danh mục này.
          </p>
        </div>
      )}

      {/* --- 4. Bottom Action --- */}
      <div className="mt-12 text-center relative z-10">
        <ButtonSvgMask href="/tours" className="inline-flex">
          <span className="flex items-center gap-2">
            Xem tất cả <IconArrowRight className="w-4 h-4" />
          </span>
        </ButtonSvgMask>
      </div>
    </section>
  );
}
