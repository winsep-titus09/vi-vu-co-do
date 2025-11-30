import React, { useState, useRef } from "react";
import { Icon3D, IconMapPin, IconCheck } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import {
  IconPlus,
  IconTrash,
  IconEye,
  IconUploadCloud,
  IconUpload,
} from "../../../icons/IconCommon";

// ============================================================================
// MOCK DATA
// ============================================================================
const initialModels = [
  {
    id: 1,
    name: "Ngọ Môn - Đại Nội",
    file: "ngo_mon.glb",
    size: "15 MB",
    place: "Đại Nội Huế",
    thumbnail:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/ngomon_3d_placeholder.jpg",
    date: "20/05/2025",
  },
  {
    id: 2,
    name: "Tháp Phước Duyên",
    file: "thap_phuoc_duyen.gltf",
    size: "8.5 MB",
    place: "Chùa Thiên Mụ",
    thumbnail:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg",
    date: "18/05/2025",
  },
  {
    id: 3,
    name: "Lăng Tự Đức (Toàn cảnh)",
    file: "lang_tu_duc_full.glb",
    size: "42 MB",
    place: "Lăng Tự Đức",
    thumbnail:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg",
    date: "15/05/2025",
  },
];

const PLACES = [
  "Đại Nội Huế",
  "Lăng Tự Đức",
  "Lăng Minh Mạng",
  "Chùa Thiên Mụ",
  "Cầu Trường Tiền",
];

export default function AdminModels3D() {
  const [models, setModels] = useState(initialModels);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewingModel, setViewingModel] = useState(null);

  // Search state
  const [search, setSearch] = useState("");

  // Upload form states
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadPlace, setUploadPlace] = useState("Chọn địa điểm");
  const [isPlaceOpen, setIsPlaceOpen] = useState(false);

  const filteredModels = models.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.place.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm("Xóa mô hình này? Hành động này không thể hoàn tác.")) {
      setModels(models.filter((m) => m.id !== id));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    alert("Upload thành công! (Demo)");
    setIsUploadOpen(false);
    setSelectedFile(null);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Thư viện 3D
          </h1>
          <p className="text-text-secondary text-sm">
            Kho dữ liệu số hóa di sản (.glb, .gltf).
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
            onClick={() => setIsUploadOpen(true)}
            className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg flex items-center gap-2 whitespace-nowrap transition-all active:scale-95"
          >
            <IconPlus className="w-5 h-5" /> Upload
          </button>
        </div>
      </div>

      {/* Grid List */}
      {filteredModels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
          {filteredModels.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-border-light overflow-hidden hover:shadow-lg transition-all relative"
            >
              {/* Thumbnail Area */}
              <div className="h-48 relative bg-gray-100 cursor-pointer overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => setViewingModel(item)}
                    className="p-3 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white hover:text-primary transition-all shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300"
                    title="Xem trước"
                  >
                    <IconEye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-3 bg-white/20 backdrop-blur rounded-full text-white hover:bg-red-500 transition-all shadow-lg transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                    title="Xóa"
                  >
                    <IconTrash className="w-5 h-5" />
                  </button>
                </div>
                <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-white/20">
                  {item.file.split(".").pop()}
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
                  <IconMapPin className="w-3 h-3 shrink-0" /> {item.place}
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border-light text-[10px] text-text-secondary uppercase font-bold">
                  <span>{item.size}</span>
                  <span>{item.date}</span>
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

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 animate-scale-up relative">
            <button
              onClick={() => setIsUploadOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6">Upload Mô hình 3D</h3>

            <div className="space-y-5">
              {/* File input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".glb,.gltf"
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
                    : "Kéo thả file .glb, .gltf vào đây"}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {selectedFile
                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                    : "Tối đa 100MB"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Tên mô hình
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-border-light focus:border-primary outline-none text-sm font-bold"
                  placeholder="VD: Ngọ Môn"
                />
              </div>

              {/* Custom place dropdown */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Gắn thẻ địa điểm
                </label>
                <button
                  onClick={() => setIsPlaceOpen(!isPlaceOpen)}
                  className={`w-full px-4 py-2.5 rounded-xl border flex justify-between items-center text-sm transition-all ${
                    isPlaceOpen
                      ? "border-primary ring-1 ring-primary"
                      : "border-border-light hover:border-primary/50"
                  }`}
                >
                  <span
                    className={
                      uploadPlace === "Chọn địa điểm"
                        ? "text-text-secondary"
                        : "text-text-primary font-bold"
                    }
                  >
                    {uploadPlace}
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
                      {PLACES.map((place) => (
                        <div
                          key={place}
                          onClick={() => {
                            setUploadPlace(place);
                            setIsPlaceOpen(false);
                          }}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm flex items-center justify-between"
                        >
                          {place}
                          {uploadPlace === place && (
                            <IconCheck className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                Tải lên
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEWER MODAL */}
      {viewingModel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/20 flex flex-col shadow-2xl">
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setViewingModel(null)}
                className="text-white/70 hover:text-white p-2 bg-black/50 rounded-full backdrop-blur hover:bg-black/80 transition-all"
              >
                <IconX className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center relative group bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black">
              <div className="relative z-10 text-center animate-pulse">
                <Icon3D className="w-20 h-20 text-white/80 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white">
                  {viewingModel.name}
                </h3>
                <p className="text-white/60 text-sm mt-2">
                  Đang tải trình xem 3D...
                </p>
              </div>
            </div>

            <div className="h-14 bg-white/10 backdrop-blur border-t border-white/10 flex items-center justify-between px-6">
              <div className="text-white text-xs font-mono opacity-70">
                {viewingModel.file}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-white/10 rounded text-xs text-white hover:bg-white/20 transition-colors font-bold">
                  Xoay
                </button>
                <button className="px-3 py-1.5 bg-white/10 rounded text-xs text-white hover:bg-white/20 transition-colors font-bold">
                  Phóng to
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
