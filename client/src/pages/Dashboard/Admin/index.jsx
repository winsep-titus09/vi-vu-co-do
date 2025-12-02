import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { IconCalendar } from "../../../icons/IconBox";
import {
  IconWallet,
  IconEye,
  IconFlag,
  IconShield,
  IconSettings,
  IconTicket,
  IconAlert,
  IconUsers,
  IconMap,
  IconCheck,
  IconX,
  IconRefresh,
} from "../../../icons/IconCommon";
import Spinner from "../../../components/Loaders/Spinner";
import {
  useAdminDashboard,
  useAdminRevenues,
  useAdminTourRequests,
  useAdminPayouts,
  useRevenueTrend,
  useApproveTourRequest,
  useRejectTourRequest,
} from "../../../features/admin/hooks";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatTimeAgo,
} from "../../../lib/formatters";

const STATUS_CONFIG = {
  pending: {
    label: "Chờ duyệt",
    className: "bg-yellow-100 text-yellow-700",
  },
  confirmed: {
    label: "Đã nhận",
    className: "bg-blue-100 text-blue-700",
  },
  completed: {
    label: "Hoàn thành",
    className: "bg-green-100 text-green-700",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-red-100 text-red-700",
  },
  approved: {
    label: "Đã duyệt",
    className: "bg-emerald-100 text-emerald-700",
  },
  rejected: {
    label: "Đã từ chối",
    className: "bg-rose-100 text-rose-700",
  },
};

const decimalToNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "object") {
    if (value.$numberDecimal) {
      return Number(value.$numberDecimal);
    }
    if (typeof value.toString === "function") {
      const parsed = Number(value.toString());
      return Number.isNaN(parsed) ? 0 : parsed;
    }
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const RevenueTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;
  return (
    <div className="bg-white border border-border-light rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-text-primary mb-1">
        {item.name || item.label}
      </p>
      <p className="text-text-secondary">
        {formatCurrency(item.rawValue || item.revenue)}
      </p>
    </div>
  );
};

const REFRESH_INTERVAL = 60000; // 60 giây

export default function AdminDashboard() {
  // State cho filter tour requests
  const [requestStatusFilter, setRequestStatusFilter] = useState("");

  // State cho quick actions
  const [actionLoading, setActionLoading] = useState(null);
  const [actionResult, setActionResult] = useState(null);

  const {
    summary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useAdminDashboard();
  const {
    revenues,
    isLoading: revenueLoading,
    error: revenueError,
  } = useAdminRevenues({ limit: 6 });

  // Revenue trend cho Line Chart
  const {
    data: revenueTrend,
    isLoading: trendLoading,
    error: trendError,
  } = useRevenueTrend({ days: 7 });

  const {
    items: tourRequests,
    total: totalRequests,
    isLoading: requestsLoading,
    error: requestsError,
    refetch: refetchRequests,
  } = useAdminTourRequests({ status: requestStatusFilter, limit: 50 });
  const {
    payouts,
    isLoading: payoutsLoading,
    error: payoutsError,
    refetch: refetchPayouts,
  } = useAdminPayouts({ status: "pending", limit: 5 });

  // Quick action hooks
  const { approve: approveRequest } = useApproveTourRequest();
  const { reject: rejectRequest } = useRejectTourRequest();

  // Auto-refresh mỗi 60 giây
  useEffect(() => {
    const interval = setInterval(() => {
      refetchSummary();
      refetchRequests();
      refetchPayouts();
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refetchSummary, refetchRequests, refetchPayouts]);

  // Quick action handlers
  const handleApprove = useCallback(
    async (id) => {
      setActionLoading(id);
      setActionResult(null);
      try {
        await approveRequest(id);
        setActionResult({
          type: "success",
          message: "Đã duyệt tour thành công!",
        });
        refetchRequests();
        refetchSummary();
      } catch {
        setActionResult({ type: "error", message: "Không thể duyệt tour." });
      } finally {
        setActionLoading(null);
      }
    },
    [approveRequest, refetchRequests, refetchSummary]
  );

  const handleReject = useCallback(
    async (id) => {
      const reason = window.prompt("Nhập lý do từ chối:");
      if (reason === null) return; // User cancelled
      setActionLoading(id);
      setActionResult(null);
      try {
        await rejectRequest(id, reason);
        setActionResult({ type: "success", message: "Đã từ chối tour." });
        refetchRequests();
        refetchSummary();
      } catch {
        setActionResult({ type: "error", message: "Không thể từ chối tour." });
      } finally {
        setActionLoading(null);
      }
    },
    [rejectRequest, refetchRequests, refetchSummary]
  );

  const handleRefreshAll = useCallback(() => {
    refetchSummary();
    refetchRequests();
    refetchPayouts();
  }, [refetchSummary, refetchRequests, refetchPayouts]);

  // Revenue trend chart data
  const trendChartData = useMemo(
    () =>
      (revenueTrend || []).map((item) => ({
        ...item,
        value: item.revenue / 1_000_000, // triệu VND
      })),
    [revenueTrend]
  );

  const summaryData = useMemo(
    () => ({
      totalGross: Number(summary?.totalGross || 0),
      totalPayouts: Number(summary?.totalPayouts || 0),
      totalNet: Number(summary?.totalNet || 0),
      pendingPayoutCount: Number(summary?.pendingPayoutCount || 0),
      pendingTourRequests: Number(summary?.pendingTourRequests || 0),
      // Users
      totalUsers: Number(summary?.totalUsers || 0),
      totalTourists: Number(summary?.totalTourists || 0),
      totalGuides: Number(summary?.totalGuides || 0),
      activeUsers: Number(summary?.activeUsers || 0),
      // Tours
      totalTours: Number(summary?.totalTours || 0),
      activeTours: Number(summary?.activeTours || 0),
      pendingApprovalTours: Number(summary?.pendingApprovalTours || 0),
      approvedTours: Number(summary?.approvedTours || 0),
      // Bookings
      totalBookings: Number(summary?.totalBookings || 0),
      todayBookings: Number(summary?.todayBookings || 0),
      paidBookings: Number(summary?.paidBookings || 0),
      completedBookings: Number(summary?.completedBookings || 0),
      canceledBookings: Number(summary?.canceledBookings || 0),
      waitingGuideBookings: Number(summary?.waitingGuideBookings || 0),
      awaitingPaymentBookings: Number(summary?.awaitingPaymentBookings || 0),
    }),
    [summary]
  );

  const revenueChartData = useMemo(
    () =>
      (revenues || []).map((item, index) => {
        const raw = Number(item?.totalRevenue || 0);
        return {
          id: item?.tourId || index,
          name:
            item?.title ||
            (item?.tourId
              ? `Tour #${String(item.tourId).slice(-4)}`
              : `Tour ${index + 1}`),
          value: raw / 1_000_000,
          rawValue: raw,
        };
      }),
    [revenues]
  );

  const requestDistribution = useMemo(() => {
    const counts = (tourRequests || []).reduce((acc, req) => {
      const key = req?.status || "pending";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return [
      { key: "pending", label: "Chờ duyệt", color: "#f59e0b" },
      { key: "approved", label: "Đã duyệt", color: "#10b981" },
      { key: "rejected", label: "Từ chối", color: "#ef4444" },
    ]
      .map((item) => ({ ...item, value: counts[item.key] || 0 }))
      .filter((item) => item.value > 0);
  }, [tourRequests]);

  const totalDistribution = useMemo(
    () => requestDistribution.reduce((sum, item) => sum + item.value, 0),
    [requestDistribution]
  );

  const visibleRequests = useMemo(
    () => (tourRequests || []).slice(0, 6),
    [tourRequests]
  );
  const visiblePayouts = useMemo(() => (payouts || []).slice(0, 4), [payouts]);

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status];
    if (!config) return null;
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Tổng quan hệ thống
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Chào mừng quay trở lại, Administrator.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshAll}
            className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white px-4 py-2 rounded-xl border border-primary/20 transition-colors"
            title="Làm mới dữ liệu"
          >
            <IconRefresh className="w-4 h-4" />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
          <div className="flex items-center gap-2 text-sm font-bold text-text-secondary bg-white px-4 py-2 rounded-xl border border-border-light shadow-sm">
            <IconCalendar className="w-4 h-4" />
            <span>
              {new Date().toLocaleDateString("vi-VN", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Action result notification */}
      {actionResult && (
        <div
          className={`px-4 py-3 rounded-3xl text-sm font-medium ${
            actionResult.type === "success"
              ? "bg-green-50 border border-green-100 text-green-600"
              : "bg-red-50 border border-red-100 text-red-600"
          }`}
        >
          {actionResult.message}
        </div>
      )}

      {summaryError && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-3xl">
          Không thể tải số liệu tổng quan: {summaryError}
        </div>
      )}

      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            id: "gross",
            title: "Tổng doanh thu",
            icon: IconWallet,
            iconClass: "bg-blue-50 text-blue-600",
            type: "currency",
            helper: "Booking đã thanh toán",
            getValue: (data) => data.totalGross,
          },
          {
            id: "payouts",
            title: "Đã thanh toán cho HDV",
            icon: IconShield,
            iconClass: "bg-green-50 text-green-600",
            type: "currency",
            helper: (data) =>
              data.pendingPayoutCount > 0
                ? `${formatNumber(data.pendingPayoutCount)} payout chờ xử lý`
                : "Không có payout đang chờ",
            getValue: (data) => data.totalPayouts,
          },
          {
            id: "net",
            title: "Doanh thu còn lại",
            icon: IconFlag,
            iconClass: "bg-purple-50 text-purple-600",
            type: "currency",
            helper: "Sau khi trừ payout HDV",
            getValue: (data) => data.totalNet,
          },
          {
            id: "requests",
            title: "Tour request cần duyệt",
            icon: IconTicket,
            iconClass: "bg-orange-50 text-orange-500",
            type: "number",
            helper: () =>
              totalRequests > 0
                ? `${formatNumber(totalRequests)} yêu cầu trong hệ thống`
                : "Chưa có yêu cầu nào",
            getValue: (data) => data.pendingTourRequests,
          },
        ].map((card) => {
          const Icon = card.icon;
          const value = card.getValue(summaryData);
          const helperText =
            typeof card.helper === "function"
              ? card.helper(summaryData)
              : card.helper;
          const formattedValue =
            card.type === "currency"
              ? formatCurrency(value)
              : formatNumber(value);
          return (
            <div
              key={card.id}
              className="bg-white p-6 rounded-3xl border border-border-light shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${card.iconClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">
                  {card.title}
                </p>
                {summaryLoading ? (
                  <div className="h-8 w-32 bg-slate-100 rounded-lg mt-2 animate-pulse"></div>
                ) : (
                  <h3 className="text-3xl font-bold text-text-primary mt-1">
                    {formattedValue}
                  </h3>
                )}
                <p className="text-xs text-text-secondary mt-2">{helperText}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1.5 THỐNG KÊ USERS / TOURS / BOOKINGS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users Stats */}
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600">
              <IconUsers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Người dùng
              </p>
              {summaryLoading ? (
                <div className="h-6 w-20 bg-slate-100 rounded mt-1 animate-pulse"></div>
              ) : (
                <h3 className="text-2xl font-bold text-text-primary">
                  {formatNumber(summaryData.totalUsers)}
                </h3>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-light">
            <div>
              <p className="text-xs text-text-secondary">Du khách</p>
              {summaryLoading ? (
                <div className="h-5 w-12 bg-slate-100 rounded mt-1 animate-pulse"></div>
              ) : (
                <p className="text-lg font-semibold text-text-primary">
                  {formatNumber(summaryData.totalTourists)}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-text-secondary">Hướng dẫn viên</p>
              {summaryLoading ? (
                <div className="h-5 w-12 bg-slate-100 rounded mt-1 animate-pulse"></div>
              ) : (
                <p className="text-lg font-semibold text-text-primary">
                  {formatNumber(summaryData.totalGuides)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tours Stats */}
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <IconMap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Tours
              </p>
              {summaryLoading ? (
                <div className="h-6 w-20 bg-slate-100 rounded mt-1 animate-pulse"></div>
              ) : (
                <h3 className="text-2xl font-bold text-text-primary">
                  {formatNumber(summaryData.totalTours)}
                </h3>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border-light">
            <div>
              <p className="text-xs text-text-secondary">Đang hoạt động</p>
              {summaryLoading ? (
                <div className="h-5 w-10 bg-slate-100 rounded mt-1 animate-pulse"></div>
              ) : (
                <p className="text-lg font-semibold text-green-600">
                  {formatNumber(summaryData.activeTours)}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-text-secondary">Chờ duyệt</p>
              {summaryLoading ? (
                <div className="h-5 w-10 bg-slate-100 rounded mt-1 animate-pulse"></div>
              ) : (
                <p className="text-lg font-semibold text-yellow-600">
                  {formatNumber(summaryData.pendingApprovalTours)}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-text-secondary">Đã duyệt</p>
              {summaryLoading ? (
                <div className="h-5 w-10 bg-slate-100 rounded mt-1 animate-pulse"></div>
              ) : (
                <p className="text-lg font-semibold text-blue-600">
                  {formatNumber(summaryData.approvedTours)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bookings Stats */}
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
              <IconTicket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Bookings
              </p>
              {summaryLoading ? (
                <div className="h-6 w-20 bg-slate-100 rounded mt-1 animate-pulse"></div>
              ) : (
                <h3 className="text-2xl font-bold text-text-primary">
                  {formatNumber(summaryData.totalBookings)}
                </h3>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-border-light">
            <div>
              <p className="text-xs text-text-secondary">Hôm nay</p>
              {summaryLoading ? (
                <div className="h-5 w-8 bg-slate-100 rounded mt-1 animate-pulse"></div>
              ) : (
                <p className="text-lg font-semibold text-primary">
                  {formatNumber(summaryData.todayBookings)}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-text-secondary">Đã TT</p>
              {summaryLoading ? (
                <div className="h-5 w-8 bg-slate-100 rounded mt-1 animate-pulse"></div>
              ) : (
                <p className="text-lg font-semibold text-green-600">
                  {formatNumber(summaryData.paidBookings)}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-text-secondary">Hoàn thành</p>
              {summaryLoading ? (
                <div className="h-5 w-8 bg-slate-100 rounded mt-1 animate-pulse"></div>
              ) : (
                <p className="text-lg font-semibold text-emerald-600">
                  {formatNumber(summaryData.completedBookings)}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-text-secondary">Đã hủy</p>
              {summaryLoading ? (
                <div className="h-5 w-8 bg-slate-100 rounded mt-1 animate-pulse"></div>
              ) : (
                <p className="text-lg font-semibold text-red-600">
                  {formatNumber(summaryData.canceledBookings)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-border-light shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">
              Biểu đồ doanh thu
            </h3>
            <span className="text-xs text-text-secondary font-bold">
              Top tour theo doanh thu (triệu VND)
            </span>
          </div>
          <div className="h-64 w-full relative">
            {revenueLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-2xl z-10">
                <Spinner />
              </div>
            )}
            {!revenueLoading && revenueError && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-red-500">
                {revenueError}
              </div>
            )}
            {!revenueLoading &&
              !revenueError &&
              revenueChartData.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-text-secondary">
                  Chưa có dữ liệu doanh thu.
                </div>
              )}
            {revenueChartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueChartData}
                  margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#5b3d7c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#5b3d7c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    tickFormatter={(value) => `${value.toFixed(0)}`}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#5b3d7c"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-border-light shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-text-primary mb-6">
            Trạng thái tour request
          </h3>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="w-full h-48">
              {requestsLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner />
                </div>
              )}
              {!requestsLoading && requestDistribution.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-text-secondary">
                  Chưa có dữ liệu.
                </div>
              )}
              {requestDistribution.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={requestDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {requestDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${formatNumber(value)} yêu cầu`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-2xl font-bold text-text-primary block">
                  {formatNumber(
                    totalDistribution || summaryData.pendingTourRequests || 0
                  )}
                </span>
                <span className="text-[10px] text-text-secondary uppercase tracking-wider">
                  Requests
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {requestDistribution.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-text-secondary">{item.label}</span>
                </div>
                <span className="font-bold text-text-primary">
                  {totalDistribution
                    ? `${((item.value / totalDistribution) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2.5 REVENUE TREND - Line Chart 7 ngày */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-border-light shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-text-primary">
            Xu hướng doanh thu 7 ngày gần nhất
          </h3>
          <span className="text-xs text-text-secondary font-bold">
            Triệu VND
          </span>
        </div>
        <div className="h-64 w-full relative">
          {trendLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-2xl z-10">
              <Spinner />
            </div>
          )}
          {!trendLoading && trendError && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-red-500">
              {trendError}
            </div>
          )}
          {!trendLoading && !trendError && trendChartData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-text-secondary">
              Chưa có dữ liệu.
            </div>
          )}
          {trendChartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendChartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  tickFormatter={(v) => `${v.toFixed(1)}`}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Actionable section: Latest bookings and tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Latest Bookings Table (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-border-light shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border-light flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-bold text-text-primary">
              Yêu cầu tour mới nhất
            </h3>
            <div className="flex items-center gap-3">
              {/* Filter dropdown */}
              <select
                value={requestStatusFilter}
                onChange={(e) => setRequestStatusFilter(e.target.value)}
                className="text-xs font-bold px-3 py-2 rounded-xl border border-border-light bg-white text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="rejected">Đã từ chối</option>
              </select>
              <Link
                to="/dashboard/admin/tour-requests"
                className="text-xs font-bold text-primary hover:underline"
              >
                Xem tất cả
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase">
                <tr>
                  <th className="p-4 pl-6">Mã #</th>
                  <th className="p-4">Tên tour</th>
                  <th className="p-4">Người gửi</th>
                  <th className="p-4">Giá đề xuất</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4">Gửi lúc</th>
                  <th className="p-4 pr-6">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {requestsLoading && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center">
                      <Spinner />
                    </td>
                  </tr>
                )}
                {!requestsLoading && requestsError && (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-sm text-red-500"
                    >
                      {requestsError}
                    </td>
                  </tr>
                )}
                {!requestsLoading &&
                  !requestsError &&
                  visibleRequests.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-6 text-center text-sm text-text-secondary"
                      >
                        Chưa có yêu cầu nào.
                      </td>
                    </tr>
                  )}
                {!requestsLoading &&
                  !requestsError &&
                  visibleRequests.map((req) => (
                    <tr
                      key={req._id}
                      className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                    >
                      <td className="p-4 pl-6 font-mono font-bold text-text-secondary text-xs">
                        #{String(req._id).slice(-6).toUpperCase()}
                      </td>
                      <td className="p-4 font-bold text-text-primary max-w-[200px] truncate">
                        {req.name || "(Chưa có tên)"}
                      </td>
                      <td className="p-4 text-text-secondary">
                        {req.created_by?.name || "Ẩn danh"}
                      </td>
                      <td className="p-4 font-bold text-text-primary">
                        {formatCurrency(decimalToNumber(req.price))}
                      </td>
                      <td className="p-4">{getStatusBadge(req.status)}</td>
                      <td className="p-4 text-xs text-text-secondary">
                        {formatTimeAgo(req.createdAt)}
                      </td>
                      <td className="p-4 pr-6">
                        {req.status === "pending" ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleApprove(req._id)}
                              disabled={actionLoading === req._id}
                              className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 transition-colors"
                              title="Duyệt"
                            >
                              {actionLoading === req._id ? (
                                <Spinner className="w-4 h-4" />
                              ) : (
                                <IconCheck className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleReject(req._id)}
                              disabled={actionLoading === req._id}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                              title="Từ chối"
                            >
                              <IconX className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-text-secondary">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Actions (1/3) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-border-light shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <IconAlert className="w-5 h-5 text-red-500" /> Payout chờ xử lý
          </h3>

          <div className="flex-1 space-y-3 max-h-[400px] overflow-y-auto">
            {payoutsLoading && (
              <div className="flex justify-center items-center py-8">
                <Spinner />
              </div>
            )}
            {!payoutsLoading && payoutsError && (
              <div className="text-sm text-red-500">{payoutsError}</div>
            )}
            {!payoutsLoading &&
              !payoutsError &&
              visiblePayouts.length === 0 && (
                <p className="text-sm text-text-secondary">
                  Không có payout nào đang chờ xử lý.
                </p>
              )}
            {!payoutsLoading &&
              !payoutsError &&
              visiblePayouts.map((payout) => (
                <div
                  key={payout._id}
                  className="p-4 rounded-2xl border border-border-light hover:border-primary/30 hover:shadow-md transition-all bg-bg-main/30"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                        Payout
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          payout.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : payout.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {payout.status === "pending"
                          ? "Chờ"
                          : payout.status === "paid"
                          ? "Đã TT"
                          : payout.status}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-text-secondary">
                      #{String(payout._id).slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-text-primary line-clamp-1">
                    {payout.tourId?.name || payout.tourId?.title || "Tour"}
                  </h4>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">
                        Hướng dẫn viên:
                      </span>
                      <span className="font-medium text-text-primary">
                        {payout.guideId?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Ngày tour:</span>
                      <span className="font-medium text-text-primary">
                        {formatDate(payout.tourDate)}
                      </span>
                    </div>
                    {payout.relatedBookingIds?.length > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Bookings:</span>
                        <span className="font-mono text-text-secondary">
                          {payout.relatedBookingIds.length} đơn
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Tỷ lệ HDV:</span>
                      <span className="font-medium text-text-primary">
                        {payout.percentage
                          ? `${(payout.percentage * 100).toFixed(0)}%`
                          : "10%"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">
                        Doanh thu tour:
                      </span>
                      <span className="font-medium text-text-primary">
                        {formatCurrency(decimalToNumber(payout.baseAmount))}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border-light flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(
                        decimalToNumber(payout.payoutAmount || payout.amount)
                      )}
                    </span>
                    <Link
                      to={`/dashboard/admin/finance`}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Xử lý →
                    </Link>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border-light grid grid-cols-2 gap-3">
            <Link
              to="/dashboard/admin/tour-requests"
              className="py-2.5 rounded-xl bg-primary/5 text-primary font-bold text-xs hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <IconFlag className="w-4 h-4" /> Duyệt tour
            </Link>
            <Link
              to="/dashboard/admin/finance"
              className="py-2.5 rounded-xl bg-primary/5 text-primary font-bold text-xs hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <IconWallet className="w-4 h-4" /> Payout
            </Link>
            <Link
              to="/dashboard/admin/settings"
              className="col-span-2 py-2.5 rounded-xl border border-border-light text-text-secondary font-bold text-xs hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <IconSettings className="w-4 h-4" /> Cấu hình hệ thống
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
