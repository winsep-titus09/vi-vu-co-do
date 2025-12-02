import React, { useState, useMemo } from "react";
import { useToast } from "../../../components/Toast/useToast";
import {
  useAdminNotificationStats,
  useAdminBroadcast,
  useAdminNotificationHistory,
} from "../../../features/notifications/hooks";
import Spinner from "../../../components/Loaders/Spinner";
import EmptyState from "../../../components/Loaders/EmptyState";
import { IconCheck, IconClock } from "../../../icons/IconBox";
import IconMail from "../../../icons/IconMail";
import {
  IconBell,
  IconFilter,
  IconSend,
  IconInbox,
} from "../../../icons/IconCommon";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getAudienceLabel = (audience) => {
  switch (audience) {
    case "tourist":
      return "Du khách";
    case "guide":
      return "Hướng dẫn viên";
    default:
      return "Toàn bộ người dùng";
  }
};

const getChannelLabel = (channels) => {
  if (!channels) return "In-App";
  const labels = [];
  if (channels.inApp) labels.push("In-App");
  if (channels.email) labels.push("Email");
  return labels.join(" + ") || "In-App";
};

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState("broadcast"); // broadcast | history
  const toast = useToast();

  // API Hooks
  const {
    stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useAdminNotificationStats();
  const { sendBroadcast, isLoading: isSending } = useAdminBroadcast();

  // History params with filters
  const [historyParams, setHistoryParams] = useState({ page: 1, limit: 20 });
  const {
    history,
    pagination,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useAdminNotificationHistory(historyParams);

  // State cho form Broadcast
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    audience: "all", // all, tourist, guide
    channels: { inApp: true, email: false },
  });

  // Filter state for history
  const [historyFilter, setHistoryFilter] = useState({
    audience: "all",
    channel: "all",
  });
  const [showHistoryFilter, setShowHistoryFilter] = useState(false);

  // Audience counts from stats
  const audienceCounts = useMemo(() => {
    return stats?.audienceCounts || { all: 0, tourist: 0, guide: 0 };
  }, [stats]);

  // Handle send broadcast
  const handleSendBroadcast = async () => {
    if (!broadcastForm.title.trim()) {
      toast.warning("Thiếu thông tin", "Vui lòng nhập tiêu đề thông báo");
      return;
    }
    if (!broadcastForm.message.trim()) {
      toast.warning("Thiếu thông tin", "Vui lòng nhập nội dung thông báo");
      return;
    }
    if (!broadcastForm.channels.inApp && !broadcastForm.channels.email) {
      toast.warning("Thiếu thông tin", "Vui lòng chọn ít nhất một kênh gửi");
      return;
    }

    const result = await sendBroadcast(broadcastForm);
    if (result) {
      toast.success(
        "Gửi thành công!",
        `Đã gửi thông báo đến ${result.stats?.totalRecipients || 0} người dùng`
      );
      // Reset form
      setBroadcastForm({
        title: "",
        message: "",
        audience: "all",
        channels: { inApp: true, email: false },
      });
      // Refresh stats and history
      refetchStats();
      refetchHistory();
    } else {
      toast.error("Lỗi", "Không thể gửi thông báo. Vui lòng thử lại.");
    }
  };

  // Handle history filter change
  const handleHistoryFilterChange = (key, value) => {
    setHistoryFilter((prev) => ({ ...prev, [key]: value }));
    const newParams = { ...historyParams, page: 1 };
    if (key === "audience" && value !== "all") {
      newParams.audience = value;
    } else if (key === "audience") {
      delete newParams.audience;
    }
    if (key === "channel" && value !== "all") {
      newParams.channel = value;
    } else if (key === "channel") {
      delete newParams.channel;
    }
    setHistoryParams(newParams);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setHistoryParams((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Hệ thống Thông báo
        </h1>
        <p className="text-text-secondary text-sm">
          Gửi thông báo đẩy đến người dùng và xem lịch sử gửi.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white border border-border-light rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "broadcast"
              ? "bg-bg-main text-primary shadow-sm"
              : "text-text-secondary hover:bg-gray-50"
          }`}
        >
          <IconBell className="w-4 h-4" /> Gửi thông báo
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "history"
              ? "bg-bg-main text-primary shadow-sm"
              : "text-text-secondary hover:bg-gray-50"
          }`}
        >
          <IconClock className="w-4 h-4" /> Lịch sử gửi
        </button>
      </div>

      {/* --- TAB 1: BROADCAST (Gửi thủ công) --- */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-border-light shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Tiêu đề thông báo
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary outline-none text-sm font-bold"
                placeholder="VD: Thông báo bảo trì hệ thống..."
                value={broadcastForm.title}
                onChange={(e) =>
                  setBroadcastForm({ ...broadcastForm, title: e.target.value })
                }
                disabled={isSending}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Nội dung
              </label>
              <textarea
                rows="5"
                className="w-full px-4 py-3 rounded-xl border border-border-light focus:border-primary outline-none text-sm resize-none"
                placeholder="Nhập nội dung chi tiết..."
                value={broadcastForm.message}
                onChange={(e) =>
                  setBroadcastForm({
                    ...broadcastForm,
                    message: e.target.value,
                  })
                }
                disabled={isSending}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Đối tượng nhận
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm cursor-pointer"
                  value={broadcastForm.audience}
                  onChange={(e) =>
                    setBroadcastForm({
                      ...broadcastForm,
                      audience: e.target.value,
                    })
                  }
                  disabled={isSending}
                >
                  <option value="all">
                    Toàn bộ người dùng (
                    {statsLoading ? "..." : audienceCounts.all.toLocaleString()}
                    )
                  </option>
                  <option value="tourist">
                    Chỉ Du khách (
                    {statsLoading
                      ? "..."
                      : audienceCounts.tourist.toLocaleString()}
                    )
                  </option>
                  <option value="guide">
                    Chỉ Hướng dẫn viên (
                    {statsLoading
                      ? "..."
                      : audienceCounts.guide.toLocaleString()}
                    )
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Kênh gửi
                </label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastForm.channels.inApp}
                      onChange={(e) =>
                        setBroadcastForm({
                          ...broadcastForm,
                          channels: {
                            ...broadcastForm.channels,
                            inApp: e.target.checked,
                          },
                        })
                      }
                      disabled={isSending}
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium">
                      In-App Notification
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={broadcastForm.channels.email}
                      onChange={(e) =>
                        setBroadcastForm({
                          ...broadcastForm,
                          channels: {
                            ...broadcastForm.channels,
                            email: e.target.checked,
                          },
                        })
                      }
                      disabled={isSending}
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium">Gửi Email</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSendBroadcast}
                disabled={isSending}
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Spinner className="w-4 h-4" /> Đang gửi...
                  </>
                ) : (
                  <>
                    <IconSend className="w-4 h-4" /> Gửi ngay
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Stats Card */}
            <div className="bg-white p-6 rounded-3xl border border-border-light">
              <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                <IconMail className="w-5 h-5 text-primary" />
                Thống kê gửi
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Tổng số đã gửi:</span>
                  <span className="font-bold text-text-primary">
                    {statsLoading
                      ? "..."
                      : stats?.broadcastStats?.totalSent || 0}
                  </span>
                </div>
                {stats?.broadcastStats?.lastSentAt && (
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Gửi gần nhất:</span>
                    <span className="font-medium text-text-primary">
                      {formatDate(stats.broadcastStats.lastSentAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2">
                Lưu ý khi gửi Broadcast
              </h3>
              <ul className="list-disc list-inside text-sm text-blue-700/80 space-y-2">
                <li>
                  Hạn chế gửi quá nhiều thông báo gây phiền cho người dùng.
                </li>
                <li>
                  Nội dung quan trọng (Bảo trì, Sự cố) nên gửi qua cả Email và
                  In-App.
                </li>
                <li>
                  Kiểm tra kỹ chính tả và tiêu đề trước khi gửi vì{" "}
                  <strong>không thể thu hồi</strong> sau khi phát tán.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: HISTORY --- */}
      {activeTab === "history" && (
        <div className="animate-fade-in space-y-4">
          {/* Filter Bar */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={() => setShowHistoryFilter(!showHistoryFilter)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
                  showHistoryFilter
                    ? "border-primary bg-bg-main text-primary"
                    : "border-border-light bg-white text-text-secondary hover:border-primary/50"
                }`}
              >
                <IconFilter className="w-4 h-4" /> Bộ lọc
              </button>
            </div>
            <p className="text-sm text-text-secondary">
              Tổng: <span className="font-bold">{pagination.total}</span> lượt
              gửi
            </p>
          </div>

          {/* Filter Panel */}
          {showHistoryFilter && (
            <div className="bg-white p-4 rounded-xl border border-border-light flex gap-4 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-secondary uppercase">
                  Đối tượng:
                </span>
                <select
                  value={historyFilter.audience}
                  onChange={(e) =>
                    handleHistoryFilterChange("audience", e.target.value)
                  }
                  className="px-3 py-2 rounded-lg border border-border-light text-sm bg-white"
                >
                  <option value="all">Tất cả</option>
                  <option value="tourist">Du khách</option>
                  <option value="guide">Hướng dẫn viên</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-secondary uppercase">
                  Kênh:
                </span>
                <select
                  value={historyFilter.channel}
                  onChange={(e) =>
                    handleHistoryFilterChange("channel", e.target.value)
                  }
                  className="px-3 py-2 rounded-lg border border-border-light text-sm bg-white"
                >
                  <option value="all">Tất cả</option>
                  <option value="inApp">In-App</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>
          )}

          {/* History Table */}
          {historyLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : history.length === 0 ? (
            <EmptyState
              icon={IconInbox}
              title="Chưa có lịch sử gửi"
              message="Các thông báo đã gửi sẽ hiển thị tại đây."
            />
          ) : (
            <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
                  <tr>
                    <th className="p-4 pl-6">Tiêu đề</th>
                    <th className="p-4">Đối tượng</th>
                    <th className="p-4">Kênh gửi</th>
                    <th className="p-4">Số người nhận</th>
                    <th className="p-4">Thời gian gửi</th>
                    <th className="p-4 pr-6 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                    >
                      <td className="p-4 pl-6 font-bold text-text-primary max-w-[200px] truncate">
                        {item.meta?.title || "Không có tiêu đề"}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded bg-bg-main text-text-secondary text-xs border border-border-light">
                          {getAudienceLabel(item.meta?.targetAudience)}
                        </span>
                      </td>
                      <td className="p-4 text-text-secondary">
                        {getChannelLabel(item.meta?.channels)}
                      </td>
                      <td className="p-4 text-text-primary font-medium">
                        {item.meta?.recipientCount?.toLocaleString() || 0}
                      </td>
                      <td className="p-4 text-text-secondary text-xs">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs">
                          <IconCheck className="w-3 h-3" /> Đã gửi
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="p-4 border-t border-border-light flex justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 rounded-lg border border-border-light text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-main"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-1.5 text-sm text-text-secondary">
                    Trang {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1.5 rounded-lg border border-border-light text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-main"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
