// src/pages/Home/FeaturedGuides.jsx

import React, { useMemo } from "react";
import GuideCard from "../../components/Cards/GuideCard";
import ButtonSvgMask from "../../components/Forms/ButtonSvgMask";
import IconArrowRight from "../../icons/IconArrowRight.jsx";
import Spinner from "../../components/Loaders/Spinner";
import { useFeaturedGuides } from "../../features/guides/hooks";

export default function FeaturedGuides() {
  // Fetch featured guides from API
  const { guides: apiGuides, isLoading } = useFeaturedGuides(4);

  // Map API guides to GuideCard format
  const guides = useMemo(() => {
    return (apiGuides || []).map((guide) => ({
      id: guide.user_id?._id || guide.user_id || guide._id,
      name: guide.user_id?.name || "Guide",
      specialty: guide.introduction || "Hướng dẫn viên",
      rating: guide.rating || 5.0,
      languages: guide.languages || ["VN"],
      bio: guide.bio || "Khám phá Huế cùng tôi!",
      image:
        guide.user_id?.avatar_url ||
        "/images/placeholders/avatar-placeholder.jpg",
    }));
  }, [apiGuides]);
  return (
    <section className="w-full py-16 lg:py-24 bg-bg-main relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-5%] w-[30%] h-[40%] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content container */}
      <div className="container-main relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary mb-2">
            Người kể chuyện Cố đô
          </p>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
            Gặp gỡ Thổ địa
          </h2>
          <p className="text-text-secondary text-sm md:text-base">
            Kết nối với những hướng dẫn viên bản địa đầy đam mê, được xác thực
            và sẵn sàng thiết kế hành trình riêng cho bạn.
          </p>
        </div>

        {/* Guides grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : guides.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {guides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-secondary">
              Chưa có hướng dẫn viên tiêu biểu
            </p>
          </div>
        )}

        {/* Action button */}
        <div className="mt-12 text-center">
          <ButtonSvgMask href="/guides" className="inline-flex">
            <span className="flex items-center gap-2">
              Xem thêm <IconArrowRight className="w-4 h-4" />
            </span>
          </ButtonSvgMask>
        </div>
      </div>
    </section>
  );
}
