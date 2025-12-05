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
  IconPlus,
  IconLoader,
  IconGripVertical,
  IconTrash,
  IconChevronUp,
  IconChevronDown,
} from "../../../icons/IconCommon";
import {
  useTourDetail,
  useTourCategories,
  useLocations,
  useUpdateTourRequest,
  useDeleteTourRequest,
} from "../../../features/guides/hooks";
import { toursApi } from "../../../features/tours/api";
import { formatCurrency, toNumber } from "../../../lib/formatters";
import Spinner from "../../../components/Loaders/Spinner";
import { useToast } from "../../../components/Toast/useToast";

export default function GuideEditTour() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  // Itinerary items state (thay vì textarea)
  const [itineraryItems, setItineraryItems] = useState([
    { id: 1, time: "08:00", title: "", description: "", location: null },
  ]);
  const [draggedItem, setDraggedItem] = useState(null);

  // Highlights/Includes/Excludes
  const [highlights, setHighlights] = useState([{ id: 1, text: "" }]);
  const [includes, setIncludes] = useState([{ id: 1, text: "" }]);
  const [excludes, setExcludes] = useState([{ id: 1, text: "" }]);

  // Amenities (tiện ích) và Rules (quy tắc)
  const [amenities, setAmenities] = useState([{ id: 1, text: "" }]);
  const [rules, setRules] = useState([{ id: 1, text: "" }]);

  // Gallery state
  const [galleryUrls, setGalleryUrls] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_hours: "",
    category_id: "",
    price: "",
    max_guests: "",
    cover_image_url: "",
    video_url: "", // Video giới thiệu tour (đầu trang)
    guide_video_url: "", // Video giới thiệu HDV (phần tiện ích)
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
        price: toNumber(tour.price) || "",
        max_guests: tour.max_guests || "",
        cover_image_url: tour.cover_image_url || "",
        video_url: tour.video_url || "",
        guide_video_url: tour.guide_video_url || "",
        status: tour.status || "pending",
      });

      // Set selected places from tour locations
      let places = [];
      if (Array.isArray(tour.locations)) {
        places = tour.locations
          .map((loc) => loc.locationId || loc)
          .filter(Boolean);
        setSelectedPlaces(places);
      }

      // Parse itinerary to items
      if (Array.isArray(tour.itinerary) && tour.itinerary.length > 0) {
        const items = tour.itinerary.map((item, idx) => ({
          id: idx + 1,
          time: item.time || "08:00",
          title: item.title || "",
          description: item.details || item.description || "",
          location: places.find(p => p._id === item.locationId) || null,
        }));
        setItineraryItems(items);
      }

      // Parse highlights
      if (Array.isArray(tour.highlights) && tour.highlights.length > 0) {
        setHighlights(tour.highlights.map((text, idx) => ({ id: idx + 1, text })));
      }

      // Parse includes
      if (Array.isArray(tour.includes) && tour.includes.length > 0) {
        setIncludes(tour.includes.map((text, idx) => ({ id: idx + 1, text })));
      }

      // Parse excludes
      if (Array.isArray(tour.excludes) && tour.excludes.length > 0) {
        setExcludes(tour.excludes.map((text, idx) => ({ id: idx + 1, text })));
      }

      // Parse amenities
      if (Array.isArray(tour.amenities) && tour.amenities.length > 0) {
        setAmenities(tour.amenities.map((text, idx) => ({ id: idx + 1, text })));
      }

      // Parse rules
      if (Array.isArray(tour.rules) && tour.rules.length > 0) {
        setRules(tour.rules.map((text, idx) => ({ id: idx + 1, text })));
      }

      // Parse gallery
      if (Array.isArray(tour.gallery) && tour.gallery.length > 0) {
        setGalleryUrls(tour.gallery);
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

  // ======== ITINERARY FUNCTIONS ========
  const addItineraryItem = () => {
    const lastItem = itineraryItems[itineraryItems.length - 1];
    let nextTime = "08:00";
    if (lastItem?.time) {
      const [h, m] = lastItem.time.split(":").map(Number);
      const totalMins = h * 60 + m + 30;
      const newH = Math.floor(totalMins / 60) % 24;
      const newM = totalMins % 60;
      nextTime = `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
    }
    setItineraryItems([
      ...itineraryItems,
      { id: Date.now(), time: nextTime, title: "", description: "", location: null },
    ]);
  };

  const updateItineraryItem = (id, field, value) => {
    setItineraryItems((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItineraryItem = (id) => {
    if (itineraryItems.length <= 1) {
      toast.warning("Cần ít nhất 1 mục", "Lịch trình cần có ít nhất 1 hoạt động.");
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
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
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
    { time: "08:00", title: "Đón khách", description: "Đón khách tại điểm hẹn" },
    { time: "08:30", title: "Tham quan", description: "Tham quan và nghe thuyết minh" },
    { time: "10:00", title: "Nghỉ giải lao", description: "Nghỉ ngơi, chụp ảnh" },
    { time: "11:30", title: "Ăn trưa", description: "Thưởng thức ẩm thực địa phương" },
    { time: "14:00", title: "Tiếp tục hành trình", description: "Di chuyển đến điểm tiếp theo" },
    { time: "17:00", title: "Kết thúc", description: "Tiễn khách, kết thúc tour" },
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

  // ======== GALLERY FUNCTIONS ========
  const addGalleryUrl = (url) => {
    if (galleryUrls.length >= 8) {
      toast.warning("Giới hạn ảnh", "Tối đa 8 ảnh cho gallery");
      return;
    }
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      setGalleryUrls((prev) => [...prev, url]);
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + galleryUrls.length > 8) {
      toast.warning("Giới hạn ảnh", "Tối đa 8 ảnh cho gallery");
      return;
    }
    // Preview as data URLs (in production, should upload to cloud)
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryUrls((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
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

  // Handle submit update
  const handleSubmit = async () => {
    if (!validateStep()) return;

    // Kiểm tra quyền chỉnh sửa từ API response
    if (!tour?.canEdit) {
      toast.warning(
        "Không thể chỉnh sửa",
        "Bạn không có quyền chỉnh sửa tour này"
      );
      return;
    }

    try {
      const imageUrl = formData.cover_image_url;
      const isValidUrl =
        imageUrl &&
        (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"));

      // Filter valid gallery URLs
      const validGalleryUrls = galleryUrls.filter(
        (url) => url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")
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
        video_url: formData.video_url?.trim() || null,
        guide_video_url: formData.guide_video_url?.trim() || null,
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
        highlights: highlights
          .filter((h) => h.text.trim())
          .map((h) => h.text.trim()),
        includes: includes
          .filter((i) => i.text.trim())
          .map((i) => i.text.trim()),
        excludes: excludes
          .filter((e) => e.text.trim())
          .map((e) => e.text.trim()),
        amenities: amenities
          .filter((a) => a.text.trim())
          .map((a) => a.text.trim()),
        rules: rules
          .filter((r) => r.text.trim())
          .map((r) => r.text.trim()),
      };

      console.log("Updating tour:", payload);
      
      // Gọi API tùy theo loại tour
      if (tour?.type === "request") {
        // Tour request chưa duyệt - dùng API tour-requests
        await updateTourRequest(id, payload);
      } else {
        // Tour đã duyệt - dùng API tours
        await toursApi.updateTour(id, payload);
      }
      
      toast.success("Thành công!", "Đã cập nhật tour.");
      navigate("/dashboard/guide/my-tours");
    } catch (err) {
      console.error("Update tour error:", err);
      const errorMsg =
        err?.message ||
        err?.detail?.toString() ||
        "Không thể cập nhật tour. Vui lòng thử lại.";
      toast.error("Lỗi cập nhật", errorMsg);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa yêu cầu tour này?")) return;

    try {
      await deleteTourRequest(id);
      toast.success("Thành công!", "Đã xóa yêu cầu tour.");
      navigate("/dashboard/guide/my-tours");
    } catch (err) {
      console.error("Delete tour error:", err);
      toast.error(
        "Lỗi xóa",
        err?.message || "Không thể xóa tour. Vui lòng thử lại."
      );
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

  // Check if tour can be edited - use canEdit from API response
  const canEdit = tour?.canEdit === true;
  const isApprovedTour = tour?.type === "tour" && tour?.approval?.status === "approved";
  const editDeadline = tour?.edit_allowed_until ? new Date(tour.edit_allowed_until) : null;
  const hasTimeLimit = editDeadline && editDeadline > new Date();

  // If tour exists but cannot be edited, show warning
  if (tour && !canEdit) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconX className="w-8 h-8 text-yellow-600" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Không thể chỉnh sửa</h2>
        <p className="text-text-secondary mb-6">
          {isApprovedTour 
            ? "Tour đã được duyệt. Bạn cần gửi yêu cầu chỉnh sửa để được admin phê duyệt."
            : "Bạn không có quyền chỉnh sửa tour này."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate("/dashboard/guide/my-tours")}
            className="px-4 py-2 rounded-xl border border-border-light text-text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            Quay lại danh sách
          </button>
          {isApprovedTour && (
            <button
              onClick={() => navigate("/dashboard/guide/edit-requests")}
              className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Gửi yêu cầu chỉnh sửa
            </button>
          )}
        </div>
      </div>
    );
  }

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
              ? "Cập nhật thông tin tour"
              : "Xem thông tin tour"}
          </p>
          {/* Hiển thị thời hạn chỉnh sửa nếu có */}
          {hasTimeLimit && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg inline-block">
              <p className="text-xs text-blue-700">
                <span className="font-bold">⏰ Thời hạn chỉnh sửa:</span>{" "}
                {editDeadline.toLocaleDateString("vi-VN", { 
                  day: "2-digit", 
                  month: "2-digit", 
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </p>
            </div>
          )}
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
                  placeholder="Hãy viết một đoạn giới thiệu hấp dẫn về tour của bạn..."
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
              
              {/* Selected places summary */}
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
                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlace(p);
                          }}
                          className="hover:text-red-500"
                        >
                          <IconX className="w-3 h-3" />
                        </button>
                      )}
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

            {/* Itinerary Builder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-secondary uppercase">
                  Chi tiết lịch trình (Timeline)
                </label>
                {canEdit && (
                  <button
                    type="button"
                    onClick={addItineraryItem}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-1"
                  >
                    <IconPlus className="w-3.5 h-3.5" /> Thêm mục
                  </button>
                )}
              </div>

              {/* Gợi ý nhanh */}
              {canEdit && (
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
              )}

              {/* Timeline Items */}
              <div className="space-y-3">
                {itineraryItems.map((item, index) => (
                  <div
                    key={item.id}
                    draggable={canEdit}
                    onDragStart={(e) => canEdit && handleDragStart(e, item)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => canEdit && handleDrop(e, item)}
                    onDragEnd={handleDragEnd}
                    className={`
                      relative flex gap-3 p-4 rounded-xl border transition-all group
                      ${draggedItem?.id === item.id
                        ? "border-primary bg-primary/5 opacity-50"
                        : "border-border-light bg-white hover:border-primary/30 hover:shadow-sm"
                      }
                    `}
                  >
                    {/* Drag Handle & Order */}
                    <div className="flex flex-col items-center gap-1 pt-1">
                      {canEdit && (
                        <div className="cursor-grab active:cursor-grabbing text-text-secondary/50 hover:text-primary transition-colors">
                          <IconGripVertical className="w-4 h-4" />
                        </div>
                      )}
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
                            onChange={(e) => updateItineraryItem(item.id, "time", e.target.value)}
                            disabled={!canEdit}
                            className="w-full px-2 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm font-medium focus:border-primary focus:bg-white outline-none disabled:opacity-60"
                          />
                        </div>
                        {/* Title Input */}
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItineraryItem(item.id, "title", e.target.value)}
                          disabled={!canEdit}
                          placeholder="Tiêu đề hoạt động (VD: Đón khách, Tham quan...)"
                          className="flex-1 px-3 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm font-medium focus:border-primary focus:bg-white outline-none disabled:opacity-60"
                        />
                      </div>

                      <div className="flex gap-2">
                        {/* Description */}
                        <textarea
                          value={item.description}
                          onChange={(e) => updateItineraryItem(item.id, "description", e.target.value)}
                          disabled={!canEdit}
                          placeholder="Mô tả chi tiết hoạt động..."
                          rows={2}
                          className="flex-1 px-3 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm focus:border-primary focus:bg-white outline-none resize-none disabled:opacity-60"
                        />
                      </div>

                      {/* Link địa điểm đã chọn */}
                      {selectedPlaces.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-secondary">Gắn địa điểm:</span>
                          <select
                            value={item.location?._id || ""}
                            onChange={(e) => {
                              const place = selectedPlaces.find((p) => p._id === e.target.value);
                              updateItineraryItem(item.id, "location", place || null);
                            }}
                            disabled={!canEdit}
                            className="px-2 py-1 rounded-lg border border-border-light text-xs bg-white focus:border-primary outline-none disabled:opacity-60"
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
                              <IconMapPin className="w-3 h-3" /> {item.location.name}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {canEdit && (
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
                    )}
                  </div>
                ))}
              </div>

              {/* Tip */}
              <p className="text-xs text-text-secondary italic flex items-start gap-1.5">
                <span>💡</span>
                <span>Kéo thả để sắp xếp lại thứ tự. Gắn địa điểm để liên kết với thông tin 3D/lịch sử.</span>
              </p>
            </div>
          </div>
        )}

        {/* --- STEP 3: PRICE & IMAGE --- */}
        {step === 3 && (
          <div className="space-y-8 animate-fade-in">
            <h3 className="text-xl font-bold text-text-primary border-b border-border-light pb-4">
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
                  value={formData.max_guests}
                  onChange={(e) => handleChange("max_guests", e.target.value)}
                  disabled={!canEdit}
                  min="1"
                  max="100"
                  placeholder="VD: 10"
                  className="w-full px-5 py-3.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />
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
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(null);
                          handleChange("cover_image_url", "");
                        }}
                        className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white text-red-500 shadow-sm"
                      >
                        <IconX className="w-5 h-5" />
                      </button>
                    )}
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

            {/* Video giới thiệu tour */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary uppercase">
                Video giới thiệu tour (YouTube/Vimeo URL)
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... hoặc https://vimeo.com/..."
                value={formData.video_url || ""}
                onChange={(e) => handleChange("video_url", e.target.value)}
                disabled={!canEdit}
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/50 text-sm focus:border-primary focus:bg-white outline-none transition-all disabled:opacity-60"
              />
              <p className="text-xs text-text-secondary">
                Video này hiển thị ở đầu trang chi tiết tour
              </p>
            </div>

            {/* Video giới thiệu hướng dẫn viên */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-secondary uppercase">
                Video giới thiệu hướng dẫn viên (YouTube/Vimeo URL)
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... hoặc https://vimeo.com/..."
                value={formData.guide_video_url || ""}
                onChange={(e) => handleChange("guide_video_url", e.target.value)}
                disabled={!canEdit}
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/50 text-sm focus:border-primary focus:bg-white outline-none transition-all disabled:opacity-60"
              />
              <p className="text-xs text-text-secondary">
                Video giới thiệu về bạn (HDV), hiển thị bên cạnh phần tiện ích
              </p>
            </div>

            {/* Gallery */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-secondary uppercase">
                  Thư viện ảnh (Tối đa 8 ảnh)
                </label>
                <span className="text-xs text-text-secondary">
                  {galleryUrls.length}/8
                </span>
              </div>

              {/* Input thêm URL ảnh */}
              {canEdit && galleryUrls.length < 8 && (
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
                {galleryUrls.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-xl overflow-hidden group"
                  >
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/images/placeholders/tour-placeholder.jpg";
                      }}
                    />
                    {canEdit && (
                      <button
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <IconX className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                {canEdit && galleryUrls.length < 8 && (
                  <label className="aspect-video rounded-xl border-2 border-dashed border-border-light hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-bg-main/50">
                    <IconPlus className="w-6 h-6 text-text-secondary" />
                    <span className="text-xs text-text-secondary mt-1">Tải ảnh lên</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleGalleryUpload}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-text-secondary">
                💡 Dán link ảnh hoặc tải lên từ máy tính.
              </p>
            </div>

            {/* Điểm nổi bật */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-secondary uppercase">
                  Điểm nổi bật của tour
                </label>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => addListItem(setHighlights)}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <IconPlus className="w-3.5 h-3.5" /> Thêm
                  </button>
                )}
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
                      onChange={(e) => updateListItem(setHighlights, item.id, e.target.value)}
                      disabled={!canEdit}
                      placeholder="VD: Tham quan Đại Nội về đêm với ánh sáng đặc biệt"
                      className="flex-1 px-3 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm focus:border-primary focus:bg-white outline-none disabled:opacity-60"
                    />
                    {canEdit && highlights.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListItem(setHighlights, highlights, item.id)}
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
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => addListItem(setIncludes)}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      + Thêm
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {includes.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <IconCheck className="w-4 h-4 text-green-500 shrink-0" />
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateListItem(setIncludes, item.id, e.target.value)}
                        disabled={!canEdit}
                        placeholder="VD: Vé tham quan"
                        className="flex-1 px-3 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm focus:border-primary focus:bg-white outline-none disabled:opacity-60"
                      />
                      {canEdit && includes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeListItem(setIncludes, includes, item.id)}
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
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => addListItem(setExcludes)}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      + Thêm
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {excludes.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <IconX className="w-4 h-4 text-red-400 shrink-0" />
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateListItem(setExcludes, item.id, e.target.value)}
                        disabled={!canEdit}
                        placeholder="VD: Ăn uống cá nhân"
                        className="flex-1 px-3 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm focus:border-primary focus:bg-white outline-none disabled:opacity-60"
                      />
                      {canEdit && excludes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeListItem(setExcludes, excludes, item.id)}
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

            {/* Tiện ích */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-secondary uppercase flex items-center gap-1.5">
                  🎁 Tiện ích tour
                </label>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => addListItem(setAmenities)}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    + Thêm
                  </button>
                )}
              </div>
              <p className="text-xs text-text-secondary">
                Các tiện ích đi kèm: Wi-Fi, nước uống, bảo hiểm, hướng dẫn viên...
              </p>
              <div className="space-y-2">
                {amenities.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <IconCheck className="w-4 h-4 text-primary shrink-0" />
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        updateListItem(setAmenities, item.id, e.target.value)
                      }
                      disabled={!canEdit}
                      placeholder="VD: Hướng dẫn viên chuyên nghiệp"
                      className="flex-1 px-3 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm focus:border-primary focus:bg-white outline-none disabled:opacity-60"
                    />
                    {canEdit && amenities.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeListItem(setAmenities, amenities, item.id)
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

            {/* Quy tắc tour */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-text-secondary uppercase flex items-center gap-1.5">
                  📋 Quy tắc tour
                </label>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => addListItem(setRules)}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    + Thêm
                  </button>
                )}
              </div>
              <p className="text-xs text-text-secondary">
                Các quy tắc khách cần tuân thủ khi tham gia tour
              </p>
              <div className="space-y-2">
                {rules.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        updateListItem(setRules, item.id, e.target.value)
                      }
                      disabled={!canEdit}
                      placeholder="VD: Đến điểm tập trung đúng giờ"
                      className="flex-1 px-3 py-2 rounded-lg border border-border-light bg-bg-main/50 text-sm focus:border-primary focus:bg-white outline-none disabled:opacity-60"
                    />
                    {canEdit && rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeListItem(setRules, rules, item.id)
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
                    <span className="font-medium">{formData.duration_hours || "-"} giờ</span>
                  </p>
                  <p>
                    <span className="text-text-secondary">Giá:</span>{" "}
                    <span className="font-medium text-primary">
                      {formData.price ? formatCurrency(Number(formData.price)) : "-"}
                    </span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="text-text-secondary">Số khách tối đa:</span>{" "}
                    <span className="font-medium">{formData.max_guests || "10"} người</span>
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
