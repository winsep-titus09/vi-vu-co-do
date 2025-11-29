import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  IconMapPin,
  IconCheck,
  IconClock,
  Icon3D,
} from "../../../icons/IconBox";
import { IconX } from "../../../icons/IconX";
import {
  IconChevronLeft,
  IconArrowRight,
  IconImage,
  IconTrash,
} from "../../../icons/IconCommon";

// ============================================================================
// MOCK DATA
// ============================================================================
// Mock data: Available places
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
];

// Mock data: Existing tour (fetch by ID from API)
const existingTourData = {
  id: 1,
  name: "Bí mật Hoàng cung Huế & Trải nghiệm trà chiều",
  category: "Lịch sử & Di sản",
  duration: 4,
  description:
    "Khám phá vẻ đẹp thâm nghiêm của Đại Nội Huế khi hoàng hôn buông xuống. Thưởng thức trà cung đình và nghe ca Huế trên sông Hương.",
  selectedPlaces: [
    { id: 1, name: "Đại Nội Huế", has3D: true },
    { id: 3, name: "Chùa Thiên Mụ", has3D: false },
  ],
  scheduleDetail:
    "- 16:00: Đón khách tại Cổng Ngọ Môn.\n- 16:30: Tham quan Đại Nội, nghe thuyết minh về triều Nguyễn.\n- 18:00: Thưởng thức trà chiều tại Duyệt Thị Đường.",
  price: 1800000,
  maxGuests: 10,
  image:
    "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
  status: "active", // active, hidden
};

export default function GuideEditTour() {
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(existingTourData);

  // Hàm xử lý thay đổi input
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle địa điểm
  const togglePlace = (place) => {
    const exists = formData.selectedPlaces.find((p) => p.id === place.id);
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        selectedPlaces: prev.selectedPlaces.filter((p) => p.id !== place.id),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedPlaces: [...prev.selectedPlaces, place],
      }));
    }
  };

  // Xử lý ảnh preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleChange("image", reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-heading font-bold text-text-primary">
              Chỉnh sửa Tour
            </h1>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                formData.status === "active"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-yellow-100 text-yellow-700 border-yellow-200"
              }`}
            >
              {formData.status === "active" ? "Đang hoạt động" : "Đang ẩn"}
            </span>
          </div>
          <p className="text-text-secondary text-sm">
            Cập nhật thông tin cho tour #{id}
          </p>
        </div>

        {/* Actions Header */}
        <div className="flex gap-3">
          {formData.status === "active" ? (
            <button
              onClick={() => handleChange("status", "hidden")}
              className="px-4 py-2 rounded-xl border border-border-light text-text-secondary font-bold text-xs hover:bg-bg-main hover:text-orange-500 transition-all"
            >
              Tạm ẩn tour
            </button>
          ) : (
            <button
              onClick={() => handleChange("status", "active")}
              className="px-4 py-2 rounded-xl border border-green-200 text-green-600 font-bold text-xs hover:bg-green-50 transition-all"
            >
              Kích hoạt lại
            </button>
          )}
          <button className="px-4 py-2 rounded-xl border border-red-100 text-red-600 bg-red-50 font-bold text-xs hover:bg-red-100 transition-all flex items-center gap-1">
            <IconTrash className="w-3 h-3" /> Xóa tour
          </button>
        </div>
      </div>

      {/* PROGRESS STEPS */}
      <div className="mb-8 flex justify-center">
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-border-light shadow-sm">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setStep(s)}
            >
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
        {/* --- STEP 1: INFO --- */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-bold text-text-primary border-b border-border-light pb-4">
              1. Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary uppercase">
                  Tên tour
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary uppercase">
                    Danh mục
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none appearance-none cursor-pointer"
                  >
                    <option>Lịch sử & Di sản</option>
                    <option>Ẩm thực & Văn hóa</option>
                    <option>Thiên nhiên & Khám phá</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary uppercase">
                    Thời lượng (Giờ)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => handleChange("duration", e.target.value)}
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
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 2: ITINERARY --- */}
        {step === 2 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-bold text-text-primary border-b border-border-light pb-4">
              2. Lịch trình & Địa điểm
            </h3>

            <div className="space-y-4">
              <label className="text-sm font-bold text-text-secondary uppercase">
                Địa điểm tham quan
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {AVAILABLE_PLACES.map((place) => {
                  const isSelected = formData.selectedPlaces.some(
                    (p) => p.id === place.id
                  );
                  return (
                    <div
                      key={place.id}
                      onClick={() => togglePlace(place)}
                      className={`
                                        relative flex items-center gap-4 p-3 rounded-2xl border cursor-pointer transition-all
                                        ${
                                          isSelected
                                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                                            : "border-border-light hover:border-primary/50"
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
                        {place.has3D && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wide border border-secondary/20">
                            <Icon3D className="w-3 h-3" /> 3D Model
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary uppercase">
                Chi tiết lịch trình
              </label>
              <textarea
                rows="6"
                value={formData.scheduleDetail}
                onChange={(e) => handleChange("scheduleDetail", e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none resize-none"
              ></textarea>
            </div>
          </div>
        )}

        {/* --- STEP 3: PRICE & IMAGE --- */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-bold text-text-primary border-b border-border-light pb-4">
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
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none font-bold text-lg"
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
                  value={formData.maxGuests}
                  onChange={(e) => handleChange("maxGuests", e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary uppercase">
                Ảnh bìa Tour
              </label>
              <div className="border-2 border-dashed border-border-light rounded-3xl p-2 text-center hover:bg-bg-main/50 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden h-72">
                {formData.image ? (
                  <div className="relative w-full h-full">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-2xl"
                    />
                    {/* Overlay Change Image */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-bold bg-black/50 px-4 py-2 rounded-full">
                        Thay đổi ảnh
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mb-4 text-text-secondary">
                      <IconImage className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-text-primary font-bold">
                      Nhấn để tải ảnh lên
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
              <IconCheck className="w-5 h-5" /> Lưu thay đổi
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
