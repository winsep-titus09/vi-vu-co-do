import React, { useState } from "react";
import { IconMapPin, IconCheck, IconClock } from "../../../icons/IconBox";

// Inline Icons
const IconPlus = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconX = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconArrowRight = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconChevronLeft = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

// Icons cho phần Upload & 3D
const IconImage = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);
const Icon3D = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3 2 8.5 12 14 22 8.5 12 3Z" />
    <path d="M2 8.5v11l10 5.5" />
    <path d="M22 8.5v11l-10 5.5" />
    <path d="m12 14 10-5.5" />
  </svg>
);

// --- MOCK DATA: Địa điểm có sẵn trong hệ thống ---
const AVAILABLE_PLACES = [
  {
    id: 1,
    name: "Đại Nội Huế",
    type: "Di sản",
    has3D: true,
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
  },
  {
    id: 2,
    name: "Lăng Tự Đức",
    type: "Di sản",
    has3D: true,
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg",
  },
  {
    id: 3,
    name: "Chùa Thiên Mụ",
    type: "Tâm linh",
    has3D: false,
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuatuhieu1.jpg",
  },
  {
    id: 4,
    name: "Cầu Tràng Tiền",
    type: "Thắng cảnh",
    has3D: false,
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/cautrangtien1.jpg",
  },
  {
    id: 5,
    name: "Chợ Đông Ba",
    type: "Ẩm thực",
    has3D: false,
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_3.jpg",
  },
  {
    id: 6,
    name: "Làng hương Thủy Xuân",
    type: "Làng nghề",
    has3D: true,
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_4.jpg",
  },
];

export default function CreateTour() {
  const [step, setStep] = useState(1);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  // Xử lý chọn địa điểm
  const togglePlace = (place) => {
    if (selectedPlaces.find((p) => p.id === place.id)) {
      setSelectedPlaces(selectedPlaces.filter((p) => p.id !== place.id));
    } else {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  };

  // Giả lập upload ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* HEADER & PROGRESS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Thiết kế Tour mới
          </h1>
          <p className="text-text-secondary text-sm">
            Chia sẻ kiến thức và đam mê của bạn với du khách.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-border-light shadow-sm">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-text-secondary"
                }`}
              >
                {step > s ? <IconCheck className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-8 h-0.5 rounded-full ${
                    step > s ? "bg-primary" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border-light p-6 md:p-10 shadow-sm">
        {/* --- STEP 1: THÔNG TIN CƠ BẢN --- */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-6">
                1. Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary uppercase">
                    Tên tour <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Khám phá bí mật Đại Nội về đêm..."
                    className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none text-text-primary font-medium placeholder:font-normal transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary uppercase">
                      Danh mục chính
                    </label>
                    <div className="relative">
                      <select className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none appearance-none cursor-pointer">
                        <option>Lịch sử & Di sản</option>
                        <option>Ẩm thực & Văn hóa</option>
                        <option>Thiên nhiên & Khám phá</option>
                        <option>Nghệ thuật & Làng nghề</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
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
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary uppercase">
                      Thời lượng (Giờ)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="4"
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none"
                      />
                      <IconClock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary uppercase">
                    Mô tả ngắn
                  </label>
                  <textarea
                    rows="4"
                    className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none resize-none"
                    placeholder="Hãy viết một đoạn giới thiệu hấp dẫn về tour của bạn..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: LỊCH TRÌNH & ĐỊA ĐIỂM --- */}
        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-bold text-text-primary mb-2">
              2. Chọn địa điểm & Lịch trình
            </h3>
            <p className="text-sm text-text-secondary bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-2">
              <span className="text-blue-500 font-bold text-lg">ⓘ</span>
              Chọn các địa điểm có sẵn trong hệ thống giúp tour của bạn được
              liên kết với kho dữ liệu 3D và thông tin lịch sử chính xác.
            </p>

            <div className="space-y-4">
              <label className="text-sm font-bold text-text-secondary uppercase">
                Địa điểm tham quan
              </label>

              {/* Grid địa điểm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {AVAILABLE_PLACES.map((place) => {
                  const isSelected = selectedPlaces.some(
                    (p) => p.id === place.id
                  );
                  return (
                    <div
                      key={place.id}
                      onClick={() => togglePlace(place)}
                      className={`
                                        relative flex items-center gap-4 p-3 rounded-2xl border cursor-pointer transition-all group
                                        ${
                                          isSelected
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-border-light hover:border-primary/50 hover:shadow-sm"
                                        }
                                    `}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={place.image}
                          alt={place.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-bold truncate ${
                            isSelected ? "text-primary" : "text-text-primary"
                          }`}
                        >
                          {place.name}
                        </h4>
                        <p className="text-xs text-text-secondary">
                          {place.type}
                        </p>

                        {/* Badge 3D */}
                        {place.has3D && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wide border border-secondary/20">
                            <Icon3D className="w-3 h-3" /> Có 3D Model
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-primary bg-white rounded-full p-0.5 shadow-sm">
                          <IconCheck className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-border-light">
                <p className="text-sm font-bold text-text-primary mb-2">
                  Đã chọn ({selectedPlaces.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedPlaces.map((p) => (
                    <span
                      key={p.id}
                      className="px-3 py-1 rounded-lg bg-bg-main border border-border-light text-xs font-medium flex items-center gap-2"
                    >
                      {p.name}
                      <button
                        onClick={() => togglePlace(p)}
                        className="hover:text-red-500"
                      >
                        <IconX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedPlaces.length === 0 && (
                    <span className="text-xs text-text-secondary italic">
                      Chưa chọn địa điểm nào.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary uppercase">
                Chi tiết lịch trình (Timeline)
              </label>
              <textarea
                rows="6"
                className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none resize-none"
                placeholder="- 8:00: Đón khách tại Cổng Ngọ Môn...&#10;- 8:30: Tham quan Điện Thái Hòa và nghe thuyết minh lịch sử..."
              ></textarea>
            </div>
          </div>
        )}

        {/* --- STEP 3: HOÀN THIỆN --- */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-bold text-text-primary mb-6">
              3. Giá & Hình ảnh
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary uppercase">
                  Giá tour / khách
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none font-bold text-lg"
                    placeholder="0"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-xs bg-white px-2 py-1 rounded border border-border-light">
                    VND
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary uppercase">
                  Số khách tối đa
                </label>
                <input
                  type="number"
                  className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none"
                  placeholder="VD: 10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary uppercase">
                Ảnh bìa Tour
              </label>

              <div className="border-2 border-dashed border-border-light rounded-3xl p-8 text-center hover:bg-bg-main/50 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden">
                {previewImage ? (
                  <div className="relative h-64 w-full">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-xl"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(null);
                      }}
                      className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white text-red-500 shadow-sm"
                    >
                      <IconX className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="py-8">
                    <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform text-text-secondary">
                      <IconImage className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-text-primary font-bold">
                      Nhấn để tải ảnh lên
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      JPG, PNG (Tối đa 5MB)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
            </div>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex justify-between pt-8 mt-8 border-t border-border-light">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className={`
                    px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all
                    ${
                      step === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-text-secondary hover:bg-bg-main hover:text-primary"
                    }
                `}
          >
            <IconChevronLeft className="w-4 h-4" /> Quay lại
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95"
            >
              Tiếp tục <IconArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button className="px-8 py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-all shadow-lg flex items-center gap-2 active:scale-95">
              <IconCheck className="w-5 h-5" /> Hoàn tất & Đăng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
