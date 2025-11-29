import React from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { IconMapPin, Icon3D } from "../../icons/IconBox";
import { IconUser } from "../../icons/IconUser";

// --- MOCK DATA: Highlight Places ---
const highlightPlaces = [
  {
    id: 1,
    name: "Vịnh Lăng Cô",
    location: "Huyện Phú Lộc",
    tag: "THIÊN NHIÊN",
    desc: "Một trong những vịnh biển đẹp nhất thế giới với làn nước trong xanh.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/cautrangtien1.jpg",
    colSpan: "md:col-span-2",
  },
  {
    id: 2,
    name: "Lăng Tự Đức",
    location: "Thủy Xuân, TP. Huế",
    tag: "DI SẢN",
    desc: "Kiến trúc cầu kỳ, phong cảnh hữu tình bậc nhất triều Nguyễn.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg",
    colSpan: "md:col-span-1",
  },
  {
    id: 3,
    name: "Rừng ngập mặn Rú Chá",
    location: "Hương Phong, TP. Huế",
    tag: "KHÁM PHÁ",
    desc: "Khu rừng nguyên sinh duy nhất còn lại trên phá Tam Giang.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/bachma1.jpg",
    colSpan: "md:col-span-1",
  },
  {
    id: 4,
    name: "Đồi Vọng Cảnh",
    location: "Thủy Biều, TP. Huế",
    tag: "THƯ GIÃN",
    desc: "Nơi ngắm hoàng hôn sông Hương đẹp nhất xứ Huế.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/bachma3.jpg",
    colSpan: "md:col-span-2",
  },
  {
    id: 5,
    name: "Hồ Thủy Tiên",
    location: "Thủy Bằng, Hương Thủy",
    tag: "BÍ ẨN",
    desc: "Công viên nước bỏ hoang nổi tiếng thế giới với vẻ đẹp ma mị.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/ngomon_3d_placeholder.jpg",
    colSpan: "md:col-span-2",
  },
  {
    id: 6,
    name: "Cầu Ngói Thanh Toàn",
    location: "Thủy Thanh, Hương Thủy",
    tag: "LÀNG QUÊ",
    desc: "Kiệt tác kiến trúc 'thượng gia hạ kiều' hiếm có tại Việt Nam.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_3.jpg",
    colSpan: "md:col-span-1",
  },
];

// Mock data: Features section
const features = [
  {
    icon: <IconMapPin className="w-12 h-12 mb-6 stroke-[1.5]" />,
    title: "Đa dạng điểm đến",
    desc: "Hơn 100+ địa điểm từ lăng tẩm, đền chùa cổ kính đến những vùng thiên nhiên hoang sơ chưa được khám phá.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/bachma3.jpg",
  },
  {
    icon: <Icon3D className="w-12 h-12 mb-6 stroke-[1.5]" />,
    title: "Trải nghiệm 3D/VR",
    desc: "Công nghệ thực tế ảo giúp bạn tham quan chi tiết kiến trúc và không gian di sản trước khi đặt chân đến.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/bachma2.jpg",
  },
  {
    icon: <IconUser className="w-12 h-12 mb-6 stroke-[1.5]" />,
    title: "Cá nhân hóa hành trình",
    desc: "Kết nối trực tiếp với hướng dẫn viên địa phương để thiết kế chuyến đi phù hợp với sở thích riêng của bạn.",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/bachma1.jpg",
  },
];

export default function PlacesPage() {
  return (
    <div className="min-h-screen bg-bg-main pb-0 pt-6 overflow-x-hidden">
      {/* --- PART 1: CONTAINER CONTENT (Có giới hạn chiều rộng) --- */}
      <div className="container-main space-y-16 mb-20">
        {/* Header */}
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: "Điểm đến" }]} />
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-text-primary">
              Bản đồ Cố Đô
            </h1>
            <p className="text-text-secondary text-lg">
              Huế không chỉ có Đại Nội. Hãy khám phá hơn 100+ điểm đến từ di sản
              ngàn năm đến những góc check-in mới lạ.
            </p>
          </div>
        </div>

        {/* FEATURED PLACES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlightPlaces.map((place) => (
            <div
              key={place.id}
              className={`group relative overflow-hidden rounded-3xl cursor-pointer ${place.colSpan} h-80 md:h-[450px] shadow-md`}
            >
              <img
                src={place.image}
                alt={place.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/70 transition-colors duration-500"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-8 group-hover:translate-y-0 z-20">
                <div className="flex items-center gap-1.5 text-secondary mb-3 font-bold text-xs uppercase tracking-widest">
                  <IconMapPin className="w-4 h-4" />
                  <span>{place.location}</span>
                </div>
                <div className="border border-white/60 px-8 py-4 mb-5 backdrop-blur-sm bg-white/5">
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-white tracking-widest uppercase leading-tight">
                    {place.name}
                  </h3>
                </div>
                <p className="text-white/90 text-base max-w-md mb-8 font-medium leading-relaxed">
                  {place.desc}
                </p>
                <Link
                  to={`/places/${place.id}`}
                  className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm hover:bg-secondary hover:text-white transition-all uppercase tracking-wider shadow-lg transform hover:-translate-y-1"
                >
                  Xem chi tiết
                </Link>
              </div>
              <div className="absolute bottom-8 left-8 z-10 transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-4">
                <p className="text-white font-bold text-xl tracking-[0.2em] uppercase drop-shadow-lg border-l-4 border-secondary pl-4">
                  {place.tag}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- PART 2: FULL WIDTH FEATURES SECTION (Tràn viền) --- */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 h-auto md:h-[600px]">
        {features.map((item, index) => (
          <div
            key={index}
            className="relative group h-[500px] md:h-full overflow-hidden"
          >
            {/* Background Image */}
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />

            {/* Overlay (Tối hơn chút để tách biệt phần trên) */}
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors duration-500"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8 md:px-16 text-white">
              <div className="text-secondary transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-110 drop-shadow-lg">
                {item.icon}
              </div>

              <h3 className="text-3xl font-heading font-bold mb-6 capitalize tracking-wide">
                {item.title}
              </h3>

              <p className="text-white/80 text-lg leading-relaxed font-medium max-w-sm">
                {item.desc}
              </p>
            </div>

            {/* Border right (except last item) for visual separation */}
            {index !== features.length - 1 && (
              <div className="hidden md:block absolute right-0 top-1/4 bottom-1/4 w-px bg-white/20 z-20"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
