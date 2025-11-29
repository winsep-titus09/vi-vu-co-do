// src/pages/Home/CategoriesSection.jsx

import React from "react";
import IconHeritage from "../../icons/IconHeritage.jsx";
import IconFood from "../../icons/IconFood.jsx";
import IconNature from "../../icons/IconNature.jsx";
import IconMusic from "../../icons/IconMusic.jsx";
import IconCraft from "../../icons/IconCraft.jsx";
import IconLotus from "../../icons/IconLotus.jsx";

// ============================================================================
// MOCK DATA
// ============================================================================
// Mock data: Tour categories
const categories = [
  {
    id: "01",
    title: "Di sản Cố đô",
    desc: "Khám phá Đại Nội, lăng tẩm và những dấu ấn lịch sử vàng son của triều Nguyễn.",
    icon: <IconHeritage className="w-10 h-10" />,
  },
  {
    id: "02",
    title: "Ẩm thực Huế",
    desc: "Thưởng thức tinh hoa ẩm thực cung đình và hương vị dân dã đậm đà khó quên.",
    icon: <IconFood className="w-10 h-10" />,
  },
  {
    id: "03",
    title: "Thiên nhiên thơ mộng",
    desc: "Du ngoạn sông Hương, núi Ngự và phá Tam Giang mênh mang sóng nước.",
    icon: <IconNature className="w-10 h-10" />,
  },
  {
    id: "04",
    title: "Nhã nhạc & Nghệ thuật",
    desc: "Đắm mình trong không gian văn hóa với Nhã nhạc cung đình và nghệ thuật diễn xướng.",
    icon: <IconMusic className="w-10 h-10" />,
  },
  {
    id: "05",
    title: "Làng nghề truyền thống",
    desc: "Trải nghiệm làm nón bài thơ, hoa giấy và gốm sứ cùng nghệ nhân bản địa.",
    icon: <IconCraft className="w-10 h-10" />,
  },
  {
    id: "06",
    title: "Du lịch Tâm linh",
    desc: "Tìm về sự an yên tại những ngôi chùa cổ kính và linh thiêng bậc nhất.",
    icon: <IconLotus className="w-10 h-10" />,
  },
  {
    id: "07",
    title: "Áo dài truyền thống",
    desc: "Trải nghiệm mặc thử và chụp ảnh với cổ phục Nhật Bình, áo dài ngũ thân.",
    icon: <IconHeritage className="w-10 h-10" />,
  },
];

export default function CategoriesSection() {
  return (
    // Bỏ padding-top (pb-20) để sát với section trên
    <section className="pb-20 lg:pb-28 bg-[#fcfaf5]">
      <div className="container-main px-6 md:px-16 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {/* CẬP NHẬT: Thêm .slice(0, 6) để giới hạn hiển thị 6 mục đầu tiên */}
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
