import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import IconArrowRight from "../../icons/IconArrowRight";
import IconChevronLeft from "../../icons/IconChevronLeft";

// Mock data phòng trường hợp user vào thẳng link này mà không qua bước chọn
const MOCK_DATA = {
  tourName: "Bí mật Hoàng cung Huế & Trải nghiệm trà chiều",
  date: "2025-05-20",
  guests: { adults: 2, children: 0 },
  guide: { name: "Minh Hương" },
  totalPrice: 1800000,
};

export default function BookingStepReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [note, setNote] = useState("");

  // Lấy dữ liệu từ state (được gửi từ trang trước), nếu không có thì dùng Mock để test UI
  const bookingData = location.state || MOCK_DATA;

  // Nếu muốn chặn truy cập trực tiếp (uncomment dòng dưới khi chạy thật)
  // useEffect(() => { if (!location.state) navigate("/"); }, [navigate, location.state]);

  return (
    <div className="min-h-screen bg-bg-main py-8 md:py-12">
      <div className="container-main max-w-4xl">
        {/* Stepper: Step 1 active */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className="flex items-center gap-4">
            {/* Step 1: Active */}
            <div className="flex items-center gap-2 text-primary">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <span className="text-sm font-bold">Thông tin</span>
            </div>

            <div className="w-8 h-[1px] bg-gray-300"></div>

            {/* Step 2: Inactive */}
            <div className="flex items-center gap-2 text-text-secondary opacity-60">
              <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className="text-sm font-bold hidden md:block">
                Thanh toán
              </span>
            </div>

            <div className="w-8 h-[1px] bg-gray-300"></div>

            {/* Step 3: Inactive */}
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
                    {bookingData.guide?.name || "Ngẫu nhiên"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. FORM NHẬP THÔNG TIN LIÊN HỆ */}
            <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Thông tin liên hệ</h3>
                <button className="text-sm text-primary font-bold hover:underline">
                  Tự động điền
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary uppercase font-bold">
                    Họ tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-xl border border-border-light bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm font-bold transition-all"
                    defaultValue="Hoàng Nam"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary uppercase font-bold">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full p-3 rounded-xl border border-border-light bg-gray-50 focus:bg-white focus:border-primary outline-none text-sm font-bold transition-all"
                    defaultValue="0905 123 456"
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
                    defaultValue="hoangnam@email.com"
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
                title={`${bookingData.totalPrice?.toLocaleString()}đ`}
              >
                {bookingData.totalPrice?.toLocaleString()}đ
              </div>

              <button
                onClick={() =>
                  navigate("/booking/payment", {
                    state: { ...bookingData, note },
                  })
                }
                className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
              >
                Tiến hành Thanh toán <IconArrowRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-text-secondary text-center mt-4">
                Bằng việc tiếp tục, bạn đồng ý với điều khoản sử dụng của Vi Vu
                Cố Đô.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
