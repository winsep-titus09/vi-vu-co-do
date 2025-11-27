import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconCheck } from "../../icons/IconBox";
import IconChevronLeft from "../../icons/IconChevronLeft";

// --- INLINE ICONS ---
const IconLock = ({ className }) => (
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
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

// --- INLINE ICONS (Payment Logos) ---
const LogoMomo = ({ className }) => (
  <svg
    viewBox="0 0 48 48"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="48" height="48" rx="8" fill="#A50064" />
    <path d="M10 14H16V34H10V14Z" fill="white" />
    <path d="M32 14H38V34H32V14Z" fill="white" />
    <path d="M19 14H29V20H19V14Z" fill="white" />
    <path d="M19 28H29V34H19V28Z" fill="white" />
  </svg>
);
const LogoVNPay = ({ className }) => (
  <svg
    viewBox="0 0 48 48"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="48" height="48" rx="8" fill="#005BAA" />
    <path d="M12 16L20 34H28L36 16H30L24 30L18 16H12Z" fill="white" />
    <path d="M26 14H32V16H26V14Z" fill="#ED1C24" />
  </svg>
);
const IconCreditCard = ({ className }) => (
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
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

// --- MOCK DATA (Dữ liệu từ bước trước chuyển sang) ---
const bookingSummary = {
  tourName: "Bí mật Hoàng cung Huế & Trải nghiệm trà chiều",
  image:
    "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg",
  date: "20/05/2025",
  time: "08:00 - 12:00",
  guests: { adults: 2, children: 0 },
  price: {
    adult: 1800000, // Tổng 2 người
    child: 0,
    discount: 100000, // Giảm giá voucher
    total: 1700000,
  },
};

// Các phương thức thanh toán
const paymentMethods = [
  { id: "momo", name: "Ví MoMo", desc: "Quét mã QR cực nhanh", icon: LogoMomo },
  {
    id: "vnpay",
    name: "VNPay QR",
    desc: "Hỗ trợ tất cả ngân hàng",
    icon: LogoVNPay,
  },
  {
    id: "card",
    name: "Thẻ Quốc tế",
    desc: "Visa, MasterCard, JCB",
    icon: ({ className }) => (
      <div
        className={`bg-gray-800 text-white rounded flex items-center justify-center ${className}`}
      >
        <IconCreditCard className="w-6 h-6" />
      </div>
    ),
  },
];

export default function BookingStepPayment() {
  const [selectedMethod, setSelectedMethod] = useState("momo");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Giả lập gọi API thanh toán
    setTimeout(() => {
      setIsProcessing(false);
      // Chuyển sang trang biên lai/thành công
      // navigate("/booking/receipt/BK-2025-001");
      alert("Thanh toán thành công! (Demo)");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-bg-main py-10">
      <div className="container-main max-w-6xl">
        {/* Header Steps */}
        <div className="mb-8">
          <Link
            to="/tours/1"
            className="text-sm font-bold text-text-secondary hover:text-primary flex items-center gap-1 mb-4"
          >
            <IconChevronLeft className="w-4 h-4" /> Quay lại chi tiết tour
          </Link>
          <h1 className="text-3xl font-heading font-bold text-text-primary">
            Thanh toán an toàn
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* --- LEFT COLUMN: PAYMENT METHODS --- */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Select Method */}
            <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                Chọn phương thức thanh toán
              </h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`
                                        relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
                                        ${
                                          isSelected
                                            ? "border-primary bg-primary/5 shadow-md"
                                            : "border-border-light hover:border-primary/30 hover:bg-bg-main"
                                        }
                                    `}
                    >
                      <div className="w-12 h-12 shrink-0">
                        <Icon className="w-full h-full object-contain rounded-lg" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-text-primary">
                          {method.name}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {method.desc}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && <IconCheck className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. User Info Confirmation (Read-only) */}
            <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-text-primary">
                  Thông tin liên hệ
                </h3>
                <button className="text-sm font-bold text-primary hover:underline">
                  Chỉnh sửa
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold">
                    Họ và tên
                  </p>
                  <p className="font-medium text-text-primary">Hoàng Nam</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold">
                    Số điện thoại
                  </p>
                  <p className="font-medium text-text-primary">0905 123 456</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-text-secondary uppercase font-bold">
                    Email
                  </p>
                  <p className="font-medium text-text-primary">
                    hoangnam@email.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: ORDER SUMMARY --- */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-3xl border border-border-light shadow-lg sticky top-24">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                Tóm tắt đơn hàng
              </h3>

              {/* Tour Card Mini */}
              <div className="flex gap-4 mb-6 pb-6 border-b border-border-light">
                <img
                  src={bookingSummary.image}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                  alt="Tour"
                />
                <div>
                  <h4 className="font-bold text-text-primary line-clamp-2 mb-1">
                    {bookingSummary.tourName}
                  </h4>
                  <p className="text-xs text-text-secondary">
                    {bookingSummary.date} • {bookingSummary.time}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {bookingSummary.guests.adults} Người lớn
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Giá tour (x2)</span>
                  <span className="font-medium text-text-primary">
                    1.800.000đ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    Giảm giá (Voucher)
                  </span>
                  <span className="font-medium text-green-600">- 100.000đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Phí dịch vụ</span>
                  <span className="font-medium text-text-primary">
                    Miễn phí
                  </span>
                </div>
                <div className="pt-3 border-t border-border-light flex justify-between items-center">
                  <span className="font-bold text-text-primary">
                    Tổng thanh toán
                  </span>
                  <span className="text-2xl font-heading font-bold text-primary">
                    1.700.000đ
                  </span>
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-bg-main p-3 rounded-xl flex items-center gap-2 text-xs text-text-secondary mb-6">
                <IconLock className="w-4 h-4 text-green-600" />
                <span>Thanh toán được bảo mật bởi SSL 256-bit.</span>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Đang xử lý..." : "Thanh toán ngay"}{" "}
                <IconArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
