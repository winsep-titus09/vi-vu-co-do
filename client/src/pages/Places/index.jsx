import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { IconMapPin, Icon3D } from "../../icons/IconBox";
import { IconUser } from "../../icons/IconUser";
import { IconLoader } from "../../icons/IconCommon";
import IconChevronLeft from "../../icons/IconChevronLeft";
import IconChevronRight from "../../icons/IconChevronRight";
import { placesApi } from "../../features/places/api";

// Grid layout pattern for places
const gridPattern = [
  "md:col-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-1",
];

// Mock data: Features section
const features = [
  {
    icon: <IconMapPin className="w-12 h-12 mb-6 stroke-[1.5]" />,
    title: "Đa dạng điểm đến",
    desc: "Hơn 100+ địa điểm từ lăng tẩm, đền chùa cổ kính đến những vùng thiên nhiên hoang sơ chưa được khám phá.",
    image: "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/bachma1.1.jpg",
  },
  {
    icon: <Icon3D className="w-12 h-12 mb-6 stroke-[1.5]" />,
    title: "Trải nghiệm 3D/VR",
    desc: "Công nghệ thực tế ảo giúp bạn tham quan chi tiết kiến trúc và không gian di sản trước khi đặt chân đến.",
    image: "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/biencanhduong1.jpg",
  },
  {
    icon: <IconUser className="w-12 h-12 mb-6 stroke-[1.5]" />,
    title: "Cá nhân hóa hành trình",
    desc: "Kết nối trực tiếp với hướng dẫn viên địa phương để thiết kế chuyến đi phù hợp với sở thích riêng của bạn.",
    image: "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu6.jpg",
  },
];

export default function PlacesPage() {
  const [locations, setLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isServerPagination, setIsServerPagination] = useState(false);
  const [serverPage, setServerPage] = useState(1);
  const limit = 6;

  useEffect(() => {
    const fetchLocations = async () => {
      // Nếu API đã trả về dữ liệu phân trang theo server cho trang hiện tại thì không cần gọi lại
      if (isServerPagination && serverPage === currentPage && locations.length) {
        return;
      }

      try {
        // Nếu đang phân trang phía client và đã có dữ liệu, không cần gọi API lại
        if (!isServerPagination && allLocations.length) {
          return;
        }

        setIsLoading(true);
        setError("");
        const response = await placesApi.listLocations({
          page: currentPage,
          limit,
        });

        // Trường hợp API đã hỗ trợ phân trang (có items và total)
        if (Array.isArray(response?.items)) {
          const total = response?.total ?? response.items.length;
          const limitFromApi = response?.limit || limit;
          const pageFromApi = response?.page || currentPage;

          setIsServerPagination(true);
          setServerPage(pageFromApi);
          setLocations(response.items);
          setTotalCount(total);
          setTotalPages(Math.max(1, Math.ceil(total / limitFromApi)));
          return;
        }

        // Mặc định: API trả về toàn bộ danh sách -> phân trang phía client
        const rawLocations = response?.locations || response || [];
        const total = response?.total ?? rawLocations.length;

        setIsServerPagination(false);
        setServerPage(1);
        setAllLocations(rawLocations);
        setLocations(rawLocations.slice(0, limit));
        setTotalCount(total);
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
      } catch (err) {
        console.error("Fetch locations error:", err);
        setError(err.message || "Không thể tải danh sách địa điểm");
        setLocations([]);
        setAllLocations([]);
        setIsServerPagination(false);
        setServerPage(1);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [currentPage, isServerPagination, allLocations.length, serverPage, locations.length]);

  // Scroll to top when changing page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Khi phân trang phía client, cắt dữ liệu theo trang hiện tại
  useEffect(() => {
    if (isServerPagination) return;
    const total = allLocations.length;
    const totalPagesCalc = Math.max(1, Math.ceil(total / limit));

    // Điều chỉnh lại nếu trang hiện tại vượt quá tổng trang (ví dụ sau khi xóa bớt dữ liệu)
    if (currentPage > totalPagesCalc) {
      setCurrentPage(totalPagesCalc);
      return;
    }

    const start = (currentPage - 1) * limit;
    setLocations(allLocations.slice(start, start + limit));
    setTotalPages(totalPagesCalc);
    setTotalCount(total);
  }, [allLocations, currentPage, isServerPagination]);

  // Lấy dữ liệu hiển thị cho grid ở trang hiện tại
  const highlightPlaces = locations.map((loc, idx) => ({
    id: loc._id || loc.id || loc.slug || `loc-${idx}`,
    name: loc.name,
    location: loc.address || loc.category_id?.name || "Huế",
    tag: loc.category_id?.name?.toUpperCase() || "ĐỊA ĐIỂM",
    desc: loc.description || "Khám phá vẻ đẹp độc đáo của địa điểm này.",
    image: loc.images?.[0] || "/images/placeholders/place-placeholder.jpg",
    colSpan: gridPattern[idx % gridPattern.length],
    slug: loc.slug,
  }));

  const paginationPages = useMemo(() => {
    return Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
      let pageNum;
      if (totalPages <= 5) {
        pageNum = i + 1;
      } else if (currentPage <= 3) {
        pageNum = i + 1;
      } else if (currentPage >= totalPages - 2) {
        pageNum = totalPages - 4 + i;
      } else {
        pageNum = currentPage - 2 + i;
      }
      return pageNum;
    });
  }, [currentPage, totalPages]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <IconLoader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

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

        {/* Stats */}
        <div className="flex items-center justify-center text-sm text-text-secondary font-medium">
          <span>
            Có <span className="font-bold text-text-primary">{totalCount}</span> địa điểm đang hiển thị
          </span>
        </div>

        {/* FEATURED PLACES GRID */}
        {highlightPlaces.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg mb-4">
              Chưa có địa điểm nào được thêm vào.
            </p>
          </div>
        ) : (
          <>
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
                      to={`/places/${place.slug || place.id}`}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-border-light bg-white text-text-secondary hover:bg-primary/5 hover:text-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconChevronLeft className="w-5 h-5" />
                </button>

                {paginationPages.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                        : "text-text-secondary hover:bg-white hover:text-primary hover:shadow-sm"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="w-10 h-10 flex items-center justify-center text-text-secondary/50">
                      ...
                    </span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:bg-white hover:text-primary hover:shadow-sm transition-all"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-border-light bg-white text-text-secondary hover:bg-primary/5 hover:text-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <IconChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
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
