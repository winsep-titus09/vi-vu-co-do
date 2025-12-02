import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { IconCheck, IconClock } from "../../../icons/IconBox";
import { IconX } from "../../../icons/IconX";
import {
  IconImage,
  IconChevronLeft,
  IconEye,
  IconTrash,
} from "../../../icons/IconCommon";
import {
  useMyArticle,
  useArticleCategories,
  useUpdateArticle,
  useDeleteArticle,
} from "../../../features/posts/hooks";
import Spinner from "../../../components/Loaders/Spinner";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import { formatDate } from "../../../lib/formatters";

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

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch article data
  const { article, isLoading, error: fetchError } = useMyArticle(id);
  const { categories } = useArticleCategories();
  const { updateArticle, isUpdating } = useUpdateArticle();
  const { deleteArticle, isDeleting } = useDeleteArticle();

  // State Form
  const [formData, setFormData] = useState({
    title: "",
    content_html: "",
    cover_image: "",
    categoryId: "",
    status: "draft",
  });
  const [previewImage, setPreviewImage] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Load article data when fetched
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || "",
        content_html: article.content_html || "",
        cover_image: article.cover_image || "",
        categoryId: article.categoryId?._id || article.categoryId || "",
        status: article.status || "draft",
      });
      setPreviewImage(article.cover_image || "");
    }
  }, [article]);

  // Handle Change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setSaveMessage(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        handleChange("cover_image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const result = await updateArticle(id, formData);
    if (result) {
      setSaveMessage({
        type: "success",
        text: "Đã lưu thay đổi! Bài viết sẽ được duyệt lại.",
      });
      setIsDirty(false);
    } else {
      setSaveMessage({
        type: "error",
        text: "Lưu thất bại. Vui lòng thử lại.",
      });
    }
  };

  const handleDelete = async () => {
    const success = await deleteArticle(id);
    if (success) {
      navigate("/dashboard/guide/posts");
    }
    setShowDeleteModal(false);
  };

  // Helper to get display status
  const getDisplayStatus = () => {
    if (!article) return "draft";
    if (article.status === "draft") return "draft";
    if (article.status === "active" && article.approval?.status === "approved")
      return "active";
    if (article.approval?.status === "rejected") return "rejected";
    if (article.status === "pending" || article.approval?.status === "pending")
      return "pending";
    return article.status;
  };

  // Helper Badge trạng thái
  const renderStatus = () => {
    const status = getDisplayStatus();
    switch (status) {
      case "active":
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
      case "rejected":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span> Bị từ chối
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (fetchError || !article) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500 mb-4">
          {fetchError || "Không tìm thấy bài viết"}
        </p>
        <Link
          to="/dashboard/guide/posts"
          className="text-primary font-bold hover:underline"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      {/* Save Message */}
      {saveMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            saveMessage.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* HEADER */}
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
              Chỉnh sửa bài viết
            </h1>
            {renderStatus()}
          </div>
          <p className="text-text-secondary text-sm ml-9">
            Cập nhật lần cuối: {formatDate(article.updatedAt)}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <IconTrash className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">Xóa bài</span>
          </button>
          {article.slug && (
            <Link
              to={`/blog/${article.slug}`}
              target="_blank"
              className="px-5 py-2.5 rounded-xl border border-border-light font-bold text-sm text-text-secondary hover:bg-bg-main transition-all flex items-center gap-2"
            >
              <IconEye className="w-4 h-4" /> Xem trước
            </Link>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || isUpdating}
            className={`
                    px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg
                    ${
                      isDirty && !isUpdating
                        ? "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                    }
                `}
          >
            {isUpdating ? (
              <Spinner size="sm" />
            ) : (
              <IconCheck className="w-4 h-4" />
            )}
            {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
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

            {/* Content - Rich Text Editor */}
            <div className="min-h-[400px]">
              <ReactQuill
                theme="snow"
                value={formData.content_html}
                onChange={(value) => handleChange("content_html", value)}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Viết nội dung bài viết của bạn..."
                className="quill-editor"
              />
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
                <option value="draft">Bản nháp (Draft)</option>
                <option value="pending">Gửi duyệt (Pending)</option>
              </select>
              <p className="text-xs text-text-secondary">
                Khi lưu, bài viết sẽ được gửi để admin duyệt lại.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Danh mục
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
          </div>

          {/* Rejection Note */}
          {article.approval?.status === "rejected" &&
            article.approval?.notes && (
              <div className="bg-red-50 p-6 rounded-3xl border border-red-200">
                <h3 className="font-bold text-red-700 mb-2">Lý do từ chối</h3>
                <p className="text-sm text-red-600">{article.approval.notes}</p>
              </div>
            )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa bài viết "${article.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </div>
  );
}
