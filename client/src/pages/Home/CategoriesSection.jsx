// src/pages/Home/CategoriesSection.jsx

import React, { useMemo } from "react";
import IconHeritage from "../../icons/IconHeritage.jsx";
import IconFood from "../../icons/IconFood.jsx";
import IconNature from "../../icons/IconNature.jsx";
import IconMusic from "../../icons/IconMusic.jsx";
import IconCraft from "../../icons/IconCraft.jsx";
import IconLotus from "../../icons/IconLotus.jsx";
import Spinner from "../../components/Loaders/Spinner";
import { useTourCategories } from "../../features/tours/hooks";

// Map icon names to components
const iconMap = {
  heritage: <IconHeritage className="w-10 h-10" />,
  food: <IconFood className="w-10 h-10" />,
  nature: <IconNature className="w-10 h-10" />,
  music: <IconMusic className="w-10 h-10" />,
  craft: <IconCraft className="w-10 h-10" />,
  lotus: <IconLotus className="w-10 h-10" />,
  default: <IconHeritage className="w-10 h-10" />,
};

export default function CategoriesSection() {
  // Fetch categories from API
  const { categories: apiCategories, isLoading } = useTourCategories();

  // Map API categories to display format
  const categories = useMemo(() => {
    return (apiCategories || []).map((cat, index) => {
      // Try to match icon from slug/name
      const slug = cat.slug || "";
      let iconKey = "default";

      if (slug.includes("di-san") || slug.includes("heritage"))
        iconKey = "heritage";
      else if (slug.includes("am-thuc") || slug.includes("food"))
        iconKey = "food";
      else if (slug.includes("thien-nhien") || slug.includes("nature"))
        iconKey = "nature";
      else if (slug.includes("nghe-thuat") || slug.includes("music"))
        iconKey = "music";
      else if (slug.includes("nghe") || slug.includes("craft"))
        iconKey = "craft";
      else if (slug.includes("tam-linh") || slug.includes("lotus"))
        iconKey = "lotus";

      return {
        id: String(index + 1).padStart(2, "0"),
        title: cat.name,
        desc: cat.description || `Khám phá ${cat.name} tại Huế`,
        icon: iconMap[iconKey],
        slug: cat.slug,
      };
    });
  }, [apiCategories]);
  // Loading state
  if (isLoading) {
    return (
      <section className="pb-20 lg:pb-28 bg-[#fcfaf5]">
        <div className="container-main px-6 md:px-16 lg:px-24 flex justify-center items-center py-20">
          <Spinner size="lg" />
        </div>
      </section>
    );
  }

  return (
    <section className="pb-20 lg:pb-28 bg-[#fcfaf5]">
      <div className="container-main px-6 md:px-16 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {categories.slice(0, 6).map((item) => (
            <div key={item.id} className="flex gap-5 group">
              {/* Cột trái: Số nền + Icon */}
              <div className="relative flex-shrink-0 w-20 h-20 flex items-center justify-center">
                {/* Số nền mờ */}
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-heading font-black text-[#e3e0d3] opacity-50 select-none group-hover:text-[#d4af37]/20 transition-colors duration-300">
                  {item.id}
                </span>
                {/* Icon nổi lên trên */}
                <span className="relative z-10 text-text-primary group-hover:text-primary transition-colors duration-300 group-hover:-translate-y-1 transform">
                  {item.icon}
                </span>
              </div>

              {/* Cột phải: Text */}
              <div className="flex flex-col justify-center pt-2">
                <h3 className="!text-xl font-heading font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
