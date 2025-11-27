import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IconUser } from "../../../icons/IconUser";
import {
  IconCalendar,
  IconStar,
  IconMapPin,
  IconCheck,
} from "../../../icons/IconBox";

// Inline SVG Icons
const IconMail = ({ className }) => (
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
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconPhone = ({ className }) => (
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
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconCamera = ({ className }) => (
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
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

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

// [NEW] Icon riêng cho phần thanh toán (Inline SVG)
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
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
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
const IconPlus = ({ className }) => (
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
    <path d="M12 5v14" />
  </svg>
);

// --- MOCK DATA ---
const initialData = {
  firstName: "Hoàng",
  lastName: "Nam",
  email: "hoangnam@gmail.com",
  phone: "0905 123 456",
  address: "12 Lê Lợi, TP. Huế",
  avatar:
    "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_4.jpg",
  stats: { toursCompleted: 5, reviewsWritten: 3 },
  // [NEW] Dữ liệu ví
  wallet: {
    balance: "1.500.000đ",
    cards: [
      { id: 1, type: "momo", number: "0905***456", active: true },
      { id: 2, type: "visa", number: "**** **** **** 4582", active: false },
    ],
  },
};

export default function ProfilePage() {
  const [formData, setFormData] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Hồ sơ & Cài đặt
        </h1>
        <p className="text-text-secondary text-sm">
          Quản lý thông tin cá nhân, thanh toán và bảo mật.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- LEFT COLUMN: AVATAR & STATS --- */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-border-light shadow-sm text-center relative">
            <div className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-bg-main">
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <IconCamera className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-text-primary mb-1">
              {formData.lastName} {formData.firstName}
            </h2>
            <p className="text-sm text-text-secondary mb-6">Tham gia từ 2023</p>

            <div className="grid grid-cols-2 gap-4 border-t border-border-light pt-6">
              <div className="text-center">
                <span className="block text-2xl font-bold text-primary">
                  {formData.stats.toursCompleted}
                </span>
                <div className="flex items-center justify-center gap-1 text-xs text-text-secondary mt-1">
                  <IconCalendar className="w-3 h-3" /> Chuyến đi
                </div>
              </div>
              <div className="text-center border-l border-border-light">
                <span className="block text-2xl font-bold text-secondary">
                  {formData.stats.reviewsWritten}
                </span>
                <div className="flex items-center justify-center gap-1 text-xs text-text-secondary mt-1">
                  <IconStar className="w-3 h-3" /> Đánh giá
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: FORMS --- */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. General Info */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-border-light shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <IconUser className="w-5 h-5 text-primary" /> Thông tin chung
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm font-bold text-primary hover:underline"
              >
                {isEditing ? "Hủy" : "Chỉnh sửa"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Họ & Tên đệm
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl bg-bg-main/50 border border-border-light focus:border-primary outline-none text-sm transition-all disabled:opacity-70"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Tên
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl bg-bg-main/50 border border-border-light focus:border-primary outline-none text-sm transition-all disabled:opacity-70"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-border-light text-text-secondary outline-none text-sm cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-xl bg-bg-main/50 border border-border-light focus:border-primary outline-none text-sm transition-all disabled:opacity-70"
                />
              </div>
            </div>
          </div>

          {/* [NEW] 2. WALLET & PAYMENT (Được chuyển vào đây) */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-border-light shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <IconWallet className="w-5 h-5 text-primary" /> Phương thức
                thanh toán
              </h3>
              <Link
                to="/dashboard/tourist/transaction-history"
                className="text-xs font-bold text-text-secondary hover:text-primary"
              >
                Lịch sử giao dịch
              </Link>
            </div>

            <div className="space-y-4">
              {/* Payment Methods List */}
              <div className="flex flex-col gap-3">
                {/* Momo Item */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-primary bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#A50064] flex items-center justify-center text-white font-bold text-xs">
                      MoMo
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">
                        Ví MoMo
                      </p>
                      <p className="text-xs text-text-secondary">
                        {formData.wallet.cards[0].number}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-primary text-white text-[10px] font-bold rounded">
                    Mặc định
                  </span>
                </div>

                {/* Visa Item */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border-light hover:border-primary/50 transition-colors cursor-pointer bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-900 flex items-center justify-center text-white">
                      <IconCreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">
                        Visa **** 4582
                      </p>
                      <p className="text-xs text-text-secondary">
                        Hết hạn 12/26
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add New */}
                <button className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border-light text-text-secondary hover:text-primary hover:border-primary hover:bg-primary/5 transition-all">
                  <IconPlus className="w-4 h-4" /> Thêm phương thức mới
                </button>
              </div>
            </div>
          </div>

          {/* 3. Security */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-border-light shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <IconLock className="w-5 h-5 text-primary" /> Bảo mật
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border-light bg-bg-main/30">
                <div>
                  <p className="font-bold text-sm text-text-primary">
                    Đổi mật khẩu
                  </p>
                  <p className="text-xs text-text-secondary">
                    Lần đổi cuối: 3 tháng trước
                  </p>
                </div>
                <button className="px-4 py-2 rounded-lg border border-border-light bg-white text-xs font-bold hover:border-primary hover:text-primary transition-all">
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
