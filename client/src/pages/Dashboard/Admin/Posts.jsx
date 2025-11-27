import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconCheck, IconClock, IconMapPin } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";

// --- INLINE ICONS ---
const IconFilter = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />{" "}
  </svg>
);
const IconEdit = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />{" "}
    <path d="m15 5 4 4" />{" "}
  </svg>
);
const IconTrash = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <path d="M3 6h18" /> <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />{" "}
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />{" "}
  </svg>
);
const IconEye = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />{" "}
    <circle cx="12" cy="12" r="3" />{" "}
  </svg>
);
const IconPlus = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <path d="M5 12h14" /> <path d="M12 5v14" />{" "}
  </svg>
);
const IconInbox = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />{" "}
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />{" "}
  </svg>
);

// --- MOCK DATA ---
const posts = [
  {
    id: 1,
    title: "Thông báo bảo trì hệ thống ngày 25/05",
    author: "Admin",
    role: "admin",
    category: "Hệ thống",
    date: "20/05/2025",
    status: "published",
  },
  {
    id: 2,
    title: "5 quán bún bò Huế ngon rẻ",
    author: "Minh Hương",
    role: "guide",
    category: "Ẩm thực",
    date: "19/05/2025",
    status: "pending",
  },
  {
    id: 3,
    title: "Kinh nghiệm đi Đại Nội mùa mưa",
    author: "Trần Văn",
    role: "guide",
    category: "Kinh nghiệm",
    date: "18/05/2025",
    status: "rejected",
  },
  {
    id: 4,
    title: "Lễ hội Festival Huế 2025",
    author: "Admin",
    role: "admin",
    category: "Tin tức",
    date: "15/05/2025",
    status: "published",
  },
];

export default function AdminPosts() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState(""); // [NEW] Search State

  const filteredPosts = posts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (filter === "pending") return p.status === "pending";
    if (filter === "admin") return p.role === "admin";
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
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

  const handleApprove = (id) => {
    if (window.confirm("Duyệt bài viết này?"))
      alert(`Đã duyệt bài viết #${id}`);
  };

  const handleReject = (id) => {
    const reason = prompt("Lý do từ chối:");
    if (reason) alert(`Đã từ chối bài viết #${id}`);
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
            Kiểm duyệt nội dung và đăng thông báo.
          </p>
        </div>
        <Link
          to="/dashboard/admin/create-post"
          className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg flex items-center gap-2 transition-all active:scale-95"
        >
          <IconPlus className="w-5 h-5" /> Viết thông báo
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-border-light flex flex-col md:flex-row justify-between gap-4 shadow-sm">
        <div className="flex gap-2 border-b border-border-light md:border-b-0 pb-2 md:pb-0 overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "Tất cả" },
            { id: "pending", label: "Chờ duyệt", icon: true },
            { id: "admin", label: "Tin hệ thống" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
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

        {/* [NEW] Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm bài viết, tác giả..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
        {filteredPosts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
                <tr>
                  <th className="p-4 pl-6">Tiêu đề bài viết</th>
                  <th className="p-4">Tác giả</th>
                  <th className="p-4">Danh mục</th>
                  <th className="p-4">Ngày gửi</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 pr-6 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
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
                          post.role === "admin"
                            ? "text-primary"
                            : "text-text-primary"
                        }`}
                      >
                        {post.author}
                      </span>
                      {post.role === "admin" && (
                        <span className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 rounded font-bold">
                          ADMIN
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-text-secondary">{post.category}</td>
                    <td className="p-4 text-text-secondary text-xs">
                      {post.date}
                    </td>
                    <td className="p-4">{getStatusBadge(post.status)}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        {post.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleApprove(post.id)}
                              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              title="Duyệt"
                            >
                              <IconCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(post.id)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
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
                              className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-gray-50 transition-colors"
                              title="Sửa"
                            >
                              <IconEdit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-colors"
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
          </div>
        ) : (
          // [NEW] Empty State
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
    </div>
  );
}
