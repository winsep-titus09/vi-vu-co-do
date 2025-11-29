import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconCheck, IconClock, IconMapPin } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import {
  IconFilter,
  IconEye,
  IconChevronLeft,
  IconChevronRight,
  IconInbox,
} from "../../../icons/IconCommon";

// ============================================================================
// MOCK DATA
// ============================================================================
const allTours = [
  {
    id: 1,
    name: "Bí mật Hoàng cung Huế & Trải nghiệm trà chiều",
    location: "Đại Nội, Huế",
    guide: "Minh Hương",
    price: "1.800.000đ",
    duration: "4 giờ",
    status: "active",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
    submittedDate: "20/05/2025",
  },
  {
    id: 2,
    name: "Food Tour: Ẩm thực đường phố Huế về đêm",
    location: "Trung tâm TP Huế",
    guide: "Trần Văn",
    price: "500.000đ",
    duration: "3 giờ",
    status: "pending",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_3.jpg",
    submittedDate: "22/05/2025",
  },
  {
    id: 3,
    name: "Khám phá Lăng Tẩm triều Nguyễn",
    location: "Lăng Tự Đức, Minh Mạng",
    guide: "Alex Nguyen",
    price: "1.200.000đ",
    duration: "5 giờ",
    status: "hidden",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg",
    submittedDate: "15/05/2025",
  },
];

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ duyệt", icon: true },
  { id: "active", label: "Đang hoạt động" },
  { id: "hidden", label: "Tạm ẩn/Vi phạm" },
];

export default function AdminTours() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filteredTours = allTours.filter((t) => {
    const matchTab = activeTab === "all" || t.status === activeTab;
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.guide.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
            Hoạt động
          </span>
        );
      case "pending":
        return (
          <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>{" "}
            Chờ duyệt
          </span>
        );
      case "hidden":
        return (
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
            Đã ẩn
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  const handleApprove = (id) => {
    if (
      window.confirm(
        `Xác nhận duyệt tour #${id}? Tour sẽ được hiển thị công khai.`
      )
    ) {
      alert(`Đã duyệt tour #${id}`);
    }
  };

  const handleReject = (id) => {
    const reason = prompt("Nhập lý do từ chối (Gửi kèm email cho HDV):");
    if (reason) alert(`Đã từ chối tour #${id}. Lý do: ${reason}`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Quản lý Tour
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Kiểm duyệt và quản lý các tour du lịch trên hệ thống.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-border-light flex flex-col md:flex-row justify-between gap-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                ${
                  activeTab === tab.id
                    ? "bg-bg-main text-primary shadow-inner"
                    : "text-text-secondary hover:bg-gray-50"
                }
              `}
            >
              {tab.label}
              {tab.icon && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm tên tour, HDV..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm transition-all"
            onChange={(e) => setSearch(e.target.value)}
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
        {filteredTours.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
                  <tr>
                    <th className="p-4 pl-6">Thông tin Tour</th>
                    <th className="p-4">Hướng dẫn viên</th>
                    <th className="p-4">Giá / Thời lượng</th>
                    <th className="p-4">Ngày gửi</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 pr-6 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTours.map((tour) => (
                    <tr
                      key={tour.id}
                      className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-border-light shrink-0">
                            <img
                              src={tour.image}
                              className="w-full h-full object-cover"
                              alt={tour.name}
                            />
                          </div>
                          <div>
                            <p
                              className="font-bold text-text-primary max-w-[200px] truncate"
                              title={tour.name}
                            >
                              {tour.name}
                            </p>
                            {/* Location display */}
                            <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                              <IconMapPin className="w-3 h-3" /> {tour.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-text-primary">
                        {tour.guide}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-primary">{tour.price}</p>
                        <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                          <IconClock className="w-3 h-3" /> {tour.duration}
                        </p>
                      </td>
                      <td className="p-4 text-text-secondary">
                        {tour.submittedDate}
                      </td>
                      <td className="p-4">{getStatusBadge(tour.status)}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          {tour.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApprove(tour.id)}
                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                title="Duyệt"
                              >
                                <IconCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(tour.id)}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                title="Từ chối"
                              >
                                <IconX className="w-4 h-4" />
                              </button>
                              <Link
                                to={`/tours/${tour.id}`}
                                target="_blank"
                                className="p-2 rounded-lg bg-gray-50 text-text-secondary hover:bg-gray-100 transition-colors"
                                title="Xem chi tiết"
                              >
                                <IconEye className="w-4 h-4" />
                              </Link>
                            </>
                          ) : (
                            <button className="px-3 py-1.5 rounded-lg border border-border-light text-text-secondary hover:text-primary hover:border-primary transition-colors flex items-center gap-1 text-xs font-bold">
                              <IconEye className="w-3 h-3" /> Chi tiết
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-border-light flex justify-between items-center text-xs text-text-secondary">
              <span>
                Hiển thị <strong>1-{filteredTours.length}</strong> trên tổng số{" "}
                <strong>{filteredTours.length}</strong>
              </span>
              <div className="flex gap-1">
                <button
                  className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-50"
                  disabled
                >
                  <IconChevronLeft className="w-3 h-3" />
                </button>
                <button className="px-2.5 py-1 rounded border bg-primary text-white font-bold">
                  1
                </button>
                <button className="px-2.5 py-1 rounded border hover:bg-gray-50">
                  2
                </button>
                <button className="p-1.5 rounded border hover:bg-gray-50">
                  <IconChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mb-4 text-gray-400">
              <IconInbox className="w-8 h-8" />
            </div>
            <p className="font-bold text-gray-500">Không tìm thấy tour nào</p>
            <p className="text-xs">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
