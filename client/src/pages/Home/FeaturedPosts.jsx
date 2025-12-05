// src/pages/Home/FeaturedPosts.jsx

import { useMemo } from "react";
import { Link } from "react-router-dom";
import BlogCard from "../../components/Cards/BlogCard";
import Spinner from "../../components/Loaders/Spinner";
import { useArticles } from "../../features/posts/hooks";
import { IconMapPin } from "../../icons/IconBox.jsx"; // Dùng icon Map Pin làm điểm nhấn header

export default function FeaturedPosts() {
  const { articles, isLoading } = useArticles({ limit: 4, status: "approved" });

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

  return (
    // Sử dụng nền map-bg như mẫu
    <section className="relative py-20 lg:py-28 bg-bg-main overflow-hidden">
      {/* Background Map (Mờ) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: "url('/images/placeholders/map-bg.png')" }}
      />

      <div className="container-main relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex flex-col items-center justify-center gap-2 mb-2">
            {/* Icon trang trí */}
            <IconMapPin className="w-8 h-8 text-text-primary" />
            {/* Subtitle (Font viết tay hoặc serif nghiêng) */}
            <p className="font-serif italic text-xl text-text-primary">
              Thông tin du lịch
            </p>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl! md:text-4xl lg:text-5xl font-heading font-black text-text-primary uppercase tracking-tight">
            Tin tức & Cập nhật Du lịch
          </h2>
        </div>

        {/* Grid Posts (4 cột theo mẫu) */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mappedArticles.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
