// src/pages/Booking/StepPayment.jsx
// Trang thanh toán - chỉ truy cập được khi booking đã ở trạng thái awaiting_payment

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  LogoMomo,
  LogoVNPay,
} from "../../icons/IconCommon";

// ============================================================================
// PAYMENT METHODS
// ============================================================================
const paymentMethods = [
  {
    id: "card",
    name: "Thẻ Quốc tế",
    desc: "Visa, MasterCard, JCB (Khuyến nghị)",
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
  { id: "momo", name: "Ví MoMo", desc: "Quét mã QR", icon: LogoMomo },
  {
    id: "vnpay",
    name: "VNPay QR",
    desc: "Hỗ trợ tất cả ngân hàng",
    icon: LogoVNPay,
  },
];

// Helper to convert MongoDB Decimal128 to number
const toNumber = (val) => {
  if (val?.$numberDecimal) return parseFloat(val.$numberDecimal);
  return parseFloat(val) || 0;
};

export default function BookingStepPayment() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const toast = useToast();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Fetch booking data
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        navigate("/dashboard/tourist/history");
        return;
      }

      try {
        setIsLoading(true);
        const response = await bookingsApi.getBooking(bookingId);
        
        // Kiểm tra status - chỉ cho phép thanh toán nếu awaiting_payment
        if (response.status !== "awaiting_payment") {
          if (response.status === "paid") {
            toast.info("Đã thanh toán", "Booking này đã được thanh toán.");
            navigate(`/booking/receipt/${bookingId}`);
          } else if (response.status === "waiting_guide") {
            toast.warning("Chờ xác nhận", "Vui lòng chờ HDV xác nhận trước khi thanh toán.");
            navigate("/dashboard/tourist/history");
          } else {
            toast.error("Không thể thanh toán", "Booking không ở trạng thái có thể thanh toán.");
            navigate("/dashboard/tourist/history");
          }
          return;
        }

        setBooking(response);
      } catch (error) {
        console.error("Fetch booking error:", error);
        toast.error("Lỗi tải dữ liệu", "Không thể tải thông tin booking.");
        navigate("/dashboard/tourist/history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate, toast]);

  // Handle payment
  const handlePayment = async () => {
    if (!agreedToTerms) {
      toast.warning("Điều khoản", "Vui lòng đồng ý với điều khoản sử dụng!");
      return;
    }

    setIsProcessing(true);

    try {
      toast.info("Đang chuyển đến cổng thanh toán...");

      // Map payment method
      let paymentMethod = "wallet"; // momo default
      if (selectedMethod === "vnpay") paymentMethod = "atm";
      if (selectedMethod === "card") paymentMethod = "credit";

      const checkoutRes = await paymentsApi.createCheckout(
        bookingId,
        paymentMethod
      );

      if (checkoutRes.payUrl) {
        // Redirect đến MoMo/VNPay
        window.location.href = checkoutRes.payUrl;
        return;
      } else {
        throw new Error("Không nhận được link thanh toán");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        "Lỗi thanh toán",
        error.message || "Không thể kết nối cổng thanh toán. Vui lòng thử lại."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <IconLoader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  // Extract data from booking
  const tourName = booking.tour_id?.name || "Tour";
  const tourImage = booking.tour_id?.cover_image_url || "/images/placeholders/tour-placeholder.jpg";
  const date = booking.start_date ? new Date(booking.start_date).toLocaleDateString("vi-VN") : "";
  const totalPrice = toNumber(booking.total_price);
  const contact = booking.contact || {};
  const participants = booking.participants || [];
  const numGuests = participants.length || 1;

  return (
    <div className="min-h-screen bg-bg-main py-8 md:py-12">
      <div className="container-main max-w-6xl">
        {/* Progress stepper */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                <IconCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold hidden md:block">Xác nhận đặt</span>
            </div>
            <div className="w-6 h-px bg-green-600"></div>
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                <IconCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold hidden md:block">HDV duyệt</span>
            </div>
            <div className="w-6 h-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-primary">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span className="text-sm font-bold">Thanh toán</span>
            </div>
            <div className="w-6 h-px bg-gray-300"></div>
            <div className="flex items-center gap-2 text-text-secondary opacity-60">
              <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                4
              </div>
              <span className="text-sm font-bold hidden md:block">Hoàn tất</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard/tourist/history")}
            className="text-sm font-bold text-text-secondary hover:text-primary flex items-center gap-1 mb-2"
          >
            <IconChevronLeft className="w-4 h-4" /> Quay lại
          </button>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">
            Thanh toán an toàn
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            HDV đã xác nhận yêu cầu của bạn. Vui lòng hoàn tất thanh toán.
          </p>
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
              <h3 className="text-lg font-bold text-text-primary mb-4">
                Thông tin liên hệ
              </h3>
              <div className="flex items-center gap-4 p-4 bg-bg-main/50 rounded-xl border border-border-light">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-text-secondary font-bold">
                  {contact.full_name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {contact.full_name || "Khách hàng"} ({contact.phone || "Chưa có SĐT"})
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
                  Bạn được hoàn tiền 100% nếu hủy trước 24h so với giờ khởi hành.
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
                  src={tourImage}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                  alt="Tour"
                />
                <div>
                  <h4 className="font-bold text-text-primary line-clamp-2 mb-1 text-sm">
                    {tourName}
                  </h4>
                  <p className="text-xs text-text-secondary mb-1">{date}</p>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-bg-main text-text-secondary text-[10px] font-bold border border-border-light">
                    {numGuests} khách
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
                  <span className="text-text-secondary">Giá tour</span>
                  <span className="font-medium text-text-primary">
                    {totalPrice.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {promoCode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Giảm giá (Voucher)</span>
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
                    <span className="underline font-bold">Điều khoản sử dụng</span>{" "}
                    và{" "}
                    <span className="underline font-bold">Chính sách bảo mật</span>{" "}
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
