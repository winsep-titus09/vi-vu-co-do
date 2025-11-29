// src/pages/Tours/index.jsx

import React, { useState, useRef, useEffect } from "react";
import FilterBar from "../../components/Filters/FilterBar";
import TourCard from "../../components/Cards/TourCard";
import { IconChevronDown } from "../../icons/IconChevronDown";
import IconChevronLeft from "../../icons/IconChevronLeft";
import IconChevronRight from "../../icons/IconChevronRight";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";

// Mock Data
const toursData = [
  {
    id: 1,
    title: "Bí mật Hoàng cung Huế",
    location: "Đại Nội",
    duration: "4 giờ",
    rating: 4.8,
    price: 45,
    description:
      "Khám phá những câu chuyện thâm cung bí sử ít người biết tại Tử Cấm Thành cùng nhà sử học.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
  },
  {
    id: 2,
    title: "Hoàng hôn trên phá Tam Giang",
    location: "Quảng Điền",
    duration: "5 giờ",
    rating: 4.9,
    price: 40,
    description:
      "Trải nghiệm đời sống ngư dân, chèo thuyền SUP và thưởng thức hải sản tươi sống ngay trên đầm phá.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/cautrangtien1.jpg",
  },
  {
    id: 3,
    title: "Food Tour: Ẩm thực đường phố",
    location: "Chợ Đông Ba",
    duration: "3 giờ",
    rating: 5.0,
    price: 25,
    description:
      "Thưởng thức 10 món đặc sản Huế: Bún bò, bánh bèo, nậm, lọc, chè hẻm... tại các quán gia truyền.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_3.jpg",
  },
  {
    id: 4,
    title: "Lăng tẩm & Phong thủy",
    location: "Lăng Tự Đức",
    duration: "4 giờ",
    rating: 4.7,
    price: 35,
    description:
      "Tìm hiểu về kiến trúc phong thủy độc đáo trong các lăng tẩm triều Nguyễn.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg",
  },
  {
    id: 5,
    title: "Thiền trà tại Chùa Từ Hiếu",
    location: "Dương Xuân",
    duration: "3 giờ",
    rating: 4.9,
    price: 30,
    description:
      "Tìm về sự an yên, thưởng trà và nghe pháp thoại tại ngôi chùa cổ kính.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuatuhieu1.jpg",
  },
  {
    id: 6,
    title: "Đạp xe về làng Thanh Thủy",
    location: "Thủy Thanh",
    duration: "6 giờ",
    rating: 4.8,
    price: 50,
    description:
      "Khám phá cầu ngói Thanh Toàn, trải nghiệm làm nông dân và nấu ăn cùng người địa phương.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_4.jpg",
  },
];

// Sort options
const sortOptions = [
  "Phổ biến nhất",
  "Giá thấp đến cao",
  "Giá cao đến thấp",
  "Đánh giá cao nhất",
  "Mới nhất",
];

export default function ToursPage() {
  // State cho Dropdown Sắp xếp
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Phổ biến nhất");
  const sortRef = useRef(null);

  // Xử lý click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSort = (option) => {
    setSortBy(option);
    setIsSortOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg-main pb-20">
      {/* Header & Filter Section */}
      <section className="relative pt-10 pb-12 bg-gradient-to-b from-white to-bg-main z-30">
        <div className="container-main space-y-6 relative">
          <Breadcrumbs items={[{ label: "Chuyến tham quan" }]} />
          {/* Tiêu đề & Mô tả */}
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-2">
              Khám phá Cố đô
            </p>
            <h1 className="!text-4xl md:text-5xl font-heading font-bold text-text-primary">
              Tìm chuyến đi của bạn
            </h1>
            {/* CẬP NHẬT: Thêm dòng <p> mô tả dưới H1 */}
            <p className="text-lg text-text-secondary mt-4 max-w-2xl leading-relaxed">
              Hơn 50+ tour độc đáo được thiết kế bởi các chuyên gia địa phương,
              giúp bạn trải nghiệm Huế một cách trọn vẹn nhất.
            </p>
          </div>

          {/* Filter Bar */}
          <FilterBar />
        </div>
      </section>

      {/* Tours Grid Section */}
      <section className="container-main py-4 relative z-10">
        {/* Toolbar: Số lượng & Sắp xếp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <span className="text-sm font-medium text-text-secondary">
            Hiển thị{" "}
            <span className="text-text-primary font-bold">
              {toursData.length}
            </span>{" "}
            kết quả
          </span>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-sm text-text-secondary hidden sm:inline">
              Sắp xếp theo:
            </span>

            {/* Dropdown Sắp xếp */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className={`
                  inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all shadow-sm
                  ${
                    isSortOpen
                      ? "border-primary text-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border-light bg-white text-text-primary hover:border-primary"
                  }
                `}
              >
                {sortBy}
                <IconChevronDown
                  className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${
                    isSortOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-border-light py-1 z-50 animate-fade-in-up overflow-hidden">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSelectSort(option)}
                      className={`
                        w-full text-left px-4 py-2.5 text-sm transition-colors
                        ${
                          sortBy === option
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-text-primary hover:bg-bg-main hover:text-primary"
                        }
                      `}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid Tours */}
        {toursData.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {toursData.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-text-secondary text-lg">
              Không tìm thấy tour nào phù hợp với bộ lọc của bạn.
            </p>
            <button className="mt-4 text-primary font-bold hover:underline">
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Pagination (Modern Style) */}
        <div className="mt-16 flex items-center justify-center gap-2">
          {/* Nút Trước */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-border-light bg-white text-text-secondary hover:bg-primary/5 hover:text-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <IconChevronLeft className="w-5 h-5" />
          </button>

          {/* Các trang */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white font-bold shadow-md shadow-primary/20 transition-transform hover:scale-105">
            1
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:bg-white hover:text-primary hover:shadow-sm transition-all">
            2
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:bg-white hover:text-primary hover:shadow-sm transition-all">
            3
          </button>
          <span className="w-10 h-10 flex items-center justify-center text-text-secondary/50">
            ...
          </span>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:bg-white hover:text-primary hover:shadow-sm transition-all">
            8
          </button>

          {/* Nút Sau */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full border border-border-light bg-white text-text-secondary hover:bg-primary/5 hover:text-primary hover:border-primary transition-all">
            <IconChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
