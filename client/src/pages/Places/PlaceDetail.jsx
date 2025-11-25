import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import {
  IconMapPin,
  IconClock,
  Icon3D,
  IconCheck,
  IconStar,
  IconShare,
} from "../../icons/IconBox";
import IconArrowRight from "../../icons/IconArrowRight";
import IconInfo from "../../icons/IconInfo";
import { IconX } from "../../icons/IconX";
import { IconSun } from "../../icons/IconSun";

// --- MOCK DATA: CHI TIẾT ĐỊA ĐIỂM ---
const placeDetail = {
  id: 1,
  name: "Đại Nội Huế (Hoàng Thành)",
  category: "Di sản",
  address: "Đường 23/8, P. Thuận Hòa, TP. Huế",
  description: `Hoàng thành Huế là vòng thành thứ hai bên trong Kinh thành Huế, có chức năng bảo vệ các cung điện quan trọng nhất của triều đình, các miếu thờ tổ tiên nhà Nguyễn và bảo vệ Tử Cấm Thành.`,
  content: `
    <h3>Lịch sử hình thành</h3>
    <p>Hoàng thành được vua Gia Long khởi công xây dựng vào năm 1804 và hoàn thiện vào năm 1833 dưới thời vua Minh Mạng. Hệ thống thành quách ở đây là sự kết hợp hài hòa giữa tinh hoa kiến trúc phương Đông và kỹ thuật quân sự phương Tây.</p>
    <blockquote>"Đại Nội Huế không chỉ là di sản vật thể, mà còn là chứng nhân lịch sử của triều đại phong kiến cuối cùng tại Việt Nam."</blockquote>
  `,
  images: [
    "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
    "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/ngomon_3d_placeholder.jpg",
    "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg",
  ],
  info: {
    openTime: "07:00 - 17:30",
    ticket: "200.000đ",
    bestTime: "Sáng sớm / Hoàng hôn",
  },
  weather: { temp: 28, condition: "Nắng đẹp", humidity: "65%" },
  has3D: true,
  rating: 4.8,
  reviewsCount: 1280,
};

// --- MOCK DATA: REVIEWS ---
const reviews = [
  {
    id: 1,
    user: "Minh Anh",
    date: "2 ngày trước",
    rating: 5,
    content:
      "Không gian cổ kính tuyệt vời. Nên thuê HDV để hiểu rõ lịch sử hơn.",
    avatar: "M",
  },
  {
    id: 2,
    user: "John Doe",
    date: "1 tuần trước",
    rating: 4,
    content:
      "Beautiful architecture but quite hot in the afternoon. Bring water!",
    avatar: "J",
  },
];

// --- [UPDATED] MOCK DATA: 3 ĐIỂM LỘ TRÌNH ---
const visitingRoute = [
  {
    time: "15 phút",
    name: "Cổng Ngọ Môn",
    desc: "Cổng chính phía Nam, nơi diễn ra các lễ lạc quan trọng nhất của triều đình (Lễ Truyền Lô, Lễ Ban Sóc...).",
    tip: "Góc chụp ảnh đẹp nhất: Chụp từ quảng trường hướng lên lầu Ngũ Phụng lúc hoàng hôn.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/ngomon_3d_placeholder.jpg",
  },
  {
    time: "30 phút",
    name: "Điện Thái Hòa",
    desc: "Nơi vua thiết triều và đón tiếp sứ thần. Biểu tượng quyền lực tối cao của nhà Nguyễn.",
    tip: "Lưu ý: Không được phép quay phim, chụp ảnh bên trong nội điện để bảo tồn di tích.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
  },
  {
    time: "45 phút",
    name: "Thế Miếu & Cửu Đỉnh",
    desc: "Khu vực thờ cúng các vị vua triều Nguyễn và nơi đặt 9 chiếc đỉnh đồng khổng lồ đúc từ năm 1835.",
    tip: "Hãy tìm vết đạn trên Hiển Lâm Các - dấu tích của chiến tranh còn sót lại.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg",
  },
];

// --- MOCK DATA: TOUR LIÊN QUAN ---
const relatedTours = [
  {
    id: 1,
    title: "Bí mật Hoàng cung Huế",
    price: 45,
    duration: "4 giờ",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
  },
];

export default function PlaceDetail() {
  const { id } = useParams();
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = is3DModalOpen ? "hidden" : "auto";
  }, [is3DModalOpen]);

  return (
    <div className="min-h-screen bg-bg-main pb-24 pt-6 md:pb-20">
      <div className="container-main space-y-10">
        <Breadcrumbs
          items={[
            { label: "Điểm đến", href: "/places" },
            { label: placeDetail.name },
          ]}
        />

        {/* 1. HERO SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px] md:h-[500px] rounded-3xl overflow-hidden relative group">
          <div className="md:col-span-2 h-full relative cursor-pointer overflow-hidden">
            <img
              src={placeDetail.images[0]}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
              alt="Main"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold uppercase tracking-wider">
                  {placeDetail.category}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold bg-secondary px-2 py-1 rounded-full text-white">
                  <IconStar className="w-3 h-3 fill-current" />{" "}
                  {placeDetail.rating}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-bold leading-tight shadow-sm">
                {placeDetail.name}
              </h1>
              <div className="flex items-center gap-2 mt-3 text-white/90 text-sm font-medium">
                <IconMapPin className="w-5 h-5" />{" "}
                <span>{placeDetail.address}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-4 h-full">
            <div className="flex-1 overflow-hidden rounded-2xl">
              <img
                src={placeDetail.images[1]}
                className="w-full h-full object-cover hover:scale-110 transition-transform"
                alt="Sub"
              />
            </div>
            <div
              onClick={() => setIs3DModalOpen(true)}
              className="flex-1 bg-primary relative rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden group/btn shadow-inner"
            >
              <img
                src={placeDetail.images[2]}
                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                alt="3D"
              />
              <div className="relative z-10 flex flex-col items-center text-white transition-transform group-hover/btn:scale-110">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-2 border border-white/30">
                  <Icon3D className="w-7 h-7 animate-pulse" />
                </div>
                <span className="font-bold font-heading text-lg">
                  Tham quan 3D
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* LEFT COLUMN (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Intro & Article */}
            <div className="space-y-6">
              <p className="text-lg md:text-xl text-text-primary font-medium leading-relaxed border-l-4 border-secondary pl-6 py-1">
                {placeDetail.description}
              </p>
              <hr className="border-border-light" />
              <article className="prose prose-lg prose-slate max-w-none prose-headings:font-heading prose-headings:text-primary prose-img:rounded-2xl">
                <div
                  dangerouslySetInnerHTML={{ __html: placeDetail.content }}
                />
              </article>
            </div>

            {/* [UPDATED] VISITING ROUTE (3 ITEMS) */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-border-light shadow-sm">
              <h3 className="text-2xl font-heading font-bold text-text-primary mb-8 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-white">
                  <IconMapPin className="w-5 h-5" />
                </span>{" "}
                Lộ trình gợi ý
              </h3>
              <div className="relative pl-4 md:pl-6 border-l-2 border-dashed border-border-light space-y-10">
                {visitingRoute.map((point, idx) => (
                  <div key={idx} className="relative pl-6 md:pl-8 group">
                    <div className="absolute -left-[9px] md:-left-[11px] top-0 w-4 h-4 md:w-5 md:h-5 rounded-full bg-white border-4 border-secondary group-hover:scale-125 transition-transform"></div>
                    <div className="flex flex-col md:flex-row gap-5">
                      <div className="flex-1 order-2 md:order-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-xl font-bold text-text-primary">
                            {point.name}
                          </h4>
                          <span className="text-xs font-bold text-text-secondary bg-bg-main px-2 py-0.5 rounded border border-border-light">
                            ~{point.time}
                          </span>
                        </div>
                        <p className="text-text-secondary text-sm mb-3 leading-relaxed">
                          {point.desc}
                        </p>
                        <div className="bg-primary/5 border border-primary/10 p-3 rounded-xl flex gap-3 items-start">
                          <IconStar className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-primary uppercase tracking-wide mb-0.5">
                              Mẹo nhỏ
                            </p>
                            <p className="text-xs text-text-secondary italic">
                              "{point.tip}"
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden shrink-0 order-1 md:order-2 shadow-sm group-hover:shadow-md transition-shadow">
                        <img
                          src={point.image}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="pt-8 border-t border-border-light">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-heading font-bold text-text-primary">
                  Đánh giá & Bình luận
                </h3>
                <button className="px-4 py-2 rounded-full border border-border-light text-sm font-bold hover:bg-bg-main transition-colors">
                  Viết đánh giá
                </button>
              </div>

              <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-2xl border border-border-light">
                <div className="text-center px-4 border-r border-border-light">
                  <span className="text-4xl font-heading font-bold text-primary block">
                    {placeDetail.rating}
                  </span>
                  <div className="flex text-[#BC4C00] text-xs gap-0.5 justify-center my-1">
                    {[...Array(5)].map((_, i) => (
                      <IconStar key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-text-secondary">
                    {placeDetail.reviewsCount} bài viết
                  </span>
                </div>
                <div className="flex-1 pl-4">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div
                      key={star}
                      className="flex items-center gap-3 text-xs text-text-secondary mb-1"
                    >
                      <span className="w-2">{star}</span>
                      <div className="flex-1 h-1.5 bg-bg-main rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary"
                          style={{
                            width:
                              star === 5 ? "70%" : star === 4 ? "20%" : "5%",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex gap-4 pb-6 border-b border-border-light last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                      {review.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-text-primary">
                          {review.user}
                        </h4>
                        <span className="text-xs text-text-secondary">
                          • {review.date}
                        </span>
                      </div>
                      <div className="flex text-[#BC4C00] w-16 mb-2">
                        <IconStar className="w-3 h-3 fill-current" />
                        <IconStar className="w-3 h-3 fill-current" />
                        <IconStar className="w-3 h-3 fill-current" />
                        <IconStar className="w-3 h-3 fill-current" />
                        <IconStar className="w-3 h-3 fill-current" />
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {review.content}
                      </p>
                    </div>
                  </div>
                ))}
                <button className="w-full py-3 text-sm font-bold text-primary border border-border-light rounded-xl hover:bg-bg-main">
                  Xem thêm 120+ đánh giá
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SIDEBAR (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* WEATHER & UTILITY WIDGET */}
              <div className="rounded-3xl overflow-hidden shadow-lg shadow-blue-500/10">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <p className="text-3xl font-bold">
                        {placeDetail.weather.temp}°
                      </p>
                      <p className="text-sm opacity-90 font-medium">
                        {placeDetail.weather.condition}
                      </p>
                      <p className="text-xs opacity-70 mt-1">
                        Độ ẩm: {placeDetail.weather.humidity}
                      </p>
                    </div>
                    <IconSun className="w-12 h-12 text-yellow-300 animate-spin-slow" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                </div>
                <div className="bg-white p-4 grid grid-cols-3 gap-2 border border-t-0 border-border-light rounded-b-3xl">
                  <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-bg-main transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary">
                      Chỉ đường
                    </span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-bg-main transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        ></path>
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary">
                      Lưu lại
                    </span>
                  </button>
                  <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-bg-main transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconShare className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-text-secondary">
                      Chia sẻ
                    </span>
                  </button>
                </div>
              </div>

              {/* INFO CARD */}
              <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <IconInfo className="w-5 h-5 text-secondary" />
                  Thông tin tham quan
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-main/50">
                    <IconClock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-text-secondary uppercase">
                        Giờ mở cửa
                      </p>
                      <p className="text-sm font-bold text-text-primary">
                        {placeDetail.info.openTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-main/50">
                    <svg
                      className="w-5 h-5 text-primary mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      ></path>
                    </svg>
                    <div>
                      <p className="text-xs font-bold text-text-secondary uppercase">
                        Giá vé tham khảo
                      </p>
                      <p className="text-sm font-bold text-text-primary">
                        {placeDetail.info.ticket}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-bg-main/50">
                    <IconCheck className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-text-secondary uppercase">
                        Thời điểm lý tưởng
                      </p>
                      <p className="text-sm font-bold text-text-primary">
                        {placeDetail.info.bestTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RELATED TOURS */}
              <div className="bg-[#2C3E50] p-6 rounded-3xl text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-heading font-bold mb-2">
                    Bạn muốn đến đây?
                  </h3>
                  <p className="text-sm text-white/70 mb-6">
                    Khám phá địa điểm này trọn vẹn nhất cùng hướng dẫn viên.
                  </p>
                  <div className="space-y-4">
                    {relatedTours.map((tour) => (
                      <Link
                        to={`/tours/${tour.id}`}
                        key={tour.id}
                        className="flex gap-3 bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors cursor-pointer items-center"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={tour.image}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold truncate">
                            {tour.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-secondary mt-1">
                            <span className="font-bold text-white">
                              ${tour.price}
                            </span>
                            <span>• {tour.duration}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/tours"
                    className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-secondary hover:text-white transition-colors"
                  >
                    Xem tất cả tour <IconArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY MOBILE ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-border-light shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 z-40 md:hidden flex items-center justify-between gap-4 safe-area-pb">
        <div className="flex flex-col">
          <span className="text-[10px] text-text-secondary font-bold uppercase">
            Giá vé
          </span>
          <span className="text-lg font-bold text-primary">
            {placeDetail.info.ticket}
          </span>
        </div>
        <div className="flex gap-3">
          <button className="w-12 h-12 rounded-full bg-bg-main text-primary border border-border-light flex items-center justify-center hover:bg-primary/10">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
          </button>
          <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-primary/30 flex items-center gap-2 active:scale-95 transition-transform">
            Đặt Tour Ngay <IconArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D VIEWER MODAL */}
      {is3DModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <button
            onClick={() => setIs3DModalOpen(false)}
            className="absolute top-6 right-6 z-50 text-white/60 hover:text-white hover:rotate-90 transition-all duration-300"
          >
            <IconX className="w-10 h-10" />
          </button>
          <div className="relative w-full h-full max-w-6xl max-h-[85vh] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
            <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <h3 className="text-white font-heading font-bold text-xl text-center">
                {placeDetail.name} - Mô hình 3D
              </h3>
            </div>
            <div className="flex-1 relative flex items-center justify-center group">
              <img
                src={placeDetail.images[1]}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[20s]"
                alt="3D Placeholder"
              />
              <div className="relative z-10 text-center space-y-4">
                <div className="w-20 h-20 border-4 border-white/30 rounded-full flex items-center justify-center mx-auto animate-spin-slow">
                  <Icon3D className="w-10 h-10 text-white" />
                </div>
                <p className="text-white text-lg font-medium">
                  Đang tải mô hình 3D...
                </p>
                <p className="text-white/50 text-sm">(Demo UI)</p>
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                <button className="px-4 py-2 bg-white/10 backdrop-blur rounded-lg text-white text-sm hover:bg-white/20">
                  Xoay trái
                </button>
                <button className="px-4 py-2 bg-white/10 backdrop-blur rounded-lg text-white text-sm hover:bg-white/20">
                  Tự động
                </button>
                <button className="px-4 py-2 bg-white/10 backdrop-blur rounded-lg text-white text-sm hover:bg-white/20">
                  Xoay phải
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
