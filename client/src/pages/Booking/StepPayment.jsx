// src/pages/Booking/StepPayment.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { bookingsApi } from "../../features/booking/api";
import { paymentsApi } from "../../features/payments/api";
import { useToast } from "../../components/Toast/useToast";
import { IconCheck, IconClock } from "../../icons/IconBox";
import IconChevronLeft from "../../icons/IconChevronLeft";
import {
  IconLock,
  IconArrowRight,
  IconShield,
  IconTicket,
  IconLoader,
} from "../../icons/IconCommon";

// ============================================================================
// PAYMENT LOGOS
// ============================================================================
const LogoMomo = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none">
    <rect width="48" height="48" rx="8" fill="#A50064" />
    <path d="M10 14H16V34H10V14Z" fill="white" />
    <path d="M32 14H38V34H32V14Z" fill="white" />
    <path d="M19 14H29V20H19V14Z" fill="white" />
    <path d="M19 28H29V34H19V28Z" fill="white" />
  </svg>
);
const LogoVNPay = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none">
    <rect width="48" height="48" rx="8" fill="#005BAA" />
    <path d="M12 16L20 34H28L36 16H30L24 30L18 16H12Z" fill="white" />
    <path d="M26 14H32V16H26V14Z" fill="#ED1C24" />
  </svg>
);

// ============================================================================
// PAYMENT METHODS
// ============================================================================
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
        className={`bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 ${className}`}
      >
        <div className="flex -space-x-1">
          <div className="w-4 h-4 rounded-full bg-red-500 opacity-80"></div>
          <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-80"></div>
        </div>
      </div>
    ),
  },
];

export default function BookingStepPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [selectedMethod, setSelectedMethod] = useState("momo");
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Lấy booking data từ location state
  const bookingData = location.state;

  // Redirect nếu không có booking data
  useEffect(() => {
    if (!location.state) {
      navigate("/tours");
    }
  }, [navigate, location.state]);

  if (!bookingData) {
    return null;
  }

  // Extract data from bookingData
  const {
    tourId,
    tourName = "Tour",
    tourImage,
    date,
    guests = { adults: 1, children: 0 },
    totalPrice = 0,
    selectedGuideId,
    contact = {},
  } = bookingData;

  const handlePayment = async () => {
    if (!agreedToTerms) {
      toast.warning("Điều khoản", "Vui lòng đồng ý với điều khoản sử dụng!");
      return;
    }

    setIsProcessing(true);

    try {
      // Chuẩn bị data cho API
      const bookingPayload = {
        tour_id: tourId,
        start_date: date,
        adults: guests.adults,
        children: guests.children,
        guide_id: selectedGuideId || undefined,
        contact: {
          full_name: contact.full_name,
          email: contact.email,
          phone: contact.phone,
          note: contact.note || "",
        },
      };

      // Gọi API tạo booking
      const response = await bookingsApi.createBooking(bookingPayload);
      const booking = response.booking || response;

      // Kiểm tra status booking
      if (booking.status === "awaiting_payment") {
        // HDV đã pre-approve (guide đã lock ngày này)
        // Gọi API tạo phiên thanh toán
        toast.info("Đang chuyển đến cổng thanh toán...");

        try {
          // Map payment method
          let paymentMethod = "wallet"; // momo default
          if (selectedMethod === "vnpay") paymentMethod = "atm";
          if (selectedMethod === "card") paymentMethod = "credit";

          const checkoutRes = await paymentsApi.createCheckout(
            booking._id,
            paymentMethod
          );

          if (checkoutRes.payUrl) {
            // Redirect đến MoMo/VNPay
            window.location.href = checkoutRes.payUrl;
            return;
          } else {
            throw new Error("Không nhận được link thanh toán");
          }
        } catch (checkoutError) {
          console.error("Checkout error:", checkoutError);
          // Fallback: chuyển đến trang receipt để xem trạng thái
          toast.warning(
            "Lưu ý",
            "Không thể kết nối cổng thanh toán. Vui lòng thanh toán sau trong mục 'Chuyến đi của tôi'."
          );
          navigate(`/booking/receipt/${booking._id}`, {
            state: {
              bookingId: booking._id,
              tourName,
              tourImage,
              date,
              totalPrice,
              contact,
              status: booking.status,
            },
          });
        }
      } else {
        // Status = waiting_guide: Chờ HDV xác nhận trước khi thanh toán
        toast.success(
          "Đặt tour thành công!",
          "Đang chờ hướng dẫn viên xác nhận. Bạn sẽ nhận được thông báo khi có thể thanh toán."
        );

        // Navigate to receipt page with booking status
        navigate(`/booking/receipt/${booking._id}`, {
          state: {
            bookingId: booking._id,
            tourName,
            tourImage,
            date,
            totalPrice,
            contact,
            status: booking.status,
          },
        });
      }
    } catch (error) {
      console.error("Create booking error:", error);
      toast.error(
        "Đặt tour thất bại",
        error.message || "Có lỗi xảy ra, vui lòng thử lại!"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main py-8 md:py-12">
      <div className="container-main max-w-6xl">
        {/* Progress stepper */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-text-secondary opacity-60">
              <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                1
              </div>
              <span className="text-sm font-bold hidden md:block">
                Thông tin
              </span>
            </div>
            <div className="w-8 h-[1px] bg-gray-300"></div>
            <div className="flex items-center gap-2 text-primary">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className="text-sm font-bold">Thanh toán</span>
            </div>
            <div className="w-8 h-[1px] bg-gray-300"></div>
            <div className="flex items-center gap-2 text-text-secondary opacity-60">
              <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span className="text-sm font-bold hidden md:block">
                Hoàn tất
              </span>
            </div>
          </div>
        </div>

        {/* Header Steps */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-bold text-text-secondary hover:text-primary flex items-center gap-1 mb-2"
          >
            <IconChevronLeft className="w-4 h-4" /> Quay lại
          </button>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">
            Thanh toán an toàn
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left column: Payment methods */}
          <div className="lg:col-span-7 space-y-6">
            {/* Payment Method Selection */}
            <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                Phương thức thanh toán
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

            {/* User Info (Compact) */}
            <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-text-primary">
                  Thông tin liên hệ
                </h3>
                <button
                  onClick={() => navigate(-1)}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Sửa
                </button>
              </div>
              <div className="flex items-center gap-4 p-4 bg-bg-main/50 rounded-xl border border-border-light">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-text-secondary font-bold">
                  {contact.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {contact.full_name || "Khách hàng"} (
                    {contact.phone || "Chưa có SĐT"})
                  </p>
                  <p className="text-xs text-text-secondary">
                    {contact.email || "Chưa có email"}
                  </p>
                </div>
              </div>
            </div>

            {/* Cancellation policy */}
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex gap-3">
              <IconShield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-green-800">
                  Chính sách "Yên tâm đặt"
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Bạn được hoàn tiền 100% nếu hủy trước 24h so với giờ khởi
                  hành.
                </p>
              </div>
            </div>
          </div>

          {/* Right column: Order summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-3xl border border-border-light shadow-lg sticky top-24">
              <h3 className="text-lg font-bold text-text-primary mb-4">
                Tóm tắt đơn hàng
              </h3>

              {/* Tour Info */}
              <div className="flex gap-4 mb-6 pb-6 border-b border-border-light">
                <img
                  src={tourImage || "/images/placeholders/tour-placeholder.jpg"}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                  alt="Tour"
                />
                <div>
                  <h4 className="font-bold text-text-primary line-clamp-2 mb-1 text-sm">
                    {tourName}
                  </h4>
                  <p className="text-xs text-text-secondary mb-1">
                    {new Date(date).toLocaleDateString("vi-VN")}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-bg-main text-text-secondary text-[10px] font-bold border border-border-light">
                    {guests.adults} Người lớn
                    {guests.children > 0 ? `, ${guests.children} Trẻ em` : ""}
                  </span>
                </div>
              </div>

              {/* Promo code input */}
              <div className="mb-6 pb-6 border-b border-border-light">
                <label className="text-xs font-bold text-text-secondary mb-2 block uppercase">
                  Mã ưu đãi
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <IconTicket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="text"
                      placeholder="Nhập mã giảm giá"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-light bg-bg-main/30 text-sm focus:border-primary outline-none transition-all uppercase placeholder:normal-case"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                  </div>
                  <button className="px-4 py-2.5 bg-text-primary text-white rounded-xl text-sm font-bold hover:bg-black transition-colors">
                    Áp dụng
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    Giá tour (x{guests.adults + guests.children})
                  </span>
                  <span className="font-medium text-text-primary">
                    {totalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {promoCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">
                      Giảm giá (Voucher)
                    </span>
                    <span className="font-medium text-green-600">- 0đ</span>
                  </div>
                )}
                <div className="pt-3 border-t border-border-light flex justify-between items-end">
                  <span className="font-bold text-text-primary mb-1">
                    Tổng thanh toán
                  </span>
                  <div className="text-right">
                    <span className="block text-2xl font-heading font-bold text-primary">
                      {totalPrice.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      (Đã bao gồm thuế & phí)
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms & conditions checkbox */}
              <div className="mb-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={agreedToTerms}
                      onChange={() => setAgreedToTerms(!agreedToTerms)}
                    />
                    <div className="w-5 h-5 border-2 border-border-light rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <IconCheck className="w-3.5 h-3.5 text-white absolute left-0.5 opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <p className="text-xs text-text-secondary leading-snug select-none group-hover:text-text-primary transition-colors">
                    Tôi đồng ý với{" "}
                    <span className="underline font-bold">
                      Điều khoản sử dụng
                    </span>{" "}
                    và{" "}
                    <span className="underline font-bold">
                      Chính sách bảo mật
                    </span>{" "}
                    của Vi Vu Cố Đô.
                  </p>
                </label>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || !agreedToTerms}
                className={`
                    w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all
                    ${
                      isProcessing || !agreedToTerms
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-95"
                    }
                `}
              >
                {isProcessing ? (
                  <>
                    <IconLoader className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Thanh toán ngay
                    <IconArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="mt-4 flex justify-center items-center gap-2 text-[10px] text-text-secondary opacity-70">
                <IconLock className="w-3 h-3" />
                <span>Thanh toán an toàn & mã hóa SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
