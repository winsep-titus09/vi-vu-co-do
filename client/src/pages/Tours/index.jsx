// src/pages/Tours/index.jsx

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import FilterBar from "../../components/Filters/FilterBar";
import TourCard from "../../components/Cards/TourCard";
import { IconChevronDown } from "../../icons/IconChevronDown";
import IconChevronLeft from "../../icons/IconChevronLeft";
import IconChevronRight from "../../icons/IconChevronRight";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { toursApi } from "../../features/tours/api";
import { IconLoader } from "../../icons/IconCommon";

// Helper to convert MongoDB Decimal128 to number
const toNumber = (val) => {
  if (val?.$numberDecimal) return parseFloat(val.$numberDecimal);
  return parseFloat(val) || 0;
};

// Helper to normalize tour data from API
const normalizeTour = (tour) => ({
  id: tour._id || tour.id,
  title: tour.name || tour.title,
  location: tour.locations?.[0]?.locationId?.name || tour.location || "Huế",
  duration: tour.duration || "N/A",
  rating: toNumber(
    tour.average_rating || tour.avgRating || tour.avg_rating || tour.rating || 0
  ),
  price: toNumber(tour.price || 0),
  category: tour.category_id?.slug || tour.category,
  description: tour.description || "",
  image:
    tour.cover_image_url ||
    tour.image_url ||
    tour.images?.[0] ||
    tour.image ||
    "",
  ...tour,
});

// Sort options - moved outside component to prevent recreation
const sortOptions = [
  "Phổ biến nhất",
  "Giá thấp đến cao",
  "Giá cao đến thấp",
  "Đánh giá cao nhất",
  "Mới nhất",
];

export default function ToursPage() {
  // State cho tours data
  const [tours, setTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({});
  const limit = 12;

  // State cho Dropdown Sắp xếp
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Phổ biến nhất");
  const sortRef = useRef(null);

  // Fetch tours from API
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setIsLoading(true);
        const params = {
          page: currentPage,
          limit: limit,
        };

        // Map filter fields to API params
        if (filters.keyword) params.q = filters.keyword;
        if (filters.category) params.category_id = filters.category;
        if (filters.date) params.start_date = filters.date;
        if (filters.maxPrice) params.price_max = filters.maxPrice;

        // Add sorting logic
        if (sortBy === "Giá thấp đến cao") params.sort = "price";
        else if (sortBy === "Giá cao đến thấp") params.sort = "-price";
        else if (sortBy === "Đánh giá cao nhất")
          params.sort = "-average_rating";
        else if (sortBy === "Mới nhất") params.sort = "-createdAt";

        const response = await toursApi.listTours(params);

        const toursData = Array.isArray(response?.items)
          ? response.items.map(normalizeTour)
          : Array.isArray(response)
          ? response.map(normalizeTour)
          : [];

        setTours(toursData);
        setTotalCount(response?.total || toursData.length);
        setTotalPages(Math.ceil((response?.total || toursData.length) / limit));
      } catch (err) {
        console.error("Fetch tours error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTours();
  }, [currentPage, sortBy, filters]);

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

  const handleSelectSort = useCallback((option) => {
    setSortBy(option);
    setIsSortOpen(false);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  // Memoize pagination calculation
  const paginationPages = useMemo(() => {
    return Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
      let pageNum;
      if (totalPages <= 5) {
        pageNum = i + 1;
      } else if (currentPage <= 3) {
        pageNum = i + 1;
      } else if (currentPage >= totalPages - 2) {
        pageNum = totalPages - 4 + i;
      } else {
        pageNum = currentPage - 2 + i;
      }
      return pageNum;
    });
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-bg-main pb-20">
      {/* Header & Filter Section */}
      <section className="relative pt-10 pb-12 bg-linear-to-b from-white to-bg-main z-30">
        <div className="container-main space-y-6 relative">
          <Breadcrumbs items={[{ label: "Chuyến tham quan" }]} />
          {/* Tiêu đề & Mô tả */}
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-2">
              Khám phá Cố đô
            </p>
            <h1 className="text-4xl! md:text-5xl font-heading font-bold text-text-primary">
              Tìm chuyến đi của bạn
            </h1>
            {/* CẬP NHẬT: Thêm dòng <p> mô tả dưới H1 */}
            <p className="text-lg text-text-secondary mt-4 max-w-2xl leading-relaxed">
              Hơn 50+ tour độc đáo được thiết kế bởi các chuyên gia địa phương,
              giúp bạn trải nghiệm Huế một cách trọn vẹn nhất.
            </p>
          </div>

          {/* Filter Bar */}
          <FilterBar onFilterChange={handleFilterChange} />
        </div>
      </section>

      {/* Tours Grid Section */}
      <section className="container-main py-4 relative z-10">
        {/* Toolbar: Số lượng & Sắp xếp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <span className="text-sm font-medium text-text-secondary">
            Hiển thị{" "}
            <span className="text-text-primary font-bold">{totalCount}</span>{" "}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <IconLoader className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : tours.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <TourCard key={tour._id || tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-text-secondary text-lg">
              Không tìm thấy tour nào phù hợp với bộ lọc của bạn.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 text-primary font-bold hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Pagination (Modern Style) */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2">
            {/* Nút Trước */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-border-light bg-white text-text-secondary hover:bg-primary/5 hover:text-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconChevronLeft className="w-5 h-5" />
            </button>

            {/* Các trang */}
            {paginationPages.map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all ${
                  currentPage === pageNum
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                    : "text-text-secondary hover:bg-white hover:text-primary hover:shadow-sm"
                }`}
              >
                {pageNum}
              </button>
            ))}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="w-10 h-10 flex items-center justify-center text-text-secondary/50">
                  ...
                </span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:bg-white hover:text-primary hover:shadow-sm transition-all"
                >
                  {totalPages}
                </button>
              </>
            )}

            {/* Nút Sau */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-border-light bg-white text-text-secondary hover:bg-primary/5 hover:text-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
