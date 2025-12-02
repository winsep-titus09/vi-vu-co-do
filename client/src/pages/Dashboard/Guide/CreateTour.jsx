import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IconMapPin,
  IconCheck,
  IconClock,
  Icon3D,
} from "../../../icons/IconBox";
import { IconX } from "../../../icons/IconX";
import {
  IconPlus,
  IconArrowRight,
  IconChevronLeft,
  IconImage,
} from "../../../icons/IconCommon";
import {
  useTourCategories,
  useLocations,
  useCreateTourRequest,
} from "../../../features/guides/hooks";
import { formatCurrency } from "../../../lib/formatters";
import { useToast } from "../../../components/Toast/useToast";

// Inline Icons
const IconLoader = ({ className }) => (
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
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default function CreateTour() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchLocation, setSearchLocation] = useState("");
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_hours: "",
    category_id: "",
    price: "",
    max_guests: "",
    itinerary: "",
    cover_image_url: "",
  });

  // Fetch data from API
  const { categories, isLoading: loadingCategories } = useTourCategories();
  const { locations, isLoading: loadingLocations } = useLocations();
  const { createTourRequest, isSubmitting } = useCreateTourRequest();

  // Filter locations by search
  const filteredLocations = locations.filter((loc) => {
    if (!searchLocation) return true;
    return loc.name?.toLowerCase().includes(searchLocation.toLowerCase());
  });

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý chọn địa điểm
  const togglePlace = (place) => {
    if (selectedPlaces.find((p) => p._id === place._id)) {
      setSelectedPlaces(selectedPlaces.filter((p) => p._id !== place._id));
    } else {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  };

  // Giả lập upload ảnh (trong thực tế cần upload lên server/cloud)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        // TODO: Upload to cloud and get URL
        setFormData((prev) => ({ ...prev, cover_image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate current step
  const validateStep = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        toast.warning("Thiếu thông tin", "Vui lòng nhập tên tour");
        return false;
      }
      if (!formData.duration_hours) {
        toast.warning("Thiếu thông tin", "Vui lòng nhập thời lượng tour");
        return false;
      }
      if (!formData.category_id) {
        toast.warning("Thiếu thông tin", "Vui lòng chọn danh mục tour");
        return false;
      }
    }
    if (step === 2) {
      if (selectedPlaces.length === 0) {
        toast.warning("Thiếu thông tin", "Vui lòng chọn ít nhất 1 địa điểm");
        return false;
      }
    }
    if (step === 3) {
      if (!formData.price) {
        toast.warning("Thiếu thông tin", "Vui lòng nhập giá tour");
        return false;
      }
    }
    return true;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateStep()) return;

    // Validate category
    if (!formData.category_id) {
      toast.warning("Thiếu thông tin", "Vui lòng chọn danh mục tour");
      setStep(1);
      return;
    }

    try {
      // Only include cover_image_url if it's a valid http(s) URL
      const imageUrl = formData.cover_image_url;
      const isValidUrl =
        imageUrl &&
        (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"));

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        duration_hours: Number(formData.duration_hours) || 4,
        duration: Math.ceil((Number(formData.duration_hours) || 4) / 24) || 1,
        price: Number(formData.price) || 0,
        max_guests: Number(formData.max_guests) || 10,
        categories: [formData.category_id],
        cover_image_url: isValidUrl ? imageUrl : null,
        itinerary: formData.itinerary
          ? formData.itinerary
              .split("\n")
              .filter(Boolean)
              .map((text, i) => ({
                day: i + 1,
                title:
                  text
                    .replace(/^[-•]\s*/, "")
                    .split(":")[0]
                    ?.trim() || `Điểm ${i + 1}`,
                details: text.replace(/^[-•]\s*/, "").trim(),
              }))
          : [],
        locations: selectedPlaces.map((p, i) => ({
          locationId: p._id,
          order: i,
        })),
        allow_custom_date: true,
        fixed_departure_time: "08:00",
      };

      console.log("Submitting tour request:", payload);
      await createTourRequest(payload);
      toast.success(
        "Thành công!",
        "Đã gửi yêu cầu tạo tour. Vui lòng chờ admin duyệt."
      );
      navigate("/dashboard/guide/my-tours");
    } catch (err) {
      console.error("Tour creation error:", err);
      const errorMsg =
        err?.message ||
        err?.detail?.toString() ||
        "Không thể tạo tour. Vui lòng thử lại.";
      toast.error("Lỗi tạo tour", errorMsg);
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
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
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
                      {loadingCategories ? (
                        <div className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 flex items-center gap-2">
                          <IconLoader className="w-4 h-4 animate-spin" />
                          <span className="text-text-secondary text-sm">
                            Đang tải...
                          </span>
                        </div>
                      ) : (
                        <select
                          name="category_id"
                          value={formData.category_id}
                          onChange={handleInputChange}
                          className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none appearance-none cursor-pointer"
                        >
                          <option value="">-- Chọn danh mục --</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      )}
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
                      Thời lượng (Giờ) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="duration_hours"
                        value={formData.duration_hours}
                        onChange={handleInputChange}
                        placeholder="4"
                        min="1"
                        max="72"
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
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-secondary uppercase">
                  Địa điểm tham quan
                </label>
                <input
                  type="text"
                  placeholder="Tìm địa điểm..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border-light text-sm focus:border-primary outline-none w-48"
                />
              </div>

              {/* Grid địa điểm */}
              {loadingLocations ? (
                <div className="py-10 text-center">
                  <IconLoader className="w-8 h-8 text-primary animate-spin mx-auto" />
                  <p className="text-text-secondary text-sm mt-2">
                    Đang tải địa điểm...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredLocations.map((place) => {
                    const isSelected = selectedPlaces.some(
                      (p) => p._id === place._id
                    );
                    const has3D =
                      place.models3d?.length > 0 || place.has_3d_model;
                    return (
                      <div
                        key={place._id}
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
                            src={
                              place.images?.[0] ||
                              place.cover_image ||
                              "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg"
                            }
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
                            {place.category?.name || "Di sản"}
                          </p>

                          {/* Badge 3D */}
                          {has3D && (
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
                  {filteredLocations.length === 0 && (
                    <div className="col-span-2 py-10 text-center text-text-secondary">
                      Không tìm thấy địa điểm nào
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-border-light">
                <p className="text-sm font-bold text-text-primary mb-2">
                  Đã chọn ({selectedPlaces.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedPlaces.map((p) => (
                    <span
                      key={p._id}
                      className="px-3 py-1 rounded-lg bg-bg-main border border-border-light text-xs font-medium flex items-center gap-2"
                    >
                      {p.name}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlace(p);
                        }}
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
                name="itinerary"
                value={formData.itinerary}
                onChange={handleInputChange}
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
                  Giá tour / khách <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none font-bold text-lg"
                    placeholder="0"
                    min="0"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-xs bg-white px-2 py-1 rounded border border-border-light">
                    VND
                  </span>
                </div>
                {formData.price && (
                  <p className="text-sm text-primary font-medium">
                    {formatCurrency(Number(formData.price))}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary uppercase">
                  Số khách tối đa
                </label>
                <input
                  type="number"
                  name="max_guests"
                  value={formData.max_guests}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none"
                  placeholder="VD: 10"
                  min="1"
                  max="100"
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
                        setFormData((prev) => ({
                          ...prev,
                          cover_image_url: "",
                        }));
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

            {/* Summary */}
            <div className="bg-bg-main/50 rounded-2xl p-6 border border-border-light">
              <h4 className="font-bold text-text-primary mb-4">Tóm tắt Tour</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-text-secondary">Tên:</span>{" "}
                  <span className="font-medium">{formData.name || "-"}</span>
                </p>
                <p>
                  <span className="text-text-secondary">Thời lượng:</span>{" "}
                  <span className="font-medium">
                    {formData.duration_hours || "-"} giờ
                  </span>
                </p>
                <p>
                  <span className="text-text-secondary">Giá:</span>{" "}
                  <span className="font-medium text-primary">
                    {formData.price
                      ? formatCurrency(Number(formData.price))
                      : "-"}
                  </span>
                </p>
                <p>
                  <span className="text-text-secondary">Số khách tối đa:</span>{" "}
                  <span className="font-medium">
                    {formData.max_guests || "10"} người
                  </span>
                </p>
                <p>
                  <span className="text-text-secondary">Địa điểm:</span>{" "}
                  <span className="font-medium">
                    {selectedPlaces.map((p) => p.name).join(", ") || "-"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="flex justify-between pt-8 mt-8 border-t border-border-light">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1 || isSubmitting}
            className={`
              px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all
              ${
                step === 1 || isSubmitting
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-text-secondary hover:bg-bg-main hover:text-primary"
              }
            `}
          >
            <IconChevronLeft className="w-4 h-4" /> Quay lại
          </button>

          {step < 3 ? (
            <button
              onClick={handleNextStep}
              className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95"
            >
              Tiếp tục <IconArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-all shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <IconLoader className="w-5 h-5 animate-spin" /> Đang gửi...
                </>
              ) : (
                <>
                  <IconCheck className="w-5 h-5" /> Hoàn tất & Đăng
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
