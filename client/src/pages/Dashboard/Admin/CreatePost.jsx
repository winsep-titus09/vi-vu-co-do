import React, { useState } from "react";
import { IconCheck } from "../../../icons/IconBox";
import { IconX } from "../../../icons/IconX";

// --- INLINE ICONS ---
const IconBell = ({ className }) => (
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
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />{" "}
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />{" "}
  </svg>
);
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
const IconBold = ({ className }) => (
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
    <path d="M6 12h8a4 4 0 0 0 0-8H6v8Zm0 0h9a4 4 0 0 1 0 8H6v-8Z" />{" "}
  </svg>
);
const IconItalic = ({ className }) => (
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
    <line x1="19" y1="4" x2="10" y2="4" />{" "}
    <line x1="14" y1="20" x2="5" y2="20" />{" "}
    <line x1="15" y1="4" x2="9" y2="20" />{" "}
  </svg>
);
const IconList = ({ className }) => (
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
    <line x1="8" y1="6" x2="21" y2="6" />{" "}
    <line x1="8" y1="12" x2="21" y2="12" />{" "}
    <line x1="8" y1="18" x2="21" y2="18" />{" "}
    <line x1="3" y1="6" x2="3.01" y2="6" />{" "}
    <line x1="3" y1="12" x2="3.01" y2="12" />{" "}
    <line x1="3" y1="18" x2="3.01" y2="18" />{" "}
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

const POST_TYPES = [
  "Thông báo hệ thống",
  "Tin tức khuyến mãi",
  "Cập nhật chính sách",
];
const AUDIENCES = ["Tất cả người dùng", "Chỉ Hướng dẫn viên", "Chỉ Du khách"];

export default function AdminCreatePost() {
  const [formData, setFormData] = useState({
    title: "",
    type: "Thông báo hệ thống",
    audience: "Tất cả người dùng",
    content: "",
    image: null,
  });

  // Dropdown States
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isAudienceOpen, setIsAudienceOpen] = useState(false);

  const [previewImg, setPreviewImg] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImg(URL.createObjectURL(file));
    }
  };

  const handlePublish = () => {
    if (!formData.title || !formData.content)
      return alert("Vui lòng nhập đủ thông tin");
    alert("Đã đăng thông báo thành công!");
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Đăng thông báo hệ thống
        </h1>
        <p className="text-text-secondary text-sm">
          Bài viết sẽ hiển thị ở mục Tin tức hoặc gửi thông báo đến người dùng.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-border-light shadow-sm space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary outline-none font-bold text-lg placeholder:font-normal"
            placeholder="VD: Bảo trì hệ thống ngày 20/10..."
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type Dropdown */}
          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-text-secondary uppercase">
              Loại tin
            </label>
            <button
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className={`w-full px-4 py-3 rounded-xl border bg-white flex justify-between items-center text-sm transition-all ${
                isTypeOpen
                  ? "border-primary ring-1 ring-primary"
                  : "border-border-light hover:border-primary/50"
              }`}
            >
              <span className="font-bold text-text-primary">
                {formData.type}
              </span>
              <IconChevronDown
                className={`w-4 h-4 transition-transform ${
                  isTypeOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isTypeOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsTypeOpen(false)}
                ></div>
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border-light z-20 py-1 overflow-hidden animate-fade-in-up">
                  {POST_TYPES.map((type) => (
                    <div
                      key={type}
                      onClick={() => {
                        setFormData({ ...formData, type });
                        setIsTypeOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium flex justify-between items-center"
                    >
                      {type}
                      {formData.type === type && (
                        <IconCheck className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Audience Dropdown */}
          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-text-secondary uppercase">
              Đối tượng nhận tin
            </label>
            <button
              onClick={() => setIsAudienceOpen(!isAudienceOpen)}
              className={`w-full px-4 py-3 rounded-xl border bg-white flex justify-between items-center text-sm transition-all ${
                isAudienceOpen
                  ? "border-primary ring-1 ring-primary"
                  : "border-border-light hover:border-primary/50"
              }`}
            >
              <span className="font-bold text-text-primary">
                {formData.audience}
              </span>
              <IconChevronDown
                className={`w-4 h-4 transition-transform ${
                  isAudienceOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isAudienceOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsAudienceOpen(false)}
                ></div>
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border-light z-20 py-1 overflow-hidden animate-fade-in-up">
                  {AUDIENCES.map((aud) => (
                    <div
                      key={aud}
                      onClick={() => {
                        setFormData({ ...formData, audience: aud });
                        setIsAudienceOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium flex justify-between items-center"
                    >
                      {aud}
                      {formData.audience === aud && (
                        <IconCheck className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase">
            Ảnh bìa (Thumbnail)
          </label>
          {!previewImg ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border-light rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <IconImage className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 font-bold">
                  Nhấn để tải ảnh lên
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          ) : (
            <div className="relative w-full h-48 rounded-xl overflow-hidden group">
              <img
                src={previewImg}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setPreviewImg(null)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full text-red-500 shadow-md hover:bg-red-50 transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Content Editor */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-text-secondary uppercase">
            Nội dung chi tiết <span className="text-red-500">*</span>
          </label>
          <div className="border border-border-light rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            {/* Fake Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-border-light bg-gray-50">
              <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600">
                <IconBold className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600">
                <IconItalic className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600">
                <IconList className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded hover:bg-gray-200 text-gray-600">
                <IconImage className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows="8"
              className="w-full px-4 py-3 outline-none resize-none text-sm leading-relaxed"
              placeholder="Nhập nội dung bài viết tại đây..."
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            ></textarea>
          </div>
        </div>

        {/* Push Notification Toggle */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <input
            type="checkbox"
            id="push"
            className="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
          />
          <label
            htmlFor="push"
            className="text-sm font-bold text-blue-800 flex items-center gap-2 cursor-pointer select-none"
          >
            <IconBell className="w-4 h-4" /> Gửi kèm thông báo đẩy (Push
            Notification) & Email
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
          <button className="px-6 py-3 rounded-xl border border-border-light font-bold text-sm hover:bg-gray-50 text-text-secondary transition-colors">
            Xem trước
          </button>
          <button
            onClick={handlePublish}
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95"
          >
            <IconCheck className="w-5 h-5" /> Xuất bản ngay
          </button>
        </div>
      </div>
    </div>
  );
}
