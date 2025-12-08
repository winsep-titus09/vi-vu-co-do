import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { bookingsApi } from "../../features/booking/api";
import { useToast } from "../../components/Toast/useToast";
import IconArrowRight from "../../icons/IconArrowRight";
import IconChevronLeft from "../../icons/IconChevronLeft";
import { IconLoader } from "../../icons/IconCommon";

// Helper to get user from localStorage
const getStoredUser = () => {
  try {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

export default function BookingStepReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [user] = useState(getStoredUser);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy dữ liệu từ state (được gửi từ trang trước)
  const bookingData = location.state;

  // Khởi tạo note từ bookingData
  const [note, setNote] = useState(bookingData?.note || "");

  // Form state for contact info
  const [contactInfo, setContactInfo] = useState({
    full_name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  // Chặn truy cập trực tiếp nếu không có booking data
  useEffect(() => {
    if (!location.state) {
      navigate("/tours");
    }
  }, [navigate, location.state]);

  // Update contact info when user data loads
  useEffect(() => {
    if (user) {
      setContactInfo((prev) => ({
        full_name: prev.full_name || user.name || "",
        phone: prev.phone || user.phone || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  if (!bookingData) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-bg-main py-8 md:py-12">
      <div className="container-main max-w-4xl">
        {/* Stepper: Đặt tour → Chờ HDV → Thanh toán → Hoàn tất */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="flex items-center gap-3">
            {/* Step 1: Active */}
            <div className="flex items-center gap-2 text-primary">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <span className="text-sm font-bold">Xác nhận đặt</span>
            </div>

            <div className="w-6 h-px bg-gray-300"></div>

            {/* Step 2: Inactive */}
            <div className="flex items-center gap-2 text-text-secondary opacity-60">
              <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className="text-sm font-bold hidden md:block">
                Chờ HDV duyệt
              </span>
            </div>

            <div className="w-6 h-px bg-gray-300"></div>

            {/* Step 3: Inactive */}
            <div className="flex items-center gap-2 text-text-secondary opacity-60">
              <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span className="text-sm font-bold hidden md:block">
                Thanh toán
              </span>
            </div>

            <div className="w-6 h-px bg-gray-300"></div>

            {/* Step 4: Inactive */}
            <div className="flex items-center gap-2 text-text-secondary opacity-60">
              <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                4
              </div>
              <span className="text-sm font-bold hidden md:block">
                Hoàn tất
              </span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-bold text-text-secondary hover:text-primary mb-4"
        >
          <IconChevronLeft className="w-4 h-4" /> Quay lại chi tiết tour
        </button>

        <h1 className="text-2xl font-heading font-bold text-text-primary mb-6">
          Xác nhận thông tin
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* 1. HIỂN THỊ LẠI THÔNG TIN ĐÃ CHỌN */}
            <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
              <h3 className="text-lg font-bold mb-4">Chuyến đi của bạn</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-dashed pb-2">
                  <span className="text-text-secondary">Tour</span>
                  <span className="font-bold text-right max-w-[60%]">
                    {bookingData.tourName}
                  </span>
                </div>
                <div className="flex justify-between border-b border-dashed pb-2">
                  <span className="text-text-secondary">Ngày khởi hành</span>
                  <span className="font-bold">
                    {new Date(bookingData.date).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex justify-between border-b border-dashed pb-2">
                  <span className="text-text-secondary">Khách</span>
                  <span className="font-bold">
                    {bookingData.guests.adults} Người lớn,{" "}
                    {bookingData.guests.children} Trẻ em
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Hướng dẫn viên</span>
                  <span className="font-bold">
                    {bookingData.selectedGuideName || "Ngẫu nhiên"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. FORM NHẬP THÔNG TIN LIÊN HỆ */}
            <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Thông tin liên hệ</h3>
                {user && (
                  <button
                    onClick={() =>
                      setContactInfo({
                        full_name: user.name || "",
                        phone: user.phone || "",
                        email: user.email || "",
                      })
                    }
                    className="text-sm text-primary font-bold hover:underline"
                  >
                    Tự động điền
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary uppercase font-bold">
                    Họ tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-xl border border-border-light bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm font-bold transition-all"
                    value={contactInfo.full_name}
                    onChange={(e) =>
                      setContactInfo((prev) => ({
                        ...prev,
                        full_name: e.target.value,
                      }))
                    }
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary uppercase font-bold">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full p-3 rounded-xl border border-border-light bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm font-bold transition-all"
                    value={contactInfo.phone}
                    onChange={(e) =>
                      setContactInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="0905 xxx xxx"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs text-text-secondary uppercase font-bold">
                    Email (Nhận vé điện tử){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 rounded-xl border border-border-light bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm font-bold transition-all"
                    value={contactInfo.email}
                    onChange={(e) =>
                      setContactInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* 3. NHẬP GHI CHÚ */}
            <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
              <h3 className="text-lg font-bold mb-2">Ghi chú cho HDV</h3>
              <textarea
                rows="3"
                className="w-full p-4 rounded-xl border border-border-light focus:border-primary outline-none text-sm bg-gray-50 resize-none transition-all"
                placeholder="Bạn có yêu cầu đặc biệt? (VD: Ăn chay, dị ứng, đón tại sảnh...)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-border-light shadow-lg sticky top-24">
              <h3 className="font-bold text-lg mb-4 whitespace-nowrap">
                Tổng thanh toán
              </h3>

              {/* Price display */}
              <div
                className="text-2xl md:text-3xl font-heading font-bold text-primary mb-6 whitespace-nowrap overflow-hidden text-ellipsis"
                title={`${(bookingData.totalPrice || 0).toLocaleString("vi-VN")}đ`}
              >
                {(bookingData.totalPrice || 0).toLocaleString("vi-VN")}đ
              </div>

              <button
                onClick={async () => {
                  // Nếu chưa đăng nhập, chuyển sang trang đăng nhập và giữ lại bookingData
                  if (!user) {
                    navigate("/auth/signin", {
                      state: { redirectTo: location.pathname, bookingData },
                    });
                    return;
                  }

                  // Validate required fields
                  if (!contactInfo.full_name.trim()) {
                    toast.warning("Thiếu thông tin", "Vui lòng nhập họ tên");
                    return;
                  }
                  if (!contactInfo.phone.trim()) {
                    toast.warning("Thiếu thông tin", "Vui lòng nhập số điện thoại");
                    return;
                  }
                  if (!contactInfo.email.trim()) {
                    toast.warning("Thiếu thông tin", "Vui lòng nhập email");
                    return;
                  }

                  setIsSubmitting(true);

                  try {
                    // Tạo booking với status waiting_guide
                    const bookingPayload = {
                      tour_id: bookingData.tourId,
                      start_date: bookingData.date,
                      adults: bookingData.guests.adults,
                      children: bookingData.guests.children,
                      guide_id: bookingData.selectedGuideId || undefined,
                      contact: {
                        full_name: contactInfo.full_name,
                        email: contactInfo.email,
                        phone: contactInfo.phone,
                        note: note.trim() || "",
                      },
                    };

                    const response = await bookingsApi.createBooking(bookingPayload);
                    const booking = response.booking || response;

                    // Thông báo thành công
                    toast.success(
                      "Gửi yêu cầu thành công!",
                      "Yêu cầu đặt tour đã được gửi đến hướng dẫn viên. Bạn sẽ nhận được thông báo khi HDV xác nhận để tiến hành thanh toán."
                    );

                    // Redirect về trang "Chuyến đi của tôi"
                    navigate("/dashboard/tourist/history", {
                      state: {
                        newBookingId: booking._id,
                        message: "Yêu cầu đặt tour đã được gửi. Vui lòng chờ HDV xác nhận.",
                      },
                    });
                  } catch (error) {
                    console.error("Create booking error:", error);
                    
                    // Xử lý lỗi chi tiết từ backend
                    const errorData = error.response?.data;
                    const errorCode = errorData?.code;
                    const errorMessage = errorData?.message || error.message;
                    
                    // Hiển thị thông báo theo loại lỗi
                    switch (errorCode) {
                      case "INSUFFICIENT_SLOTS": {
                        const meta = errorData?.meta || {};
                        toast.error(
                          "Hết chỗ",
                          `Tour ngày này chỉ còn ${meta.remaining || 0} chỗ trống, không đủ cho ${meta.requested || "số người"} bạn yêu cầu. Vui lòng chọn ngày khác hoặc giảm số lượng khách.`
                        );
                        break;
                      }
                      case "GUIDE_MARKED_BUSY":
                        toast.warning(
                          "HDV không khả dụng",
                          errorMessage || "Hướng dẫn viên đã bận vào ngày này. Vui lòng chọn ngày khác."
                        );
                        break;
                      case "GUIDE_HAS_BOOKING":
                        toast.warning(
                          "HDV đã có lịch",
                          errorMessage || "Hướng dẫn viên đã có booking khác vào thời gian này."
                        );
                        break;
                      case "ALL_GUIDES_BUSY":
                        toast.error(
                          "Không có HDV",
                          "Tất cả hướng dẫn viên đều bận vào ngày này. Vui lòng chọn ngày khác."
                        );
                        break;
                      case "BLACKOUT_DATE":
                        toast.error(
                          "Ngày không khả dụng",
                          "Tour không hoạt động vào ngày này. Vui lòng chọn ngày khác."
                        );
                        break;
                      case "CLOSED_WEEKDAY":
                        toast.error(
                          "Ngày nghỉ",
                          errorMessage || "Tour không hoạt động vào ngày này trong tuần."
                        );
                        break;
                      default:
                        toast.error(
                          "Đặt tour thất bại",
                          errorMessage || "Có lỗi xảy ra, vui lòng thử lại!"
                        );
                    }
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <IconLoader className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Xác nhận đặt tour <IconArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-xs text-text-secondary text-center mt-4">
                Sau khi HDV xác nhận, bạn sẽ được thông báo để tiến hành thanh toán.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
