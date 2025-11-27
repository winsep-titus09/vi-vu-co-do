import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { IconCheck, IconClock } from "../../../icons/IconBox";

// Inline Icons
const IconArrowUpRight = ({ className }) => (
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
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

const IconBank = ({ className }) => (
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
    <path d="M3 21h18" />
    <path d="M5 21v-7" />
    <path d="M19 21v-7" />
    <path d="M10 9 3 21" />
    <path d="M14 9l7 12" />
    <rect x="3" y="4" width="18" height="5" rx="1" />
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

// --- MOCK DATA ---
const transactions = [
  {
    id: "TRX-001",
    date: "20/05/2025",
    tour: "Bí mật Hoàng cung Huế",
    total: "1.800.000đ",
    fee: "-180.000đ",
    net: "+ 1.620.000đ",
    status: "paid",
  },
  {
    id: "TRX-002",
    date: "18/05/2025",
    tour: "Food Tour đêm",
    total: "500.000đ",
    fee: "-50.000đ",
    net: "+ 450.000đ",
    status: "paid",
  },
  {
    id: "TRX-003",
    date: "15/05/2025",
    tour: "Rút tiền về VCB",
    total: "-",
    fee: "-",
    net: "- 5.000.000đ",
    status: "withdraw",
  },
  {
    id: "TRX-004",
    date: "12/05/2025",
    tour: "Thiền trà Từ Hiếu",
    total: "600.000đ",
    fee: "-60.000đ",
    net: "+ 540.000đ",
    status: "pending",
  },
];

// [UPDATED] Dữ liệu chuẩn cho Recharts (Đơn vị: Triệu đồng)
const chartData = [
  { name: "Th12", value: 4.5 },
  { name: "Th1", value: 6.0 },
  { name: "Th2", value: 3.5 },
  { name: "Th3", value: 8.0 },
  { name: "Th4", value: 7.0 },
  { name: "Th5", value: 8.5 }, // Tháng hiện tại
];

// Custom Tooltip cho biểu đồ
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-border-light rounded-xl shadow-lg text-xs">
        <p className="font-bold text-text-primary mb-1">{`Tháng ${label}`}</p>
        <p className="text-primary font-medium">{`Thu nhập: ${payload[0].value}M`}</p>
      </div>
    );
  }
  return null;
};

export default function GuideEarnings() {
  return (
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Thu nhập & Tài chính
          </h1>
          <p className="text-text-secondary text-sm">
            Theo dõi dòng tiền, phí nền tảng và lịch sử rút tiền.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 bg-white border border-border-light rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-bg-main transition-colors">
            <IconFilter className="w-4 h-4" /> Lọc
          </button>
          <button className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-colors">
            <IconDownload className="w-4 h-4" /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Earnings */}
        <div className="bg-primary text-white p-6 rounded-3xl relative overflow-hidden shadow-lg shadow-primary/30 group">
          <div className="relative z-10">
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">
              Tổng thu nhập (Tháng 5)
            </p>
            <h2 className="text-4xl font-heading font-bold">8.500.000đ</h2>
            <div className="mt-4 flex items-center gap-2 text-xs bg-white/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <IconArrowUpRight className="w-3 h-3" />
              <span className="font-bold">+12%</span>
              <span className="opacity-80">so với tháng trước</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
        </div>

        {/* Pending Balance */}
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-2">
              Số dư khả dụng
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-text-primary">
                3.500.000đ
              </h2>
              <span className="text-xs text-text-secondary">VNĐ</span>
            </div>
            <p className="text-xs text-orange-500 mt-2 flex items-center gap-1 font-medium">
              <IconClock className="w-3 h-3" /> 1.250.000đ đang chờ duyệt
            </p>
          </div>
          <button className="w-full mt-4 py-2 rounded-lg bg-bg-main text-primary font-bold text-xs hover:bg-primary hover:text-white transition-colors">
            Yêu cầu rút tiền
          </button>
        </div>

        {/* Bank Account */}
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-2">
              Tài khoản nhận tiền
            </p>
            <div className="flex items-center gap-3 p-3 bg-bg-main/50 rounded-xl border border-border-light">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-border-light text-green-600">
                <IconBank className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">
                  Vietcombank
                </p>
                <p className="text-xs text-text-secondary">**** 8899</p>
              </div>
            </div>
          </div>
          <button className="text-xs font-bold text-primary hover:underline self-end mt-2 underline">
            Quản lý tài khoản
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. [UPDATED] REVENUE CHART (RECHARTS) */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-border-light shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">
              Biểu đồ tăng trưởng
            </h3>
            <select className="bg-bg-main px-3 py-1.5 rounded-lg text-xs font-bold border border-border-light outline-none cursor-pointer">
              <option>6 tháng qua</option>
              <option>Năm nay</option>
            </select>
          </div>

          {/* Chart Container */}
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
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
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index === chartData.length - 1 ? "#5b3d7c" : "#ede9f2"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. FEE INFO */}
        <div className="lg:col-span-1 bg-secondary/5 p-6 rounded-3xl border border-secondary/20 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-[#BC4C00] mb-4">
            Chính sách phí
          </h3>
          <ul className="space-y-4 text-sm text-text-secondary">
            <li className="flex justify-between border-b border-secondary/10 pb-2">
              <span>Phí dịch vụ nền tảng</span>
              <span className="font-bold text-text-primary">10%</span>
            </li>
            <li className="flex justify-between border-b border-secondary/10 pb-2">
              <span>Thuế thu nhập</span>
              <span className="font-bold text-text-primary">Đã bao gồm</span>
            </li>
            <li className="flex justify-between">
              <span>Phí rút tiền</span>
              <span className="font-bold text-green-600">Miễn phí</span>
            </li>
          </ul>
          <div className="mt-6 p-4 bg-white rounded-xl border border-secondary/20 text-xs text-text-secondary leading-relaxed">
            <span className="font-bold text-[#BC4C00]">Lưu ý:</span> Doanh thu
            sẽ được đối soát và chuyển vào Ví khả dụng sau{" "}
            <strong>3 ngày</strong> kể từ khi tour kết thúc thành công.
          </div>
        </div>
      </div>

      {/* 4. TRANSACTION HISTORY */}
      <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border-light">
          <h3 className="font-bold text-lg text-text-primary">
            Lịch sử giao dịch
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase">
              <tr>
                <th className="p-4 pl-6">Mã GD</th>
                <th className="p-4">Nội dung</th>
                <th className="p-4">Ngày</th>
                <th className="p-4 text-right">Tổng thu</th>
                <th className="p-4 text-right text-red-500">Phí sàn</th>
                <th className="p-4 text-right text-green-600">Thực nhận</th>
                <th className="p-4 pr-6 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                >
                  <td className="p-4 pl-6 font-bold text-text-secondary">
                    {tx.id}
                  </td>
                  <td className="p-4 font-bold text-text-primary">{tx.tour}</td>
                  <td className="p-4 text-text-secondary">{tx.date}</td>

                  {/* Cột tiền */}
                  <td className="p-4 text-right font-medium">{tx.total}</td>
                  <td className="p-4 text-right text-red-500 text-xs">
                    {tx.fee}
                  </td>
                  <td
                    className={`p-4 text-right font-bold text-base ${
                      tx.status === "withdraw"
                        ? "text-text-primary"
                        : "text-green-600"
                    }`}
                  >
                    {tx.net}
                  </td>

                  <td className="p-4 pr-6 text-center">
                    {tx.status === "paid" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold gap-1">
                        <IconCheck className="w-3 h-3" /> Thành công
                      </span>
                    )}
                    {tx.status === "pending" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold gap-1">
                        <IconClock className="w-3 h-3" /> Đang xử lý
                      </span>
                    )}
                    {tx.status === "withdraw" && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold gap-1">
                        Rút tiền
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
