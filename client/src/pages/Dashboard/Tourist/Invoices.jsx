import React, { useState, useMemo } from "react";
import { useMyBookings } from "../../../features/booking/hooks";
import { toNumber } from "../../../lib/formatters";
import Spinner from "../../../components/Loaders/Spinner";
import { IconCheck } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import {
  IconDownload,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconWallet,
} from "../../../icons/IconCommon";

export default function TouristInvoices() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Fetch bookings from API
  const { bookings, isLoading } = useMyBookings();

  // Transform bookings to transactions
  const transactions = useMemo(() => {
    if (!bookings) return [];

    return bookings
      .filter(
        (b) =>
          b.status === "paid" ||         // ✅ Sửa: "paid" thay vì "confirmed"
          b.status === "completed" ||
          b.status === "canceled"
      )
      .map((b) => {
        const isCanceled = b.status === "canceled";
        const isRefund = isCanceled && b.refund_transaction_id;
        const isPaid = b.status === "paid" || b.status === "completed";

        return {
          id: b._id?.slice(-8).toUpperCase() || "N/A",
          tourName: isRefund
            ? `Hoàn tiền: ${b.tour_id?.name || "Tour"}`
            : b.tour_id?.name || "Tour",
          amount: isRefund
            ? Math.abs(toNumber(b.total_price))
            : -toNumber(b.total_price),
          date:
            new Date(b.start_date).toLocaleDateString("vi-VN") +
            " " +
            (b.start_time || ""),
          method: b.payment_session?.gateway || b.payment_method || "Chưa thanh toán",
          status: isPaid || isRefund ? "success" : "failed",  // ✅ Sửa logic xác định status
          type: isRefund ? "refund" : "payment",
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [bookings]);

  // Logic lọc
  const filteredData = transactions.filter((item) => {
    const matchType = filter === "all" || item.type === filter;
    const matchSearch =
      item.tourName.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return (
          <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase border border-green-200 flex items-center gap-1 w-fit">
            <IconCheck className="w-3 h-3" /> Thành công
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-[10px] font-bold uppercase border border-red-200 flex items-center gap-1 w-fit">
            <IconX className="w-3 h-3" /> Thất bại
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase border border-yellow-200">
            Đang xử lý
          </span>
        );
    }
  };

  const formatCurrency = (amount) => {
    // Nếu là Payment (số âm) -> Màu đỏ, dấu trừ
    // Nếu là Refund (số dương) -> Màu xanh, dấu cộng
    const isPositive = amount > 0;
    return (
      <span
        className={`font-bold ${
          isPositive ? "text-green-600" : "text-text-primary"
        }`}
      >
        {isPositive ? "+" : ""}
        {amount.toLocaleString()}đ
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary flex items-center gap-2">
            Lịch sử giao dịch
          </h1>
          <p className="text-text-secondary text-sm">
            Theo dõi các khoản thanh toán và hoàn tiền của bạn.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Tìm mã GD hoặc tên tour..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm animate-fade-in">
        {/* Filters */}
        <div className="p-4 border-b border-border-light flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "Tất cả" },
            { id: "payment", label: "Thanh toán" },
            { id: "refund", label: "Hoàn tiền" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`
                        px-4 py-2 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all 
                        ${
                          filter === tab.id
                            ? "bg-bg-main text-primary shadow-inner"
                            : "text-text-secondary hover:bg-gray-50"
                        }
                    `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
              <tr>
                <th className="p-4 pl-6">Mã GD</th>
                <th className="p-4">Nội dung</th>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Phương thức</th>
                <th className="p-4 text-right">Số tiền</th>
                <th className="p-4 pr-6">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                  >
                    <td className="p-4 pl-6 font-mono font-bold text-text-secondary text-xs">
                      {item.id}
                    </td>
                    <td className="p-4 font-medium text-text-primary">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            item.amount > 0
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.amount > 0 ? (
                            <IconArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <IconArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <span
                          className="truncate max-w-[200px]"
                          title={item.tourName}
                        >
                          {item.tourName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-text-secondary text-xs">
                      {item.date}
                    </td>
                    <td className="p-4 text-text-secondary">{item.method}</td>
                    <td className="p-4 text-right">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="p-4 pr-6">{getStatusBadge(item.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center text-text-secondary"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <IconWallet className="w-10 h-10 mb-2 opacity-20" />
                      <p>Chưa có giao dịch nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
