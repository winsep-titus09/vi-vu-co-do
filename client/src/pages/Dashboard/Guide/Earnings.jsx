import { useState, useMemo } from "react";
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
import {
  IconArrowUpRight,
  IconArrowDownLeft,
  IconDownload,
  IconX,
} from "../../../icons/IconCommon";
import {
  useMonthlyEarnings,
  useGuideDashboard,
  useMyPayoutRequests,
  useCreatePayoutRequest,
} from "../../../features/guides/hooks";
import Spinner from "../../../components/Loaders/Spinner";
import { formatCurrency } from "../../../lib/formatters";
import { useToast } from "../../../components/Toast/useToast";

// Custom Tooltip cho biểu đồ
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-border-light rounded-xl shadow-lg text-xs">
        <p className="font-bold text-text-primary mb-1">{label}</p>
        <p className="text-primary font-medium">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

// Tên tháng tiếng Việt
const MONTH_NAMES = [
  "Th1",
  "Th2",
  "Th3",
  "Th4",
  "Th5",
  "Th6",
  "Th7",
  "Th8",
  "Th9",
  "Th10",
  "Th11",
  "Th12",
];

export default function GuideEarnings() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const toast = useToast();

  // Payout modal state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");

  // Fetch data
  const {
    data: earningsData,
    isLoading: earningsLoading,
    error: earningsError,
  } = useMonthlyEarnings(selectedYear);
  const { data: dashboardData, isLoading: dashboardLoading } =
    useGuideDashboard();
  
  // Payout data
  const { 
    payouts, 
    isLoading: payoutsLoading, 
    refetch: refetchPayouts 
  } = useMyPayoutRequests({ limit: 10 });
  const { createPayoutRequest, isSubmitting: isCreatingPayout } = useCreatePayoutRequest();

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!earningsData?.months) return [];

    return earningsData.months.map((m, idx) => ({
      name: MONTH_NAMES[idx],
      value: m.total || 0,
      month: m.month,
      count: m.count || 0,
    }));
  }, [earningsData]);

  // Get current month earnings
  const currentMonthData = useMemo(() => {
    if (!earningsData?.months) return { total: 0, count: 0 };
    return (
      earningsData.months.find((m) => m.month === currentMonth) || {
        total: 0,
        count: 0,
      }
    );
  }, [earningsData, currentMonth]);

  // Get previous month for comparison
  const previousMonthData = useMemo(() => {
    if (!earningsData?.months) return { total: 0, count: 0 };
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    return (
      earningsData.months.find((m) => m.month === prevMonth) || {
        total: 0,
        count: 0,
      }
    );
  }, [earningsData, currentMonth]);

  // Calculate percentage change
  const percentChange = useMemo(() => {
    if (!previousMonthData.total || previousMonthData.total === 0) return 0;
    return Math.round(
      ((currentMonthData.total - previousMonthData.total) /
        previousMonthData.total) *
        100
    );
  }, [currentMonthData, previousMonthData]);

  // Calculate average platform fee from tour data
  // percentage = phí nền tảng (0.15 = 15%), HDV nhận (1 - percentage) = 85%
  const averagePlatformFee = useMemo(() => {
    if (!dashboardData?.items || dashboardData.items.length === 0) return 10; // default 10%
    const validItems = dashboardData.items.filter(
      (item) => typeof item.percentage === "number" && !isNaN(item.percentage)
    );
    if (validItems.length === 0) return 10;
    const avgPercentage =
      validItems.reduce((sum, item) => sum + item.percentage, 0) /
      validItems.length;
    return Math.round(avgPercentage * 100);
  }, [dashboardData]);

  // Total earnings from dashboard (guide share)
  const totalGuideShare = dashboardData?.totalGuideShare || 0;

  // Available balance for withdrawal (from dashboard or calculate)
  const availableBalance = dashboardData?.availableBalance || totalGuideShare;

  // Handle payout request
  const handlePayoutRequest = async () => {
    const amount = parseFloat(payoutAmount.replace(/[.,]/g, ""));
    
    if (!amount || amount <= 0) {
      toast.warning("Số tiền không hợp lệ", "Vui lòng nhập số tiền cần rút");
      return;
    }
    
    if (amount < 100000) {
      toast.warning("Số tiền quá nhỏ", "Số tiền rút tối thiểu là 100.000đ");
      return;
    }
    
    if (amount > availableBalance) {
      toast.warning("Số dư không đủ", "Số tiền rút vượt quá số dư khả dụng");
      return;
    }

    const result = await createPayoutRequest(amount);
    
    if (result.success) {
      toast.success("Yêu cầu đã gửi", "Yêu cầu rút tiền đang được xử lý");
      setShowPayoutModal(false);
      setPayoutAmount("");
      refetchPayouts();
    } else {
      toast.error("Lỗi", result.error || "Không thể tạo yêu cầu rút tiền");
    }
  };

  // Format input amount
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value) {
      setPayoutAmount(parseInt(value).toLocaleString("vi-VN"));
    } else {
      setPayoutAmount("");
    }
  };

  // Payout status badge
  const getPayoutStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold gap-1">
            <IconClock className="w-3 h-3" /> Chờ duyệt
          </span>
        );
      case "approved":
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold gap-1">
            <IconCheck className="w-3 h-3" /> Đã chuyển
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold gap-1">
            <IconX className="w-3 h-3" /> Từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  // Loading state
  if (earningsLoading || dashboardLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (earningsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        {earningsError}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* PAYOUT MODAL */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-heading font-bold text-text-primary">
                Yêu cầu rút tiền
              </h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="p-2 hover:bg-bg-main rounded-full transition-colors"
              >
                <IconX className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Available Balance */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-green-700 font-bold uppercase mb-1">
                Số dư khả dụng
              </p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(availableBalance)}
              </p>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-text-primary mb-2">
                Số tiền muốn rút
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={payoutAmount}
                  onChange={handleAmountChange}
                  placeholder="Nhập số tiền"
                  className="w-full px-4 py-3 border border-border-light rounded-xl text-lg font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">
                  đ
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Tối thiểu: 100.000đ • Phí rút tiền: Miễn phí
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {[500000, 1000000, 2000000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setPayoutAmount(amount.toLocaleString("vi-VN"))}
                  disabled={amount > availableBalance}
                  className="px-3 py-2 border border-border-light rounded-xl text-sm font-bold hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 px-4 py-3 border border-border-light rounded-xl font-bold text-text-secondary hover:bg-bg-main transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handlePayoutRequest}
                disabled={isCreatingPayout || !payoutAmount}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreatingPayout ? (
                  <>
                    <Spinner size="sm" className="text-white" /> Đang xử lý...
                  </>
                ) : (
                  "Xác nhận rút tiền"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2.5 bg-white border border-border-light rounded-xl font-bold text-sm outline-none cursor-pointer"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={availableBalance <= 0}
            className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconArrowUpRight className="w-4 h-4" /> Rút tiền
          </button>
          <button className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-colors">
            <IconDownload className="w-4 h-4" /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Month Earnings */}
        <div className="bg-primary text-white p-6 rounded-3xl relative overflow-hidden shadow-lg shadow-primary/30 group">
          <div className="relative z-10">
            <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">
              Thu nhập tháng {currentMonth}
            </p>
            <h2 className="text-3xl font-heading font-bold">
              {formatCurrency(currentMonthData.total)}
            </h2>
            <p className="text-white/70 text-xs mt-1">
              {currentMonthData.count} giao dịch
            </p>
            {percentChange !== 0 && (
              <div
                className={`mt-4 flex items-center gap-2 text-xs ${
                  percentChange > 0 ? "bg-white/20" : "bg-red-500/30"
                } w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm`}
              >
                {percentChange > 0 ? (
                  <IconArrowUpRight className="w-3 h-3" />
                ) : (
                  <IconArrowDownLeft className="w-3 h-3" />
                )}
                <span className="font-bold">
                  {percentChange > 0 ? "+" : ""}
                  {percentChange}%
                </span>
                <span className="opacity-80">so với tháng trước</span>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
        </div>

        {/* Total Year Earnings */}
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-2">
              Tổng thu nhập năm {selectedYear}
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-text-primary">
                {formatCurrency(earningsData?.totalYear || 0)}
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Từ{" "}
              {earningsData?.months?.reduce(
                (sum, m) => sum + (m.count || 0),
                0
              ) || 0}{" "}
              giao dịch
            </p>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-text-secondary text-xs font-bold uppercase tracking-wider mb-2">
              Tổng thu nhập từ tour
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-bold text-green-600">
                {formatCurrency(totalGuideShare)}
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Doanh thu: {formatCurrency(dashboardData?.totalGross || 0)}
            </p>
          </div>
          <div className="mt-4 p-3 bg-bg-main/50 rounded-xl border border-border-light">
            <p className="text-xs text-text-secondary">
              <span className="font-bold text-text-primary">
                {dashboardData?.items?.length || 0}
              </span>{" "}
              tour đang hoạt động
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-border-light shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">
              Biểu đồ thu nhập năm {selectedYear}
            </h3>
          </div>

          {/* Chart Container */}
          <div className="w-full h-64">
            {chartData.length > 0 ? (
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
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M`
                    }
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
                          entry.month === currentMonth &&
                          selectedYear === currentYear
                            ? "#5b3d7c"
                            : "#ede9f2"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-secondary">
                Chưa có dữ liệu thu nhập
              </div>
            )}
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
              <span className="font-bold text-text-primary">
                {averagePlatformFee}%
              </span>
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

      {/* 4. MONTHLY BREAKDOWN TABLE */}
      <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border-light">
          <h3 className="font-bold text-lg text-text-primary">
            Chi tiết theo tháng - Năm {selectedYear}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase">
              <tr>
                <th className="p-4 pl-6">Tháng</th>
                <th className="p-4 text-right">Số giao dịch</th>
                <th className="p-4 text-right">Thu nhập</th>
                <th className="p-4 pr-6 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {earningsData?.months?.map((monthData) => (
                <tr
                  key={monthData.month}
                  className={`border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors ${
                    monthData.month === currentMonth &&
                    selectedYear === currentYear
                      ? "bg-primary/5"
                      : ""
                  }`}
                >
                  <td className="p-4 pl-6 font-bold text-text-primary">
                    Tháng {monthData.month}
                    {monthData.month === currentMonth &&
                      selectedYear === currentYear && (
                        <span className="ml-2 text-xs text-primary">
                          (Hiện tại)
                        </span>
                      )}
                  </td>
                  <td className="p-4 text-right text-text-secondary">
                    {monthData.count || 0}
                  </td>
                  <td
                    className={`p-4 text-right font-bold ${
                      monthData.total > 0
                        ? "text-green-600"
                        : "text-text-secondary"
                    }`}
                  >
                    {monthData.total > 0
                      ? `+${formatCurrency(monthData.total)}`
                      : formatCurrency(0)}
                  </td>
                  <td className="p-4 pr-6 text-center">
                    {monthData.total > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold gap-1">
                        <IconCheck className="w-3 h-3" /> Đã thanh toán
                      </span>
                    ) : monthData.month <= currentMonth ||
                      selectedYear < currentYear ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                        Không có giao dịch
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold gap-1">
                        <IconClock className="w-3 h-3" /> Chưa đến
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. TOUR BREAKDOWN */}
      {dashboardData?.items && dashboardData.items.length > 0 && (
        <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border-light">
            <h3 className="font-bold text-lg text-text-primary">
              Thu nhập theo tour
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase">
                <tr>
                  <th className="p-4 pl-6">Tour</th>
                  <th className="p-4 text-right">Số booking</th>
                  <th className="p-4 text-right">Doanh thu</th>
                  <th className="p-4 text-right">Tỷ lệ</th>
                  <th className="p-4 pr-6 text-right">Thực nhận</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.items.map((tour) => (
                  <tr
                    key={tour.tourId}
                    className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                  >
                    <td className="p-4 pl-6 font-bold text-text-primary max-w-[200px] truncate">
                      {tour.name}
                    </td>
                    <td className="p-4 text-right text-text-secondary">
                      {tour.bookingsCount}
                    </td>
                    <td className="p-4 text-right font-medium">
                      {formatCurrency(tour.gross)}
                    </td>
                    <td className="p-4 text-right text-text-secondary">
                      {Math.round(tour.percentage * 100)}%
                    </td>
                    <td className="p-4 pr-6 text-right font-bold text-green-600">
                      +{formatCurrency(tour.guideShare)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-bg-main/30">
                <tr>
                  <td className="p-4 pl-6 font-bold text-text-primary">
                    Tổng cộng
                  </td>
                  <td className="p-4 text-right font-bold">
                    {dashboardData.items.reduce(
                      (sum, t) => sum + t.bookingsCount,
                      0
                    )}
                  </td>
                  <td className="p-4 text-right font-bold">
                    {formatCurrency(dashboardData.totalGross)}
                  </td>
                  <td className="p-4 text-right">-</td>
                  <td className="p-4 pr-6 text-right font-bold text-green-600">
                    +{formatCurrency(dashboardData.totalGuideShare)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 6. PAYOUT HISTORY */}
      <div className="bg-white rounded-3xl border border-border-light overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border-light flex items-center justify-between">
          <h3 className="font-bold text-lg text-text-primary">
            Lịch sử rút tiền
          </h3>
          {availableBalance > 0 && (
            <button
              onClick={() => setShowPayoutModal(true)}
              className="text-sm font-bold text-primary hover:underline"
            >
              + Yêu cầu rút tiền
            </button>
          )}
        </div>

        {payoutsLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : payouts && payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-bg-main/50 text-text-secondary font-bold text-xs uppercase">
                <tr>
                  <th className="p-4 pl-6">Mã yêu cầu</th>
                  <th className="p-4">Ngày tạo</th>
                  <th className="p-4 text-right">Số tiền</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 pr-6">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr
                    key={payout._id}
                    className="border-b border-border-light last:border-0 hover:bg-bg-main/20 transition-colors"
                  >
                    <td className="p-4 pl-6 font-mono text-xs text-text-secondary">
                      #{payout._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-4 text-text-secondary">
                      {new Date(payout.createdAt || payout.created_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right font-bold text-text-primary">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="p-4 text-center">
                      {getPayoutStatusBadge(payout.status)}
                    </td>
                    <td className="p-4 pr-6 text-text-secondary text-xs max-w-[200px] truncate">
                      {payout.note || payout.reject_reason || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-4">
              <IconArrowUpRight className="w-8 h-8 text-text-secondary" />
            </div>
            <p className="text-text-secondary font-medium mb-2">
              Chưa có yêu cầu rút tiền
            </p>
            <p className="text-xs text-text-secondary mb-4">
              Số dư khả dụng: <span className="font-bold text-green-600">{formatCurrency(availableBalance)}</span>
            </p>
            {availableBalance >= 100000 && (
              <button
                onClick={() => setShowPayoutModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
              >
                Rút tiền ngay
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
