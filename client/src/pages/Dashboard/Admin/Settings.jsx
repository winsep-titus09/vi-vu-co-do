import React, { useState } from "react";
import { IconCheck } from "../../../icons/IconBox";

// --- INLINE ICONS ---
const IconSettings = ({ className }) => (
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
    {" "}
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />{" "}
    <circle cx="12" cy="12" r="3" />{" "}
  </svg>
);
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
    {" "}
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />{" "}
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />{" "}
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />{" "}
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
    {" "}
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />{" "}
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />{" "}
  </svg>
);
const IconEye = ({ className }) => (
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
    {" "}
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />{" "}
    <circle cx="12" cy="12" r="3" />{" "}
  </svg>
);
const IconEyeOff = ({ className }) => (
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
    {" "}
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />{" "}
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />{" "}
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />{" "}
    <line x1="2" x2="22" y1="2" y2="22" />{" "}
  </svg>
);
const IconRefresh = ({ className }) => (
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
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

export default function AdminSettings() {
  const [config, setConfig] = useState({
    commissionRate: 10,
    vnpayEnabled: true,
    momoEnabled: true,
    vnpayTmnCode: "VNPAY_DEMO",
    vnpaySecret: "****************",
    momoPartnerCode: "MOMO_DEMO",
    momoSecret: "****************",
  });

  const [showVnPaySecret, setShowVnPaySecret] = useState(false);
  const [showMomoSecret, setShowMomoSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // [NEW] Loading state

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Đã lưu cấu hình hệ thống!");
    }, 1500); // Fake API delay
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Cấu hình hệ thống
        </h1>
        <p className="text-text-secondary text-sm">
          Thiết lập các thông số vận hành và cổng thanh toán.
        </p>
      </div>

      {/* 1. COMMISSION SETTING */}
      <div className="bg-white p-8 rounded-3xl border border-border-light shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <IconWallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              Phí nền tảng (Commission)
            </h3>
            <p className="text-text-secondary text-sm">
              Mức phí hoa hồng thu trên mỗi booking thành công của HDV.
            </p>
          </div>
        </div>

        <div className="max-w-xs">
          <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
            Mức phí (%)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={config.commissionRate}
              onChange={(e) =>
                setConfig({
                  ...config,
                  commissionRate: Math.min(100, Math.max(0, e.target.value)),
                })
              } // [IMPROVED] Limit 0-100
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-border-light focus:border-primary outline-none text-lg font-bold"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">
              %
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Ví dụ: Tour 1.000.000đ, phí {config.commissionRate}% ={" "}
            {((1000000 * config.commissionRate) / 100).toLocaleString()}đ doanh
            thu sàn.
          </p>
        </div>
      </div>

      {/* 2. PAYMENT GATEWAYS */}
      <div className="bg-white p-8 rounded-3xl border border-border-light shadow-sm">
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl">
            <IconLock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              Cổng thanh toán
            </h3>
            <p className="text-text-secondary text-sm">
              Cấu hình API Key cho VNPay và MoMo.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* VNPay Config */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              config.vnpayEnabled
                ? "border-blue-200 bg-blue-50/30"
                : "border-border-light bg-gray-50 opacity-70"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-700 text-lg">VNPay</span>
                {config.vnpayEnabled && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                    Đang bật
                  </span>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.vnpayEnabled}
                  onChange={() =>
                    setConfig({ ...config, vnpayEnabled: !config.vnpayEnabled })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary">
                  TMN Code
                </label>
                <input
                  type="text"
                  value={config.vnpayTmnCode}
                  disabled={!config.vnpayEnabled}
                  className="w-full px-4 py-2 rounded-lg border border-border-light bg-white text-sm font-mono"
                />
              </div>
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-text-secondary">
                  Hash Secret
                </label>
                <div className="relative">
                  <input
                    type={showVnPaySecret ? "text" : "password"}
                    value={config.vnpaySecret}
                    disabled={!config.vnpayEnabled}
                    className="w-full px-4 py-2 rounded-lg border border-border-light bg-white text-sm font-mono pr-10"
                  />
                  <button
                    onClick={() => setShowVnPaySecret(!showVnPaySecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                    disabled={!config.vnpayEnabled}
                  >
                    {showVnPaySecret ? (
                      <IconEyeOff className="w-4 h-4" />
                    ) : (
                      <IconEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* MoMo Config */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              config.momoEnabled
                ? "border-pink-200 bg-pink-50/30"
                : "border-border-light bg-gray-50 opacity-70"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#A50064] text-lg">
                  MoMo Wallet
                </span>
                {config.momoEnabled && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                    Đang bật
                  </span>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.momoEnabled}
                  onChange={() =>
                    setConfig({ ...config, momoEnabled: !config.momoEnabled })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-text-secondary">
                  Partner Code
                </label>
                <input
                  type="text"
                  value={config.momoPartnerCode}
                  disabled={!config.momoEnabled}
                  className="w-full px-4 py-2 rounded-lg border border-border-light bg-white text-sm font-mono"
                />
              </div>
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-text-secondary">
                  Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showMomoSecret ? "text" : "password"}
                    value={config.momoSecret}
                    disabled={!config.momoEnabled}
                    className="w-full px-4 py-2 rounded-lg border border-border-light bg-white text-sm font-mono pr-10"
                  />
                  <button
                    onClick={() => setShowMomoSecret(!showMomoSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                    disabled={!config.momoEnabled}
                  >
                    {showMomoSecret ? (
                      <IconEyeOff className="w-4 h-4" />
                    ) : (
                      <IconEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end sticky bottom-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            px-8 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2 transition-all
            ${isSaving ? "opacity-70 cursor-not-allowed" : "active:scale-95"}
          `}
        >
          {isSaving ? (
            <>
              <IconRefresh className="w-5 h-5 animate-spin" /> Đang lưu...
            </>
          ) : (
            <>
              <IconCheck className="w-5 h-5" /> Lưu cấu hình
            </>
          )}
        </button>
      </div>
    </div>
  );
}
