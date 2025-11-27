import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconCheck, IconClock } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";

// Inline Icons
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
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
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
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconFileText = ({ className }) => (
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
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// --- MOCK DATA ---
const myPosts = [
  {
    id: 1,
    title: "5 quán bún bò Huế 'núp hẻm' chỉ thổ địa mới biết",
    category: "Ẩm thực",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_3.jpg",
    date: "20/05/2025",
    status: "published", // published, pending, draft
    stats: { views: 1240, comments: 45 },
  },
  {
    id: 2,
    title: "Hướng dẫn tham quan Đại Nội Huế: Lộ trình 4 tiếng không mỏi chân",
    category: "Kinh nghiệm",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
    date: "18/05/2025",
    status: "pending",
    stats: { views: 0, comments: 0 },
  },
  {
    id: 3,
    title: "[Nháp] Những điều cấm kỵ khi vào Lăng tẩm",
    category: "Văn hóa",
    image:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg",
    date: "15/05/2025",
    status: "draft",
    stats: { views: 0, comments: 0 },
  },
];

const tabs = [
  { id: "all", label: "Tất cả" },
  { id: "published", label: "Đã đăng" },
  { id: "pending", label: "Chờ duyệt" },
  { id: "draft", label: "Bản nháp" },
];

export default function GuideMyPosts() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const filteredPosts = myPosts.filter((post) => {
    const matchTab = activeTab === "all" || post.status === activeTab;
    const matchSearch = post.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
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
      default:
        return null;
    }
  };

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
              key={post.id}
              className="bg-white rounded-3xl border border-border-light p-4 hover:shadow-md transition-all group"
            >
              <div className="flex gap-6 items-start">
                {/* Thumbnail */}
                <div className="w-24 h-24 md:w-32 md:h-24 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-24">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-base md:text-lg font-bold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      {getStatusBadge(post.status)}
                    </div>
                    <p className="text-xs text-text-secondary mt-1 flex items-center gap-2">
                      <span>{post.category}</span> • <span>{post.date}</span>
                    </p>
                  </div>

                  {/* Footer: Stats & Actions */}
                  <div className="flex justify-between items-end">
                    <div className="flex gap-4 text-xs font-medium text-text-secondary">
                      <span className="flex items-center gap-1">
                        <IconEye className="w-3.5 h-3.5" /> {post.stats.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconFileText className="w-3.5 h-3.5" />{" "}
                        {post.stats.comments}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/dashboard/guide/edit-post/${post.id}`}
                        className="p-2 rounded-lg border border-border-light text-text-secondary hover:text-primary hover:border-primary transition-all bg-white"
                        title="Chỉnh sửa"
                      >
                        <IconEdit className="w-4 h-4" />
                      </Link>
                      <button
                        className="p-2 rounded-lg border border-border-light text-text-secondary hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
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
    </div>
  );
}
