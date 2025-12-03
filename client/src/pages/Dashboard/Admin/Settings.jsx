import React, { useState, useEffect } from "react";
import { useToast } from "../../../components/Toast/useToast";
import { IconCheck } from "../../../icons/IconBox";
import {
  IconSettings,
  IconWallet,
  IconLock,
  IconEye,
  IconEyeOff,
  IconRefresh,
  IconCreditCard,
  IconShield,
  IconInfo,
} from "../../../icons/IconCommon";
import Spinner from "../../../components/Loaders/Spinner";
import {
  usePaymentSettings,
  useUpdatePaymentSetting,
} from "../../../features/admin/hooks";

export default function AdminSettings() {
  const toast = useToast();

  // API Hooks
  const { settings, isLoading, error, refetch } = usePaymentSettings();
  const { update: updateSetting, isLoading: isUpdating } =
    useUpdatePaymentSetting();

  // Local state for MoMo form
  const [momoConfig, setMomoConfig] = useState({
    is_active: false,
    partnerCode: "",
    accessKey: "",
    secretKey: "",
  });

  const [showMomoSecret, setShowMomoSecret] = useState(false);
  const [showMomoAccessKey, setShowMomoAccessKey] = useState(false);

  // Sync API data to local state
  useEffect(() => {
    if (settings && settings.length > 0) {
      const momo = settings.find((s) => s.gateway === "momo");

      if (momo) {
        setMomoConfig({
          is_active: momo.is_active || false,
          partnerCode: momo.config_masked?.partnerCode || "",
          accessKey: momo.config_masked?.accessKey || "",
          secretKey: momo.config_masked?.secretKey || "",
        });
      }
    }
  }, [settings]);

  // Track if user has changed the values (to know what to send)
  const [momoChanged, setMomoChanged] = useState({
    partnerCode: false,
    accessKey: false,
    secretKey: false,
  });

  const handleSaveMomo = async () => {
    try {
      const configToSend = {};

      if (momoChanged.partnerCode && momoConfig.partnerCode) {
        configToSend.partnerCode = momoConfig.partnerCode;
      }
      if (momoChanged.accessKey && momoConfig.accessKey) {
        configToSend.accessKey = momoConfig.accessKey;
      }
      if (momoChanged.secretKey && momoConfig.secretKey) {
        configToSend.secretKey = momoConfig.secretKey;
      }

      await updateSetting("momo", {
        is_active: momoConfig.is_active,
        ...(Object.keys(configToSend).length > 0 && { config: configToSend }),
      });

      toast.success("Thành công!", "Đã lưu cấu hình MoMo!");
      setMomoChanged({
        partnerCode: false,
        accessKey: false,
        secretKey: false,
      });
      refetch();
    } catch (err) {
      toast.error("Lỗi!", err?.message || "Không thể lưu cấu hình MoMo.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto pb-20 space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 font-bold">Lỗi: {error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Cấu hình hệ thống
          </h1>
          <p className="text-text-secondary text-sm">
            Thiết lập các thông số vận hành và cổng thanh toán.
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white border border-border-light rounded-xl hover:bg-gray-50 transition-colors"
        >
          <IconRefresh
            className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Làm mới
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <IconWallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Phí nền tảng</p>
              <p className="text-xl font-bold text-primary">15%</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-xl text-green-600">
              <IconShield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Cổng thanh toán</p>
              <p className="text-xl font-bold text-green-600">
                {momoConfig.is_active ? "Hoạt động" : "Tắt"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
              <IconCreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-text-secondary">Phương thức</p>
              <p className="text-xl font-bold text-blue-600">MoMo</p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. COMMISSION INFO (Read-only, configured via env) */}
      <div className="bg-white p-8 rounded-3xl border border-border-light shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <IconWallet className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">
                Phí nền tảng (Commission)
              </h3>
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                Chỉ đọc
              </span>
            </div>
            <p className="text-text-secondary text-sm">
              Mức phí hoa hồng thu trên mỗi booking thành công của HDV.
            </p>
          </div>
        </div>

        <div className="max-w-xs">
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
            <p className="text-xs font-bold text-text-secondary uppercase mb-1">
              Mức phí hiện tại
            </p>
            <p className="text-3xl font-bold text-primary">15%</p>
            <p className="text-xs text-text-secondary mt-2">
              Ví dụ: Tour 1.000.000đ → Phí sàn = 150.000đ
            </p>
          </div>
          <p className="text-xs text-text-secondary mt-3 italic">
            * Phí nền tảng được cấu hình trong hệ thống. Liên hệ quản trị viên
            để thay đổi.
          </p>
        </div>
      </div>

      {/* 2. PAYMENT GATEWAY - MoMo only */}
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
              Cấu hình API Key cho MoMo.
            </p>
          </div>
        </div>

        {/* MoMo Config */}
        <div
          className={`p-6 rounded-2xl border transition-all ${
            momoConfig.is_active
              ? "border-pink-200 bg-pink-50/30"
              : "border-border-light bg-gray-50 opacity-70"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#A50064] text-lg">
                MoMo Wallet
              </span>
              {momoConfig.is_active && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                  Đang bật
                </span>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={momoConfig.is_active}
                onChange={() =>
                  setMomoConfig({
                    ...momoConfig,
                    is_active: !momoConfig.is_active,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-text-secondary">
                Partner Code
              </label>
              <input
                type="text"
                value={momoConfig.partnerCode}
                onChange={(e) => {
                  setMomoConfig({
                    ...momoConfig,
                    partnerCode: e.target.value,
                  });
                  setMomoChanged({ ...momoChanged, partnerCode: true });
                }}
                placeholder="Nhập Partner Code..."
                disabled={!momoConfig.is_active}
                className="w-full px-4 py-2 rounded-lg border border-border-light bg-white text-sm font-mono disabled:opacity-50"
              />
            </div>
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-text-secondary">
                Access Key
              </label>
              <div className="relative">
                <input
                  type={showMomoAccessKey ? "text" : "password"}
                  value={momoConfig.accessKey}
                  onChange={(e) => {
                    setMomoConfig({
                      ...momoConfig,
                      accessKey: e.target.value,
                    });
                    setMomoChanged({ ...momoChanged, accessKey: true });
                  }}
                  placeholder="Nhập Access Key..."
                  disabled={!momoConfig.is_active}
                  className="w-full px-4 py-2 rounded-lg border border-border-light bg-white text-sm font-mono pr-10 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowMomoAccessKey(!showMomoAccessKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                  disabled={!momoConfig.is_active}
                >
                  {showMomoAccessKey ? (
                    <IconEyeOff className="w-4 h-4" />
                  ) : (
                    <IconEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-1 relative">
              <label className="text-xs font-bold text-text-secondary">
                Secret Key
              </label>
              <div className="relative">
                <input
                  type={showMomoSecret ? "text" : "password"}
                  value={momoConfig.secretKey}
                  onChange={(e) => {
                    setMomoConfig({
                      ...momoConfig,
                      secretKey: e.target.value,
                    });
                    setMomoChanged({ ...momoChanged, secretKey: true });
                  }}
                  placeholder="Nhập Secret Key..."
                  disabled={!momoConfig.is_active}
                  className="w-full px-4 py-2 rounded-lg border border-border-light bg-white text-sm font-mono pr-10 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowMomoSecret(!showMomoSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                  disabled={!momoConfig.is_active}
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

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveMomo}
              disabled={isUpdating}
              className="px-4 py-2 bg-[#A50064] text-white rounded-lg font-bold text-sm hover:bg-[#8a0054] disabled:opacity-50 flex items-center gap-2"
            >
              {isUpdating ? (
                <IconRefresh className="w-4 h-4 animate-spin" />
              ) : (
                <IconCheck className="w-4 h-4" />
              )}
              Lưu cấu hình
            </button>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <IconSettings className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800 font-medium">Lưu ý bảo mật</p>
          <p className="text-xs text-amber-700 mt-1">
            Các khóa bí mật được hiển thị dưới dạng đã che (masked). Khi bạn
            nhập giá trị mới và lưu, hệ thống sẽ cập nhật giá trị mới. Nếu không
            thay đổi, giá trị cũ sẽ được giữ nguyên.
          </p>
        </div>
      </div>
    </div>
  );
}
