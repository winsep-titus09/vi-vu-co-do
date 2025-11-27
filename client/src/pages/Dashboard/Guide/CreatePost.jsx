import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconCheck } from "../../../icons/IconBox";

// Inline Icons
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

const IconEye = ({ className }) => (
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
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Viết bài mới
          </h1>
          <p className="text-text-secondary text-sm">
            Chia sẻ trải nghiệm và kiến thức của bạn.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl border border-border-light font-bold text-sm text-text-secondary hover:bg-bg-main transition-all">
            Lưu nháp
          </button>
          <button className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
            <IconCheck className="w-4 h-4" /> Đăng bài
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Editor (Left) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-border-light shadow-sm space-y-6">
            {/* Title Input */}
            <div>
              <input
                type="text"
                placeholder="Tiêu đề bài viết (VD: Bí mật Lăng Tự Đức...)"
                className="w-full text-2xl md:text-3xl font-heading font-bold placeholder:text-gray-300 border-none outline-none text-text-primary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Cover Image Upload */}
            <div className="relative w-full aspect-video rounded-2xl border-2 border-dashed border-border-light bg-bg-main/30 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-primary/50 transition-all">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-text-secondary group-hover:text-primary transition-colors">
                    <IconImage className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-text-secondary">
                    Thêm ảnh bìa bài viết
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

            {/* Content Editor Placeholder */}
            <div className="relative">
              <textarea
                rows="15"
                className="w-full resize-none outline-none text-text-primary text-lg leading-relaxed placeholder:text-gray-300"
                placeholder="Bắt đầu viết câu chuyện của bạn tại đây..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
              {/* (Sau này có thể tích hợp Rich Text Editor như Quill hoặc TipTap ở đây) */}
            </div>
          </div>
        </div>

        {/* Sidebar Settings (Right) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publish Settings */}
          <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm space-y-4">
            <h3 className="font-bold text-text-primary text-lg">
              Cài đặt bài viết
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Danh mục
              </label>
              <select className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm cursor-pointer appearance-none">
                <option>Kinh nghiệm du lịch</option>
                <option>Ẩm thực</option>
                <option>Văn hóa & Di sản</option>
                <option>Câu chuyện HDV</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Gắn thẻ (Tags)
              </label>
              <input
                type="text"
                placeholder="VD: Hue, Food Tour..."
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm"
              />
              <p className="text-[10px] text-text-secondary">
                Phân cách bằng dấu phẩy.
              </p>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-primary font-medium">
                  Ghim vào hồ sơ của tôi
                </span>
              </label>
            </div>
          </div>

          {/* Tour Liên quan (Upsell) */}
          <div className="bg-secondary/5 p-6 rounded-3xl border border-secondary/20">
            <h3 className="font-bold text-secondary-dark mb-2">
              Gợi ý Tour liên quan
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Gắn bài viết này với một tour của bạn để tăng tỉ lệ đặt chỗ.
            </p>

            <select className="w-full px-4 py-3 rounded-xl border border-secondary/30 bg-white focus:border-secondary outline-none text-sm cursor-pointer mb-2">
              <option value="">-- Chọn Tour --</option>
              <option>Bí mật Hoàng cung Huế</option>
              <option>Food Tour đêm</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
