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
  IconLoader,
} from "../../../icons/IconCommon";
import {
  useTourCategories,
  useLocations,
  useCreateTour,
} from "../../../features/guides/hooks";
import { uploadApi } from "../../../features/upload/api";
import { formatCurrency } from "../../../lib/formatters";
import { useToast } from "../../../components/Toast/useToast";

// Icons for itinerary
const IconGripVertical = ({ className }) => (
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
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
);

const IconTrash = ({ className }) => (
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
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const IconChevronUp = ({ className }) => (
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
    <path d="m18 15-6-6-6 6" />
  </svg>
);

const IconChevronDown = ({ className }) => (
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
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function CreateTour() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchLocation, setSearchLocation] = useState("");
  const toast = useToast();

  // Itinerary items state (thay vì textarea)
  const [itineraryItems, setItineraryItems] = useState([
    { id: 1, time: "08:00", title: "", description: "", location: null },
  ]);
  const [draggedItem, setDraggedItem] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_hours: "",
    category_id: "",
    price: "",
    max_guests: "",
    cover_image_url: "",
    video_url: "", // Video giới thiệu (YouTube/Vimeo URL)
    // New fields
    fixed_departure_time: "08:00",
    min_days_before_start: 1,
    max_days_advance: 90,
  });

  // Gallery state
  const [galleryPreviews, setGalleryPreviews] = useState([]); // preview URLs cho hiển thị
  const [galleryUrls, setGalleryUrls] = useState([]); // actual URLs (from upload or paste)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  // Highlights/Amenities
  const [highlights, setHighlights] = useState([{ id: 1, text: "" }]);

  // Includes / Excludes
  const [includes, setIncludes] = useState([{ id: 1, text: "" }]);
  const [excludes, setExcludes] = useState([{ id: 1, text: "" }]);

  // Fetch data from API
  const { categories, isLoading: loadingCategories } = useTourCategories();
  const { locations, isLoading: loadingLocations } = useLocations();
  const { createTour, isSubmitting } = useCreateTour();

  // Filter locations by search
  const filteredLocations = locations.filter((loc) => {
    if (!searchLocation) return true;
    return loc.name?.toLowerCase().includes(searchLocation.toLowerCase());
  });

  // ======== ITINERARY FUNCTIONS ========
  const addItineraryItem = () => {
    const lastItem = itineraryItems[itineraryItems.length - 1];
    // Tự động tính thời gian tiếp theo (+30 phút)
    let nextTime = "08:00";
    if (lastItem?.time) {
      const [h, m] = lastItem.time.split(":").map(Number);
      const totalMins = h * 60 + m + 30;
      const newH = Math.floor(totalMins / 60) % 24;
      const newM = totalMins % 60;
      nextTime = `${String(newH).padStart(2, "0")}:${String(newM).padStart(
        2,
        "0"
      )}`;
    }
    setItineraryItems([
      ...itineraryItems,
      {
        id: Date.now(),
        time: nextTime,
        title: "",
        description: "",
        location: null,
      },
    ]);
  };

  const updateItineraryItem = (id, field, value) => {
    setItineraryItems((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItineraryItem = (id) => {
    if (itineraryItems.length <= 1) {
      toast.warning(
        "Cần ít nhất 1 mục",
        "Lịch trình cần có ít nhất 1 hoạt động."
      );
      return;
    }
    setItineraryItems((items) => items.filter((item) => item.id !== id));
  };

  const moveItineraryItem = (id, direction) => {
    const index = itineraryItems.findIndex((item) => item.id === id);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= itineraryItems.length) return;

    const newItems = [...itineraryItems];
    [newItems[index], newItems[newIndex]] = [
      newItems[newIndex],
      newItems[index],
    ];
    setItineraryItems(newItems);
  };

  // Drag & Drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    const newItems = [...itineraryItems];
    const dragIndex = newItems.findIndex((item) => item.id === draggedItem.id);
    const targetIndex = newItems.findIndex((item) => item.id === targetItem.id);

    newItems.splice(dragIndex, 1);
    newItems.splice(targetIndex, 0, draggedItem);
    setItineraryItems(newItems);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Gợi ý nhanh cho lịch trình
  const quickTemplates = [
    {
      time: "08:00",
      title: "Đón khách",
      description: "Đón khách tại điểm hẹn",
    },
    {
      time: "08:30",
      title: "Tham quan",
      description: "Tham quan và nghe thuyết minh",
    },
    {
      time: "10:00",
      title: "Nghỉ giải lao",
      description: "Nghỉ ngơi, chụp ảnh",
    },
    {
      time: "11:30",
      title: "Ăn trưa",
      description: "Thưởng thức ẩm thực địa phương",
    },
    {
      time: "14:00",
      title: "Tiếp tục hành trình",
      description: "Di chuyển đến điểm tiếp theo",
    },
    {
      time: "17:00",
      title: "Kết thúc",
      description: "Tiễn khách, kết thúc tour",
    },
  ];

  const applyQuickTemplate = (template) => {
    const newItem = {
      id: Date.now(),
      time: template.time,
      title: template.title,
      description: template.description,
      location: null,
    };
    setItineraryItems([...itineraryItems, newItem]);
  };

  // ======== GALLERY FUNCTIONS ========
  const handleGalleryChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + galleryPreviews.length > 8) {
      toast.warning("Giới hạn ảnh", "Tối đa 8 ảnh cho gallery");
      return;
    }

    // Upload files to server
    setIsUploadingGallery(true);
    try {
      const result = await uploadApi.uploadImages(files, "tours/gallery");

      if (result.success && result.images) {
        const newUrls = result.images.map((img) => img.url);
        setGalleryPreviews((prev) => [...prev, ...newUrls]);
        setGalleryUrls((prev) => [...prev, ...newUrls]);
        toast.success("Upload thành công", `Đã tải lên ${result.count} ảnh`);
      }
    } catch (err) {
      console.error("Gallery upload error:", err);
      toast.error("Lỗi upload", err.message || "Không thể tải ảnh lên");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const addGalleryUrl = (url) => {
    if (galleryPreviews.length >= 8) {
      toast.warning("Giới hạn ảnh", "Tối đa 8 ảnh cho gallery");
      return;
    }
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      setGalleryPreviews((prev) => [...prev, url]);
      setGalleryUrls((prev) => [...prev, url]);
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // ======== LIST ITEM FUNCTIONS (highlights, includes, excludes) ========
  const addListItem = (setter) => {
    setter((prev) => [...prev, { id: Date.now(), text: "" }]);
  };

  const updateListItem = (setter, id, text) => {
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  const removeListItem = (setter, items, id) => {
    if (items.length <= 1) return;
    setter((prev) => prev.filter((item) => item.id !== id));
  };

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

      // Use galleryUrls which contains only valid uploaded/pasted URLs
      const validGalleryUrls = galleryUrls.filter(
        (url) => url.startsWith("http://") || url.startsWith("https://")
      );

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        duration_hours: Number(formData.duration_hours) || 4,
        duration: Math.ceil((Number(formData.duration_hours) || 4) / 24) || 1,
        price: Number(formData.price) || 0,
        max_guests: Number(formData.max_guests) || 10,
        categories: [formData.category_id],
        cover_image_url: isValidUrl ? imageUrl : null,
        video_url: formData.video_url?.trim() || null, // Video giới thiệu
        gallery: validGalleryUrls,
        itinerary: itineraryItems
          .filter((item) => item.title || item.description)
          .map((item, i) => ({
            day: 1,
            order: i + 1,
            time: item.time,
            title: item.title || `Điểm ${i + 1}`,
            details: item.description || item.title,
            locationId: item.location?._id || null,
          })),
        locations: selectedPlaces.map((p, i) => ({
          locationId: p._id,
          order: i,
        })),
        // New fields
        highlights: highlights
          .filter((h) => h.text.trim())
          .map((h) => h.text.trim()),
        includes: includes
          .filter((i) => i.text.trim())
          .map((i) => i.text.trim()),
        excludes: excludes
          .filter((e) => e.text.trim())
          .map((e) => e.text.trim()),
        fixed_departure_time: formData.fixed_departure_time || "08:00",
        min_days_before_start: Number(formData.min_days_before_start) || 1,
        max_days_advance: Number(formData.max_days_advance) || 90,
        allow_custom_date: true,
      };

      console.log("Submitting tour:", payload);
      await createTour(payload);
      toast.success(
        "Thành công!",
        "Đã tạo tour thành công. Vui lòng chờ admin duyệt."
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
                              "/images/placeholders/place-placeholder.jpg"
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-secondary uppercase">
                  Chi tiết lịch trình (Timeline)
                </label>
                <button
                  type="button"
                  onClick={addItineraryItem}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-1"
                >
                  <IconPlus className="w-3.5 h-3.5" /> Thêm mục
                </button>
              </div>

              {/* Gợi ý nhanh */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-text-secondary">Thêm nhanh:</span>
                {quickTemplates.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyQuickTemplate(tpl)}
                    className="px-2.5 py-1 rounded-full bg-bg-main border border-border-light text-[11px] font-medium hover:border-primary hover:text-primary transition-all"
                  >
                    {tpl.time} - {tpl.title}
                  </button>
                ))}
              </div>

              {/* Timeline Items */}
              <div className="space-y-3">
                {itineraryItems.map((item, index) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item)}
                    onDragEnd={handleDragEnd}
                    className={`
                      relative flex gap-3 p-4 rounded-xl border transition-all group
                      ${
                        draggedItem?.id === item.id
                          ? "border-primary bg-primary/5 opacity-50"
                          : "border-border-light bg-white hover:border-primary/30 hover:shadow-sm"
                      }
                    `}
                  >
                    {/* Drag Handle & Order */}
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <div className="cursor-grab active:cursor-grabbing text-text-secondary/50 hover:text-primary transition-colors">
                        <IconGripVertical className="w-4 h-4" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                      {index < itineraryItems.length - 1 && (
                        <div className="w-0.5 h-full bg-primary/20 absolute left-[26px] top-14 bottom-0"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        {/* Time Input */}
                        <div className="relative w-24 shrink-0">
                          <input
                            type="time"
                            value={item.time}
                            onChange={(e) =>
                              updateItineraryItem(
                                item.id,
                                "time",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm font-medium focus:border-primary focus:bg-white outline-none"
                          />
                        </div>
                        {/* Title Input */}
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            updateItineraryItem(
                              item.id,
                              "title",
                              e.target.value
                            )
                          }
                          placeholder="Tiêu đề hoạt động (VD: Đón khách, Tham quan...)"
                          className="flex-1 px-3 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm font-medium focus:border-primary focus:bg-white outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        {/* Description */}
                        <textarea
                          value={item.description}
                          onChange={(e) =>
                            updateItineraryItem(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Mô tả chi tiết hoạt động..."
                          rows={2}
                          className="flex-1 px-3 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm focus:border-primary focus:bg-white outline-none resize-none"
                        />
                      </div>

                      {/* Link địa điểm đã chọn */}
                      {selectedPlaces.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-secondary">
                            Gắn địa điểm:
                          </span>
                          <select
                            value={item.location?._id || ""}
                            onChange={(e) => {
                              const place = selectedPlaces.find(
                                (p) => p._id === e.target.value
                              );
                              updateItineraryItem(
                                item.id,
                                "location",
                                place || null
                              );
                            }}
                            className="px-2 py-1 rounded-lg border border-border-light text-xs bg-white focus:border-primary outline-none"
                          >
                            <option value="">-- Không chọn --</option>
                            {selectedPlaces.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                          {item.location && (
                            <span className="px-2 py-0.5 rounded bg-secondary/10 text-secondary text-[10px] font-bold flex items-center gap-1">
                              <IconMapPin className="w-3 h-3" />{" "}
                              {item.location.name}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => moveItineraryItem(item.id, "up")}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-bg-main text-text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Di chuyển lên"
                      >
                        <IconChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItineraryItem(item.id, "down")}
                        disabled={index === itineraryItems.length - 1}
                        className="p-1 rounded hover:bg-bg-main text-text-secondary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Di chuyển xuống"
                      >
                        <IconChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItineraryItem(item.id)}
                        className="p-1 rounded hover:bg-red-50 text-text-secondary hover:text-red-500 transition-all"
                        title="Xóa"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty state */}
              {itineraryItems.length === 0 && (
                <div className="py-8 text-center border-2 border-dashed border-border-light rounded-xl">
                  <IconClock className="w-10 h-10 text-text-secondary/30 mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">
                    Chưa có lịch trình nào
                  </p>
                  <button
                    type="button"
                    onClick={addItineraryItem}
                    className="mt-3 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
                  >
                    Thêm hoạt động đầu tiên
                  </button>
                </div>
              )}

              {/* Tip */}
              <p className="text-xs text-text-secondary italic flex items-start gap-1.5">
                <span>💡</span>
                <span>
                  Kéo thả để sắp xếp lại thứ tự. Gắn địa điểm để liên kết với
                  thông tin 3D/lịch sử.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* --- STEP 3: HOÀN THIỆN --- */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-bold text-text-primary mb-6">
              3. Giá, Hình ảnh & Chi tiết
            </h3>

            {/* Giá & Số khách */}
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

            {/* Cấu hình đặt tour */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <h4 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <IconClock className="w-5 h-5 text-primary" />
                Cấu hình đặt tour
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondary">
                    Giờ khởi hành mặc định
                  </label>
                  <input
                    type="time"
                    name="fixed_departure_time"
                    value={formData.fixed_departure_time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-border-light bg-white text-sm focus:border-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondary">
                    Đặt trước tối thiểu (ngày)
                  </label>
                  <input
                    type="number"
                    name="min_days_before_start"
                    value={formData.min_days_before_start}
                    onChange={handleInputChange}
                    min="0"
                    max="30"
                    className="w-full px-3 py-2 rounded-lg border border-border-light bg-white text-sm focus:border-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondary">
                    Đặt trước tối đa (ngày)
                  </label>
                  <input
                    type="number"
                    name="max_days_advance"
                    value={formData.max_days_advance}
                    onChange={handleInputChange}
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 rounded-lg border border-border-light bg-white text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Ảnh bìa */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary uppercase">
                Ảnh bìa Tour <span className="text-red-500">*</span>
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
                      Nhấn để tải ảnh bìa
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      JPG, PNG (Tối đa 5MB) - Kích thước khuyến nghị 1200x800
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

            {/* Video giới thiệu */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary uppercase">
                Video giới thiệu (YouTube/Vimeo URL)
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... hoặc https://vimeo.com/..."
                value={formData.video_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    video_url: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/50 text-sm focus:border-primary focus:bg-white outline-none transition-all"
              />
              <p className="text-xs text-text-secondary">
                Dán link video YouTube hoặc Vimeo để giới thiệu tour
              </p>
            </div>

            {/* Gallery */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-secondary uppercase">
                  Thư viện ảnh (Tối đa 8 ảnh)
                </label>
                <span className="text-xs text-text-secondary">
                  {galleryPreviews.length}/8
                </span>
              </div>

              {/* Input thêm URL ảnh */}
              {galleryPreviews.length < 8 && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Dán URL ảnh (https://...)"
                    className="flex-1 px-3 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm focus:border-primary focus:bg-white outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addGalleryUrl(e.target.value.trim());
                        e.target.value = "";
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      addGalleryUrl(input?.value?.trim());
                      if (input) input.value = "";
                    }}
                    className="px-3 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Loading indicator */}
                {isUploadingGallery && (
                  <div className="aspect-video rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center">
                    <IconLoader className="w-6 h-6 text-primary animate-spin" />
                    <span className="text-xs text-primary mt-1">
                      Đang tải...
                    </span>
                  </div>
                )}

                {galleryPreviews.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-xl overflow-hidden group"
                  >
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "/images/placeholders/tour-placeholder.jpg";
                      }}
                    />
                    <button
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IconX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {galleryPreviews.length < 8 && !isUploadingGallery && (
                  <label className="aspect-video rounded-xl border-2 border-dashed border-border-light hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-bg-main/50">
                    <IconPlus className="w-6 h-6 text-text-secondary" />
                    <span className="text-xs text-text-secondary mt-1">
                      Tải ảnh lên
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleGalleryChange}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-text-secondary">
                💡 Dán link ảnh hoặc tải lên từ máy tính (tự động upload lên
                cloud).
              </p>
            </div>

            {/* Điểm nổi bật */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-secondary uppercase">
                  Điểm nổi bật của tour
                </label>
                <button
                  type="button"
                  onClick={() => addListItem(setHighlights)}
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  <IconPlus className="w-3.5 h-3.5" /> Thêm
                </button>
              </div>
              <div className="space-y-2">
                {highlights.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        updateListItem(setHighlights, item.id, e.target.value)
                      }
                      placeholder="VD: Tham quan Đại Nội về đêm với ánh sáng đặc biệt"
                      className="flex-1 px-3 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm focus:border-primary focus:bg-white outline-none"
                    />
                    {highlights.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeListItem(setHighlights, highlights, item.id)
                        }
                        className="p-1.5 text-text-secondary hover:text-red-500 transition-colors"
                      >
                        <IconX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bao gồm / Không bao gồm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bao gồm */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-green-600 uppercase flex items-center gap-1.5">
                    <IconCheck className="w-4 h-4" /> Bao gồm
                  </label>
                  <button
                    type="button"
                    onClick={() => addListItem(setIncludes)}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    + Thêm
                  </button>
                </div>
                <div className="space-y-2">
                  {includes.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <IconCheck className="w-4 h-4 text-green-500 shrink-0" />
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          updateListItem(setIncludes, item.id, e.target.value)
                        }
                        placeholder="VD: Vé tham quan"
                        className="flex-1 px-3 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm focus:border-primary focus:bg-white outline-none"
                      />
                      {includes.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeListItem(setIncludes, includes, item.id)
                          }
                          className="p-1 text-text-secondary hover:text-red-500"
                        >
                          <IconX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Không bao gồm */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-red-500 uppercase flex items-center gap-1.5">
                    <IconX className="w-4 h-4" /> Không bao gồm
                  </label>
                  <button
                    type="button"
                    onClick={() => addListItem(setExcludes)}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    + Thêm
                  </button>
                </div>
                <div className="space-y-2">
                  {excludes.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <IconX className="w-4 h-4 text-red-400 shrink-0" />
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) =>
                          updateListItem(setExcludes, item.id, e.target.value)
                        }
                        placeholder="VD: Ăn uống cá nhân"
                        className="flex-1 px-3 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm focus:border-primary focus:bg-white outline-none"
                      />
                      {excludes.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeListItem(setExcludes, excludes, item.id)
                          }
                          className="p-1 text-text-secondary hover:text-red-500"
                        >
                          <IconX className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-bg-main/50 rounded-2xl p-6 border border-border-light">
              <h4 className="font-bold text-text-primary mb-4">Tóm tắt Tour</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
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
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="text-text-secondary">
                      Số khách tối đa:
                    </span>{" "}
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
                  <p>
                    <span className="text-text-secondary">Lịch trình:</span>{" "}
                    <span className="font-medium">
                      {itineraryItems.filter((i) => i.title).length} hoạt động
                    </span>
                  </p>
                </div>
              </div>
              {/* Preview highlights */}
              {highlights.filter((h) => h.text).length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-light">
                  <p className="text-xs font-bold text-text-secondary uppercase mb-2">
                    Điểm nổi bật:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {highlights
                      .filter((h) => h.text)
                      .map((h) => (
                        <span
                          key={h.id}
                          className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                        >
                          {h.text}
                        </span>
                      ))}
                  </div>
                </div>
              )}
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
