import React, { useState } from "react";
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

// ============================================================================
// MOCK DATA
// ============================================================================
const transactionsIn = [
  {
    id: "TRX-1001",
    user: "Nguyễn Văn A",
    tour: "Bí mật Hoàng cung",
    amount: "+1.800.000đ",
    method: "VNPay",
    status: "success",
    date: "20/05/2025 10:30",
  },
  {
    id: "TRX-1002",
    user: "Sarah J.",
    tour: "Food Tour",
    amount: "+500.000đ",
    method: "MoMo",
    status: "success",
    date: "20/05/2025 11:15",
  },
  {
    id: "TRX-1003",
    user: "Trần B",
    tour: "Lăng Tự Đức",
    amount: "+1.200.000đ",
    method: "Visa",
    status: "failed",
    date: "19/05/2025 14:20",
  },
  {
    id: "TRX-1004",
    user: "Lê C",
    tour: "Sông Hương",
    amount: "-300.000đ",
    method: "Hoàn tiền ví",
    status: "refunded",
    date: "18/05/2025 09:00",
  },
];

const payouts = [
  {
    id: "PO-5501",
    guide: "Minh Hương",
    totalSales: "18.000.000đ",
    commission: "1.800.000đ (10%)",
    netAmount: "16.200.000đ",
    status: "pending",
    bank: "VCB **** 8899",
  },
  {
    id: "PO-5502",
    guide: "Trần Văn",
    totalSales: "5.000.000đ",
    commission: "500.000đ (10%)",
    netAmount: "4.500.000đ",
    status: "processing",
    bank: "MoMo 0905...",
  },
  {
    id: "PO-5499",
    guide: "Alex Nguyen",
    totalSales: "12.000.000đ",
    commission: "1.200.000đ (10%)",
    netAmount: "10.800.000đ",
    status: "paid",
    bank: "Techcom **** 1234",
  },
];

// --- OPTIONS ---
const DATE_OPTIONS = ["Tháng này", "Tháng trước", "Tuần này", "Tất cả"];
const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "success", label: "Thành công" },
  { value: "failed", label: "Thất bại" },
  { value: "refunded", label: "Hoàn tiền" },
];

export default function AdminFinance() {
  const [activeTab, setActiveTab] = useState("transactions");
  const [search, setSearch] = useState("");

  // Dropdown states
  const [dateFilter, setDateFilter] = useState("Á ống này");
  const [isDateOpen, setIsDateOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all"); // Filter cho Transactions
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Filter Logic (Transactions)
  const filteredTransactions = transactionsIn.filter((tx) => {
    const matchSearch =
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.user.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || tx.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Helper Badge
  const getStatusBadge = (status) => {
    switch (status) {
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
        return null;
    }
  };

  const handlePayout = (id) => {
    if (window.confirm(`Xác nhận đã chuyển khoản cho yêu cầu #${id}?`)) {
      alert("Đã cập nhật trạng thái thành công!");
    }
  };

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
              {dateFilter}
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
                      key={opt}
                      onClick={() => {
                        setDateFilter(opt);
                        setIsDateOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 flex justify-between items-center ${
                        dateFilter === opt
                          ? "text-primary bg-primary/5"
                          : "text-text-primary"
                      }`}
                    >
                      {opt}
                      {dateFilter === opt && (
                        <IconCheck className="w-3.5 h-3.5" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

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
              Tổng doanh thu ({dateFilter})
            </p>
            <h3 className="text-2xl font-bold text-text-primary mt-1">
              45.500.000đ
            </h3>
            <span className="text-xs text-green-600 flex items-center gap-1 mt-1 font-bold">
              <IconTrendingUp className="w-3 h-3" /> +12% so với trước
            </span>
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
            <h3 className="text-2xl font-bold text-text-primary mt-1">
              16.200.000đ
            </h3>
            <span className="text-xs text-orange-500 font-bold mt-1">
              3 yêu cầu đang chờ
            </span>
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
            <h3 className="text-2xl font-bold text-primary mt-1">4.550.000đ</h3>
            <span className="text-xs text-text-secondary mt-1">
              10% phí hoa hồng
            </span>
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
          <IconWallet className="w-4 h-4" /> Lịch sử giao dịch
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
      </div>

      {/* --- TAB 1: TRANSACTIONS (Cash In) --- */}
      {activeTab === "transactions" && (
        <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
          {/* Toolbar with Search & Dropdown Filter */}
          <div className="p-4 border-b border-border-light flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm mã GD, tên khách..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            </div>

            {/* Status filter dropdown */}
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
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
                <tr>
                  <th className="p-4 pl-6">Mã GD</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Tour / Nội dung</th>
                  <th className="p-4">Phương thức</th>
                  <th className="p-4 text-right">Số tiền</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 pr-6 text-right">Ngày giờ</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                    >
                      <td className="p-4 pl-6 font-mono font-bold text-text-secondary">
                        {tx.id}
                      </td>
                      <td className="p-4 font-bold text-text-primary">
                        {tx.user}
                      </td>
                      <td className="p-4 text-text-secondary">{tx.tour}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold border border-gray-200">
                          {tx.method}
                        </span>
                      </td>
                      <td
                        className={`p-4 text-right font-bold ${
                          tx.status === "refunded"
                            ? "text-red-500"
                            : "text-green-600"
                        }`}
                      >
                        {tx.amount}
                      </td>
                      <td className="p-4">{getStatusBadge(tx.status)}</td>
                      <td className="p-4 pr-6 text-right text-text-secondary text-xs">
                        {tx.date}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-8 text-center text-text-secondary"
                    >
                      Không tìm thấy giao dịch nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border-light flex justify-center">
            <span className="text-xs text-text-secondary">
              Hiển thị {filteredTransactions.length} kết quả
            </span>
          </div>
        </div>
      )}

      {/* --- TAB 2: PAYOUTS (Cash Out) --- */}
      {activeTab === "payouts" && (
        <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
                <tr>
                  <th className="p-4 pl-6">Mã Phiếu</th>
                  <th className="p-4">Hướng dẫn viên</th>
                  <th className="p-4">Tài khoản nhận</th>
                  <th className="p-4 text-right">Doanh thu</th>
                  <th className="p-4 text-right text-red-500">Phí sàn</th>
                  <th className="p-4 text-right text-green-600">Thực trả</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 pr-6 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((po) => (
                  <tr
                    key={po.id}
                    className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                  >
                    <td className="p-4 pl-6 font-mono font-bold text-text-secondary">
                      {po.id}
                    </td>
                    <td className="p-4 font-bold text-primary">{po.guide}</td>
                    <td className="p-4 font-mono text-xs text-text-secondary bg-gray-50 rounded px-2 py-1 w-fit">
                      {po.bank}
                    </td>
                    <td className="p-4 text-right">{po.totalSales}</td>
                    <td className="p-4 text-right text-red-500 text-xs">
                      {po.commission}
                    </td>
                    <td className="p-4 text-right font-bold text-lg text-green-600">
                      {po.netAmount}
                    </td>
                    <td className="p-4">{getStatusBadge(po.status)}</td>
                    <td className="p-4 pr-6 text-right">
                      {po.status === "pending" && (
                        <button
                          onClick={() => handlePayout(po.id)}
                          className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                          Xác nhận chuyển
                        </button>
                      )}
                      {po.status === "processing" && (
                        <button className="px-4 py-2 rounded-lg border border-border-light text-text-secondary text-xs font-bold bg-gray-50 cursor-not-allowed flex items-center gap-1 mx-auto">
                          <IconRefresh className="w-3 h-3 animate-spin" /> Đang
                          API...
                        </button>
                      )}
                      {po.status === "paid" && (
                        <button className="text-primary font-bold text-xs hover:underline">
                          Xem biên lai
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
