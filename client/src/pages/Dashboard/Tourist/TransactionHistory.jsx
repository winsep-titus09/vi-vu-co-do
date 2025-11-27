import React from "react";
import { Link } from "react-router-dom";
import { IconCheck, IconClock } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";

// Inline Icons
const IconWallet = ({ className }) => (
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
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </svg>
);
const IconArrowRight = ({ className }) => (
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
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);
const IconDownload = ({ className }) => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
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
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const IconInvoice = ({ className }) => (
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
const transactions = [
  {
    id: "TRX-8892",
    date: "20/05/2025",
    desc: "Thanh toán tour 'Bí mật Hoàng cung Huế'",
    amount: "- 1.800.000đ",
    method: "Ví MoMo",
    status: "success",
    type: "payment",
  },
  {
    id: "TRX-8801",
    date: "15/04/2025",
    desc: "Thanh toán tour 'Food Tour'",
    amount: "- 500.000đ",
    method: "Thẻ Visa •••• 4582",
    status: "success",
    type: "payment",
  },
  {
    id: "TRX-REF-09",
    date: "02/01/2025",
    desc: "Hoàn tiền tour 'Sông Hương ca Huế'",
    amount: "+ 300.000đ",
    method: "Ví MoMo",
    status: "refunded",
    type: "refund",
  },
  {
    id: "TRX-FAIL-01",
    date: "01/01/2025",
    desc: "Thanh toán thất bại",
    amount: "0đ",
    method: "Ví MoMo",
    status: "failed",
    type: "payment",
  },
];

export default function TouristTransactionHistory() {
  const getStatusBadge = (status) => {
    switch (status) {
      case "success":
        return (
          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold flex items-center gap-1 w-fit">
            <IconCheck className="w-3 h-3" /> Thành công
          </span>
        );
      case "refunded":
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center gap-1 w-fit">
            <IconArrowRight className="w-3 h-3 rotate-180" /> Hoàn tiền
          </span>
        );
      case "failed":
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold flex items-center gap-1 w-fit">
            <IconX className="w-3 h-3" /> Thất bại
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
            Lịch sử giao dịch
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Theo dõi chi tiêu và tải hóa đơn điện tử.
          </p>
        </div>
        <button className="px-4 py-2.5 bg-white border border-border-light rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-bg-main transition-colors shadow-sm">
          <IconFilter className="w-4 h-4" /> Bộ lọc
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
          <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">
            Tổng chi tiêu (2025)
          </p>
          <p className="text-2xl font-bold text-text-primary">2.300.000đ</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
          <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">
            Đã hoàn tiền
          </p>
          <p className="text-2xl font-bold text-green-600">+ 300.000đ</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
          <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">
            Phương thức chính
          </p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#A50064] rounded text-white flex items-center justify-center text-[8px] font-bold">
              Mo
            </div>
            <p className="text-lg font-bold text-text-primary">Ví MoMo</p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase border-b border-border-light">
              <tr>
                <th className="p-4 pl-6">Mã GD</th>
                <th className="p-4">Nội dung</th>
                <th className="p-4">Ngày giờ</th>
                <th className="p-4">Phương thức</th>
                <th className="p-4 text-right">Số tiền</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 pr-6 text-right">Hóa đơn</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                >
                  <td className="p-4 pl-6 font-mono text-xs font-bold text-text-secondary">
                    {tx.id}
                  </td>
                  <td
                    className="p-4 font-bold text-text-primary max-w-[200px] truncate"
                    title={tx.desc}
                  >
                    {tx.desc}
                  </td>
                  <td className="p-4 text-text-secondary">{tx.date}</td>
                  <td className="p-4 text-text-primary">{tx.method}</td>
                  <td
                    className={`p-4 text-right font-bold ${
                      tx.type === "refund"
                        ? "text-green-600"
                        : "text-text-primary"
                    }`}
                  >
                    {tx.amount}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center">
                      {getStatusBadge(tx.status)}
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    {tx.status === "success" && (
                      <button
                        className="p-2 hover:bg-bg-main rounded-lg text-primary transition-colors"
                        title="Tải hóa đơn"
                      >
                        <IconInvoice className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Mock */}
        <div className="p-4 border-t border-border-light flex justify-center">
          <button className="text-xs font-bold text-text-secondary hover:text-primary">
            Xem thêm giao dịch cũ hơn
          </button>
        </div>
      </div>
    </div>
  );
}
