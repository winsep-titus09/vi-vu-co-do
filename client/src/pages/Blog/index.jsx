// src/pages/Blog/index.jsx

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import BlogCard from "../../components/Cards/BlogCard";
import Spinner from "../../components/Loaders/Spinner";
import EmptyState from "../../components/Loaders/EmptyState";
import { useArticles, useArticleCategories } from "../../features/posts/hooks";

// Import Icons
import { IconSearch } from "../../icons/IconSearch.jsx";
import { IconChevronDown } from "../../icons/IconChevronDown.jsx";
import IconInstagram from "../../icons/IconInstagram.jsx";

// Mock Gallery (static content - Instagram feed)
const galleryImages = [
  "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/bachma1.1.jpg",
  "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/bachma2.jpg",
  "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/bachma3.jpg",
  "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/bachma4.jpg",
  "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/bachma5.jpg",
  "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/bachma6.jpg",
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const topicRef = useRef(null);

  // Fetch categories from API
  const { categories: apiCategories } = useArticleCategories();

  // Build categories array with "all" option
  const categories = useMemo(() => {
    const all = { _id: "all", name: "Tất cả chủ đề", slug: "all" };
    return [all, ...(apiCategories || [])];
  }, [apiCategories]);

  // Fetch articles with filters
  const params = useMemo(() => {
    const p = { limit: 20 };
    if (searchQuery) p.q = searchQuery;
    if (activeCategory !== "all") p.categoryId = activeCategory;
    return p;
  }, [searchQuery, activeCategory]);

  const { articles, isLoading, error } = useArticles(params);

  // Map articles to BlogCard format
  const mappedArticles = useMemo(() => {
    return (articles || []).map((article) => ({
      id: article._id,
      title: article.title,
      slug: article.slug || article._id,
      date: new Date(
        article.publishedAt || article.createdAt
      ).toLocaleDateString("vi-VN"),
      image:
        article.cover_image ||
        article.images?.[0] ||
        "/images/placeholders/hero_slide_1.jpg",
      category: article.categoryId?.name || "Bài viết",
      categoryId: article.categoryId?._id,
      author: article.authorId?.name || "Vi Vu Cố Đô",
    }));
  }, [articles]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (topicRef.current && !topicRef.current.contains(event.target)) {
        setIsTopicOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-bg-main pb-0 pt-6 overflow-x-hidden">
      <div className="container-main space-y-10">
        {/* 1. HEADER & TOOLBAR */}
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: "Cẩm nang du lịch" }]} />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                Blog & Tin tức
              </p>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-text-primary leading-tight">
                Góc nhìn thổ địa
              </h1>
              <p className="text-text-secondary text-lg leading-relaxed max-w-xl">
                Khám phá văn hóa, ẩm thực và những bí kíp du lịch Huế độc đáo
                được chia sẻ bởi cộng đồng hướng dẫn viên địa phương.
              </p>
            </div>

            {/* TOOLBAR */}
            <div className="w-full lg:w-auto flex flex-col md:flex-row gap-3">
              {/* Dropdown Chủ đề */}
              <div className="relative w-full md:w-48" ref={topicRef}>
                <div
                  onClick={() => setIsTopicOpen(!isTopicOpen)}
                  className={`
                    w-full h-[52px] px-4 flex items-center justify-between cursor-pointer rounded-2xl border transition-all select-none bg-white
                    ${
                      isTopicOpen
                        ? "border-primary ring-1 ring-primary"
                        : "border-border-light hover:border-primary/50"
                    }
                  `}
                >
                  <span className="text-sm font-medium text-text-primary truncate">
                    {categories.find((c) => c._id === activeCategory)?.name ||
                      "Chủ đề"}
                  </span>
                  <IconChevronDown
                    className={`w-4 h-4 text-text-secondary transition-transform ${
                      isTopicOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {isTopicOpen && (
                  <div className="absolute top-full right-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-border-light py-2 z-50 animate-fade-in-up">
                    {categories.map((cat) => (
                      <div
                        key={cat._id}
                        onClick={() => {
                          setActiveCategory(cat._id);
                          setIsTopicOpen(false);
                        }}
                        className={`
                          px-4 py-2.5 text-sm cursor-pointer transition-colors
                          ${
                            activeCategory === cat._id
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-text-primary hover:bg-bg-main hover:text-primary"
                          }
                        `}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[52px] pl-12 pr-4 rounded-2xl border border-border-light bg-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-secondary/60"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                  <IconSearch className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CATEGORY TABS (Desktop) */}
        <div className="hidden md:flex flex-wrap items-center gap-3 pb-2 border-b border-border-light/60">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`
                px-6 py-2.5 rounded-full text-sm font-bold transition-all border
                ${
                  activeCategory === cat._id
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white text-text-secondary border-border-light hover:border-primary hover:text-primary"
                }
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 3. BLOG GRID */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <EmptyState
            title="Lỗi tải dữ liệu"
            message={error}
            actionLabel="Thử lại"
            onAction={() => window.location.reload()}
          />
        ) : mappedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {mappedArticles.map((post) => (
              <div key={post.id}>
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-border-light">
            <p className="text-text-secondary">Không tìm thấy bài viết nào.</p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="text-primary font-bold hover:underline mt-2"
            >
              Xem tất cả
            </button>
          </div>
        )}
      </div>

      {/* 4. INFINITE GALLERY MARQUEE (Updated Background) */}
      <div className="w-full border-t border-border-light py-16 overflow-hidden relative bg-bg-main/30">
        {/* Background map pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none mix-blend-multiply">
          <img
            src="/images/placeholders/map-bg.png"
            alt="Map Pattern"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container-main mb-8 flex justify-between items-end relative z-10">
          <div>
            {/* Instagram icon */}
            <div className="flex items-center gap-2 mb-2 text-secondary">
              <IconInstagram className="w-5 h-5" />
              <p className="text-xs font-bold uppercase tracking-[0.2em]">
                Instagram
              </p>
            </div>
            <h3 className="text-3xl font-heading font-bold text-text-primary">
              Khoảnh khắc Vi Vu
            </h3>
          </div>
          <a
            href="#"
            className="text-sm font-bold text-primary hover:underline"
          >
            @vivucodo.hue
          </a>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full flex overflow-hidden group z-10">
          {/* Dải ảnh chạy */}
          <div className="flex gap-4 animate-marquee whitespace-nowrap py-4">
            {[...galleryImages, ...galleryImages].map((src, idx) => (
              <div
                key={idx}
                className="relative w-64 h-80 rounded-2xl overflow-hidden shrink-0 cursor-pointer hover:opacity-90 transition-opacity shadow-md"
              >
                <img
                  src={src}
                  alt={`Gallery ${idx}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors"></div>
              </div>
            ))}
          </div>
          {/* Dải ảnh lặp lại (Duplicate) */}
          <div
            className="flex gap-4 animate-marquee whitespace-nowrap py-4"
            aria-hidden="true"
          >
            {[...galleryImages, ...galleryImages].map((src, idx) => (
              <div
                key={`dup-${idx}`}
                className="relative w-64 h-80 rounded-2xl overflow-hidden shrink-0 cursor-pointer hover:opacity-90 transition-opacity shadow-md"
              >
                <img
                  src={src}
                  alt={`Gallery ${idx}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animation Style */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .group:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
