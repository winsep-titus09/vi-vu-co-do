import React, { useState } from "react";
import { useToast } from "../../../components/Toast/useToast";
import { IconCheck } from "../../../icons/IconBox";
import {
  IconSettings,
  IconWallet,
  IconLock,
  IconEye,
  IconEyeOff,
  IconRefresh,
} from "../../../icons/IconCommon";

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
  const [isSaving, setIsSaving] = useState(false); // Loading state

  const toast = useToast();

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Thành công!", "Đã lưu cấu hình hệ thống!");
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
