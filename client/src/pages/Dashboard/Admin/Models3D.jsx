import React, { useState, useRef, useMemo } from "react";
import { useToast } from "../../../components/Toast/useToast";
import { Icon3D, IconMapPin, IconCheck } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import {
  IconPlus,
  IconTrash,
  IconEye,
  IconUploadCloud,
  IconEdit,
  IconInbox,
} from "../../../icons/IconCommon";
import { IconChevronDown } from "../../../icons/IconChevronDown";
import Spinner from "../../../components/Loaders/Spinner";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import {
  useAdminModels3D,
  useAdminModel3DActions,
  useLocations,
} from "../../../features/places/hooks";

// ============================================================================
// CONSTANTS
// ============================================================================
const FILE_TYPES = [
  { value: "glb", label: "GLB" },
  { value: "gltf", label: "GLTF" },
  { value: "panorama", label: "Panorama 360°" },
];

// ============================================================================
// HELPER: Format file size
// ============================================================================
const formatFileSize = (bytes) => {
  if (!bytes) return "N/A";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
};

// ============================================================================
// HELPER: Format date
// ============================================================================
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

// ============================================================================
// HELPER: Get file extension
// ============================================================================
const getFileExtension = (url) => {
  if (!url) return "3D";
  const parts = url.split(".");
  return parts[parts.length - 1]?.toUpperCase() || "3D";
};

export default function AdminModels3D() {
  const toast = useToast();

  // Search & filters
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Fetch data
  const { models, total, totalPages, isLoading, error, refetch } =
    useAdminModels3D({
      page,
      limit: 20,
      search: search || undefined,
    });

  // Locations for dropdown
  const { locations } = useLocations({ limit: 100 });

  // Actions
  const {
    createModel,
    updateModel,
    deleteModel,
    isLoading: actionLoading,
  } = useAdminModel3DActions();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [viewingModel, setViewingModel] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form states
  const fileInputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    locationId: "",
    file_type: "panorama",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedThumb, setSelectedThumb] = useState(null);
  const [isPlaceOpen, setIsPlaceOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  // Filter models by search
  const filteredModels = useMemo(() => {
    if (!search.trim()) return models;
    const searchLower = search.toLowerCase();
    return models.filter(
      (m) =>
        m.name?.toLowerCase().includes(searchLower) ||
        m.locationId?.name?.toLowerCase().includes(searchLower)
    );
  }, [models, search]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const openCreateModal = () => {
    setEditingModel(null);
    setFormData({
      name: "",
      description: "",
      locationId: "",
      file_type: "panorama",
    });
    setSelectedFile(null);
    setSelectedThumb(null);
    setIsModalOpen(true);
  };

  const openEditModal = (model) => {
    setEditingModel(model);
    setFormData({
      name: model.name || "",
      description: model.description || "",
      locationId: model.locationId?._id || "",
      file_type: model.file_type || "panorama",
    });
    setSelectedFile(null);
    setSelectedThumb(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingModel(null);
    setSelectedFile(null);
    setSelectedThumb(null);
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Auto-detect file type
      const name = file.name.toLowerCase();
      if (name.endsWith(".glb")) {
        setFormData((prev) => ({ ...prev, file_type: "glb" }));
      } else if (name.endsWith(".gltf")) {
        setFormData((prev) => ({ ...prev, file_type: "gltf" }));
      } else {
        setFormData((prev) => ({ ...prev, file_type: "panorama" }));
      }
    }
  };

  const handleThumbSelect = (e) => {
    if (e.target.files[0]) setSelectedThumb(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng nhập tên mô hình.");
      return;
    }

    if (!editingModel && !selectedFile) {
      toast.error("Thiếu thông tin", "Vui lòng chọn file mô hình 3D.");
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      if (formData.description)
        data.append("description", formData.description.trim());
      if (formData.locationId) data.append("locationId", formData.locationId);
      data.append("file_type", formData.file_type);
      if (selectedFile) data.append("model3d", selectedFile);
      if (selectedThumb) data.append("thumbnail", selectedThumb);

      if (editingModel) {
        await updateModel(editingModel._id, data);
        toast.success("Thành công", "Đã cập nhật mô hình 3D.");
      } else {
        await createModel(data);
        toast.success("Thành công", "Đã tạo mô hình 3D mới.");
      }

      closeModal();
      refetch();
    } catch (err) {
      toast.error("Lỗi lưu mô hình", err.message || "Không thể lưu mô hình 3D.");
    }
  };

  const handleDelete = async (model) => {
    setDeleteConfirm(model);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteModel(deleteConfirm._id);
      toast.success("Thành công", "Đã xóa mô hình 3D.");
      setDeleteConfirm(null);
      refetch();
    } catch (err) {
      toast.error("Lỗi xóa mô hình", err.message || "Không thể xóa mô hình 3D.");
    }
  };

  const getSelectedLocationName = () => {
    if (!formData.locationId) return "Chọn địa điểm (tùy chọn)";
    const loc = locations.find((l) => l._id === formData.locationId);
    return loc?.name || "Chọn địa điểm";
  };

  const getSelectedTypeName = () => {
    const type = FILE_TYPES.find((t) => t.value === formData.file_type);
    return type?.label || "Chọn loại";
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading && models.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Thư viện 3D
          </h1>
          <p className="text-text-secondary text-sm">
            Kho dữ liệu số hóa di sản (.glb, .gltf, panorama 360°).
            {total > 0 && (
              <span className="ml-2 font-bold">Tổng: {total} mô hình</span>
            )}
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm model..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          </div>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg flex items-center gap-2 whitespace-nowrap transition-all active:scale-95"
          >
            <IconPlus className="w-5 h-5" /> Upload
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Grid List */}
      {filteredModels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
          {filteredModels.map((item) => (
            <div
              key={item._id}
              className="group bg-white rounded-2xl border border-border-light overflow-hidden hover:shadow-lg transition-all relative"
            >
              {/* Thumbnail Area */}
              <div className="h-48 relative bg-gray-100 cursor-pointer overflow-hidden">
                {item.thumbnail_url || item.locationId?.images?.[0] ? (
                  <img
                    src={item.thumbnail_url || item.locationId?.images?.[0]}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Icon3D className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => setViewingModel(item)}
                    className="p-3 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white hover:text-primary transition-all shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300"
                    title="Xem trước"
                  >
                    <IconEye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-3 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white hover:text-amber-500 transition-all shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                    title="Sửa"
                  >
                    <IconEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-3 bg-white/20 backdrop-blur rounded-full text-white hover:bg-red-500 transition-all shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300 delay-100"
                    title="Xóa"
                  >
                    <IconTrash className="w-5 h-5" />
                  </button>
                </div>
                <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-white/20">
                  {item.file_type || getFileExtension(item.file_url)}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3
                  className="font-bold text-text-primary truncate"
                  title={item.name}
                >
                  {item.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-text-secondary mt-1 mb-3 truncate">
                  <IconMapPin className="w-3 h-3 shrink-0" />
                  {item.locationId?.name || "Chưa gắn địa điểm"}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border-light text-[10px] text-text-secondary uppercase font-bold">
                  <span>{item.file_type?.toUpperCase() || "3D"}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-text-secondary">
          <IconInbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Không tìm thấy mô hình nào.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-border-light bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-sm font-medium text-text-secondary">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-border-light bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium"
          >
            Sau
          </button>
        </div>
      )}

      {/* UPLOAD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 animate-scale-up relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6">
              {editingModel ? "Chỉnh sửa Mô hình 3D" : "Upload Mô hình 3D"}
            </h3>

            <div className="space-y-5">
              {/* File input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".glb,.gltf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
              <div
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${
                  selectedFile
                    ? "border-primary bg-primary/5"
                    : "border-border-light hover:bg-bg-main hover:border-primary/50"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors ${
                    selectedFile
                      ? "bg-primary text-white"
                      : "bg-primary/10 text-primary group-hover:scale-110"
                  }`}
                >
                  {selectedFile ? (
                    <IconCheck className="w-7 h-7" />
                  ) : (
                    <IconUploadCloud className="w-7 h-7" />
                  )}
                </div>
                <p className="text-sm font-bold text-text-primary">
                  {selectedFile
                    ? selectedFile.name
                    : editingModel
                    ? "Chọn file mới (tùy chọn)"
                    : "Kéo thả file .glb, .gltf hoặc ảnh panorama"}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {selectedFile
                    ? formatFileSize(selectedFile.size)
                    : "Tối đa 100MB"}
                </p>
              </div>

              {/* Model name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Tên mô hình *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light focus:border-primary outline-none text-sm font-bold"
                  placeholder="VD: Ngọ Môn - Đại Nội"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Mô tả
                </label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light focus:border-primary outline-none text-sm resize-none"
                  rows={3}
                  placeholder="Mô tả ngắn về mô hình..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {/* File type dropdown */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Loại file
                </label>
                <button
                  type="button"
                  onClick={() => setIsTypeOpen(!isTypeOpen)}
                  className={`w-full px-4 py-2.5 rounded-xl border flex justify-between items-center text-sm transition-all ${
                    isTypeOpen
                      ? "border-primary ring-1 ring-primary"
                      : "border-border-light hover:border-primary/50"
                  }`}
                >
                  <span className="text-text-primary font-bold">
                    {getSelectedTypeName()}
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
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border-light z-20 py-1 animate-fade-in-up overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                      {FILE_TYPES.map((type) => (
                        <div
                          key={type.value}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              file_type: type.value,
                            }));
                            setIsTypeOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm flex items-center justify-between"
                        >
                          {type.label}
                          {formData.file_type === type.value && (
                            <IconCheck className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Location dropdown */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Gắn thẻ địa điểm
                </label>
                <button
                  type="button"
                  onClick={() => setIsPlaceOpen(!isPlaceOpen)}
                  className={`w-full px-4 py-2.5 rounded-xl border flex justify-between items-center text-sm transition-all ${
                    isPlaceOpen
                      ? "border-primary ring-1 ring-primary"
                      : "border-border-light hover:border-primary/50"
                  }`}
                >
                  <span
                    className={
                      formData.locationId
                        ? "text-text-primary font-bold"
                        : "text-text-secondary"
                    }
                  >
                    {getSelectedLocationName()}
                  </span>
                  <IconChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isPlaceOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isPlaceOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsPlaceOpen(false)}
                    ></div>
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border-light z-20 py-1 animate-fade-in-up overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                      {/* Option to clear */}
                      <div
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, locationId: "" }));
                          setIsPlaceOpen(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-text-secondary italic"
                      >
                        Không gắn địa điểm
                      </div>
                      {locations.map((loc) => (
                        <div
                          key={loc._id}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              locationId: loc._id,
                            }));
                            setIsPlaceOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm flex items-center justify-between"
                        >
                          {loc.name}
                          {formData.locationId === loc._id && (
                            <IconCheck className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Ảnh thumbnail (tùy chọn)
                </label>
                <input
                  type="file"
                  ref={thumbInputRef}
                  className="hidden"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleThumbSelect}
                />
                <button
                  type="button"
                  onClick={() => thumbInputRef.current.click()}
                  className="w-full px-4 py-2.5 rounded-xl border border-dashed border-border-light hover:border-primary/50 text-sm text-text-secondary hover:text-primary transition-all flex items-center justify-center gap-2"
                >
                  <IconUploadCloud className="w-4 h-4" />
                  {selectedThumb ? selectedThumb.name : "Chọn ảnh thumbnail"}
                </button>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={actionLoading || (!editingModel && !selectedFile)}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {actionLoading && <Spinner size="sm" />}
                {editingModel ? "Cập nhật" : "Tải lên"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEWER MODAL */}
      {viewingModel && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/20 flex flex-col shadow-2xl">
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setViewingModel(null)}
                className="text-white/70 hover:text-white p-2 bg-black/50 rounded-full backdrop-blur hover:bg-black/80 transition-all"
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center relative group bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-gray-800 via-black to-black">
              {viewingModel.file_type === "panorama" ? (
                <img
                  src={viewingModel.file_url}
                  alt={viewingModel.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="relative z-10 text-center animate-pulse">
                  <Icon3D className="w-20 h-20 text-white/80 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white">
                    {viewingModel.name}
                  </h3>
                  <p className="text-white/60 text-sm mt-2">
                    Đang tải trình xem 3D...
                  </p>
                </div>
              )}
            </div>

            <div className="h-14 bg-white/10 backdrop-blur border-t border-white/10 flex items-center justify-between px-6">
              <div className="text-white text-xs font-mono opacity-70">
                {viewingModel.name} • {viewingModel.file_type?.toUpperCase()}
              </div>
              <div className="flex gap-2">
                <a
                  href={viewingModel.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/10 rounded text-xs text-white hover:bg-white/20 transition-colors font-bold"
                >
                  Mở link gốc
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Xóa mô hình 3D"
        message={`Bạn có chắc muốn xóa mô hình "${deleteConfirm?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmVariant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
}
