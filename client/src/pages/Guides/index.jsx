import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import GuideCard from "../../components/Cards/GuideCard";
import { IconSearch } from "../../icons/IconSearch";
import { IconChevronDown } from "../../icons/IconChevronDown";
import IconChevronLeft from "../../icons/IconChevronLeft";
import IconChevronRight from "../../icons/IconChevronRight";

// ============================================================================
// MOCK DATA
// ============================================================================
// Mock data: Tour guides (16 total)
const originalGuides = [
  {
    id: 1,
    name: "Minh Hương",
    specialty: "Nhà sử học & Văn hóa",
    rating: 4.9,
    image: "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/chandung/1.jpg",
    languages: ["VI", "EN"],
    bio: "Xin chào, tôi là Hương. Với 5 năm nghiên cứu triều Nguyễn, tôi sẽ kể bạn nghe những bí mật hoàng cung chưa từng được tiết lộ.",
    tags: ["history", "culture"],
  },
  {
    id: 2,
    name: "Trần Văn",
    specialty: "Chuyên gia Ẩm thực",
    rating: 5.0,
    image: "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/chandung/2.jpg",
    languages: ["VI"],
    bio: "Tôi sinh ra trong một gia đình làm bún bò truyền thống. Hãy cùng tôi len lỏi vào những con hẻm nhỏ để nếm vị Huế chuẩn nhất.",
    tags: ["food"],
  },
  {
    id: 3,
    name: "Alex Nguyen",
    specialty: "Nhiếp ảnh & Nghệ thuật",
    rating: 4.8,
    image: "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/chandung/3.jpg",
    languages: ["EN", "FR"],
    bio: "Đam mê những góc máy lạ của Cố Đô. Tôi sẽ giúp bạn có những bức ảnh 'để đời' tại Lăng Tự Đức và Đại Nội.",
    tags: ["art", "photo"],
  },
  {
    id: 4,
    name: "Lê Bình",
    specialty: "Thiền & Tâm linh",
    rating: 4.9,
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuatuhieu1.jpg",
    languages: ["VI", "EN"],
    bio: "Tìm về sự an yên tại các ngôi chùa cổ. Tôi sẽ hướng dẫn bạn các nghi thức thiền trà và nghe pháp thoại.",
    tags: ["spiritual"],
  },
  {
    id: 5,
    name: "Phạm Lan",
    specialty: "Làng nghề Truyền thống",
    rating: 4.7,
    image: "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/chandung/4.jpg",
    languages: ["VI", "KR"],
    bio: "Tôi lớn lên tại làng hương Thủy Xuân. Tôi sẽ đưa bạn đi trải nghiệm tự tay làm nón bài thơ và làm hương trầm.",
    tags: ["craft", "culture"],
  },
  {
    id: 6,
    name: "James Đặng",
    specialty: "Khám phá & Mạo hiểm",
    rating: 4.8,
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/hoanghon.jpg",
    languages: ["VI", "EN", "DE"],
    bio: "Chuyên các tour trekking Bạch Mã và chèo SUP phá Tam Giang. Dành cho những ai yêu thiên nhiên và vận động.",
    tags: ["adventure", "nature"],
  },
  {
    id: 7,
    name: "Bảo Ngọc",
    specialty: "Ẩm thực Chay & Sức khỏe",
    rating: 4.9,
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/ngomon_3d_placeholder.jpg",
    languages: ["VI", "EN"],
    bio: "Huế là kinh đô của ẩm thực chay. Tôi sẽ giới thiệu cho bạn những quán chay thanh tịnh và ngon miệng nhất.",
    tags: ["food", "spiritual"],
  },
  {
    id: 8,
    name: "Tuấn Kiệt",
    specialty: "Kiến trúc Cung đình",
    rating: 5.0,
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
    languages: ["VI", "JP"],
    bio: "Là kiến trúc sư, tôi sẽ giúp bạn hiểu sâu về kết cấu gỗ, ngói lưu ly và phong thủy trong các công trình triều Nguyễn.",
    tags: ["history", "architecture"],
  },
];

const guidesData = [
  ...originalGuides,
  ...originalGuides.map((g) => ({
    ...g,
    id: g.id + 8,
    name: g.name + " (Copy)",
  })),
];

const filters = [
  { id: "all", label: "Tất cả chuyên môn" },
  { id: "VI", label: "Tiếng Việt" },
  { id: "EN", label: "English" },
  { id: "food", label: "Ẩm thực" },
  { id: "history", label: "Lịch sử" },
  { id: "art", label: "Nghệ thuật" },
];

export default function GuidesPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredGuides = guidesData.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "all" ||
      g.languages.includes(activeFilter) ||
      g.tags.includes(activeFilter);
    return matchSearch && matchFilter;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, search]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGuides.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGuides.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-bg-main pb-20 pt-6 relative overflow-hidden">
      {/* Background map pattern for header area */}
      <div className="absolute top-0 right-0 w-full md:w-2/3 h-[600px] z-0 pointer-events-none">
        <img
          src="/images/placeholders/map-bg.png"
          className="w-full h-full object-contain object-right-top mix-blend-multiply"
          alt="Map Pattern"
        />
      </div>

      <div className="container-main space-y-10 relative z-10">
        {/* 1. Header & Toolbar */}
        <div className="space-y-6">
          <Breadcrumbs items={[{ label: "Hướng dẫn viên" }]} />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                Người kể chuyện
              </p>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-text-primary leading-tight">
                Gặp gỡ Thổ địa
              </h1>
              <p className="text-text-secondary text-lg leading-relaxed max-w-xl">
                Kết nối với những người am hiểu sâu sắc về Huế để chuyến đi của
                bạn trở nên sống động, chân thực và giàu cảm xúc hơn.
              </p>
            </div>

            {/* --- TOOLBAR --- */}
            <div className="w-full lg:w-auto flex flex-col md:flex-row gap-3">
              {/* Filter Dropdown */}
              <div className="relative w-full md:w-56" ref={filterRef}>
                <div
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`
                            w-full h-[52px] px-4 flex items-center justify-between cursor-pointer rounded-2xl border transition-all select-none bg-white
                            ${
                              isFilterOpen
                                ? "border-primary ring-1 ring-primary"
                                : "border-border-light hover:border-primary/50"
                            }
                        `}
                >
                  <span className="text-sm font-medium text-text-primary truncate">
                    {filters.find((f) => f.id === activeFilter)?.label ||
                      "Lọc theo"}
                  </span>
                  <IconChevronDown
                    className={`w-4 h-4 text-text-secondary transition-transform ${
                      isFilterOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Dropdown menu */}
                {isFilterOpen && (
                  <div className="absolute top-full right-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-border-light py-2 z-50 animate-fade-in-up max-h-60 overflow-y-auto">
                    {filters.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => {
                          setActiveFilter(f.id);
                          setIsFilterOpen(false);
                        }}
                        className={`
                                        px-4 py-2.5 text-sm cursor-pointer transition-colors
                                        ${
                                          activeFilter === f.id
                                            ? "bg-primary/10 text-primary font-bold"
                                            : "text-text-primary hover:bg-bg-main hover:text-primary"
                                        }
                                    `}
                      >
                        {f.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="Tìm theo tên HDV..."
                  className="w-full h-[52px] pl-12 pr-4 rounded-2xl border border-border-light bg-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-secondary/60"
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                  <IconSearch className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Guides Grid */}
        {currentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentItems.map((guide) => (
              <div key={guide.id} className="h-[420px]">
                <GuideCard guide={guide} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-border-light">
            <p className="text-text-secondary">
              Không tìm thấy hướng dẫn viên nào phù hợp.
            </p>
            <button
              onClick={() => {
                setActiveFilter("all");
                setSearch("");
              }}
              className="text-primary font-bold hover:underline mt-2"
            >
              Xem tất cả
            </button>
          </div>
        )}

        {/* 4. Pagination */}
        {filteredGuides.length > itemsPerPage && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-border-light bg-white text-text-secondary hover:bg-primary/5 hover:text-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconChevronLeft className="w-5 h-5" />
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => handlePageChange(idx + 1)}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all
                  ${
                    currentPage === idx + 1
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                      : "text-text-secondary hover:bg-white hover:text-primary hover:shadow-sm"
                  }
                `}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-border-light bg-white text-text-secondary hover:bg-primary/5 hover:text-primary hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* 5. Recruitment CTA */}
        <div className="mt-16 rounded-3xl bg-[#2C3E50] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-xl">
          <img
            src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg"
            className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-overlay pointer-events-none"
            alt="bg"
          />
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-heading font-bold">
              Bạn là một Hướng dẫn viên tại Huế?
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Gia nhập cộng đồng Vi Vu Cố Đô để tiếp cận hàng ngàn du khách, tự
              do thiết kế tour và xây dựng thương hiệu cá nhân của riêng bạn.
            </p>
            <button className="px-8 py-4 bg-secondary text-[#2C3E50] font-bold rounded-xl hover:bg-white transition-all shadow-lg shadow-black/20 transform hover:-translate-y-1">
              Trở thành Đối tác ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
