// src/pages/Blog/PostDetail.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import Spinner from "../../components/Loaders/Spinner";
import EmptyState from "../../components/Loaders/EmptyState";
import { useArticle } from "../../features/posts/hooks";
import { toursApi } from "../../features/tours/api";
import { formatDate } from "../../lib/formatters";
// Correct icon imports: only some come from IconBox, others from individual files
import {
  IconClock,
  IconShare,
  IconBookmark,
  IconStar,
  IconMapPin,
  IconCalendar,
} from "../../icons/IconBox";
import { IconUser } from "../../icons/IconUser";
import IconArrowRight from "../../icons/IconArrowRight";
import BlogCard from "../../components/Cards/BlogCard";
import TourCard from "../../components/Cards/TourCard";

export default function PostDetail() {
  const { slug } = useParams(); // slug is actually the article ID from routes
  const [scrollProgress, setScrollProgress] = useState(0);
  const [relatedTours, setRelatedTours] = useState([]);
  const [toursLoading, setToursLoading] = useState(false);

  // Fetch article from API
  const { article, isLoading, error } = useArticle(slug);

  // Fetch related tours
  useEffect(() => {
    const fetchRelatedTours = async () => {
      try {
        setToursLoading(true);
        const response = await toursApi.getFeaturedTours(3);
        const tours = response?.items || response || [];
        setRelatedTours(tours.slice(0, 3));
      } catch (err) {
        console.error("Error fetching related tours:", err);
      } finally {
        setToursLoading(false);
      }
    };

    fetchRelatedTours();
  }, []);

  // Logic tính toán thanh tiến trình đọc
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div className="min-h-screen bg-bg-main pt-20">
        <div className="container-main">
          <EmptyState
            title="Không tìm thấy bài viết"
            message={error || "Bài viết không tồn tại hoặc chưa được phê duyệt"}
            actionLabel="Quay lại danh sách"
            onAction={() => (window.location.href = "/blog")}
          />
        </div>
      </div>
    );
  }

  // Map article data
  const postData = {
    id: article._id,
    title: article.title,
    category: article.categoryId?.name || "Bài viết",
    date: formatDate(article.publishedAt || article.createdAt),
    author: article.authorId?.name || "Vi Vu Cố Đô",
    readTime: `${Math.ceil(
      (article.content_html?.length || 0) / 1000
    )} phút đọc`,
    image:
      article.cover_image ||
      article.images?.[0] ||
      "/images/placeholders/hero_slide_1.jpg",
    content: article.content_html || "<p>Nội dung đang được cập nhật...</p>",
    authorAvatar:
      article.authorId?.avatar_url ||
      "/images/placeholders/avatar-placeholder.jpg",
    authorBio: article.authorId?.bio || "Hướng dẫn viên địa phương tại Huế",
  };

  return (
    <div className="min-h-screen bg-bg-main pb-20 pt-0">
      {/* 1. READING PROGRESS BAR (Fixed Top) */}
      <div className="fixed top-0 left-0 h-1 bg-border-light z-50 w-full">
        <div
          className="h-full bg-secondary transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* 2. HERO SECTION (Ảnh bìa lớn) */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden group">
        <img
          src={postData.image}
          alt={postData.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

        <div className="absolute bottom-0 left-0 w-full pb-12 md:pb-16">
          <div className="container-main">
            <div className="max-w-4xl">
              {/* Breadcrumbs on Image */}
              <div className="text-white/80 mb-4 text-sm font-medium flex items-center gap-2">
                <Link
                  to="/blog"
                  className="hover:text-secondary transition-colors"
                >
                  Cẩm nang
                </Link>
                <span>/</span>
                <span className="text-secondary font-bold uppercase tracking-wider">
                  {postData.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-heading font-bold text-white leading-tight mb-6 drop-shadow-md">
                {postData.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm md:text-base font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center border border-white/30">
                    <IconUser className="w-4 h-4" />
                  </div>
                  <span>{postData.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCalendar className="w-4 h-4" />
                  <span>{postData.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconClock className="w-4 h-4" />
                  <span>{postData.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT LAYOUT */}
      <div className="container-main pt-10 md:pt-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* --- LEFT COLUMN: SOCIAL SHARE (Desktop Sticky) --- */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-32 flex flex-col gap-4 items-center">
              <button
                className="w-10 h-10 rounded-full bg-white border border-border-light text-text-secondary hover:text-primary hover:border-primary flex items-center justify-center transition-all shadow-sm tooltip"
                data-tip="Chia sẻ"
              >
                <IconShare className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white border border-border-light text-text-secondary hover:text-secondary hover:border-secondary flex items-center justify-center transition-all shadow-sm">
                <IconBookmark className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* --- CENTER COLUMN: ARTICLE CONTENT --- */}
          <div className="col-span-1 lg:col-span-7">
            <article
              className="
              prose prose-lg prose-slate max-w-none 
              
              /* Typography Spacing Optimized */
              prose-headings:mt-8 prose-headings:mb-3
              prose-headings:font-heading prose-headings:font-bold prose-headings:text-primary 
              prose-p:my-3 prose-p:text-text-secondary prose-p:leading-relaxed
              
              /* Links & Strong */
              prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
              prose-strong:text-primary prose-strong:font-bold
              
              /* Blockquotes */
              prose-blockquote:my-6 prose-blockquote:border-l-4 prose-blockquote:border-secondary 
              prose-blockquote:bg-secondary/10 prose-blockquote:py-3 prose-blockquote:px-5 
              prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-text-primary
              
              /* Images */
              prose-img:my-6 prose-img:rounded-3xl prose-img:shadow-lg prose-img:w-full
              prose-figcaption:mt-2 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-text-secondary prose-figcaption:italic
              
              /* Lead Paragraph */
              prose-lead:text-xl prose-lead:text-text-primary prose-lead:font-medium prose-lead:mb-6
            "
            >
              <div dangerouslySetInnerHTML={{ __html: postData.content }} />
            </article>

            {/* Tags */}
            <div className="mt-10 pt-6 border-t border-border-light">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-bold text-text-primary mr-2 py-1">
                  Tags:
                </span>
                {["Huế về đêm", "Ca Huế", "Ẩm thực", "Di sản"].map((tag) => (
                  <Link
                    key={tag}
                    to="#"
                    className="px-4 py-1.5 rounded-full bg-white border border-border-light text-text-secondary text-sm hover:border-primary hover:text-primary transition-colors shadow-sm"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-8 p-6 md:p-8 rounded-3xl bg-white border border-border-light flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left shadow-sm">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 shadow-md shrink-0">
                <img
                  src={postData.authorAvatar}
                  alt={postData.author}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Tác giả
                </p>
                <h3 className="text-xl font-heading font-bold text-text-primary mb-2">
                  {postData.author}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {postData.authorBio}
                </p>
                {article.authorId && (
                  <Link
                    to={`/guides/${article.authorId._id}`}
                    className="text-sm font-bold text-primary hover:underline mt-3 inline-flex items-center gap-1"
                  >
                    Xem hồ sơ & Tour của tôi{" "}
                    <IconArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>

            {/* TODO: BÀI VIẾT LIÊN QUAN - Requires API endpoint for related articles */}
            {/* TODO: BÌNH LUẬN - Requires comments API */}
          </div>

          {/* --- RIGHT COLUMN: SIDEBAR --- */}
          <div className="col-span-1 lg:col-span-4 lg:pl-8">
            <div className="sticky top-32 space-y-8">
              {/* Tour Liên Quan */}
              <div className="rounded-3xl border border-border-light bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-heading font-bold text-text-primary">
                    Tour đề xuất
                  </h3>
                  <Link
                    to="/tours"
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    Xem tất cả
                  </Link>
                </div>

                {toursLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="md" />
                  </div>
                ) : relatedTours.length > 0 ? (
                  <div className="space-y-4">
                    {relatedTours.map((tour) => (
                      <TourCard
                        key={tour._id || tour.id}
                        tour={{
                          id: tour._id || tour.id,
                          title: tour.title,
                          description: tour.description,
                          image:
                            tour.cover_image ||
                            tour.images?.[0] ||
                            "/images/placeholders/hero_slide_1.jpg",
                          location: tour.location?.name || "Huế",
                          duration: tour.duration || "1 ngày",
                          rating: tour.rating || 5,
                          price: tour.price || 0,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary text-center py-8">
                    Chưa có tour đề xuất
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
