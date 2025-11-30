// src/pages/Home/FeaturedTours.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TourCard from "../../components/Cards/TourCard";
import ButtonSvgMask from "../../components/Forms/ButtonSvgMask";
import IconArrowRight from "../../icons/IconArrowRight.jsx";
import { toursApi } from "../../features/tours/api";
import { IconLoader } from "../../icons/IconCommon";

// Helper to convert MongoDB Decimal128 to number
const toNumber = (val) => {
  if (val?.$numberDecimal) return parseFloat(val.$numberDecimal);
  return parseFloat(val) || 0;
};

// Helper to normalize tour data from API to match component expectations
const normalizeTour = (tour) => ({
  id: tour._id || tour.id,
  title: tour.name || tour.title,
  location: tour.locations?.[0]?.locationId?.name || tour.location || "Huế",
  duration: tour.duration || "N/A",
  rating: toNumber(tour.average_rating || tour.rating || 0),
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

export default function FeaturedTours() {
  const [activeTab, setActiveTab] = useState("all");
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([
    { id: "all", label: "Tất cả" },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch featured tours and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch tours and categories in parallel
        const [toursResponse, categoriesResponse] = await Promise.all([
          toursApi.getFeaturedTours(12),
          toursApi.getCategories().catch(() => ({ categories: [] })),
        ]);

        // Process tours - API returns { items, limit }
        let toursData = Array.isArray(toursResponse?.items)
          ? toursResponse.items.map(normalizeTour)
          : Array.isArray(toursResponse)
          ? toursResponse.map(normalizeTour)
          : [];

        // If we have fewer than 6 featured tours, fetch all tours
        if (toursData.length < 6) {
          try {
            const allToursResponse = await toursApi.listTours({ limit: 12 });
            toursData = Array.isArray(allToursResponse?.items)
              ? allToursResponse.items.map(normalizeTour)
              : Array.isArray(allToursResponse?.tours)
              ? allToursResponse.tours.map(normalizeTour)
              : toursData;
          } catch (err) {
            console.error("Error fetching all tours:", err);
          }
        }

        setTours(toursData);

        // Process categories - add "all" option
        const categoriesData = Array.isArray(categoriesResponse?.categories)
          ? categoriesResponse.categories
          : [];

        const categoryOptions = [
          { id: "all", label: "Tất cả" },
          ...categoriesData
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((cat) => ({
              id: cat._id,
              label: cat.name,
              slug: cat.slug,
            })),
        ];

        setCategories(categoryOptions);
      } catch (err) {
        console.error("Fetch data error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter tours by category
  const filteredTours = Array.isArray(tours)
    ? activeTab === "all"
      ? tours
      : tours.filter((tour) => {
          const categoryId = tour.category_id?._id || tour.category_id;
          const categoryIds = tour.categories?.map((c) => c._id || c) || [];
          const categorySlug = tour.category_id?.slug || tour.category;

          const matchesById =
            categoryId === activeTab || categoryIds.includes(activeTab);
          const matchesBySlug =
            categorySlug &&
            categories.find((c) => c.id === activeTab)?.slug === categorySlug;

          return matchesById || matchesBySlug;
        })
    : [];

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
      {isLoading ? (
        <div className="flex items-center justify-center py-20 relative z-10">
          <IconLoader className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
          {displayTours.map((tour) => (
            <div
              key={tour._id || tour.id}
              className="transition-all duration-500 ease-out"
            >
              <TourCard tour={tour} />
            </div>
          ))}
        </div>
      )}

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
