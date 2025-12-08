import React, { useState, useMemo, useEffect, useRef } from "react";
import { useToast } from "../../../components/Toast/useToast";
import { IconCheck } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import { IconUser } from "../../../icons/IconUser";
import {
  IconLock,
  IconUnlock,
  IconEye,
  IconVideo,
  IconFileText,
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
  IconShieldCheck,
} from "../../../icons/IconCommon";
import Spinner from "../../../components/Loaders/Spinner";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import {
  useAdminUsers,
  useAdminUserActions,
  useAdminGuideApplications,
  useAdminGuideAppActions,
  useAdminDeleteRequests,
  useAdminDeleteRequestActions,
} from "../../../features/users/hooks";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return "N/A";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
};

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminUsers() {
  const toast = useToast();

  // Tab & search state
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  // Lightbox & modals
  const [lightboxImg, setLightboxImg] = useState(null);
  const [lockConfirm, setLockConfirm] = useState(null);
  const [rejectConfirm, setRejectConfirm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [rejectDeleteConfirm, setRejectDeleteConfirm] = useState(null);

  // Cache for instant tab switching
  const cacheRef = useRef({});

  // Get role filter for API
  const getRoleFilter = () => {
    if (activeTab === "tourist") return "tourist";
    if (activeTab === "guide") return "guide";
    return undefined;
  };

  // Fetch users
  const { users, total, totalPages, isLoading, error, refetch } = useAdminUsers(
    {
      page,
      limit: 10,
      role: getRoleFilter(),
      search: debouncedSearch || undefined,
    }
  );

  // Fetch pending guide applications
  const {
    applications: pendingGuides,
    isLoading: guidesLoading,
    refetch: refetchGuides,
  } = useAdminGuideApplications({ status: "pending" });

  // Fetch pending delete requests
  const {
    requests: deleteRequests,
    isLoading: deleteRequestsLoading,
    refetch: refetchDeleteRequests,
  } = useAdminDeleteRequests();

  // Actions
  const { updateStatus, isLoading: actionLoading } = useAdminUserActions();
  const { reviewApplication, isLoading: reviewLoading } =
    useAdminGuideAppActions();
  const {
    approveDelete,
    rejectDelete,
    isLoading: deleteActionLoading,
  } = useAdminDeleteRequestActions();

  // Cache results
  const cacheKey = `${activeTab}-${page}-${debouncedSearch}`;
  useEffect(() => {
    if (users.length > 0 && !isLoading) {
      cacheRef.current[cacheKey] = { users, total, totalPages };
    }
  }, [users, total, totalPages, isLoading, cacheKey]);

  // Display data (use cache while loading)
  const displayData = useMemo(() => {
    if (!isLoading) return { users, total, totalPages };
    const cached = cacheRef.current[cacheKey];
    if (cached) return cached;
    return { users, total, totalPages };
  }, [isLoading, users, total, totalPages, cacheKey]);

  // Client-side filter for instant feedback
  const filteredUsers = useMemo(() => {
    if (!search.trim()) return displayData.users;
    const searchLower = search.toLowerCase();
    return displayData.users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
    );
  }, [displayData.users, search]);

  // Handlers
  const handleToggleLock = (user) => {
    setLockConfirm(user);
  };

  const confirmToggleLock = async () => {
    if (!lockConfirm) return;
    try {
      const newStatus = lockConfirm.status === "active" ? "banned" : "active";
      await updateStatus(lockConfirm._id, newStatus);
      toast.success(
        "Thành công!",
        newStatus === "banned"
          ? `Đã khóa tài khoản ${lockConfirm.name}`
          : `Đã mở khóa tài khoản ${lockConfirm.name}`
      );
      setLockConfirm(null);
      refetch();
    } catch (err) {
      toast.error("Lỗi thay đổi trạng thái", err.message || "Không thể thay đổi trạng thái tài khoản");
    }
  };

  const handleApproveGuide = async (guide) => {
    try {
      await reviewApplication(guide._id, "approve");
      toast.success("Thành công!", `Đã chấp thuận HDV ${guide.user_id?.name}`);
      refetchGuides();
    } catch (err) {
      toast.error("Lỗi chấp thuận HDV", err.message || "Không thể chấp thuận hồ sơ");
    }
  };

  const handleRejectGuide = (guide) => {
    setRejectConfirm(guide);
  };

  const confirmReject = async () => {
    if (!rejectConfirm) return;
    try {
      await reviewApplication(rejectConfirm._id, "reject");
      toast.info(
        "Đã từ chối",
        `HDV ${rejectConfirm.user_id?.name} đã bị từ chối.`
      );
      setRejectConfirm(null);
      refetchGuides();
    } catch (err) {
      toast.error("Lỗi từ chối HDV", err.message || "Không thể từ chối hồ sơ");
    }
  };

  // Delete request handlers
  const handleApproveDelete = (user) => {
    setDeleteConfirm(user);
  };

  const confirmApproveDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await approveDelete(deleteConfirm._id);
      toast.success(
        "Đã xóa",
        `Tài khoản ${deleteConfirm.name} đã được xóa thành công.`
      );
      setDeleteConfirm(null);
      refetchDeleteRequests();
      refetch();
    } catch (err) {
      toast.error("Lỗi xóa tài khoản", err.message || "Không thể xóa tài khoản");
    }
  };

  const handleRejectDelete = (user) => {
    setRejectDeleteConfirm(user);
  };

  const confirmRejectDelete = async () => {
    if (!rejectDeleteConfirm) return;
    try {
      await rejectDelete(rejectDeleteConfirm._id);
      toast.info(
        "Đã từ chối",
        `Yêu cầu xóa của ${rejectDeleteConfirm.name} đã bị từ chối.`
      );
      setRejectDeleteConfirm(null);
      refetchDeleteRequests();
    } catch (err) {
      toast.error("Lỗi từ chối yêu cầu", err.message || "Không thể từ chối yêu cầu xóa tài khoản");
    }
  };

  // Loading state for initial load
  if (isLoading && users.length === 0 && activeTab !== "pending") {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

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
            {displayData.total > 0 &&
              activeTab !== "pending" &&
              activeTab !== "delete-requests" && (
                <span className="ml-2 font-bold">
                  Tổng: {displayData.total} người dùng
                </span>
              )}
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Toolbar Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-border-light flex flex-col md:flex-row justify-between gap-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "Tất cả" },
            { id: "tourist", label: "Du khách" },
            { id: "guide", label: "Hướng dẫn viên" },
            {
              id: "pending",
              label: "Chờ duyệt HDV",
              icon: true,
              count: pendingGuides.length,
            },
            {
              id: "delete-requests",
              label: "Yêu cầu xóa",
              icon: true,
              count: deleteRequests.length,
              danger: true,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`
                whitespace-nowrap px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2
                ${
                  activeTab === tab.id
                    ? tab.danger
                      ? "bg-red-500 text-white shadow-md"
                      : "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:bg-bg-main"
                }
              `}
            >
              {tab.label}
              {tab.icon && tab.count > 0 && (
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    tab.danger ? "bg-red-300" : "bg-red-500"
                  }`}
                ></span>
              )}
            </button>
          ))}
        </div>

        {activeTab !== "pending" && activeTab !== "delete-requests" && (
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Tìm tên hoặc email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-bg-main/30 focus:bg-white focus:border-primary outline-none text-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          </div>
        )}
      </div>

      {/* --- VIEW 1: USER LIST TABLE --- */}
      {activeTab !== "pending" && activeTab !== "delete-requests" && (
        <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
          {/* Empty state check */}
          {filteredUsers.length > 0 ? (
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
                        key={user._id}
                        className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                      >
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-text-secondary uppercase">
                                {user.name?.charAt(0) || "?"}
                              </div>
                            )}
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
                                : user.role === "admin"
                                ? "bg-red-50 text-red-700 border border-red-100"
                                : "bg-blue-50 text-blue-700 border border-blue-100"
                            }`}
                          >
                            {user.role === "guide"
                              ? "HDV"
                              : user.role === "admin"
                              ? "Admin"
                              : "Du khách"}
                          </span>
                        </td>
                        <td className="p-4 text-text-secondary">
                          {formatDate(user.createdAt)}
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
                          {user.role !== "admin" && (
                            <button
                              onClick={() => handleToggleLock(user)}
                              disabled={actionLoading}
                              className={`p-2 rounded-lg ml-2 transition-colors disabled:opacity-50 ${
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
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {displayData.totalPages > 1 && (
                <div className="p-4 border-t border-border-light flex justify-between items-center text-xs text-text-secondary bg-white">
                  <span>
                    Hiển thị{" "}
                    <strong>
                      {(page - 1) * 10 + 1}-
                      {Math.min(page * 10, displayData.total)}
                    </strong>{" "}
                    trên tổng số <strong>{displayData.total}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-border-light hover:bg-bg-main disabled:opacity-50"
                    >
                      <IconChevronLeft className="w-4 h-4" />
                    </button>
                    {[...Array(Math.min(5, displayData.totalPages))].map(
                      (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-3 py-1.5 rounded-lg border font-bold ${
                              page === pageNum
                                ? "border-primary bg-primary text-white"
                                : "border-border-light hover:bg-bg-main"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                    {displayData.totalPages > 5 && (
                      <>
                        <span className="text-gray-400">...</span>
                        <button
                          onClick={() => setPage(displayData.totalPages)}
                          className={`px-3 py-1.5 rounded-lg border font-bold ${
                            page === displayData.totalPages
                              ? "border-primary bg-primary text-white"
                              : "border-border-light hover:bg-bg-main"
                          }`}
                        >
                          {displayData.totalPages}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(displayData.totalPages, p + 1))
                      }
                      disabled={page === displayData.totalPages}
                      className="p-2 rounded-lg border border-border-light hover:bg-bg-main disabled:opacity-50"
                    >
                      <IconChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
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
          {guidesLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : pendingGuides.length > 0 ? (
            pendingGuides.map((guide) => (
              <div
                key={guide._id}
                className="bg-white p-6 rounded-3xl border border-border-light shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold border-2 border-primary/20">
                          {guide.user_id?.name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-bold text-text-primary">
                            {guide.user_id?.name || "Ẩn danh"}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {guide.user_id?.email} •{" "}
                            {guide.user_id?.phone_number || "Chưa có SĐT"}
                          </p>
                          <p className="text-xs text-orange-500 font-bold mt-1">
                            Yêu cầu: {formatTimeAgo(guide.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {guide.about && (
                      <div className="bg-bg-main p-4 rounded-2xl border border-border-light text-sm text-text-secondary italic">
                        "{guide.about}"
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-bold text-text-secondary uppercase">
                          Kinh nghiệm
                        </p>
                        <p className="font-bold text-text-primary">
                          {guide.experience_years || 0} năm
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-secondary uppercase">
                          Ngôn ngữ
                        </p>
                        <p className="font-bold text-primary">
                          {guide.languages?.join(", ") || "Tiếng Việt"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="lg:w-80 space-y-4">
                    {guide.id_cards?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-text-secondary uppercase flex items-center gap-1">
                          <IconFileText className="w-3 h-3" /> Ảnh thẻ HDV /
                          CCCD
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {guide.id_cards.map((card, idx) => {
                            const url = card?.url || card;
                            return (
                              <div
                                key={url || idx}
                                className="h-32 rounded-xl overflow-hidden border border-border-light bg-gray-100 relative group cursor-zoom-in"
                                onClick={() => setLightboxImg(url)}
                                title={`CCCD ${idx + 1}`}
                              >
                                <img
                                  src={url}
                                  className="w-full h-full object-cover"
                                  alt={`ID Card ${idx + 1}`}
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <IconEye className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {guide.certificates?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-text-secondary uppercase flex items-center gap-1">
                          <IconFileText className="w-3 h-3" /> Chứng chỉ
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {guide.certificates.map((file, idx) => {
                            const url = file?.url || file;
                            return (
                              <a
                                key={url || idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="h-28 rounded-xl border border-border-light bg-white hover:border-primary hover:shadow-md transition-all flex items-center justify-center text-xs font-bold text-primary text-center px-2"
                                title={file?.name || `Chứng chỉ ${idx + 1}`}
                              >
                                Xem chứng chỉ {idx + 1} ↗
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {guide.intro_video?.url && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-text-secondary uppercase flex items-center gap-1">
                          <IconVideo className="w-3 h-3" /> Video giới thiệu
                        </p>
                        <a
                          href={guide.intro_video.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block p-3 rounded-xl border border-border-light bg-white hover:border-primary hover:text-primary transition-colors text-sm font-medium truncate text-center"
                        >
                          Xem video ↗
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="lg:w-48 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-border-light pt-6 lg:pt-0 lg:pl-8">
                    <button
                      onClick={() => handleApproveGuide(guide)}
                      disabled={reviewLoading}
                      className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <IconCheck className="w-5 h-5" /> Chấp thuận
                    </button>
                    <button
                      onClick={() => handleRejectGuide(guide)}
                      disabled={reviewLoading}
                      className="w-full py-3 rounded-xl border border-red-100 text-red-600 bg-red-50 hover:bg-red-100 font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

      {/* --- VIEW 3: DELETE REQUESTS --- */}
      {activeTab === "delete-requests" && (
        <div className="grid grid-cols-1 gap-6 animate-fade-in">
          {deleteRequestsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : deleteRequests.length > 0 ? (
            deleteRequests.map((user) => (
              <div
                key={user._id}
                className="bg-white p-6 rounded-3xl border border-red-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* User Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-red-100"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold border-2 border-red-200">
                          {user.name?.charAt(0) || "?"}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-heading font-bold text-text-primary">
                          {user.name || "Ẩn danh"}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {user.email} • {user.phone || "Chưa có SĐT"}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                              user.role === "guide"
                                ? "bg-purple-50 text-purple-700 border border-purple-100"
                                : "bg-blue-50 text-blue-700 border border-blue-100"
                            }`}
                          >
                            {user.role === "guide" ? "HDV" : "Du khách"}
                          </span>
                          <span className="text-xs text-orange-500 font-bold">
                            Yêu cầu:{" "}
                            {formatTimeAgo(user.delete_request?.requested_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    {user.delete_request?.reason && (
                      <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-sm text-red-700">
                        <p className="text-xs font-bold text-red-500 uppercase mb-1">
                          Lý do xóa:
                        </p>
                        "{user.delete_request.reason}"
                      </div>
                    )}

                    {/* User Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-bold text-text-secondary uppercase">
                          Ngày tham gia
                        </p>
                        <p className="font-bold text-text-primary">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-secondary uppercase">
                          Trạng thái TK
                        </p>
                        <p
                          className={`font-bold ${
                            user.status === "active"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {user.status === "active" ? "Hoạt động" : "Đã khóa"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:w-48 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-border-light pt-6 lg:pt-0 lg:pl-8">
                    <button
                      onClick={() => handleApproveDelete(user)}
                      disabled={deleteActionLoading}
                      className="w-full py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <IconTrash className="w-4 h-4" /> Xóa tài khoản
                    </button>
                    <button
                      onClick={() => handleRejectDelete(user)}
                      disabled={deleteActionLoading}
                      className="w-full py-3 rounded-xl border border-gray-200 text-text-secondary bg-white hover:bg-gray-50 font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <IconX className="w-4 h-4" /> Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-border-light">
              <IconCheck className="w-12 h-12 mx-auto mb-3 text-green-500 bg-green-100 p-2 rounded-full" />
              <p className="text-text-primary font-bold">Tuyệt vời!</p>
              <p className="text-text-secondary text-sm">
                Không có yêu cầu xóa tài khoản nào đang chờ xử lý.
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- LIGHTBOX MODAL --- */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-100 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImg(null)}
        >
          <button className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 bg-white/10 rounded-full backdrop-blur-sm">
            <IconX className="w-8 h-8" />
          </button>
          <img
            src={lightboxImg}
            alt="Full View"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border-4 border-white/20"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Lock/Unlock Confirm Modal */}
      <ConfirmModal
        isOpen={!!lockConfirm}
        onClose={() => setLockConfirm(null)}
        onConfirm={confirmToggleLock}
        title={
          lockConfirm?.status === "active"
            ? "Khóa tài khoản"
            : "Mở khóa tài khoản"
        }
        message={
          lockConfirm?.status === "active"
            ? `Bạn có chắc muốn khóa tài khoản "${lockConfirm?.name}"? Người dùng sẽ không thể đăng nhập.`
            : `Bạn có chắc muốn mở khóa tài khoản "${lockConfirm?.name}"?`
        }
        confirmText={lockConfirm?.status === "active" ? "Khóa" : "Mở khóa"}
        confirmVariant={lockConfirm?.status === "active" ? "danger" : "primary"}
        isLoading={actionLoading}
      />

      {/* Reject Guide Confirm Modal */}
      <ConfirmModal
        isOpen={!!rejectConfirm}
        onClose={() => setRejectConfirm(null)}
        onConfirm={confirmReject}
        title="Từ chối hồ sơ HDV"
        message={`Bạn có chắc muốn từ chối hồ sơ của "${rejectConfirm?.user_id?.name}"?`}
        confirmText="Từ chối"
        confirmVariant="danger"
        isLoading={reviewLoading}
      />

      {/* Approve Delete Account Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmApproveDelete}
        title="Xác nhận xóa tài khoản"
        message={`Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản "${deleteConfirm?.name}" (${deleteConfirm?.email})? Hành động này không thể hoàn tác!`}
        confirmText="Xóa vĩnh viễn"
        confirmVariant="danger"
        isLoading={deleteActionLoading}
      />

      {/* Reject Delete Request Confirm Modal */}
      <ConfirmModal
        isOpen={!!rejectDeleteConfirm}
        onClose={() => setRejectDeleteConfirm(null)}
        onConfirm={confirmRejectDelete}
        title="Từ chối yêu cầu xóa"
        message={`Bạn có chắc muốn từ chối yêu cầu xóa tài khoản của "${rejectDeleteConfirm?.name}"?`}
        confirmText="Từ chối"
        confirmVariant="primary"
        isLoading={deleteActionLoading}
      />
    </div>
  );
}
