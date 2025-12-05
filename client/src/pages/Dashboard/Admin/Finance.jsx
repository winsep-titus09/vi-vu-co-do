import React, { useState, useMemo } from "react";
import { useToast } from "../../../components/Toast/useToast";
import { IconCheck, IconClock } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import { IconChevronDown } from "../../../icons/IconChevronDown";
import {
  IconFilter,
  IconWallet,
  IconArrowRight,
  IconDownload,
  IconRefresh,
  IconTrendingUp,
} from "../../../icons/IconCommon";
import Spinner from "../../../components/Loaders/Spinner";
import EmptyState from "../../../components/Loaders/EmptyState";
import {
  useFinanceStats,
  useFinanceTransactions,
  useFinancePayouts,
  useConfirmPayout,
  useAdminPayoutRequests,    // THÊM
  useApprovePayoutRequest,   // THÊM
  useRejectPayoutRequest,    // THÊM
} from "../../../features/admin/hooks";
import { formatCurrency } from "../../../lib/formatters";

// --- OPTIONS ---
const DATE_OPTIONS = [
  { value: "thisMonth", label: "Tháng này" },
  { value: "lastMonth", label: "Tháng trước" },
  { value: "thisWeek", label: "Tuần này" },
  { value: "all", label: "Tất cả" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "confirmed", label: "Thành công" },
  { value: "failed", label: "Thất bại" },
  { value: "refunded", label: "Hoàn tiền" },
];

const PAYOUT_STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "paid", label: "Đã chuyển" },
];

const WITHDRAWAL_STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Đã từ chối" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Tất cả loại" },
  { value: "charge", label: "Thanh toán" },
  { value: "refund", label: "Hoàn tiền" },
  { value: "payout", label: "Payout" },
  { value: "withdraw", label: "Rút tiền" },
];

export default function AdminFinance() {
  const [activeTab, setActiveTab] = useState("transactions");
  const [search, setSearch] = useState("");
  const toast = useToast();

  // Filter states
  const [dateFilter, setDateFilter] = useState("thisMonth");
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [payoutStatusFilter, setPayoutStatusFilter] = useState("all");
  const [isPayoutStatusOpen, setIsPayoutStatusOpen] = useState(false);
  
  // THÊM: Filter cho withdrawals
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState("all");
  const [isWithdrawalStatusOpen, setIsWithdrawalStatusOpen] = useState(false);
  const [withdrawalSearch, setWithdrawalSearch] = useState("");

  // Pagination
  const [txPage, setTxPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);
  const [withdrawalPage, setWithdrawalPage] = useState(1); // THÊM
  const PAGE_SIZE = 20;

  // API Hooks - existing
  const {
    stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useFinanceStats({ period: dateFilter });

  const txParams = useMemo(
    () => ({
      page: txPage,
      limit: PAGE_SIZE,
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(typeFilter !== "all" && { type: typeFilter }),
      ...(search && { search }),
    }),
    [txPage, statusFilter, typeFilter, search]
  );

  const {
    items: transactions,
    total: txTotal,
    totalPages: txTotalPages,
    isLoading: txLoading,
    refetch: refetchTx,
  } = useFinanceTransactions(txParams);

  const payoutParams = useMemo(
    () => ({
      page: payoutPage,
      limit: PAGE_SIZE,
      ...(payoutStatusFilter !== "all" && { status: payoutStatusFilter }),
    }),
    [payoutPage, payoutStatusFilter]
  );

  const {
    items: payouts,
    total: payoutTotal,
    totalPages: payoutTotalPages,
    isLoading: payoutsLoading,
    refetch: refetchPayouts,
  } = useFinancePayouts(payoutParams);

  const { confirm: confirmPayoutApi, isLoading: confirmingPayout } =
    useConfirmPayout();

  // THÊM: Hook cho withdrawal requests
  const withdrawalParams = useMemo(
    () => ({
      page: withdrawalPage,
      limit: PAGE_SIZE,
      ...(withdrawalStatusFilter !== "all" && { status: withdrawalStatusFilter }),
      ...(withdrawalSearch && { search: withdrawalSearch }),
    }),
    [withdrawalPage, withdrawalStatusFilter, withdrawalSearch]
  );

  const {
    items: withdrawalRequests,
    total: withdrawalTotal,
    totalPages: withdrawalTotalPages,
    pendingCount: withdrawalPendingCount,
    isLoading: withdrawalsLoading,
    refetch: refetchWithdrawals,
  } = useAdminPayoutRequests(withdrawalParams);

  const { approve: approveWithdrawal, isLoading: approvingWithdrawal } = useApprovePayoutRequest();
  const { reject: rejectWithdrawal, isLoading: rejectingWithdrawal } = useRejectPayoutRequest();

  // THÊM: Modal state cho approve/reject
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [externalTxId, setExternalTxId] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // Helper Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
      case "success":
        return (
          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1 w-fit">
            <IconCheck className="w-3 h-3" /> Thành công
          </span>
        );
      case "failed":
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 w-fit">
            <IconX className="w-3 h-3" /> Thất bại
          </span>
        );
      case "refunded":
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1 w-fit">
            <IconArrowRight className="w-3 h-3 rotate-180" /> Hoàn tiền
          </span>
        );
      case "paid":
        return (
          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
            Đã chuyển
          </span>
        );
      case "pending":
        return (
          <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
            Chờ duyệt
          </span>
        );
      case "processing":
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1">
            <IconRefresh className="w-3 h-3 animate-spin" /> Đang xử lý
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
            {status || "N/A"}
          </span>
        );
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "charge":
        return (
          <span className="px-2 py-1 rounded bg-green-50 text-green-600 text-xs font-bold border border-green-100">
            Thanh toán
          </span>
        );
      case "refund":
        return (
          <span className="px-2 py-1 rounded bg-purple-50 text-purple-600 text-xs font-bold border border-purple-100">
            Hoàn tiền
          </span>
        );
      case "payout":
        return (
          <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100">
            Payout
          </span>
        );
      case "withdraw":
        return (
          <span className="px-2 py-1 rounded bg-orange-50 text-orange-600 text-xs font-bold border border-orange-100">
            Rút tiền
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded bg-gray-50 text-gray-600 text-xs font-bold border border-gray-100">
            {type || "N/A"}
          </span>
        );
    }
  };

  const handlePayout = async (payout) => {
    if (
      window.confirm(
        `Xác nhận đã chuyển khoản ${formatCurrency(payout.netAmount)} cho HDV ${
          payout.guide
        }?`
      )
    ) {
      try {
        await confirmPayoutApi(payout._id, {});
        toast.success("Thành công!", "Đã xác nhận chuyển khoản.");
        refetchPayouts();
        refetchStats();
      } catch (err) {
        toast.error("Lỗi!", err?.message || "Không thể xác nhận thanh toán.");
      }
    }
  };

  // THÊM: Handle approve withdrawal
  const handleApproveWithdrawal = async () => {
    if (!selectedWithdrawal) return;
    try {
      await approveWithdrawal(selectedWithdrawal._id, { externalTxId, note: "" });
      toast.success("Thành công!", "Đã duyệt yêu cầu rút tiền.");
      setShowApproveModal(false);
      setSelectedWithdrawal(null);
      setExternalTxId("");
      refetchWithdrawals();
      refetchStats();
    } catch (err) {
      toast.error("Lỗi!", err?.message || "Không thể duyệt yêu cầu.");
    }
  };

  // THÊM: Handle reject withdrawal
  const handleRejectWithdrawal = async () => {
    if (!selectedWithdrawal) return;
    if (!rejectReason.trim()) {
      toast.warning("Thiếu thông tin", "Vui lòng nhập lý do từ chối.");
      return;
    }
    try {
      await rejectWithdrawal(selectedWithdrawal._id, { reason: rejectReason });
      toast.success("Thành công!", "Đã từ chối yêu cầu rút tiền.");
      setShowRejectModal(false);
      setSelectedWithdrawal(null);
      setRejectReason("");
      refetchWithdrawals();
    } catch (err) {
      toast.error("Lỗi!", err?.message || "Không thể từ chối yêu cầu.");
    }
  };

  const handleRefresh = () => {
    refetchStats();
    if (activeTab === "transactions") {
      refetchTx();
    } else if (activeTab === "payouts") {
      refetchPayouts();
    } else if (activeTab === "withdrawals") {
      refetchWithdrawals();
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const dateLabel =
    DATE_OPTIONS.find((o) => o.value === dateFilter)?.label || "Tháng này";

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Quản lý Tài chính
          </h1>
          <p className="text-text-secondary text-sm">
            Theo dõi dòng tiền và thực hiện đối soát.
          </p>
        </div>
        <div className="flex gap-2 relative z-20">
          {/* Date dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDateOpen(!isDateOpen)}
              className={`px-4 py-2.5 bg-white border rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                isDateOpen
                  ? "border-primary ring-1 ring-primary shadow-md"
                  : "border-border-light hover:bg-bg-main shadow-sm"
              }`}
            >
              {dateLabel}
              <IconChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDateOpen ? "rotate-180 text-primary" : "text-text-secondary"
                }`}
              />
            </button>
            {isDateOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDateOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-border-light z-20 py-1 animate-fade-in-up overflow-hidden">
                  {DATE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setDateFilter(opt.value);
                        setIsDateOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 flex justify-between items-center ${
                        dateFilter === opt.value
                          ? "text-primary bg-primary/5"
                          : "text-text-primary"
                      }`}
                    >
                      {opt.label}
                      {dateFilter === opt.value && (
                        <IconCheck className="w-3.5 h-3.5" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-white border border-border-light rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-bg-main shadow-sm transition-colors"
          >
            <IconRefresh className="w-4 h-4" /> Làm mới
          </button>

          <button className="px-4 py-2 bg-white border border-border-light rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-bg-main shadow-sm transition-colors">
            <IconDownload className="w-4 h-4" /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary uppercase font-bold">
              Tổng doanh thu ({dateLabel})
            </p>
            {statsLoading ? (
              <div className="h-8 mt-1">
                <Spinner className="w-5 h-5" />
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-text-primary mt-1">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </h3>
                <span
                  className={`text-xs flex items-center gap-1 mt-1 font-bold ${
                    (stats?.revenueChange || 0) >= 0
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  <IconTrendingUp
                    className={`w-3 h-3 ${
                      (stats?.revenueChange || 0) < 0 ? "rotate-180" : ""
                    }`}
                  />
                  {stats?.revenueChange >= 0 ? "+" : ""}
                  {stats?.revenueChange || 0}% so với trước
                </span>
              </>
            )}
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
            <IconWallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary uppercase font-bold">
              Cần thanh toán HDV
            </p>
            {statsLoading ? (
              <div className="h-8 mt-1">
                <Spinner className="w-5 h-5" />
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-text-primary mt-1">
                  {formatCurrency(stats?.pendingPayoutAmount || 0)}
                </h3>
                <span className="text-xs text-orange-500 font-bold mt-1">
                  {stats?.pendingPayoutCount || 0} yêu cầu đang chờ
                </span>
              </>
            )}
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
            <IconClock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary uppercase font-bold">
              Lợi nhuận ròng (Est.)
            </p>
            {statsLoading ? (
              <div className="h-8 mt-1">
                <Spinner className="w-5 h-5" />
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-primary mt-1">
                  {formatCurrency(stats?.platformCommission || 0)}
                </h3>
                <span className="text-xs text-text-secondary mt-1">
                  15% phí hoa hồng
                </span>
              </>
            )}
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <IconTrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-border-light inline-flex shadow-sm">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "transactions"
              ? "bg-primary text-white shadow-md"
              : "text-text-secondary hover:bg-bg-main"
          }`}
        >
          <IconWallet className="w-4 h-4" /> Giao dịch
        </button>
        <button
          onClick={() => setActiveTab("payouts")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "payouts"
              ? "bg-primary text-white shadow-md"
              : "text-text-secondary hover:bg-bg-main"
          }`}
        >
          <IconCheck className="w-4 h-4" /> Thanh toán HDV
        </button>
        <button
          onClick={() => setActiveTab("withdrawals")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 relative ${
            activeTab === "withdrawals"
              ? "bg-primary text-white shadow-md"
              : "text-text-secondary hover:bg-bg-main"
          }`}
        >
          <IconArrowRight className="w-4 h-4 rotate-180" /> Yêu cầu rút tiền
          {withdrawalPendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {withdrawalPendingCount}
            </span>
          )}
        </button>
      </div>

      {/* --- TAB 1: TRANSACTIONS --- */}
      {activeTab === "transactions" && (
        <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
          {/* Toolbar */}
          <div className="p-4 border-b border-border-light flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm mã GD, tên khách..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm transition-all"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setTxPage(1);
                }}
              />
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            </div>

            {/* Status filter */}
            <div className="relative">
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className={`px-4 py-2.5 border rounded-xl bg-white text-sm font-bold flex items-center gap-2 transition-all min-w-[160px] justify-between ${
                  isStatusOpen
                    ? "border-primary ring-1 ring-primary"
                    : "border-border-light hover:border-primary/50 text-text-secondary"
                }`}
              >
                <span className="flex items-center gap-2">
                  <IconFilter className="w-4 h-4" />
                  {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
                </span>
                <IconChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isStatusOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isStatusOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsStatusOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-border-light z-20 py-1 animate-fade-in-up overflow-hidden">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setStatusFilter(opt.value);
                          setIsStatusOpen(false);
                          setTxPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 flex justify-between items-center ${
                          statusFilter === opt.value
                            ? "text-primary bg-primary/5"
                            : "text-text-primary"
                        }`}
                      >
                        {opt.label}
                        {statusFilter === opt.value && (
                          <IconCheck className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Type filter */}
            <div className="relative">
              <button
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                className={`px-4 py-2.5 border rounded-xl bg-white text-sm font-bold flex items-center gap-2 transition-all min-w-[140px] justify-between ${
                  isTypeOpen
                    ? "border-primary ring-1 ring-primary"
                    : "border-border-light hover:border-primary/50 text-text-secondary"
                }`}
              >
                <span>
                  {TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label}
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
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-border-light z-20 py-1 animate-fade-in-up overflow-hidden">
                    {TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setTypeFilter(opt.value);
                          setIsTypeOpen(false);
                          setTxPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 flex justify-between items-center ${
                          typeFilter === opt.value
                            ? "text-primary bg-primary/5"
                            : "text-text-primary"
                        }`}
                      >
                        {opt.label}
                        {typeFilter === opt.value && (
                          <IconCheck className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {txLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="w-8 h-8" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
                    <tr>
                      <th className="p-4 pl-6">Mã GD</th>
                      <th className="p-4">Khách hàng</th>
                      <th className="p-4">Tour</th>
                      <th className="p-4">Loại</th>
                      <th className="p-4">Phương thức</th>
                      <th className="p-4 text-right">Số tiền</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 pr-6 text-right">Ngày giờ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.map((tx) => (
                        <tr
                          key={tx._id}
                          className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                        >
                          <td className="p-4 pl-6 font-mono font-bold text-text-secondary">
                            {tx.id}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-text-primary">
                              {tx.user}
                            </div>
                            {tx.userEmail && (
                              <div className="text-xs text-text-secondary">
                                {tx.userEmail}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-text-secondary max-w-[200px] truncate">
                            {tx.tour}
                          </td>
                          <td className="p-4">{getTypeBadge(tx.type)}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold border border-gray-200 uppercase">
                              {tx.method}
                            </span>
                          </td>
                          <td
                            className={`p-4 text-right font-bold ${
                              tx.type === "refund" ||
                              tx.type === "payout" ||
                              tx.type === "withdraw"
                                ? "text-red-500"
                                : "text-green-600"
                            }`}
                          >
                            {tx.type === "refund" ||
                            tx.type === "payout" ||
                            tx.type === "withdraw"
                              ? "-"
                              : "+"}
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="p-4">{getStatusBadge(tx.status)}</td>
                          <td className="p-4 pr-6 text-right text-text-secondary text-xs">
                            {formatDate(tx.date)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="p-8 text-center text-text-secondary"
                        >
                          Không tìm thấy giao dịch nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-border-light flex items-center justify-between">
                <span className="text-xs text-text-secondary">
                  Hiển thị {transactions.length} / {txTotal} kết quả
                </span>
                {txTotalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                      disabled={txPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-border-light text-sm font-bold disabled:opacity-50 hover:bg-bg-main"
                    >
                      Trước
                    </button>
                    <span className="text-sm text-text-secondary">
                      {txPage} / {txTotalPages}
                    </span>
                    <button
                      onClick={() =>
                        setTxPage((p) => Math.min(txTotalPages, p + 1))
                      }
                      disabled={txPage === txTotalPages}
                      className="px-3 py-1.5 rounded-lg border border-border-light text-sm font-bold disabled:opacity-50 hover:bg-bg-main"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* --- TAB 2: PAYOUTS --- */}
      {activeTab === "payouts" && (
        <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
          {/* Filter toolbar */}
          <div className="p-4 border-b border-border-light flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsPayoutStatusOpen(!isPayoutStatusOpen)}
                className={`px-4 py-2.5 border rounded-xl bg-white text-sm font-bold flex items-center gap-2 transition-all min-w-[140px] justify-between ${
                  isPayoutStatusOpen
                    ? "border-primary ring-1 ring-primary"
                    : "border-border-light hover:border-primary/50 text-text-secondary"
                }`}
              >
                <span className="flex items-center gap-2">
                  <IconFilter className="w-4 h-4" />
                  {
                    PAYOUT_STATUS_OPTIONS.find(
                      (o) => o.value === payoutStatusFilter
                    )?.label
                  }
                </span>
                <IconChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isPayoutStatusOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isPayoutStatusOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsPayoutStatusOpen(false)}
                  ></div>
                  <div className="absolute left-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-border-light z-20 py-1 animate-fade-in-up overflow-hidden">
                    {PAYOUT_STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setPayoutStatusFilter(opt.value);
                          setIsPayoutStatusOpen(false);
                          setPayoutPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 flex justify-between items-center ${
                          payoutStatusFilter === opt.value
                            ? "text-primary bg-primary/5"
                            : "text-text-primary"
                        }`}
                      >
                        {opt.label}
                        {payoutStatusFilter === opt.value && (
                          <IconCheck className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {payoutsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="w-8 h-8" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
                    <tr>
                      <th className="p-4 pl-6">Mã Phiếu</th>
                      <th className="p-4">Hướng dẫn viên</th>
                      <th className="p-4">Tài khoản nhận</th>
                      <th className="p-4 text-right">Doanh thu</th>
                      <th className="p-4 text-right text-red-500">Phí sàn</th>
                      <th className="p-4 text-right text-green-600">
                        Thực trả
                      </th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 pr-6 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.length > 0 ? (
                      payouts.map((po) => (
                        <tr
                          key={po._id}
                          className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                        >
                          <td className="p-4 pl-6 font-mono font-bold text-text-secondary">
                            {po.id}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-primary">
                              {po.guide}
                            </div>
                            {po.guideEmail && (
                              <div className="text-xs text-text-secondary">
                                {po.guideEmail}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-xs text-text-secondary bg-gray-50 rounded px-2 py-1">
                              {po.bank}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {formatCurrency(po.totalSales)}
                          </td>
                          <td className="p-4 text-right text-red-500 text-xs">
                            {formatCurrency(po.commission)} ({po.commissionRate}
                            )
                          </td>
                          <td className="p-4 text-right font-bold text-lg text-green-600">
                            {formatCurrency(po.netAmount)}
                          </td>
                          <td className="p-4">{getStatusBadge(po.status)}</td>
                          <td className="p-4 pr-6 text-right">
                            {po.status === "pending" && (
                              <button
                                onClick={() => handlePayout(po)}
                                disabled={confirmingPayout}
                                className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                              >
                                {confirmingPayout ? (
                                  <IconRefresh className="w-3 h-3 animate-spin" />
                                ) : (
                                  "Xác nhận chuyển"
                                )}
                              </button>
                            )}
                            {po.status === "processing" && (
                              <button className="px-4 py-2 rounded-lg border border-border-light text-text-secondary text-xs font-bold bg-gray-50 cursor-not-allowed flex items-center gap-1 mx-auto">
                                <IconRefresh className="w-3 h-3 animate-spin" />{" "}
                                Đang xử lý
                              </button>
                            )}
                            {po.status === "paid" && (
                              <div className="text-xs text-text-secondary">
                                {po.paidAt && formatDate(po.paidAt)}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="p-8 text-center text-text-secondary"
                        >
                          Không có yêu cầu thanh toán nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-border-light flex items-center justify-between">
                <span className="text-xs text-text-secondary">
                  Hiển thị {payouts.length} / {payoutTotal} kết quả
                </span>
                {payoutTotalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPayoutPage((p) => Math.max(1, p - 1))}
                      disabled={payoutPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-border-light text-sm font-bold disabled:opacity-50 hover:bg-bg-main"
                    >
                      Trước
                    </button>
                    <span className="text-sm text-text-secondary">
                      {payoutPage} / {payoutTotalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPayoutPage((p) => Math.min(payoutTotalPages, p + 1))
                      }
                      disabled={payoutPage === payoutTotalPages}
                      className="px-3 py-1.5 rounded-lg border border-border-light text-sm font-bold disabled:opacity-50 hover:bg-bg-main"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* --- TAB 3: WITHDRAWALS (MỚI) --- */}
      {activeTab === "withdrawals" && (
        <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
          {/* Toolbar */}
          <div className="p-4 border-b border-border-light flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm theo tên HDV, email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm transition-all"
                value={withdrawalSearch}
                onChange={(e) => {
                  setWithdrawalSearch(e.target.value);
                  setWithdrawalPage(1);
                }}
              />
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            </div>

            {/* Status filter */}
            <div className="relative">
              <button
                onClick={() => setIsWithdrawalStatusOpen(!isWithdrawalStatusOpen)}
                className={`px-4 py-2.5 border rounded-xl bg-white text-sm font-bold flex items-center gap-2 transition-all min-w-[160px] justify-between ${
                  isWithdrawalStatusOpen
                    ? "border-primary ring-1 ring-primary"
                    : "border-border-light hover:border-primary/50 text-text-secondary"
                }`}
              >
                <span className="flex items-center gap-2">
                  <IconFilter className="w-4 h-4" />
                  {WITHDRAWAL_STATUS_OPTIONS.find((o) => o.value === withdrawalStatusFilter)?.label}
                </span>
                <IconChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isWithdrawalStatusOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isWithdrawalStatusOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsWithdrawalStatusOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-border-light z-20 py-1 animate-fade-in-up overflow-hidden">
                    {WITHDRAWAL_STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setWithdrawalStatusFilter(opt.value);
                          setIsWithdrawalStatusOpen(false);
                          setWithdrawalPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 flex justify-between items-center ${
                          withdrawalStatusFilter === opt.value
                            ? "text-primary bg-primary/5"
                            : "text-text-primary"
                        }`}
                      >
                        {opt.label}
                        {withdrawalStatusFilter === opt.value && (
                          <IconCheck className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Table */}
          {withdrawalsLoading ? (
            <div className="p-10 flex justify-center">
              <Spinner className="w-8 h-8" />
            </div>
          ) : withdrawalRequests.length === 0 ? (
            <div className="p-10">
              <EmptyState
                title="Chưa có yêu cầu rút tiền"
                message="Các yêu cầu rút tiền từ HDV sẽ hiển thị ở đây."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg-main/50 text-left">
                    <th className="px-4 py-3 font-bold text-text-secondary">Hướng dẫn viên</th>
                    <th className="px-4 py-3 font-bold text-text-secondary">Số tiền</th>
                    <th className="px-4 py-3 font-bold text-text-secondary">Ngày yêu cầu</th>
                    <th className="px-4 py-3 font-bold text-text-secondary">Trạng thái</th>
                    <th className="px-4 py-3 font-bold text-text-secondary">Ghi chú</th>
                    <th className="px-4 py-3 font-bold text-text-secondary text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {withdrawalRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-bg-main/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={req.guide?.avatar || "/images/default-avatar.png"}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-border-light"
                          />
                          <div>
                            <p className="font-bold text-text-primary">{req.guide?.name || "N/A"}</p>
                            <p className="text-xs text-text-secondary">{req.guide?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-primary">
                          {formatCurrency(req.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-text-secondary">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        {getWithdrawalStatusBadge(req.status)}
                      </td>
                      <td className="px-4 py-4 text-text-secondary max-w-[200px] truncate">
                        {req.adminNote || "-"}
                      </td>
                      <td className="px-4 py-4">
                        {req.status === "pending" ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedWithdrawal(req);
                                setShowApproveModal(true);
                              }}
                              disabled={approvingWithdrawal}
                              className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() => {
                                setSelectedWithdrawal(req);
                                setShowRejectModal(true);
                              }}
                              disabled={rejectingWithdrawal}
                              className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-text-secondary text-center block">
                            {req.processedAt ? formatDate(req.processedAt) : "-"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {withdrawalTotalPages > 1 && (
            <div className="p-4 border-t border-border-light flex justify-between items-center">
              <span className="text-sm text-text-secondary">
                Hiển thị {withdrawalRequests.length} / {withdrawalTotal} yêu cầu
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setWithdrawalPage((p) => Math.max(1, p - 1))}
                  disabled={withdrawalPage <= 1}
                  className="px-3 py-1.5 border border-border-light rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-bg-main transition-colors"
                >
                  Trước
                </button>
                <span className="px-3 py-1.5 text-sm">
                  {withdrawalPage} / {withdrawalTotalPages}
                </span>
                <button
                  onClick={() => setWithdrawalPage((p) => Math.min(withdrawalTotalPages, p + 1))}
                  disabled={withdrawalPage >= withdrawalTotalPages}
                  className="px-3 py-1.5 border border-border-light rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-bg-main transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Approve Withdrawal */}
      {showApproveModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              Xác nhận duyệt yêu cầu rút tiền
            </h3>
            <div className="space-y-3 mb-4">
              <p className="text-sm text-text-secondary">
                HDV: <strong>{selectedWithdrawal.guide?.name}</strong>
              </p>
              <p className="text-sm text-text-secondary">
                Số tiền: <strong className="text-primary">{formatCurrency(selectedWithdrawal.amount)}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Mã giao dịch ngân hàng (tùy chọn)
                </label>
                <input
                  type="text"
                  value={externalTxId}
                  onChange={(e) => setExternalTxId(e.target.value)}
                  placeholder="VD: VCB123456789"
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl text-sm focus:border-primary outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedWithdrawal(null);
                  setExternalTxId("");
                }}
                className="flex-1 px-4 py-2.5 border border-border-light rounded-xl font-bold text-sm hover:bg-bg-main transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleApproveWithdrawal}
                disabled={approvingWithdrawal}
                className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {approvingWithdrawal ? "Đang xử lý..." : "Xác nhận duyệt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject Withdrawal */}
      {showRejectModal && selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              Từ chối yêu cầu rút tiền
            </h3>
            <div className="space-y-3 mb-4">
              <p className="text-sm text-text-secondary">
                HDV: <strong>{selectedWithdrawal.guide?.name}</strong>
              </p>
              <p className="text-sm text-text-secondary">
                Số tiền: <strong className="text-primary">{formatCurrency(selectedWithdrawal.amount)}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-border-light rounded-xl text-sm focus:border-primary outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedWithdrawal(null);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2.5 border border-border-light rounded-xl font-bold text-sm hover:bg-bg-main transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectWithdrawal}
                disabled={rejectingWithdrawal}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {rejectingWithdrawal ? "Đang xử lý..." : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const getWithdrawalStatusBadge = (status) => {
  switch (status) {
    case 'pending':
      return <span className="badge bg-warning">Đang chờ</span>;
    case 'approved':
      return <span className="badge bg-success">Đã duyệt</span>;
    case 'rejected':
      return <span className="badge bg-danger">Từ chối</span>;
    default:
      return <span className="badge bg-secondary">{status}</span>;
  }
};
