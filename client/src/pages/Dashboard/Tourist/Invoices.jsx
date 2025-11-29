import React, { useState } from "react";
import { IconCheck } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import {
  IconDownload,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconWallet,
} from "../../../icons/IconCommon";

// ============================================================================
// MOCK DATA
// ============================================================================
// Mock data: Payment and refund transactions
const transactions = [
  {
    id: "TRX-2025-001",
    tourName: "Bí mật Hoàng cung Huế",
    amount: -1800000, // Số âm thể hiện tiền ra
    date: "20/05/2025 10:30",
    method: "VNPay QR",
    status: "success",
    type: "payment",
  },
  {
    id: "TRX-2025-003",
    tourName: "Hoàn tiền: Sông Hương Ca Huế",
    amount: +300000, // Số dương thể hiện tiền vào (Hoàn tiền)
    date: "15/05/2025 14:20",
    method: "Về tài khoản gốc",
    status: "success",
    type: "refund",
  },
  {
    id: "TRX-2025-004",
    tourName: "Food Tour Huế",
    amount: -500000,
    date: "10/05/2025 19:00",
    method: "MoMo",
    status: "failed",
    type: "payment",
  },
];

export default function TouristInvoices() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

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
                <th className="p-4">Trạng thái</th>
                <th className="p-4 pr-6 text-right"></th>
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
                    <td className="p-4">{getStatusBadge(item.status)}</td>
                    <td className="p-4 pr-6 text-right">
                      {item.status === "success" && (
                        <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1 justify-end ml-auto">
                          <IconDownload className="w-3 h-3" /> Hóa đơn
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
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
