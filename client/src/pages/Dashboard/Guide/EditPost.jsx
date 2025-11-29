import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { IconCheck, IconClock } from "../../../icons/IconBox";
import { IconX } from "../../../icons/IconX";
import {
  IconImage,
  IconChevronLeft,
  IconEye,
  IconTrash,
} from "../../../icons/IconCommon";

// ============================================================================
// MOCK DATA
// ============================================================================
// Mock data: Existing post (simulated API fetch)
const existingPost = {
  id: 1,
  title: "5 quán bún bò Huế 'núp hẻm' chỉ thổ địa mới biết",
  content:
    "Huế không chỉ có bún bò Mệ Kéo hay O Cương Chú Điệp. Hãy cùng tôi len lỏi vào những con hẻm nhỏ để tìm ra hương vị chuẩn Huế xưa...\n\n1. Bún bò O Ty\nNằm sâu trong hẻm...",
  image:
    "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_3.jpg",
  category: "Ẩm thực",
  tags: "Bún bò, Ẩm thực Huế, Local food",
  status: "published", // published, pending, draft
  relatedTourId: "",
};

export default function EditPost() {
  const { id: _id } = useParams();
  const navigate = useNavigate();

  // State Form
  const [formData, setFormData] = useState(existingPost);
  const [previewImage, setPreviewImage] = useState(existingPost.image);
  const [isDirty, setIsDirty] = useState(false); // Đánh dấu có thay đổi chưa lưu

  // Handle Change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setIsDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Call API update
    alert("Đã lưu thay đổi thành công!");
    setIsDirty(false);
  };

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      alert("Đã xóa bài viết!");
      navigate("/dashboard/guide/posts");
    }
  };

  // Helper Badge trạng thái
  const renderStatus = () => {
    switch (formData.status) {
      case "published":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Đã đăng
          </span>
        );
      case "pending":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span> Chờ
            duyệt
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span> Bản nháp
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-heading font-bold text-text-primary">
              Chỉnh sửa bài viết
            </h1>
            {renderStatus()}
          </div>
          <p className="text-text-secondary text-sm">
            Cập nhật nội dung lần cuối: 20/05/2025
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-sm transition-all flex items-center gap-2"
          >
            <IconTrash className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">Xóa bài</span>
          </button>
          <Link
            to={`/blog/post-slug-demo`} // Link demo ra trang chi tiết
            target="_blank"
            className="px-5 py-2.5 rounded-xl border border-border-light font-bold text-sm text-text-secondary hover:bg-bg-main transition-all flex items-center gap-2"
          >
            <IconEye className="w-4 h-4" /> Xem trước
          </Link>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`
                    px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg
                    ${
                      isDirty
                        ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                    }
                `}
          >
            <IconCheck className="w-4 h-4" /> Lưu thay đổi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MAIN EDITOR (Left) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-border-light shadow-sm space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                placeholder="Tiêu đề bài viết..."
                className="w-full text-2xl md:text-3xl font-heading font-bold placeholder:text-gray-300 border-none outline-none text-text-primary bg-transparent"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            {/* Cover Image */}
            <div className="relative w-full aspect-video rounded-2xl border-2 border-dashed border-border-light bg-bg-main/30 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-primary/50 transition-all">
              {previewImage ? (
                <>
                  <img
                    src={previewImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white font-bold text-sm border border-white/30 flex items-center gap-2">
                      <IconImage className="w-4 h-4" /> Thay đổi ảnh
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-text-secondary group-hover:text-primary transition-colors">
                    <IconImage className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-text-secondary">
                    Thêm ảnh bìa
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

            {/* Content */}
            <div className="relative min-h-[400px]">
              <textarea
                rows="15"
                className="w-full resize-none outline-none text-text-primary text-lg leading-relaxed placeholder:text-gray-300 bg-transparent"
                placeholder="Nội dung bài viết..."
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        {/* SIDEBAR SETTINGS (Right) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Settings Box */}
          <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm space-y-5">
            <h3 className="font-bold text-text-primary text-lg">
              Cài đặt bài viết
            </h3>

            {/* Trạng thái hiển thị */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm cursor-pointer font-bold appearance-none"
              >
                <option value="published">Công khai (Published)</option>
                <option value="pending">Chờ duyệt (Pending)</option>
                <option value="draft">Bản nháp (Draft)</option>
                <option value="hidden">Đã ẩn (Hidden)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Danh mục
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm cursor-pointer appearance-none"
              >
                <option>Kinh nghiệm du lịch</option>
                <option>Ẩm thực</option>
                <option>Văn hóa & Di sản</option>
                <option>Câu chuyện HDV</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleChange("tags", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm"
              />
            </div>
          </div>

          {/* Related Tour */}
          <div className="bg-secondary/5 p-6 rounded-3xl border border-secondary/20">
            <h3 className="font-bold text-secondary-dark mb-2">
              Gợi ý Tour liên quan
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Hiển thị box đặt tour ở cuối bài viết này.
            </p>

            <select
              value={formData.relatedTourId}
              onChange={(e) => handleChange("relatedTourId", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-secondary/30 bg-white focus:border-secondary outline-none text-sm cursor-pointer mb-2"
            >
              <option value="">-- Không chọn --</option>
              <option value="1">Bí mật Hoàng cung Huế</option>
              <option value="2">Food Tour đêm</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
