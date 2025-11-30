import React, { useState } from "react";
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

const initialCats = [
  { id: 1, name: "Ẩm thực & Ăn uống", slug: "am-thuc", count: 12 },
  { id: 2, name: "Lịch sử & Di sản", slug: "lich-su", count: 24 },
  { id: 3, name: "Thiên nhiên", slug: "thien-nhien", count: 8 },
  { id: 4, name: "Tâm linh", slug: "tam-linh", count: 5 },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState(initialCats);
  const [newCat, setNewCat] = useState("");
  const [search, setSearch] = useState("");

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Helper: Generate Slug
  const createSlug = (text) =>
    text
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

  // Logic: Add
  const handleAdd = () => {
    if (!newCat.trim()) return;
    setCategories([
      ...categories,
      {
        id: Date.now(),
        name: newCat,
        slug: createSlug(newCat),
        count: 0,
      },
    ]);
    setNewCat("");
  };

  // Logic: Delete
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này?"))
      setCategories(categories.filter((c) => c.id !== id));
  };

  // Logic: Start Edit
  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditValue(cat.name);
  };

  // Logic: Save Edit
  const saveEdit = (id) => {
    if (!editValue.trim()) return;
    setCategories(
      categories.map((c) =>
        c.id === id ? { ...c, name: editValue, slug: createSlug(editValue) } : c
      )
    );
    setEditingId(null);
    setEditValue("");
  };

  // Logic: Cancel Edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Filter
  const filteredCats = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  // Handle Enter Key
  const handleKeyDown = (e, action) => {
    if (e.key === "Enter") action();
  };

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
          />
          <button
            onClick={handleAdd}
            disabled={!newCat.trim()}
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
                key={cat.id}
                className={`p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                  editingId === cat.id ? "bg-blue-50/50" : "hover:bg-gray-50"
                }`}
              >
                {/* Left Side: Info or Edit Input */}
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {cat.name.charAt(0).toUpperCase()}
                  </div>

                  {editingId === cat.id ? (
                    // Edit mode
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg border border-primary focus:outline-none text-sm font-bold"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(cat.id);
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
                        <span>• {cat.count} mục</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Side: Actions */}
                <div className="flex gap-2 self-end md:self-center">
                  {editingId === cat.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(cat.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all"
                        title="Lưu"
                      >
                        <IconSave className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all"
                        title="Hủy"
                      >
                        <IconX className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-2 text-text-secondary hover:text-primary hover:bg-white rounded-lg border border-transparent hover:border-border-light transition-all"
                        title="Sửa"
                      >
                        <IconEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"
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
