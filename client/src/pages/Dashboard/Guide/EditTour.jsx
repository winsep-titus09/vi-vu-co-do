import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import {
  useTourDetail,
  useTourCategories,
  useLocations,
  useUpdateTourRequest,
  useDeleteTourRequest,
} from "../../../features/guides/hooks";
import { formatCurrency } from "../../../lib/formatters";
import Spinner from "../../../components/Loaders/Spinner";

// Inline Loader Icon
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

export default function GuideEditTour() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedPlaces, setSelectedPlaces] = useState([]);

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
    status: "pending",
  });

  // Fetch data from API
  const { tour, isLoading: loadingTour, error: tourError } = useTourDetail(id);
  const { categories, isLoading: loadingCategories } = useTourCategories();
  const { locations, isLoading: loadingLocations } = useLocations();
  const { updateTourRequest, isSubmitting } = useUpdateTourRequest();
  const { deleteTourRequest, isDeleting } = useDeleteTourRequest();

  // Filter locations by search
  const filteredLocations = locations.filter((loc) => {
    if (!searchLocation) return true;
    return loc.name?.toLowerCase().includes(searchLocation.toLowerCase());
  });

  // Populate form when tour data is loaded
  useEffect(() => {
    if (tour) {
      // Parse itinerary back to text
      let itineraryText = "";
      if (Array.isArray(tour.itinerary)) {
        itineraryText = tour.itinerary
          .map(
            (item) =>
              `- ${item.title || ""}: ${item.details || item.description || ""}`
          )
          .join("\n");
      }

      // Get category_id
      const categoryId =
        tour.category_id?._id ||
        tour.category_id ||
        (tour.categories && tour.categories[0]?._id) ||
        (tour.categories && tour.categories[0]) ||
        "";

      setFormData({
        name: tour.name || "",
        description: tour.description || "",
        duration_hours: tour.duration_hours || tour.duration || "",
        category_id: categoryId,
        price: tour.price || "",
        max_guests: tour.max_guests || "",
        itinerary: itineraryText,
        cover_image_url: tour.cover_image_url || "",
        status: tour.status || "pending",
      });

      // Set selected places from tour locations
      if (Array.isArray(tour.locations)) {
        const places = tour.locations
          .map((loc) => loc.locationId || loc)
          .filter(Boolean);
        setSelectedPlaces(places);
      }

      if (tour.cover_image_url) {
        setPreviewImage(tour.cover_image_url);
      }
    }
  }, [tour]);

  // Handle form input change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle location
  const togglePlace = (place) => {
    const exists = selectedPlaces.find((p) => p._id === place._id);
    if (exists) {
      setSelectedPlaces(selectedPlaces.filter((p) => p._id !== place._id));
    } else {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  };

  // Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        handleChange("cover_image_url", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate current step
  const validateStep = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        alert("Vui lòng nhập tên tour");
        return false;
      }
      if (!formData.duration_hours) {
        alert("Vui lòng nhập thời lượng tour");
        return false;
      }
      if (!formData.category_id) {
        alert("Vui lòng chọn danh mục tour");
        return false;
      }
    }
    if (step === 2) {
      if (selectedPlaces.length === 0) {
        alert("Vui lòng chọn ít nhất 1 địa điểm");
        return false;
      }
    }
    if (step === 3) {
      if (!formData.price) {
        alert("Vui lòng nhập giá tour");
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

  // Handle submit update
  const handleSubmit = async () => {
    if (!validateStep()) return;

    if (tour?.type !== "request" || tour?.status !== "pending") {
      alert("Chỉ có thể chỉnh sửa yêu cầu tour đang chờ duyệt");
      return;
    }

    try {
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
                    .replace(/^[-\u2022]\s*/, "")
                    .split(":")[0]
                    ?.trim() || `Diem ${i + 1}`,
                details: text.replace(/^[-\u2022]\s*/, "").trim(),
              }))
          : [],
        locations: selectedPlaces.map((p, i) => ({
          locationId: p._id,
          order: i,
        })),
      };

      console.log("Updating tour request:", payload);
      await updateTourRequest(id, payload);
      alert("Đã cập nhật yêu cầu tour thành công!");
      navigate("/dashboard/guide/my-tours");
    } catch (err) {
      console.error("Update tour error:", err);
      const errorMsg =
        err?.message ||
        err?.detail?.toString() ||
        "Không thể cập nhật tour. Vui lòng thử lại.";
      alert(errorMsg);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa yêu cầu tour này?")) return;

    try {
      await deleteTourRequest(id);
      alert("Đã xóa yêu cầu tour thành công!");
      navigate("/dashboard/guide/my-tours");
    } catch (err) {
      console.error("Delete tour error:", err);
      alert(err?.message || "Không thể xóa tour. Vui lòng thử lại.");
    }
  };

  // Loading state
  if (loadingTour) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (tourError) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">{tourError}</p>
        <button
          onClick={() => navigate("/dashboard/guide/my-tours")}
          className="text-primary hover:underline"
        >
          Quay lại danh sách tour
        </button>
      </div>
    );
  }

  // Check if tour can be edited
  const canEdit = tour?.type === "request" && tour?.status === "pending";
  const isApprovedTour = tour?.type === "tour" || tour?.status === "approved";

  // Status badge
  const getStatusBadge = () => {
    const status = tour?.status || formData.status;
    const statusMap = {
      pending: {
        label: "Chờ duyệt",
        class: "bg-yellow-100 text-yellow-700 border-yellow-200",
      },
      approved: {
        label: "Đã duyệt",
        class: "bg-green-100 text-green-700 border-green-200",
      },
      rejected: {
        label: "Bị từ chối",
        class: "bg-red-100 text-red-700 border-red-200",
      },
      active: {
        label: "Đang hoạt động",
        class: "bg-green-100 text-green-700 border-green-200",
      },
      inactive: {
        label: "Tạm ẩn",
        class: "bg-gray-100 text-gray-700 border-gray-200",
      },
    };
    const config = statusMap[status] || statusMap.pending;
    return (
      <span
        className={`px-3 py-0.5 rounded-full text-xs font-bold border ${config.class}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-heading font-bold text-text-primary">
              {canEdit ? "Chỉnh sửa Tour" : "Chi tiết Tour"}
            </h1>
            {getStatusBadge()}
          </div>
          <p className="text-text-secondary text-sm">
            {canEdit
              ? "Cập nhật thông tin yêu cầu tạo tour"
              : "Xem thông tin tour"}
          </p>
        </div>

        {/* Actions Header */}
        {canEdit && (
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl border border-red-100 text-red-600 bg-red-50 font-bold text-xs hover:bg-red-100 transition-all flex items-center gap-1 disabled:opacity-50"
            >
              {isDeleting ? (
                <IconLoader className="w-3 h-3 animate-spin" />
              ) : (
                <IconTrash className="w-3 h-3" />
              )}
              Xóa yêu cầu
            </button>
          </div>
        )}
      </div>

      {/* Not editable warning */}
      {!canEdit && tour && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-yellow-800 text-sm">
            {isApprovedTour
              ? "Tour đã được duyệt. Vui lòng liên hệ admin nếu cần thay đổi."
              : "Yêu cầu tour đã bị từ chối. Vui lòng tạo yêu cầu mới."}
          </p>
        </div>
      )}

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
                  Tên tour <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary uppercase">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  {loadingCategories ? (
                    <div className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30">
                      <IconLoader className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <select
                      value={formData.category_id}
                      onChange={(e) =>
                        handleChange("category_id", e.target.value)
                      }
                      disabled={!canEdit}
                      className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-secondary uppercase">
                    Thời lượng (Giờ) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.duration_hours}
                      onChange={(e) =>
                        handleChange("duration_hours", e.target.value)
                      }
                      disabled={!canEdit}
                      min="1"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed"
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
                  disabled={!canEdit}
                  className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none resize-none disabled:opacity-60 disabled:cursor-not-allowed"
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

            {/* Search locations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-secondary uppercase">
                  Địa điểm tham quan <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-primary font-medium">
                  Đã chọn: {selectedPlaces.length} địa điểm
                </span>
              </div>

              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm địa điểm..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none"
                />
                <IconMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              </div>

              {/* Location grid */}
              {loadingLocations ? (
                <div className="flex items-center justify-center py-10">
                  <IconLoader className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredLocations.map((place) => {
                    const isSelected = selectedPlaces.some(
                      (p) => p._id === place._id
                    );
                    return (
                      <div
                        key={place._id}
                        onClick={() => canEdit && togglePlace(place)}
                        className={`
                          relative flex items-center gap-4 p-3 rounded-2xl border transition-all
                          ${canEdit ? "cursor-pointer" : "cursor-default"}
                          ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border-light hover:border-primary/50"
                          }
                        `}
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                          <img
                            src={
                              place.cover_image_url ||
                              place.images?.[0] ||
                              "/images/placeholders/location.jpg"
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
                            {place.category?.name || place.type || "Địa điểm"}
                          </p>
                          {place.model_3d_url && (
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
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary uppercase">
                Chi tiết lịch trình
              </label>
              <textarea
                rows="6"
                value={formData.itinerary}
                onChange={(e) => handleChange("itinerary", e.target.value)}
                disabled={!canEdit}
                placeholder="- 08:00: Don khach tai diem hen&#10;- 09:00: Tham quan Dai Noi&#10;- 12:00: An trua"
                className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none resize-none disabled:opacity-60 disabled:cursor-not-allowed"
              ></textarea>
              <p className="text-xs text-text-secondary">
                Mỗi dòng là một mục trong lịch trình. Bắt đầu bằng dấu "-" hoặc
                "•".
              </p>
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
                  Giá tour / khách <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    disabled={!canEdit}
                    min="0"
                    className="w-full pl-5 pr-12 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none font-bold text-lg disabled:opacity-60 disabled:cursor-not-allowed"
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
                  value={formData.max_guests}
                  onChange={(e) => handleChange("max_guests", e.target.value)}
                  disabled={!canEdit}
                  min="1"
                  className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary uppercase">
                Ảnh bìa Tour
              </label>
              <div className="border-2 border-dashed border-border-light rounded-3xl p-2 text-center hover:bg-bg-main/50 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden h-72">
                {previewImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-2xl"
                    />
                    {canEdit && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-bold bg-black/50 px-4 py-2 rounded-full">
                          Thay đổi ảnh
                        </p>
                      </div>
                    )}
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
                {canEdit && (
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-bg-main/50 rounded-2xl p-6 border border-border-light">
              <h4 className="font-bold text-text-primary mb-4">Tóm tắt tour</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-text-secondary">Tên tour</p>
                  <p className="font-bold text-text-primary truncate">
                    {formData.name || "Chưa nhập"}
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary">Thời lượng</p>
                  <p className="font-bold text-text-primary">
                    {formData.duration_hours || 0} giờ
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary">Địa điểm</p>
                  <p className="font-bold text-text-primary">
                    {selectedPlaces.length} điểm
                  </p>
                </div>
                <div>
                  <p className="text-text-secondary">Giá tour</p>
                  <p className="font-bold text-primary">
                    {formatCurrency(formData.price || 0)}
                  </p>
                </div>
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
              onClick={handleNextStep}
              className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95"
            >
              Tiếp tục <IconArrowRight className="w-4 h-4" />
            </button>
          ) : canEdit ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-all shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <IconLoader className="w-5 h-5 animate-spin" />
              ) : (
                <IconCheck className="w-5 h-5" />
              )}
              Lưu thay đổi
            </button>
          ) : (
            <button
              onClick={() => navigate("/dashboard/guide/my-tours")}
              className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2 active:scale-95"
            >
              Quay lại danh sách
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
