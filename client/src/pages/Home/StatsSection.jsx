// src/pages/Home/StatsSection.jsx

import React, { useMemo } from "react";
import ButtonSvgMask from "../../components/Forms/ButtonSvgMask";
import { IconMapPin } from "../../icons/IconBox.jsx";
import Spinner from "../../components/Loaders/Spinner";
import { usePublicStats } from "../../features/public/hooks";

// Icon components for stats
const IconGuide = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLocation = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconTour = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
  </svg>
);

const IconCustomer = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function StatsSection() {
  const { stats, isLoading } = usePublicStats();

  // Map stats to display format
  const displayStats = useMemo(() => {
    if (!stats) {
      // Fallback to default values while loading
      return [
        {
          id: 1,
          number: "50+",
          label: "Hướng dẫn viên bản địa",
          desc: "Am hiểu sâu sắc văn hóa Huế",
          icon: IconGuide,
        },
        {
          id: 2,
          number: "120+",
          label: "Di tích & Điểm đến",
          desc: "Từ Đại Nội đến phá Tam Giang",
          icon: IconLocation,
        },
        {
          id: 3,
          number: "1,500+",
          label: "Du khách hài lòng",
          desc: "Đánh giá 5 sao về trải nghiệm",
          icon: IconCustomer,
        },
        {
          id: 4,
          number: "300+",
          label: "Lộ trình độc bản",
          desc: "Thiết kế riêng theo sở thích",
          icon: IconTour,
        },
      ];
    }

    return [
      {
        id: 1,
        number: stats.formatted?.guides || `${stats.totalGuides || 0}+`,
        label: "Hướng dẫn viên bản địa",
        desc: "Am hiểu sâu sắc văn hóa Huế",
        icon: IconGuide,
      },
      {
        id: 2,
        number: stats.formatted?.locations || `${stats.totalLocations || 0}+`,
        label: "Di tích & Điểm đến",
        desc: "Từ Đại Nội đến phá Tam Giang",
        icon: IconLocation,
      },
      {
        id: 3,
        number:
          stats.formatted?.customers || `${stats.completedBookings || 0}+`,
        label: "Du khách hài lòng",
        desc: "Đánh giá 5 sao về trải nghiệm",
        icon: IconCustomer,
      },
      {
        id: 4,
        number: stats.formatted?.tours || `${stats.totalTours || 0}+`,
        label: "Lộ trình độc bản",
        desc: "Thiết kế riêng theo sở thích",
        icon: IconTour,
      },
    ];
  }, [stats]);

  return (
    <section className="relative pb-20 lg:pb-28 bg-bg-main overflow-hidden group">
      {/* 1. Background Map */}
      {/* CẬP NHẬT:
          - Thay 'group-hover:scale-110' thành 'group-hover:translate-x-10'.
          - Tăng thời gian duration-[5s] để di chuyển mượt mà hơn.
          - Thêm 'scale-105' mặc định để ảnh to hơn khung một chút, 
            tránh bị hở viền khi di chuyển.
      */}
      <div
        className="
          absolute inset-0 z-0 pointer-events-none 
          bg-center bg-no-repeat bg-contain
          scale-105 
          transition-transform duration-[2s] ease-in-out
          group-hover:translate-x-10
        "
        style={{ backgroundImage: "url('/images/placeholders/map-bg.png')" }}
      />

      <div className="container-main relative z-10 pt-10">
        {/* 2. Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-secondary">
              <IconMapPin className="w-8 h-8" />
            </div>
            <p className="font-heading font-bold text-xl text-text-primary italic">
              Vi Vu Cố Đô
            </p>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-text-primary leading-tight">
            Kết nối đam mê, <br />
            <span className="text-primary">Kiến tạo trải nghiệm</span>
          </h2>
        </div>

        {/* 3. Stats Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16">
            {displayStats.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center text-center group/item"
              >
                {/* Vòng tròn trang trí */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-6 transition-transform duration-500 group-hover/item:-translate-y-2">
                  {/* Vòng tròn xoay nhẹ */}
                  <div className="absolute inset-0 rounded-full border-4 border-secondary/30 border-dashed animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-2 rounded-full border-2 border-secondary/60" />

                  <span className="font-heading font-black text-3xl lg:text-4xl text-text-primary relative z-10">
                    {item.number}
                  </span>
                </div>

                <h3 className="!text-lg font-bold text-text-primary mb-2">
                  {item.label}
                </h3>
                <p className="text-sm text-text-secondary font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 4. CTA Button */}
        <div className="flex justify-center">
          <ButtonSvgMask href="/blog" className="inline-flex">
            Cẩm nang
          </ButtonSvgMask>
        </div>
      </div>
    </section>
  );
}
