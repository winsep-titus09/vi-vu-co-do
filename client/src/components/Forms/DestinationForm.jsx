import React, { useState, useRef } from "react";
import { IconMapPin, IconCheck } from "../../icons/IconBox";
import { IconX } from "../../icons/IconX";

// --- INLINE ICONS ---
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
    {" "}
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />{" "}
    <circle cx="9" cy="9" r="2" />{" "}
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />{" "}
  </svg>
);
const IconBox3D = ({ className }) => (
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
    {" "}
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />{" "}
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />{" "}
    <line x1="12" x2="12" y1="22.08" y2="12" />{" "}
  </svg>
);
const IconUpload = ({ className }) => (
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
    {" "}
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />{" "}
    <polyline points="17 8 12 3 7 8" /> <line x1="12" x2="12" y1="3" y2="15" />{" "}
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
    {" "}
    <polyline points="6 9 12 15 18 9" />{" "}
  </svg>
);
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
    {" "}
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />{" "}
  </svg>
);

const CATEGORIES = ["Di sản", "Thiên nhiên", "Tâm linh", "Ẩm thực", "Check-in"];

export default function DestinationForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      category: "Di sản",
      address: "",
      description: "",
      image: null,
      has3D: false,
      modelFile: null,
    }
  );

  const [previewImg, setPreviewImg] = useState(initialData?.image || null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // [NEW] Drag state
  const [isSubmitting, setIsSubmitting] = useState(false); // [NEW] Submit state

  const fileInputRef = useRef(null);
  const modelInputRef = useRef(null); // [NEW] Ref for 3D input

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- Image Handling ---
  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, image: file }));
      const objectUrl = URL.createObjectURL(file);
      setPreviewImg(objectUrl);
    }
  };

  const handleImageChange = (e) => processFile(e.target.files[0]);

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreviewImg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // [NEW] Drag & Drop Handlers
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

  // [NEW] 3D File Handling
  const handle3DFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData((prev) => ({ ...prev, modelFile: file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate async
    setTimeout(() => {
      onSubmit(formData);
      setIsSubmitting(false);
    }, 1000);
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
              Danh mục
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
                {formData.category}
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
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border-light rounded-xl shadow-xl z-20 py-1 animate-fade-in-up overflow-hidden">
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat}
                      onClick={() => {
                        handleChange("category", cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                        formData.category === cat
                          ? "bg-primary/5 text-primary font-bold"
                          : "text-text-primary hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                      {formData.category === cat && (
                        <IconCheck className="w-4 h-4" />
                      )}
                    </div>
                  ))}
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
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-border-light">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl border border-border-light text-text-secondary font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all 
            ${
              isSubmitting
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-primary/90 active:scale-95"
            }
          `}
        >
          {isSubmitting ? (
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
