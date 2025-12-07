import React, { useState, useRef, useMemo } from "react";
import { useToast } from "../Toast/useToast";
import { IconMapPin, IconCheck } from "../../icons/IconBox";
import { IconChevronDown } from "../../icons/IconChevronDown";
import {
  IconImage,
  IconBox3D,
  IconUpload,
  IconLoader,
  IconPlus,
  IconTrash,
} from "../../icons/IconCommon";
import Icon360 from "../../icons/Icon360";

// Default coords for Hue city center
const DEFAULT_COORDS = [107.5901, 16.4637]; // [lng, lat]

const toNumber = (val) => {
  if (val?.$numberDecimal) return Number(val.$numberDecimal);
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : "";
};

export default function DestinationForm({
  initialData,
  categories = [],
  onSubmit,
  onCancel,
  isLoading = false,
}) {
  // Initialize form data from initialData or defaults
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        name: initialData.name || "",
        category_id:
          initialData.category_id?._id || initialData.category_id || "",
        address: initialData.address || "",
        description: initialData.description || "",
        coords: initialData.coords?.coordinates || DEFAULT_COORDS,
        image: null, // File object for new image
        existingImages: initialData.images || [],
        has3D: initialData.threeDModels?.length > 0 || false,
        modelFile: null,
        opening_hours: initialData.opening_hours || "",
        ticket_price: toNumber(initialData.ticket_price),
        ticket_price_currency: initialData.ticket_price_currency || "VND",
        best_visit_time: initialData.best_visit_time || "",
        highlights: initialData.highlights || [],
        // Panorama fields
        hasPanorama: initialData.threeDModels?.some(m => m.file_type === "panorama") || false,
        panoramaFile: null,
        existingPanorama: initialData.threeDModels?.find(m => m.file_type === "panorama") || null,
      };
    }
    return {
      name: "",
      category_id: categories[0]?._id || "",
      address: "",
      description: "",
      coords: DEFAULT_COORDS,
      image: null,
      existingImages: [],
      has3D: false,
      modelFile: null,
      opening_hours: "",
      ticket_price: "",
      ticket_price_currency: "VND",
      best_visit_time: "",
      highlights: [],
      hasPanorama: false,
      panoramaFile: null,
      existingPanorama: null,
    };
  });

  const [previewImg, setPreviewImg] = useState(
    initialData?.images?.[0] || null
  );
  const [panoramaPreview, setPanoramaPreview] = useState(
    initialData?.threeDModels?.find(m => m.file_type === "panorama")?.file_url || null
  );
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanoramaDragging, setIsPanoramaDragging] = useState(false);

  const fileInputRef = useRef(null);
  const modelInputRef = useRef(null);
  const panoramaInputRef = useRef(null);

  // Get selected category name for display
  const selectedCategoryName = useMemo(() => {
    const cat = categories.find((c) => c._id === formData.category_id);
    return cat?.name || "Chọn danh mục";
  }, [categories, formData.category_id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Image handling
  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, image: file }));
      const objectUrl = URL.createObjectURL(file);
      setPreviewImg(objectUrl);
    }
  };

  const handleImageChange = (e) => processFile(e.target.files[0]);

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null, existingImages: [] }));
    setPreviewImg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  // 3D file handling
  const handle3DFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData((prev) => ({ ...prev, modelFile: file }));
  };

  // Panorama file handling
  const processPanoramaFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, panoramaFile: file, existingPanorama: null }));
      const objectUrl = URL.createObjectURL(file);
      setPanoramaPreview(objectUrl);
    }
  };

  const handlePanoramaChange = (e) => processPanoramaFile(e.target.files[0]);

  const handleRemovePanorama = () => {
    setFormData((prev) => ({ ...prev, panoramaFile: null, existingPanorama: null }));
    setPanoramaPreview(null);
    if (panoramaInputRef.current) panoramaInputRef.current.value = "";
  };

  const handlePanoramaDragOver = (e) => {
    e.preventDefault();
    setIsPanoramaDragging(true);
  };
  const handlePanoramaDragLeave = (e) => {
    e.preventDefault();
    setIsPanoramaDragging(false);
  };
  const handlePanoramaDrop = (e) => {
    e.preventDefault();
    setIsPanoramaDragging(false);
    processPanoramaFile(e.dataTransfer.files[0]);
  };

  const toast = useToast();

  const addHighlight = () => {
    setFormData((prev) => ({
      ...prev,
      highlights: [
        ...prev.highlights,
        { name: "", description: "", duration: "", tip: "", image_url: "", order: prev.highlights.length },
      ],
    }));
  };

  const updateHighlight = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev.highlights];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, highlights: next };
    });
  };

  const removeHighlight = (index) => {
    setFormData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index).map((h, i) => ({ ...h, order: i })),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      toast.warning("Thiếu thông tin", "Vui lòng nhập tên địa điểm");
      return;
    }
    if (!formData.category_id) {
      toast.warning("Thiếu thông tin", "Vui lòng chọn danh mục");
      return;
    }

    // Build FormData for multipart upload
    const fd = new FormData();
    fd.append("name", formData.name.trim());
    fd.append("category_id", formData.category_id);
    if (formData.address) fd.append("address", formData.address.trim());
    if (formData.description)
      fd.append("description", formData.description.trim());

    if (formData.opening_hours)
      fd.append("opening_hours", formData.opening_hours.trim());

    const priceVal = toNumber(formData.ticket_price);
    if (priceVal !== "" && !Number.isNaN(priceVal)) {
      fd.append("ticket_price", Number(priceVal));
      fd.append("ticket_price_currency", formData.ticket_price_currency || "VND");
    }

    if (formData.best_visit_time)
      fd.append("best_visit_time", formData.best_visit_time.trim());

    // Coords as JSON string
    fd.append(
      "coords",
      JSON.stringify({
        type: "Point",
        coordinates: formData.coords,
      })
    );

    // Image file
    if (formData.image) {
      fd.append("images", formData.image);
    }

    // 3D model file
    if (formData.has3D && formData.modelFile) {
      fd.append("model3d", formData.modelFile);
    }

    // Panorama file
    if (formData.hasPanorama && formData.panoramaFile) {
      fd.append("panorama", formData.panoramaFile);
    }

    const cleanedHighlights = (formData.highlights || [])
      .map((h, idx) => ({ ...h, order: h.order ?? idx }))
      .filter((h) => h.name && h.name.trim());

    if (cleanedHighlights.length) {
      fd.append("highlights", JSON.stringify(cleanedHighlights));
    }

    try {
      await onSubmit(fd);
    } catch {
      // Error handling done in parent
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 gap-6">
        {/* Row 1: Name & Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-text-secondary uppercase">
              Tên địa điểm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm font-bold placeholder:font-normal transition-all"
              placeholder="VD: Lăng Tự Đức"
            />
          </div>

          {/* Custom Dropdown */}
          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-text-secondary uppercase">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className={`w-full px-4 py-3 rounded-xl border bg-bg-main/30 flex items-center justify-between text-sm cursor-pointer transition-all ${
                isCategoryOpen
                  ? "border-primary ring-1 ring-primary bg-white"
                  : "border-border-light hover:border-primary/50"
              }`}
            >
              <span className="font-medium text-text-primary">
                {selectedCategoryName}
              </span>
              <IconChevronDown
                className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${
                  isCategoryOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isCategoryOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsCategoryOpen(false)}
                ></div>
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border-light rounded-xl shadow-xl z-20 py-1 animate-fade-in-up overflow-hidden max-h-48 overflow-y-auto">
                  {categories.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-text-secondary">
                      Không có danh mục
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <div
                        key={cat._id}
                        onClick={() => {
                          handleChange("category_id", cat._id);
                          setIsCategoryOpen(false);
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                          formData.category_id === cat._id
                            ? "bg-primary/5 text-primary font-bold"
                            : "text-text-primary hover:bg-gray-50"
                        }`}
                      >
                        {cat.name}
                        {formData.category_id === cat._id && (
                          <IconCheck className="w-4 h-4" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Row 2: Address */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase">
            Địa chỉ hiển thị
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm transition-all"
              placeholder="VD: Phường Thủy Xuân, TP. Huế"
            />
            <IconMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          </div>
        </div>

          {/* Row 2b: Visit info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Giờ mở cửa
              </label>
              <select
                value={formData.opening_hours}
                onChange={(e) => handleChange("opening_hours", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm transition-all"
              >
                <option value="">Chọn giờ mở cửa</option>
                <option value="06:00 - 18:00">06:00 - 18:00</option>
                <option value="07:00 - 17:30">07:00 - 17:30</option>
                <option value="07:00 - 19:00">07:00 - 19:00</option>
                <option value="08:00 - 17:00">08:00 - 17:00</option>
                <option value="08:00 - 20:00">08:00 - 20:00</option>
                <option value="Cả ngày">Cả ngày</option>
                <option value="Đóng cửa">Đóng cửa</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Giá vé (số)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={formData.ticket_price}
                  onChange={(e) => handleChange("ticket_price", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm transition-all"
                  placeholder="VD: 50000"
                />
                <select
                  value={formData.ticket_price_currency}
                  onChange={(e) => handleChange("ticket_price_currency", e.target.value)}
                  className="px-3 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm transition-all min-w-[96px]"
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Thời điểm lý tưởng
              </label>
              <input
                type="text"
                value={formData.best_visit_time}
                onChange={(e) => handleChange("best_visit_time", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm transition-all"
                placeholder="VD: Sáng sớm / Hoàng hôn"
              />
            </div>
          </div>

        {/* Row 3: Description */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase">
            Mô tả ngắn
          </label>
          <textarea
            rows="4"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm resize-none transition-all"
            placeholder="Giới thiệu tóm tắt về địa điểm, lịch sử hình thành..."
          ></textarea>
        </div>

        {/* Row 3b: Highlights / visiting route */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase block">
                Lộ trình gợi ý / Điểm nổi bật
              </label>
              <p className="text-[11px] text-text-secondary">Thêm các điểm chính: tên, thời lượng, mẹo, hình ảnh.</p>
            </div>
            <button
              type="button"
              onClick={addHighlight}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-light text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
            >
              <IconPlus className="w-4 h-4" /> Thêm điểm
            </button>
          </div>

          {formData.highlights.length === 0 && (
            <p className="text-sm text-text-secondary italic">Chưa có điểm nào, nhấn "Thêm điểm" để bắt đầu.</p>
          )}

          <div className="space-y-4">
            {formData.highlights.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-border-light bg-bg-main/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text-primary">Điểm #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeHighlight(idx)}
                    className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                    title="Xóa điểm này"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateHighlight(idx, "name", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm"
                    placeholder="Tên điểm (bắt buộc)"
                  />
                  <input
                    type="text"
                    value={item.duration}
                    onChange={(e) => updateHighlight(idx, "duration", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm"
                    placeholder="Thời lượng ~30 phút"
                  />
                </div>
                <textarea
                  rows="2"
                  value={item.description}
                  onChange={(e) => updateHighlight(idx, "description", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm resize-none"
                  placeholder="Mô tả ngắn"
                ></textarea>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={item.tip}
                    onChange={(e) => updateHighlight(idx, "tip", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm"
                    placeholder="Mẹo nhỏ"
                  />
                  <input
                    type="text"
                    value={item.image_url}
                    onChange={(e) => updateHighlight(idx, "image_url", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm"
                    placeholder="Link ảnh minh họa"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 4: Image Upload (Improved with Drag & Drop) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase">
            Hình ảnh đại diện
          </label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />

          {!previewImg ? (
            <div
              onClick={() => fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                    border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all group
                    ${
                      isDragging
                        ? "border-primary bg-primary/10 scale-[1.02]"
                        : "border-border-light hover:bg-bg-main/50 hover:border-primary/50"
                    }
                `}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
                  isDragging
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-text-secondary group-hover:bg-primary/10 group-hover:text-primary"
                }`}
              >
                <IconImage className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-text-primary">
                {isDragging ? "Thả ảnh vào đây" : "Nhấn để tải ảnh lên"}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Hỗ trợ JPG, PNG (Kéo thả hoặc Click)
              </p>
            </div>
          ) : (
            <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-border-light group">
              <img
                src={previewImg}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="bg-white text-red-500 px-4 py-2 rounded-lg font-bold text-xs shadow-lg hover:bg-red-50 transition-colors"
                >
                  Xóa ảnh
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Row 5: 3D Option (Functional) */}
        <div className="space-y-3">
          <div
            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer select-none ${
              formData.has3D
                ? "bg-primary/5 border-primary"
                : "bg-bg-main/30 border-border-light hover:border-primary/50"
            }`}
            onClick={() => handleChange("has3D", !formData.has3D)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  formData.has3D
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <IconBox3D className="w-5 h-5" />
              </div>
              <div>
                <span
                  className={`text-sm font-bold ${
                    formData.has3D ? "text-primary" : "text-text-primary"
                  }`}
                >
                  Tích hợp mô hình 3D
                </span>
                <p className="text-[10px] text-text-secondary">
                  Cho phép du khách xem trước không gian ảo.
                </p>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                formData.has3D
                  ? "border-primary bg-primary text-white"
                  : "border-gray-200"
              }`}
            >
              {formData.has3D && <IconCheck className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Conditional File Upload for 3D (Functional) */}
          {formData.has3D && (
            <div className="pl-4 border-l-2 border-primary/20 ml-5 animate-fade-in-up">
              <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">
                File mô hình (.glb / .gltf)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border-light bg-white hover:bg-gray-50 cursor-pointer transition-colors shadow-sm active:scale-95">
                  <IconUpload className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-text-primary">
                    Chọn file 3D
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".glb,.gltf"
                    ref={modelInputRef}
                    onChange={handle3DFileChange}
                  />
                </label>
                {/* [IMPROVED] Hiển thị tên file đã chọn */}
                <span
                  className={`text-xs ${
                    formData.modelFile
                      ? "text-primary font-medium"
                      : "text-text-secondary italic"
                  }`}
                >
                  {formData.modelFile
                    ? formData.modelFile.name
                    : "Chưa có file nào được chọn"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Row 6: Panorama 360° Option */}
        <div className="space-y-3">
          <div
            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer select-none ${
              formData.hasPanorama
                ? "bg-secondary/5 border-secondary"
                : "bg-bg-main/30 border-border-light hover:border-secondary/50"
            }`}
            onClick={() => handleChange("hasPanorama", !formData.hasPanorama)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  formData.hasPanorama
                    ? "bg-secondary text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <Icon360 className="w-5 h-5" />
              </div>
              <div>
                <span
                  className={`text-sm font-bold ${
                    formData.hasPanorama ? "text-secondary" : "text-text-primary"
                  }`}
                >
                  Ảnh Panorama 360°
                </span>
                <p className="text-[10px] text-text-secondary">
                  Cho phép xem không gian 360° tương tác.
                </p>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                formData.hasPanorama
                  ? "border-secondary bg-secondary text-white"
                  : "border-gray-200"
              }`}
            >
              {formData.hasPanorama && <IconCheck className="w-3.5 h-3.5" />}
            </div>
          </div>

          {/* Conditional File Upload for Panorama */}
          {formData.hasPanorama && (
            <div className="pl-4 border-l-2 border-secondary/20 ml-5 animate-fade-in-up space-y-3">
              <label className="text-xs font-bold text-text-secondary uppercase block">
                Ảnh Panorama (JPG, PNG - khuyến nghị 2:1)
              </label>
              
              <input
                type="file"
                ref={panoramaInputRef}
                onChange={handlePanoramaChange}
                className="hidden"
                accept="image/jpeg,image/jpg,image/png"
              />

              {!panoramaPreview ? (
                <div
                  onClick={() => panoramaInputRef.current.click()}
                  onDragOver={handlePanoramaDragOver}
                  onDragLeave={handlePanoramaDragLeave}
                  onDrop={handlePanoramaDrop}
                  className={`
                    border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all group
                    ${
                      isPanoramaDragging
                        ? "border-secondary bg-secondary/10 scale-[1.02]"
                        : "border-border-light hover:bg-secondary/5 hover:border-secondary/50"
                    }
                  `}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors ${
                      isPanoramaDragging
                        ? "bg-secondary text-white"
                        : "bg-gray-100 text-text-secondary group-hover:bg-secondary/10 group-hover:text-secondary"
                    }`}
                  >
                    <Icon360 className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-text-primary">
                    {isPanoramaDragging ? "Thả ảnh vào đây" : "Tải ảnh 360° lên"}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Kéo thả hoặc click • Tỉ lệ 2:1 (VD: 4096x2048)
                  </p>
                </div>
              ) : (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-border-light group">
                  <img
                    src={panoramaPreview}
                    alt="Panorama Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-secondary/90 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Icon360 className="w-3 h-3" /> 360°
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={handleRemovePanorama}
                      className="bg-white text-red-500 px-4 py-2 rounded-lg font-bold text-xs shadow-lg hover:bg-red-50 transition-colors"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                </div>
              )}
              
              {formData.existingPanorama && !formData.panoramaFile && (
                <p className="text-xs text-secondary">
                  ✓ Đã có ảnh panorama: {formData.existingPanorama.name}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-border-light">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl border border-border-light text-text-secondary font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`
            px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all 
            ${
              isLoading
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-primary/90 active:scale-95"
            }
          `}
        >
          {isLoading ? (
            <>
              <IconLoader className="w-4 h-4 animate-spin" /> Đang lưu...
            </>
          ) : (
            <>
              <IconCheck className="w-4 h-4" /> Lưu địa điểm
            </>
          )}
        </button>
      </div>
    </form>
  );
}
