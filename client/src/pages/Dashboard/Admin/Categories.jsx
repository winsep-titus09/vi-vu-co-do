import React, { useState, useMemo } from "react";
import { useToast } from "../../../components/Toast/useToast";
import {
  useCategories,
  useCategoryActions,
} from "../../../features/categories/hooks";
import Spinner from "../../../components/Loaders/Spinner";
import { IconCheck } from "../../../icons/IconBox";
import { IconX } from "../../../icons/IconX";
import { IconSearch } from "../../../icons/IconSearch";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconSave,
  IconFolder,
} from "../../../icons/IconCommon";

// Helper: Generate Slug
const createSlug = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

export default function AdminCategories() {
  const toast = useToast();

  // API hooks
  const { categories, isLoading, error, refetch } = useCategories();
  const {
    createCategory,
    updateCategory,
    deleteCategory,
    isLoading: isActionLoading,
  } = useCategoryActions();

  // Local state
  const [newCat, setNewCat] = useState("");
  const [search, setSearch] = useState("");

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Logic: Add
  const handleAdd = async () => {
    if (!newCat.trim()) {
      toast.warning("Thiếu thông tin", "Vui lòng nhập tên danh mục");
      return;
    }

    const data = {
      name: newCat.trim(),
      slug: createSlug(newCat),
    };

    const result = await createCategory(data);
    if (result.success) {
      toast.success("Thành công!", "Đã thêm danh mục mới.");
      setNewCat("");
      refetch();
    } else {
      toast.error("Lỗi", result.error);
    }
  };

  // Logic: Delete
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) return;

    const result = await deleteCategory(id);
    if (result.success) {
      toast.success("Thành công!", "Đã xóa danh mục.");
      refetch();
    } else {
      // If category is in use, ask to force delete
      if (result.error?.includes("đang được dùng")) {
        if (
          window.confirm(
            `${result.error}\n\nBạn có muốn gỡ liên kết và xóa không?`
          )
        ) {
          const forceResult = await deleteCategory(id, true);
          if (forceResult.success) {
            toast.success("Thành công!", "Đã xóa danh mục và gỡ liên kết.");
            refetch();
          } else {
            toast.error("Lỗi", forceResult.error);
          }
        }
      } else {
        toast.error("Lỗi", result.error);
      }
    }
  };

  // Logic: Start Edit
  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditValue(cat.name);
  };

  // Logic: Save Edit
  const saveEdit = async (id) => {
    if (!editValue.trim()) {
      toast.warning("Thiếu thông tin", "Tên danh mục không được để trống");
      return;
    }

    const data = {
      name: editValue.trim(),
      slug: createSlug(editValue),
    };

    const result = await updateCategory(id, data);
    if (result.success) {
      toast.success("Thành công!", "Đã cập nhật danh mục.");
      setEditingId(null);
      setEditValue("");
      refetch();
    } else {
      toast.error("Lỗi", result.error);
    }
  };

  // Logic: Cancel Edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Filter categories based on search
  const filteredCats = useMemo(() => {
    if (!search.trim()) return categories;
    const searchLower = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(searchLower) ||
        c.slug?.toLowerCase().includes(searchLower)
    );
  }, [categories, search]);

  // Handle Enter Key
  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") action();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <IconFolder className="w-16 h-16 text-red-300 mb-4" />
        <p className="text-red-600 font-bold mb-2">Không thể tải danh mục</p>
        <p className="text-text-secondary text-sm mb-4">{error}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 pb-20 mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Quản lý Danh mục
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Phân loại Tour và Địa điểm để người dùng dễ tìm kiếm.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Tìm danh mục..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden">
        {/* Add New Row */}
        <div className="p-4 md:p-6 border-b border-border-light bg-bg-main/30 flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Nhập tên danh mục mới..."
            className="flex-1 px-4 py-3 rounded-xl border border-border-light focus:border-primary outline-none text-sm"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleAdd)}
            disabled={isActionLoading}
          />
          <button
            onClick={handleAdd}
            disabled={!newCat.trim() || isActionLoading}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <IconPlus className="w-4 h-4" /> Thêm mới
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-border-light">
          {filteredCats.length > 0 ? (
            filteredCats.map((cat) => (
              <div
                key={cat._id}
                className={`p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                  editingId === cat._id ? "bg-blue-50/50" : "hover:bg-gray-50"
                }`}
              >
                {/* Left Side: Info or Edit Input */}
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {cat.name?.charAt(0).toUpperCase() || "?"}
                  </div>

                  {editingId === cat._id ? (
                    // Edit mode
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg border border-primary focus:outline-none text-sm font-bold"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        disabled={isActionLoading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(cat._id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                    </div>
                  ) : (
                    // View Mode
                    <div className="min-w-0">
                      <p className="font-bold text-text-primary truncate">
                        {cat.name}
                      </p>
                      <p className="text-xs text-text-secondary flex items-center gap-2">
                        <span className="bg-gray-100 px-1.5 rounded text-[10px] font-mono">
                          /{cat.slug}
                        </span>
                        {cat.status && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              cat.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {cat.status === "active" ? "Hoạt động" : "Ẩn"}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Side: Actions */}
                <div className="flex gap-2 self-end md:self-center">
                  {editingId === cat._id ? (
                    <>
                      <button
                        onClick={() => saveEdit(cat._id)}
                        disabled={isActionLoading}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all disabled:opacity-50"
                        title="Lưu"
                      >
                        <IconSave className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isActionLoading}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all disabled:opacity-50"
                        title="Hủy"
                      >
                        <IconX className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(cat)}
                        disabled={isActionLoading}
                        className="p-2 text-text-secondary hover:text-primary hover:bg-white rounded-lg border border-transparent hover:border-border-light transition-all disabled:opacity-50"
                        title="Sửa"
                      >
                        <IconEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id, cat.name)}
                        disabled={isActionLoading}
                        className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all disabled:opacity-50"
                        title="Xóa"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="p-12 text-center text-text-secondary">
              <IconFolder className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-bold">Không tìm thấy danh mục</p>
              <p className="text-xs">Hãy thử tìm từ khóa khác hoặc thêm mới.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
