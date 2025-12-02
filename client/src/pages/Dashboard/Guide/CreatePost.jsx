import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { IconCheck } from "../../../icons/IconBox";
import { IconImage, IconChevronLeft } from "../../../icons/IconCommon";
import {
  useArticleCategories,
  useCreateArticle,
} from "../../../features/posts/hooks";
import Spinner from "../../../components/Loaders/Spinner";

// Quill modules configuration
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "image"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
];

export default function CreatePost() {
  const navigate = useNavigate();

  // Hooks
  const { categories } = useArticleCategories();
  const { createArticle, isCreating } = useCreateArticle();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content_html: "",
    cover_image: "",
    categoryId: "",
    status: "draft",
  });
  const [previewImage, setPreviewImage] = useState("");
  const [message, setMessage] = useState(null);

  // Handle form change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Ảnh không được vượt quá 5MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        handleChange("cover_image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập tiêu đề bài viết" });
      return false;
    }
    if (!formData.content_html || formData.content_html === "<p><br></p>") {
      setMessage({ type: "error", text: "Vui lòng nhập nội dung bài viết" });
      return false;
    }
    if (!formData.categoryId) {
      setMessage({ type: "error", text: "Vui lòng chọn danh mục" });
      return false;
    }
    return true;
  };

  // Save as draft
  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập tiêu đề để lưu nháp" });
      return;
    }

    const result = await createArticle({ ...formData, status: "draft" });
    if (result) {
      setMessage({ type: "success", text: "Đã lưu bản nháp!" });
      setTimeout(() => {
        navigate(
          `/dashboard/guide/posts/edit/${result._id || result.data?._id}`
        );
      }, 1000);
    } else {
      setMessage({
        type: "error",
        text: "Lưu nháp thất bại. Vui lòng thử lại.",
      });
    }
  };

  // Publish (submit for review)
  const handlePublish = async () => {
    if (!validateForm()) return;

    const result = await createArticle({ ...formData, status: "pending" });
    if (result) {
      setMessage({ type: "success", text: "Đã gửi bài viết để duyệt!" });
      setTimeout(() => {
        navigate("/dashboard/guide/posts");
      }, 1500);
    } else {
      setMessage({
        type: "error",
        text: "Gửi bài thất bại. Vui lòng thử lại.",
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              to="/dashboard/guide/posts"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <IconChevronLeft className="w-5 h-5 text-text-secondary" />
            </Link>
            <h1 className="text-2xl font-heading font-bold text-text-primary">
              Viết bài mới
            </h1>
          </div>
          <p className="text-text-secondary text-sm ml-9">
            Chia sẻ trải nghiệm và kiến thức của bạn.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={isCreating}
            className="px-5 py-2.5 rounded-xl border border-border-light font-bold text-sm text-text-secondary hover:bg-bg-main transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isCreating ? <Spinner size="sm" /> : null}
            Lưu nháp
          </button>
          <button
            onClick={handlePublish}
            disabled={isCreating}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isCreating ? (
              <Spinner size="sm" />
            ) : (
              <IconCheck className="w-4 h-4" />
            )}
            Gửi duyệt
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
                className="w-full text-2xl md:text-3xl font-heading font-bold placeholder:text-gray-300 border-none outline-none text-text-primary bg-transparent"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            {/* Cover Image Upload */}
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
                    Thêm ảnh bìa bài viết
                  </p>
                  <p className="text-xs text-text-secondary mt-1">Tối đa 5MB</p>
                </div>
              )}
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>

            {/* Content Editor - Rich Text */}
            <div className="min-h-[400px]">
              <ReactQuill
                theme="snow"
                value={formData.content_html}
                onChange={(value) => handleChange("content_html", value)}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Bắt đầu viết câu chuyện của bạn tại đây..."
                className="quill-editor"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings (Right) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publish Settings */}
          <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm space-y-5">
            <h3 className="font-bold text-text-primary text-lg">
              Cài đặt bài viết
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleChange("categoryId", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm cursor-pointer appearance-none"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-700">
                <strong>Lưu ý:</strong> Sau khi gửi duyệt, bài viết sẽ được
                admin xem xét trước khi hiển thị công khai.
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
            <h3 className="font-bold text-primary mb-3">💡 Mẹo viết bài hay</h3>
            <ul className="text-xs text-text-secondary space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Sử dụng tiêu đề hấp dẫn, gây tò mò
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Thêm hình ảnh chất lượng cao
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Chia nội dung thành các phần rõ ràng
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Kể chuyện từ trải nghiệm cá nhân
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
