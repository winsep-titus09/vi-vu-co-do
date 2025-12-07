import React, { useState, useCallback, useMemo } from "react";
import { IconMapPin } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import DestinationForm from "../../../components/Forms/DestinationForm";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconInbox,
  IconRefresh,
} from "../../../icons/IconCommon";
import Spinner from "../../../components/Loaders/Spinner";
import { useToast } from "../../../components/Toast/useToast";
import {
  useAdminLocations,
  useLocationCategories,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from "../../../features/admin/hooks";

export default function AdminPlaces() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const toast = useToast();

  // Search and filter state
  const [search, setSearch] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");

  // API hooks
  const { locations, isLoading, error, refetch } = useAdminLocations({
    q: search || undefined,
    category_id: filterCategoryId || undefined,
  });

  const { categories, isLoading: categoriesLoading } = useLocationCategories();
  const { create } = useCreateLocation();
  const { update } = useUpdateLocation();
  const { remove } = useDeleteLocation();

  const normalizeImage = (url) => {
    if (!url) return "/images/placeholders/place-placeholder.jpg";
    const lower = url.toString().toLowerCase();
    if (lower.startsWith("http") || url.startsWith("/")) return url;
    return "/images/placeholders/place-placeholder.jpg";
  };

  // Filter categories with "Tất cả" option
  const categoryTabs = useMemo(() => {
    const tabs = [{ _id: "", name: "Tất cả" }];
    if (categories?.length) {
      tabs.push(...categories);
    }
    return tabs;
  }, [categories]);

  // Handle save (create or update)
  const handleSave = useCallback(
    async (formData) => {
      try {
        setActionLoading("saving");
        if (editingPlace) {
          await update(editingPlace._id, formData);
          toast.success("Thành công!", "Đã cập nhật thông tin địa điểm.");
        } else {
          await create(formData);
          toast.success("Thành công!", "Đã thêm địa điểm mới vào hệ thống.");
        }
        setIsModalOpen(false);
        setEditingPlace(null);
        refetch();
      } catch (err) {
        toast.error("Có lỗi xảy ra", err?.message || "Vui lòng thử lại sau.");
      } finally {
        setActionLoading(null);
      }
    },
    [editingPlace, create, update, refetch, toast]
  );

  // Handle delete
  const handleDelete = useCallback(
    async (id, name) => {
      if (
        !window.confirm(
          `Bạn có chắc muốn xóa địa điểm "${name}"? Hành động này không thể hoàn tác.`
        )
      ) {
        return;
      }
      try {
        setActionLoading(id);
        await remove(id);
        toast.success(
          "Đã xóa!",
          `Địa điểm "${name}" đã được xóa khỏi hệ thống.`
        );
        refetch();
      } catch (err) {
        toast.error("Lỗi khi xóa", err?.message || "Vui lòng thử lại sau.");
      } finally {
        setActionLoading(null);
      }
    },
    [remove, refetch, toast]
  );

  const openCreate = useCallback(() => {
    setEditingPlace(null);
    setIsModalOpen(true);
  }, []);

  const openEdit = useCallback((place) => {
    setEditingPlace(place);
    setIsModalOpen(true);
  }, []);

  // Get image URL
  const getImageUrl = (place) => {
    if (place.images?.length > 0) return normalizeImage(place.images[0]);
    return "/images/placeholders/place-placeholder.jpg";
  };

  // Check if place has 3D model
  const has3DModel = (place) => {
    return place.threeDModels?.length > 0 || place.has3D;
  };

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Quản lý Địa điểm
          </h1>
          <p className="text-text-secondary text-sm">
            Kho dữ liệu địa danh, di tích cho hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refetch}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-border-light text-text-secondary hover:text-primary hover:border-primary transition-colors disabled:opacity-50"
            title="Làm mới"
          >
            <IconRefresh
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={openCreate}
            className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg flex items-center gap-2 transition-all active:scale-95"
          >
            <IconPlus className="w-5 h-5" /> Thêm địa điểm
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-border-light flex flex-col md:flex-row gap-4 shadow-sm">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          {categoriesLoading ? (
            <Spinner className="w-5 h-5" />
          ) : (
            categoryTabs.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setFilterCategoryId(cat._id)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  filterCategoryId === cat._id
                    ? "bg-bg-main text-primary shadow-inner"
                    : "text-text-secondary hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            ))
          )}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72 ml-auto">
          <input
            type="text"
            placeholder="Tìm địa điểm..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Spinner />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500">
          <p className="font-bold">Đã có lỗi xảy ra</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold"
          >
            Thử lại
          </button>
        </div>
      ) : locations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
          {locations.map((place) => (
            <div
              key={place._id}
              className="group bg-white rounded-2xl border border-border-light overflow-hidden hover:shadow-lg transition-all relative flex flex-col h-full"
            >
              {/* Image Area */}
              <div className="h-48 overflow-hidden relative">
                <img
                  src={getImageUrl(place)}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {has3DModel(place) && (
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/20 shadow-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>{" "}
                    3D Model
                  </span>
                )}
                {/* Hover Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => openEdit(place)}
                    disabled={actionLoading === place._id}
                    className="p-3 rounded-full bg-white text-primary hover:bg-primary hover:text-white transition-all shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300 disabled:opacity-50"
                  >
                    <IconEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(place._id, place.name)}
                    disabled={actionLoading === place._id}
                    className="p-3 rounded-full bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75 disabled:opacity-50"
                  >
                    {actionLoading === place._id ? (
                      <Spinner className="w-5 h-5" />
                    ) : (
                      <IconTrash className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Info Area */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className="font-bold text-text-primary text-lg line-clamp-1"
                    title={place.name}
                  >
                    {place.name}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-text-secondary bg-gray-100 px-2 py-1 rounded w-fit mb-3 uppercase tracking-wide">
                  {place.category_id?.name || "Chưa phân loại"}
                </span>
                <p className="text-xs text-text-secondary flex items-start gap-1.5 mt-auto line-clamp-2">
                  <IconMapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />{" "}
                  {place.address || "Chưa có địa chỉ"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty state
        <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
          <div className="w-20 h-20 bg-bg-main rounded-full flex items-center justify-center mb-4 text-gray-400">
            <IconInbox className="w-10 h-10" />
          </div>
          <p className="font-bold text-gray-500 text-lg">
            Không tìm thấy địa điểm nào
          </p>
          <p className="text-sm mt-1">
            Thử thay đổi bộ lọc hoặc thêm địa điểm mới.
          </p>
        </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border-light bg-bg-main/30 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-text-primary">
                {editingPlace ? "Chỉnh sửa địa điểm" : "Thêm địa điểm mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <DestinationForm
                initialData={editingPlace}
                categories={categories}
                onSubmit={handleSave}
                onCancel={() => setIsModalOpen(false)}
                isLoading={actionLoading === "saving"}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
