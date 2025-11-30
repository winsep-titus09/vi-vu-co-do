import React, { useState } from "react";
import { IconMapPin } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import DestinationForm from "../../../components/Forms/DestinationForm";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconInbox,
} from "../../../icons/IconCommon";

// ============================================================================
// MOCK DATA
// ============================================================================
const initialPlaces = [
  {
    id: 1,
    name: "Đại Nội Huế",
    category: "Di sản",
    address: "TP. Huế",
    has3D: true,
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
  },
  {
    id: 2,
    name: "Phá Tam Giang",
    category: "Thiên nhiên",
    address: "Quảng Điền",
    has3D: false,
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/hoanghon.jpg",
  },
  {
    id: 3,
    name: "Chùa Thiên Mụ",
    category: "Tâm linh",
    address: "Hương Long, Huế",
    has3D: true,
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg",
  },
];

const CATEGORIES = ["Tất cả", "Di sản", "Thiên nhiên", "Tâm linh", "Ẩm thực"];

export default function AdminPlaces() {
  const [places, setPlaces] = useState(initialPlaces);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingPlace, setViewingPlace] = useState(null);

  // Search and filter state
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Tất cả");

  // Logic lọc dữ liệu
  const filteredPlaces = places.filter((place) => {
    const matchSearch =
      place.name.toLowerCase().includes(search.toLowerCase()) ||
      place.address.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      filterCategory === "Tất cả" || place.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleSave = (data) => {
    if (editingPlace) {
      setPlaces(
        places.map((p) =>
          p.id === editingPlace.id ? { ...data, id: editingPlace.id } : p
        )
      );
      alert("Đã cập nhật địa điểm!");
    } else {
      setPlaces([
        ...places,
        {
          ...data,
          id: Date.now(),
          image:
            "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_4.jpg",
        },
      ]);
      alert("Đã thêm địa điểm mới!");
    }
    setIsModalOpen(false);
    setEditingPlace(null);
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa địa điểm này? Hành động này không thể hoàn tác."
      )
    ) {
      setPlaces(places.filter((p) => p.id !== id));
    }
  };

  const openCreate = () => {
    setEditingPlace(null);
    setIsModalOpen(true);
  };
  const openEdit = (place) => {
    setEditingPlace(place);
    setIsModalOpen(true);
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
        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg flex items-center gap-2 transition-all active:scale-95"
        >
          <IconPlus className="w-5 h-5" /> Thêm địa điểm
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-border-light flex flex-col md:flex-row gap-4 shadow-sm">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filterCategory === cat
                  ? "bg-bg-main text-primary shadow-inner"
                  : "text-text-secondary hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
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
      {filteredPlaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="group bg-white rounded-2xl border border-border-light overflow-hidden hover:shadow-lg transition-all relative flex flex-col h-full"
            >
              {/* Image Area */}
              <div className="h-48 overflow-hidden relative">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {place.has3D && (
                  <span className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-white/20 shadow-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>{" "}
                    3D Model
                  </span>
                )}
                {/* Hover Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => openEdit(place)}
                    className="p-3 rounded-full bg-white text-primary hover:bg-primary hover:text-white transition-all shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300"
                  >
                    <IconEdit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(place.id)}
                    className="p-3 rounded-full bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                  >
                    <IconTrash className="w-5 h-5" />
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
                  {place.category}
                </span>
                <p className="text-xs text-text-secondary flex items-start gap-1.5 mt-auto line-clamp-2">
                  <IconMapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />{" "}
                  {place.address}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
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
                onSubmit={handleSave}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
