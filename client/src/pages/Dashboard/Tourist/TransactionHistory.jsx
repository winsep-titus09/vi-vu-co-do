import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useMyBookings } from "../../../features/booking/hooks";
import Spinner from "../../../components/Loaders/Spinner";
import { IconCheck, IconClock } from "../../../icons/IconBox";
import { IconSearch } from "../../../icons/IconSearch";
import { IconX } from "../../../icons/IconX";
import {
  IconWallet,
  IconArrowRight,
  IconDownload,
  IconFilter,
  IconFileText,
} from "../../../icons/IconCommon";

const IconInvoice = IconFileText;

export default function TouristTransactionHistory() {
  // Fetch bookings from API
  const { bookings, isLoading } = useMyBookings();

  // Transform bookings to transactions
  const transactions = useMemo(() => {
    if (!bookings) return [];

    // Map booking status to transaction-friendly status
    const getTransactionStatus = (booking) => {
      const status = booking.status;
      const guideStatus = booking.guide_decision?.status;

      // Check cancelled/rejected first
      if (
        status === "canceled" ||
        status === "cancelled" ||
        guideStatus === "rejected"
      )
        return "cancelled";

      // Check confirmed states
      if (
        status === "paid" ||
        status === "completed" ||
        status === "awaiting_payment" ||
        guideStatus === "accepted"
      )
        return "confirmed";

      return status;
    };

    return bookings
      .filter((b) => {
        const mappedStatus = getTransactionStatus(b);
        return mappedStatus === "confirmed" || mappedStatus === "cancelled";
      })
      .map((b) => {
        const mappedStatus = getTransactionStatus(b);
        const isCancelled = mappedStatus === "cancelled";
        return {
          id: b._id?.slice(-8).toUpperCase() || "N/A",
          date: new Date(b.booking_date || b.createdAt).toLocaleDateString(
            "vi-VN"
          ),
          desc: `Thanh toán tour '${
            b.tour_id?.name || b.tourId?.title || "Tour"
          }'`,
          amount: isCancelled
            ? "+ " + (b.total_price || 0).toLocaleString() + "đ"
            : "- " + (b.total_price || 0).toLocaleString() + "đ",
          method:
            b.payment_session?.gateway || b.payment_method || "Chưa thanh toán",
          status: isCancelled
            ? "refunded"
            : b.status === "paid" || b.payment_status === "paid"
            ? "success"
            : "pending",
          type: isCancelled ? "refund" : "payment",
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [bookings]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSpent = transactions
      .filter((t) => t.type === "payment" && t.status === "success")
      .reduce((sum, t) => {
        const amount = parseInt(t.amount.replace(/[^\d]/g, ""));
        return sum + amount;
      }, 0);

    const totalRefunded = transactions
      .filter((t) => t.type === "refund")
      .reduce((sum, t) => {
        const amount = parseInt(t.amount.replace(/[^\d]/g, ""));
        return sum + amount;
      }, 0);

    return {
      totalSpent: totalSpent.toLocaleString() + "đ",
      totalRefunded: totalRefunded.toLocaleString() + "đ",
      totalTransactions: transactions.length,
    };
  }, [transactions]);
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
          <p className="text-2xl font-bold text-text-primary">
            {stats.totalSpent}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
          <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">
            Đã hoàn tiền
          </p>
          <p className="text-2xl font-bold text-green-600">
            + {stats.totalRefunded}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
          <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-2">
            Tổng giao dịch
          </p>
          <p className="text-2xl font-bold text-text-primary">
            {stats.totalTransactions}
          </p>
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
