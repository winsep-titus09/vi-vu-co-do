import React, { useState } from "react";
import { IconCheck } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import { IconUser } from "../../../icons/IconUser";
import {
  IconLock,
  IconUnlock,
  IconEye,
  IconShield,
  IconVideo,
  IconFileText,
  IconInbox,
  IconChevronLeft,
  IconChevronRight,
} from "../../../icons/IconCommon";

// ============================================================================
// MOCK DATA
// ============================================================================
const usersData = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    role: "tourist",
    status: "active",
    joinDate: "12/05/2024",
  },
  {
    id: 2,
    name: "Minh Hương",
    email: "huong.guide@vivucodo.com",
    role: "guide",
    status: "active",
    joinDate: "10/01/2024",
  },
  {
    id: 3,
    name: "Trần Văn",
    email: "tranvan@foodtour.com",
    role: "guide",
    status: "locked",
    joinDate: "15/02/2024",
  },
  {
    id: 4,
    name: "Sarah Jenkins",
    email: "sarah.j@uk.co",
    role: "tourist",
    status: "active",
    joinDate: "20/05/2025",
  },
];

const pendingGuides = [
  {
    id: 99,
    name: "Phạm Lan",
    email: "lan.pham@craft.vn",
    phone: "0905 111 222",
    exp: "3 năm",
    cert: "Thẻ HDV Nội địa - 123456",
    certImage:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/ngomon_3d_placeholder.jpg",
    video: "https://youtube.com/...",
    bio: "Tôi sinh ra ở làng hương Thủy Xuân, muốn giới thiệu nghề truyền thống đến du khách.",
    requestDate: "20 phút trước",
  },
  {
    id: 100,
    name: "James Đặng",
    email: "james.dang@trekking.vn",
    phone: "0905 888 999",
    exp: "5 năm",
    cert: "Thẻ HDV Quốc tế - 987654",
    certImage:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
    video: "https://youtube.com/...",
    bio: "Chuyên gia trekking và thám hiểm hang động tại Quảng Bình & Huế.",
    requestDate: "1 ngày trước",
  },
];

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [lightboxImg, setLightboxImg] = useState(null); // Lightbox state

  // Logic Lọc User
  const filteredUsers = usersData.filter((user) => {
    const matchSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "all") return matchSearch;
    return matchSearch && user.role === activeTab;
  });

  const toggleLockUser = (id) => {
    alert(`Đã thay đổi trạng thái khóa cho User #${id}`);
  };

  const handleApprove = (id, isApproved) => {
    if (isApproved) {
      alert(`Đã chấp thuận HDV #${id}.`);
    } else {
      // Simple confirm for rejection
      if (window.confirm(`Bạn có chắc chắn muốn từ chối HDV #${id}?`)) {
        alert("Đã từ chối.");
      }
    }
  };

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Quản lý Người dùng
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Kiểm soát tài khoản và xét duyệt đối tác.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("pending")}
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <IconShieldCheck className="w-4 h-4" /> Duyệt HDV (
            {pendingGuides.length})
          </button>
        </div>
      </div>

      {/* Toolbar Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-border-light flex flex-col md:flex-row justify-between gap-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "Tất cả" },
            { id: "tourist", label: "Du khách" },
            { id: "guide", label: "Hướng dẫn viên" },
            { id: "pending", label: "Chờ duyệt", icon: true },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2
                ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:bg-bg-main"
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

        {activeTab !== "pending" && (
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Tìm tên hoặc email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none text-sm transition-all"
              onChange={(e) => setSearch(e.target.value)}
            />
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          </div>
        )}
      </div>

      {/* --- VIEW 1: USER LIST TABLE --- */}
      {activeTab !== "pending" && (
        <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
          {/* Empty state check */}
          {filteredUsers.length === 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
                    <tr>
                      <th className="p-4 pl-6">Người dùng</th>
                      <th className="p-4">Vai trò</th>
                      <th className="p-4">Ngày tham gia</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 pr-6 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                      >
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-text-secondary uppercase">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-text-primary">
                                {user.name}
                              </p>
                              <p className="text-xs text-text-secondary">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                              user.role === "guide"
                                ? "bg-purple-50 text-purple-700 border border-purple-100"
                                : "bg-blue-50 text-blue-700 border border-blue-100"
                            }`}
                          >
                            {user.role === "guide" ? "Partner" : "Tourist"}
                          </span>
                        </td>
                        <td className="p-4 text-text-secondary">
                          {user.joinDate}
                        </td>
                        <td className="p-4">
                          {user.status === "active" ? (
                            <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span>{" "}
                              Hoạt động
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-red-600 font-bold text-xs">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>{" "}
                              Đã khóa
                            </span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg text-text-secondary transition-colors"
                            title="Xem chi tiết"
                          >
                            <IconEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleLockUser(user.id)}
                            className={`p-2 rounded-lg ml-2 transition-colors ${
                              user.status === "active"
                                ? "hover:bg-red-50 text-text-secondary hover:text-red-600"
                                : "hover:bg-green-50 text-red-500 hover:text-green-600"
                            }`}
                            title={
                              user.status === "active"
                                ? "Khóa tài khoản"
                                : "Mở khóa"
                            }
                          >
                            {user.status === "active" ? (
                              <IconLock className="w-4 h-4" />
                            ) : (
                              <IconUnlock className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-border-light flex justify-between items-center text-xs text-text-secondary bg-white">
                <span>
                  Hiển thị <strong>1-10</strong> trên tổng số{" "}
                  <strong>{filteredUsers.length}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-lg border border-border-light hover:bg-bg-main disabled:opacity-50"
                    disabled
                  >
                    <IconChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="px-3 py-1.5 rounded-lg border border-primary bg-primary text-white font-bold">
                    1
                  </button>
                  <button className="px-3 py-1.5 rounded-lg border border-border-light hover:bg-bg-main font-bold">
                    2
                  </button>
                  <span className="text-gray-400">...</span>
                  <button className="px-3 py-1.5 rounded-lg border border-border-light hover:bg-bg-main font-bold">
                    5
                  </button>
                  <button className="p-2 rounded-lg border border-border-light hover:bg-bg-main">
                    <IconChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
              <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mb-4 text-gray-400">
                <IconUser className="w-8 h-8" />
              </div>
              <p className="font-bold text-gray-500">
                Không tìm thấy người dùng nào
              </p>
              <p className="text-xs">Vui lòng thử từ khóa khác.</p>
            </div>
          )}
        </div>
      )}

      {/* --- VIEW 2: PENDING GUIDES --- */}
      {activeTab === "pending" && (
        <div className="grid grid-cols-1 gap-6 animate-fade-in">
          {pendingGuides.length > 0 ? (
            pendingGuides.map((guide) => (
              <div
                key={guide.id}
                className="bg-white p-6 rounded-3xl border border-border-light shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold border-2 border-primary/20">
                          {guide.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold text-text-primary">
                            {guide.name}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {guide.email} • {guide.phone}
                          </p>
                          <p className="text-xs text-orange-500 font-bold mt-1">
                            Yêu cầu: {guide.requestDate}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-bg-main p-4 rounded-2xl border border-border-light text-sm text-text-secondary italic">
                      "{guide.bio}"
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-bold text-text-secondary uppercase">
                          Kinh nghiệm
                        </p>
                        <p className="font-bold text-text-primary">
                          {guide.exp}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-secondary uppercase">
                          Chứng chỉ
                        </p>
                        <p className="font-bold text-primary">{guide.cert}</p>
                      </div>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="lg:w-80 space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-text-secondary uppercase flex items-center gap-1">
                        <IconFileText className="w-3 h-3" /> Ảnh thẻ HDV / CCCD
                      </p>
                      {/* Lightbox trigger */}
                      <div
                        className="h-32 rounded-xl overflow-hidden border border-border-light bg-gray-100 relative group cursor-zoom-in"
                        onClick={() => setLightboxImg(guide.certImage)}
                      >
                        <img
                          src={guide.certImage}
                          className="w-full h-full object-cover"
                          alt="Cert"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconEye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-text-secondary uppercase flex items-center gap-1">
                        <IconVideo className="w-3 h-3" /> Video giới thiệu
                      </p>
                      <a
                        href={guide.video}
                        target="_blank"
                        rel="noreferrer"
                        className="block p-3 rounded-xl border border-border-light bg-white hover:border-primary hover:text-primary transition-colors text-sm font-medium truncate text-center"
                      >
                        Xem video trên Youtube ↗
                      </a>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:w-48 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-border-light pt-6 lg:pt-0 lg:pl-8">
                    <button
                      onClick={() => handleApprove(guide.id, true)}
                      className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                      <IconCheck className="w-5 h-5" /> Chấp thuận
                    </button>
                    <button
                      onClick={() => handleApprove(guide.id, false)}
                      className="w-full py-3 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <IconX className="w-5 h-5" /> Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-border-light">
              <IconShieldCheck className="w-12 h-12 mx-auto mb-3 text-green-500 bg-green-100 p-2 rounded-full" />
              <p className="text-text-primary font-bold">Tuyệt vời!</p>
              <p className="text-text-secondary text-sm">
                Không có hồ sơ nào đang chờ xử lý.
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- LIGHTBOX MODAL --- */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImg(null)}
        >
          <button className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 bg-white/10 rounded-full backdrop-blur-sm">
            <IconX className="w-8 h-8" />
          </button>
          <img
            src={lightboxImg}
            alt="Certificate Full"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border-4 border-white/20"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
