import React, { useState } from "react";
import { IconCheck, IconMapPin } from "../../../icons/IconBox";
import { IconUser } from "../../../icons/IconUser";
import IconMail from "../../../icons/IconMail";
import IconPhone from "../../../icons/IconPhone";
import {
  IconCamera,
  IconVideo,
  IconShield,
  IconGlobe,
  IconWallet,
  IconFileText,
  IconBank,
  IconUpload,
} from "../../../icons/IconCommon";

export default function GuideProfileSettings() {
  const [activeTab, setActiveTab] = useState("public"); // public | identity | finance

  // Mock Data
  const [profile, setProfile] = useState({
    name: "Minh Hương",
    title: "Nhà sử học & Văn hóa",
    bio: "Xin chào! Tôi là Hương, người con của Thành Nội. Tôi muốn kể cho bạn nghe những câu chuyện lịch sử sống động đằng sau từng viên gạch của Cố đô.",
    languages: "Tiếng Việt, English",
    phone: "0905 123 456",
    email: "huong.guide@vivucodo.com",
    address: "Thành Nội, Huế",
    bankName: "Vietcombank",
    bankNumber: "9999 8888 7777",
    certNumber: "123456789",
  });

  // Tabs Configuration
  const tabs = [
    { id: "public", label: "Thông tin công khai", icon: IconUser },
    { id: "identity", label: "Định danh & Chứng chỉ", icon: IconShieldCheck },
    { id: "finance", label: "Tài khoản nhận tiền", icon: IconWallet },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Hồ sơ & Cài đặt
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Quản lý thông tin hiển thị và tài khoản nhận tiền.
          </p>
        </div>
        <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          Xem trang hồ sơ
        </button>
      </div>

      {/* Improved Tabs */}
      <div className="flex p-1 bg-white border border-border-light rounded-xl overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                        flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                        ${
                          isActive
                            ? "bg-bg-main text-primary shadow-sm border border-border-light"
                            : "text-text-secondary hover:bg-gray-50"
                        }
                    `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- TAB 1: PUBLIC PROFILE --- */}
      {activeTab === "public" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* Left: Avatar & Status */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm text-center">
              <div className="relative w-36 h-36 mx-auto mb-4 group cursor-pointer">
                <img
                  src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/guides/guide_female_1.jpg"
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-md group-hover:opacity-90 transition-opacity"
                  alt="Avatar"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 rounded-full p-2 text-white backdrop-blur-sm">
                    <IconCamera className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                {profile.name}
              </h2>
              <p className="text-xs text-text-secondary mb-4">
                Hồ sơ đã hoàn tất 90%
              </p>

              <div className="flex flex-col gap-2">
                <button className="w-full py-2 rounded-lg border border-border-light text-xs font-bold text-text-secondary hover:text-primary hover:border-primary transition-all">
                  Tải ảnh mới
                </button>
                <button className="w-full py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-all">
                  Xóa ảnh
                </button>
              </div>
            </div>
          </div>

          {/* Right: Form Fields */}
          <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-border-light shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Họ và tên
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.name}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm font-bold"
                  />
                  <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Chức danh (Tagline)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.title}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm"
                  />
                  <IconFileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Giới thiệu bản thân (Bio)
              </label>
              <textarea
                rows="4"
                value={profile.bio}
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm resize-none leading-relaxed"
              ></textarea>
              <p className="text-[10px] text-text-secondary text-right">
                Một bio ấn tượng giúp tăng 30% tỉ lệ đặt tour.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Ngôn ngữ
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.languages}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm"
                  />
                  <IconGlobe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Số điện thoại
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={profile.phone}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm"
                  />
                  <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Video giới thiệu (URL Youtube)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://youtube.com/..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm"
                />
                <IconVideo className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-border-light">
              <button className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: IDENTITY (Improved UI) --- */}
      {activeTab === "identity" && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex gap-4 items-start">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm shrink-0">
              <IconShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-green-800">
                Tài khoản đã được xác thực
              </h3>
              <p className="text-sm text-green-700/80 mt-1">
                Thông tin định danh của bạn đã được Admin phê duyệt. Bạn có thể
                bắt đầu nhận tour ngay lập tức.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-border-light shadow-sm space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Số thẻ HDV / CCCD
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.certNumber}
                  disabled
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-border-light text-text-primary font-bold text-sm cursor-not-allowed"
                />
                <IconCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Mặt trước thẻ
                </label>
                <div className="aspect-video rounded-2xl border-2 border-dashed border-border-light bg-bg-main/30 flex flex-col items-center justify-center text-text-secondary hover:bg-bg-main hover:border-primary/50 transition-all cursor-not-allowed opacity-70">
                  <IconShieldCheck className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs font-bold">Đã tải lên</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Mặt sau thẻ
                </label>
                <div className="aspect-video rounded-2xl border-2 border-dashed border-border-light bg-bg-main/30 flex flex-col items-center justify-center text-text-secondary hover:bg-bg-main hover:border-primary/50 transition-all cursor-not-allowed opacity-70">
                  <IconShieldCheck className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs font-bold">Đã tải lên</span>
                </div>
              </div>
            </div>

            <div className="pt-4 text-center">
              <p className="text-xs text-text-secondary">
                Thông tin định danh không thể tự chỉnh sửa. <br />
                Vui lòng liên hệ{" "}
                <span className="text-primary font-bold cursor-pointer hover:underline">
                  Bộ phận hỗ trợ
                </span>{" "}
                nếu cần thay đổi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: FINANCE (Visual Upgrade) --- */}
      {activeTab === "finance" && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          {/* Card Preview Visual */}
          <div className="bg-gradient-to-br from-[#2C3E50] to-[#4CA1AF] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                  Ngân hàng thụ hưởng
                </p>
                <h3 className="text-2xl font-heading font-bold tracking-wide">
                  Vietcombank
                </h3>
              </div>
              <IconWallet className="w-8 h-8 opacity-80" />
            </div>
            <div className="relative z-10 mt-8">
              <p className="text-2xl font-mono tracking-widest mb-4">
                {profile.bankNumber}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-white/70 uppercase">
                    Chủ tài khoản
                  </p>
                  <p className="font-bold uppercase tracking-wide">
                    {profile.name}
                  </p>
                </div>
                <IconCheck className="w-6 h-6 text-green-400" />
              </div>
            </div>
            {/* Decor */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-border-light shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Cập nhật tài khoản
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Ngân hàng
                </label>
                <div className="relative">
                  <select className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm font-bold appearance-none cursor-pointer">
                    <option>Vietcombank</option>
                    <option>Techcombank</option>
                    <option>MB Bank</option>
                  </select>
                  <IconBank className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Số tài khoản
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.bankNumber}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm font-mono"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs font-bold">
                    #
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Tên chủ tài khoản
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.name.toUpperCase()}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm font-bold uppercase"
                />
                <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              </div>
            </div>

            <div className="pt-4">
              <button className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
                Lưu thông tin ngân hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
