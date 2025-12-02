import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconCheck, IconClock } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconFileText,
} from "../../../icons/IconCommon";
import { useMyArticles, useDeleteArticle } from "../../../features/posts/hooks";
import Spinner from "../../../components/Loaders/Spinner";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import { formatDate } from "../../../lib/formatters";

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đã đăng" },
  { id: "pending", label: "Chờ duyệt" },
  { id: "draft", label: "Bản nháp" },
  { id: "rejected", label: "Bị từ chối" },
];

// Helper to get display status from article
const getDisplayStatus = (article) => {
  if (article.status === "draft") return "draft";
  if (article.status === "active" && article.approval?.status === "approved")
    return "active";
  if (article.approval?.status === "rejected") return "rejected";
  if (article.status === "pending" || article.approval?.status === "pending")
    return "pending";
  return article.status;
};

export default function GuideMyPosts() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch articles from API
  const { articles, isLoading, error, pagination, refetch } = useMyArticles({
    page,
    limit: 20,
  });

  const { deleteArticle, isDeleting } = useDeleteArticle();

  // Filter articles by tab and search
  const filteredPosts = articles.filter((post) => {
    const displayStatus = getDisplayStatus(post);
    const matchTab = activeTab === "all" || displayStatus === activeTab;
    const matchSearch = post.title
      ?.toLowerCase()
      .includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const success = await deleteArticle(deleteTarget._id);
    if (success) {
      refetch();
    }
    setDeleteTarget(null);
  };

  const getStatusBadge = (article) => {
    const status = getDisplayStatus(article);
    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1 w-fit">
            <IconCheck className="w-3 h-3" /> Đã đăng
          </span>
        );
      case "pending":
        return (
          <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center gap-1 w-fit">
            <IconClock className="w-3 h-3" /> Chờ duyệt
          </span>
        );
      case "draft":
        return (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center gap-1 w-fit">
            <IconFileText className="w-3 h-3" /> Bản nháp
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1 w-fit">
            Bị từ chối
          </span>
        );
      default:
        return null;
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
  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="text-primary font-bold hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Bài viết & Cẩm nang
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Chia sẻ kiến thức để thu hút du khách.
          </p>
        </div>
        <Link
          to="/dashboard/guide/create-post"
          className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
        >
          <IconPlus className="w-5 h-5" /> Viết bài mới
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-border-light flex flex-col md:flex-row justify-between gap-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                        whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all
                        ${
                          activeTab === tab.id
                            ? "bg-bg-main text-primary"
                            : "text-text-secondary hover:bg-gray-50"
                        }
                    `}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm bài viết..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-light bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
            onChange={(e) => setSearch(e.target.value)}
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-3xl border border-border-light p-4 hover:shadow-md transition-all group"
            >
              <div className="flex gap-6 items-start">
                {/* Thumbnail */}
                <div className="w-24 h-24 md:w-32 md:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <IconFileText className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-24">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-base md:text-lg font-bold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      {getStatusBadge(post)}
                    </div>
                    <p className="text-xs text-text-secondary mt-1 flex items-center gap-2">
                      <span>{post.categoryId?.name || "Chưa phân loại"}</span> •{" "}
                      <span>{formatDate(post.createdAt)}</span>
                    </p>
                  </div>

                  {/* Footer: Stats & Actions */}
                  <div className="flex justify-between items-end">
                    <div className="flex gap-4 text-xs font-medium text-text-secondary">
                      <span className="flex items-center gap-1">
                        <IconEye className="w-3.5 h-3.5" /> {post.views || 0}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/dashboard/guide/edit-post/${post._id}`}
                        className="p-2 rounded-lg border border-border-light text-text-secondary hover:text-primary hover:border-primary transition-all bg-white"
                        title="Chỉnh sửa"
                      >
                        <IconEdit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(post)}
                        disabled={isDeleting}
                        className="p-2 rounded-lg border border-border-light text-text-secondary hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all disabled:opacity-50"
                        title="Xóa"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-border-light">
            <p className="text-text-secondary mb-4">Chưa có bài viết nào.</p>
            <Link
              to="/dashboard/guide/create-post"
              className="text-primary font-bold hover:underline"
            >
              Viết bài đầu tiên
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-border-light text-text-secondary hover:bg-gray-50 disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-text-secondary">
            Trang {page} / {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(pagination.total / pagination.limit)}
            className="px-4 py-2 rounded-lg border border-border-light text-text-secondary hover:bg-gray-50 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa bài viết "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </div>
  );
}
