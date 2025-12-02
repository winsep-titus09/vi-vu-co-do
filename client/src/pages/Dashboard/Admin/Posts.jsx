import React, { useState } from "react";
import { useToast } from "../../../components/Toast/useToast";
import {
  useAdminArticles,
  useAdminArticleActions,
  useAdminUpdateArticle,
  useArticleCategories,
} from "../../../features/posts/hooks";
import Spinner from "../../../components/Loaders/Spinner";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import { IconCheck, IconMapPin } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import { IconChevronDown } from "../../../icons/IconChevronDown";
import {
  IconFilter,
  IconEdit,
  IconTrash,
  IconEye,
  IconInbox,
  IconImage,
  IconBold,
  IconItalic,
  IconList,
  IconFileText,
} from "../../../icons/IconCommon";

// ============================================================================
// CONSTANTS
// ============================================================================
const CATEGORY_TYPES = [
  { value: "travel", label: "Du lịch" },
  { value: "culture", label: "Văn hóa" },
  { value: "food", label: "Ẩm thực" },
  { value: "tips", label: "Mẹo hay" },
];

// ============================================================================
// MAIN POSTS COMPONENT
// ============================================================================
export default function AdminPosts() {
  // API Hooks
  const [apiParams, setApiParams] = useState({ page: 1, limit: 20 });
  const { articles, isLoading, error, pagination, refetch } =
    useAdminArticles(apiParams);
  const {
    approveArticle,
    rejectArticle,
    deleteArticle,
    isLoading: isActing,
  } = useAdminArticleActions();
  const { updateArticle, isUpdating } = useAdminUpdateArticle();
  const { categories } = useArticleCategories();

  // Form processing state
  const isFormProcessing = isUpdating;

  // UI States
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "",
    data: null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const toast = useToast();

  // Form states for article editing
  const [articleForm, setArticleForm] = useState({
    title: "",
    content: "",
    categoryId: "",
    cover_image: "",
  });

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Reset forms
  const resetForms = () => {
    setArticleForm({
      title: "",
      content: "",
      categoryId: "",
      cover_image: "",
    });
    setEditingPost(null);
  };

  // Open form for edit article (guide's post)
  const handleOpenEdit = (post) => {
    setArticleForm({
      title: post.title,
      content: post.content_html || post.content || "",
      categoryId: post.category?._id || post.categoryId || "",
      cover_image: post.cover_image || "",
    });
    setEditingPost(post);
    setIsFormOpen(true);
  };

  // Close form
  const handleCloseForm = () => {
    if (isFormProcessing) return; // Prevent closing while processing
    setIsFormOpen(false);
    resetForms();
  };

  // Submit article edit form
  const handleSubmitArticle = async () => {
    if (!articleForm.title.trim()) {
      toast.warning("Thiếu thông tin", "Vui lòng nhập tiêu đề bài viết");
      return;
    }
    if (!articleForm.content.trim()) {
      toast.warning("Thiếu thông tin", "Vui lòng nhập nội dung bài viết");
      return;
    }

    const articleData = {
      title: articleForm.title,
      content_html: articleForm.content,
      categoryId: articleForm.categoryId || undefined,
      cover_image: articleForm.cover_image || undefined,
    };

    const result = await updateArticle(editingPost._id, articleData);
    if (result) {
      toast.success("Thành công!", "Đã cập nhật bài viết.");
      refetch();
      handleCloseForm();
    } else {
      toast.error("Lỗi", "Không thể cập nhật bài viết.");
    }
  };

  // Filter posts by status
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === "all") {
      setApiParams((prev) => ({ ...prev, status: undefined, page: 1 }));
    } else if (newFilter === "pending") {
      setApiParams((prev) => ({ ...prev, status: "pending", page: 1 }));
    } else if (newFilter === "approved") {
      setApiParams((prev) => ({ ...prev, status: "approved", page: 1 }));
    }
  };

  // Search handler
  const handleSearch = (value) => {
    setSearch(value);
    setApiParams((prev) => ({ ...prev, q: value || undefined, page: 1 }));
  };

  // Status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase border border-green-200">
            Đã đăng
          </span>
        );
      case "pending":
        return (
          <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold uppercase border border-yellow-200 flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>{" "}
            Chờ duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase border border-red-200">
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  // Approve handler
  const handleApprove = (post) => {
    setConfirmModal({ open: true, type: "approve", data: post });
  };

  const confirmApprove = async () => {
    const result = await approveArticle(confirmModal.data._id);
    if (result) {
      toast.success("Thành công!", "Đã duyệt bài viết");
      refetch();
    } else {
      toast.error("Lỗi", "Không thể duyệt bài viết");
    }
    setConfirmModal({ open: false, type: "", data: null });
  };

  // Reject handler
  const handleReject = (post) => {
    setRejectReason("");
    setConfirmModal({ open: true, type: "reject", data: post });
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      toast.warning("Thiếu thông tin", "Vui lòng nhập lý do từ chối");
      return;
    }
    const result = await rejectArticle(confirmModal.data._id, rejectReason);
    if (result) {
      toast.success("Thành công!", "Đã từ chối bài viết");
      refetch();
    } else {
      toast.error("Lỗi", "Không thể từ chối bài viết");
    }
    setConfirmModal({ open: false, type: "", data: null });
    setRejectReason("");
  };

  // Delete handler
  const handleDelete = (post) => {
    setConfirmModal({ open: true, type: "delete", data: post });
  };

  const confirmDelete = async () => {
    const result = await deleteArticle(confirmModal.data._id);
    if (result) {
      toast.success("Thành công!", "Đã xóa bài viết");
      refetch();
    } else {
      toast.error("Lỗi", "Không thể xóa bài viết");
    }
    setConfirmModal({ open: false, type: "", data: null });
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Quản lý Bài viết
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Kiểm duyệt nội dung bài viết của hướng dẫn viên.
          </p>
        </div>
      </div>

      {/* Modal Overlay Form - Edit Article */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={handleCloseForm}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in-up z-10">
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-border-light bg-gradient-to-r from-primary/5 to-transparent flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="font-heading font-bold text-text-primary flex items-center gap-2">
                <IconFileText className="w-5 h-5 text-primary" />
                Chỉnh sửa bài viết
              </h2>
              <button
                onClick={handleCloseForm}
                disabled={isFormProcessing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <IconX className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Form Content - Scrollable */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Cover Image Preview */}
              {articleForm.cover_image && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-secondary uppercase">
                    Ảnh bìa hiện tại
                  </label>
                  <div className="relative rounded-xl overflow-hidden border border-border-light">
                    <img
                      src={articleForm.cover_image}
                      alt="Cover"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setArticleForm({ ...articleForm, cover_image: "" })
                      }
                      className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-lg shadow transition-colors"
                    >
                      <IconX className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* Cover Image URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Link ảnh bìa
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm placeholder:text-text-secondary/50 transition-all"
                  placeholder="https://example.com/image.jpg"
                  value={articleForm.cover_image}
                  onChange={(e) =>
                    setArticleForm({
                      ...articleForm,
                      cover_image: e.target.value,
                    })
                  }
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Tiêu đề bài viết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-base placeholder:font-normal transition-all"
                  placeholder="Nhập tiêu đề bài viết..."
                  value={articleForm.title}
                  onChange={(e) =>
                    setArticleForm({
                      ...articleForm,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Danh mục
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className={`w-full px-4 py-3 rounded-xl border bg-white flex justify-between items-center text-sm transition-all ${
                    isCategoryOpen
                      ? "border-primary ring-1 ring-primary"
                      : "border-border-light hover:border-primary/50"
                  }`}
                >
                  <span className="font-bold text-text-primary">
                    {categories.find((c) => c._id === articleForm.categoryId)
                      ?.name || "Chọn danh mục"}
                  </span>
                  <IconChevronDown
                    className={`w-4 h-4 transition-transform ${
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
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border-light z-20 py-1 overflow-hidden animate-fade-in-up max-h-60 overflow-y-auto">
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <div
                            key={cat._id}
                            onClick={() => {
                              setArticleForm({
                                ...articleForm,
                                categoryId: cat._id,
                              });
                              setIsCategoryOpen(false);
                            }}
                            className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm font-medium flex justify-between items-center"
                          >
                            {cat.name}
                            {articleForm.categoryId === cat._id && (
                              <IconCheck className="w-4 h-4 text-primary" />
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-text-secondary">
                          Không có danh mục nào
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Nội dung bài viết <span className="text-red-500">*</span>
                </label>
                <div className="border border-border-light rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                  <div className="flex items-center gap-1 p-2 border-b border-border-light bg-gray-50">
                    <button
                      type="button"
                      className="p-1.5 rounded hover:bg-gray-200 text-gray-600"
                    >
                      <IconBold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded hover:bg-gray-200 text-gray-600"
                    >
                      <IconItalic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button
                      type="button"
                      className="p-1.5 rounded hover:bg-gray-200 text-gray-600"
                    >
                      <IconList className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded hover:bg-gray-200 text-gray-600"
                    >
                      <IconImage className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    rows="8"
                    className="w-full px-4 py-3 outline-none resize-none text-sm leading-relaxed"
                    placeholder="Nhập nội dung bài viết tại đây..."
                    value={articleForm.content}
                    onChange={(e) =>
                      setArticleForm({
                        ...articleForm,
                        content: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
              </div>

              {/* Author info */}
              {editingPost?.author && (
                <div className="p-3 bg-gray-50 rounded-xl border border-border-light">
                  <p className="text-xs text-text-secondary">
                    <span className="font-bold">Tác giả:</span>{" "}
                    {editingPost.author.name || editingPost.author.email}
                  </p>
                </div>
              )}
            </div>

            {/* Actions - Fixed at bottom */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border-light bg-gray-50/50">
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={isFormProcessing}
                className="px-5 py-2.5 rounded-xl border border-border-light font-bold text-sm hover:bg-gray-100 text-text-secondary transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmitArticle}
                disabled={isFormProcessing}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFormProcessing ? (
                  <>
                    <Spinner size="sm" className="w-4 h-4" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <IconCheck className="w-4 h-4" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-border-light flex flex-col md:flex-row justify-between gap-4 shadow-sm">
        <div className="flex gap-2 border-b border-border-light md:border-b-0 pb-2 md:pb-0 overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "Tất cả" },
            { id: "pending", label: "Chờ duyệt", icon: true },
            { id: "approved", label: "Đã duyệt" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleFilterChange(tab.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                filter === tab.id
                  ? "bg-bg-main text-primary shadow-inner"
                  : "text-text-secondary hover:bg-gray-50"
              }`}
            >
              {tab.label}
              {tab.icon && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm bài viết, tác giả..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm transition-all"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-bold">Lỗi: {error}</p>
          <button
            onClick={refetch}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
          {articles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
                  <tr>
                    <th className="p-4 pl-6">Tiêu đề bài viết</th>
                    <th className="p-4">Tác giả</th>
                    <th className="p-4">Loại</th>
                    <th className="p-4">Ngày tạo</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 pr-6 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((post) => (
                    <tr
                      key={post._id}
                      className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                    >
                      <td
                        className="p-4 pl-6 font-bold text-text-primary max-w-[300px] truncate"
                        title={post.title}
                      >
                        {post.title}
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-medium ${
                            post.author?.role === "admin"
                              ? "text-primary"
                              : "text-text-primary"
                          }`}
                        >
                          {post.author?.name || post.author?.email || "Ẩn danh"}
                        </span>
                        {post.author?.role === "admin" && (
                          <span className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 rounded font-bold">
                            ADMIN
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-text-secondary">
                        {post.category?.name || "—"}
                      </td>
                      <td className="p-4 text-text-secondary text-xs">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(post.status || post.approvalStatus)}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          {post.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApprove(post)}
                                disabled={isActing}
                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                                title="Duyệt"
                              >
                                <IconCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(post)}
                                disabled={isActing}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                title="Từ chối"
                              >
                                <IconX className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 rounded-lg bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
                                title="Xem trước"
                              >
                                <IconEye className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleOpenEdit(post)}
                                className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-gray-50 transition-colors"
                                title="Sửa"
                              >
                                <IconEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(post)}
                                disabled={isActing}
                                className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Xóa"
                              >
                                <IconTrash className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination info */}
              {pagination.total > 0 && (
                <div className="px-6 py-3 border-t border-border-light text-sm text-text-secondary">
                  Hiển thị {articles.length} / {pagination.total} bài viết
                </div>
              )}
            </div>
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
              <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mb-4 text-gray-400">
                <IconInbox className="w-8 h-8" />
              </div>
              <p className="font-bold text-gray-500">
                Không tìm thấy bài viết nào
              </p>
              <p className="text-xs">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirm Modal - Approve */}
      <ConfirmModal
        isOpen={confirmModal.open && confirmModal.type === "approve"}
        onClose={() => setConfirmModal({ open: false, type: "", data: null })}
        onConfirm={confirmApprove}
        title="Duyệt bài viết"
        message={`Bạn có chắc muốn duyệt bài viết "${confirmModal.data?.title}"?`}
        confirmText="Duyệt"
        confirmType="primary"
        isProcessing={isActing}
      />

      {/* Confirm Modal - Delete */}
      <ConfirmModal
        isOpen={confirmModal.open && confirmModal.type === "delete"}
        onClose={() => setConfirmModal({ open: false, type: "", data: null })}
        onConfirm={confirmDelete}
        title="Xóa bài viết"
        message={`Bạn có chắc muốn xóa bài viết "${confirmModal.data?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmType="danger"
        isProcessing={isActing}
      />

      {/* Reject Modal with Reason Input */}
      {confirmModal.open && confirmModal.type === "reject" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!isActing) {
                setConfirmModal({ open: false, type: "", data: null });
                setRejectReason("");
              }
            }}
          ></div>

          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative z-10 animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-text-primary">
                Từ chối bài viết
              </h3>
              <button
                onClick={() => {
                  setConfirmModal({ open: false, type: "", data: null });
                  setRejectReason("");
                }}
                disabled={isActing}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <IconX className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-text-secondary text-sm">
                Bạn có chắc muốn từ chối bài viết "
                <span className="font-bold">{confirmModal.data?.title}</span>"?
              </p>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase block mb-1">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2.5 rounded-xl border border-border-light focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none text-sm resize-none"
                  placeholder="Nhập lý do từ chối bài viết..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setConfirmModal({ open: false, type: "", data: null });
                  setRejectReason("");
                }}
                disabled={isActing}
                className="flex-1 py-2.5 rounded-xl border border-border-light font-bold text-sm text-text-secondary hover:bg-bg-main transition-all disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmReject}
                disabled={isActing || !rejectReason.trim()}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isActing ? "Đang xử lý..." : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
