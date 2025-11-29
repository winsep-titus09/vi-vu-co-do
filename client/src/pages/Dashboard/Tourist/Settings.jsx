import React, { useEffect, useRef, useState } from "react";
import { IconChevronDown } from "../../../icons/IconChevronDown";
import { IconBell, IconDisplay, IconTrash } from "../../../icons/IconCommon";

// Options cho 3D Quality
const QUALITY_OPTIONS = [
  { value: "auto", label: "Tự động (Khuyên dùng)" },
  { value: "low", label: "Tiết kiệm dữ liệu (Thấp)" },
  { value: "high", label: "Chất lượng cao (HD)" },
];

// Options cho Tiền tệ
const CURRENCY_OPTIONS = [
  { value: "vnd", label: "VND (Việt Nam Đồng)" },
  { value: "usd", label: "USD (US Dollar)" },
];

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    booking: true,
    promo: false,
    system: true,
  });

  // State cho Settings mới
  const [quality3D, setQuality3D] = useState(QUALITY_OPTIONS[0]);
  const [currency, setCurrency] = useState(CURRENCY_OPTIONS[0]);

  // Dropdown States
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const qualityRef = useRef(null);
  const currencyRef = useRef(null);

  // Click Outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (qualityRef.current && !qualityRef.current.contains(event.target)) {
        setIsQualityOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setIsCurrencyOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Cài đặt hệ thống
        </h1>
        <p className="text-text-secondary text-sm">
          Tùy chỉnh trải nghiệm sử dụng ứng dụng của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Notification Settings (Giữ nguyên) */}
        <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm h-fit">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-6">
            <IconBell className="w-5 h-5 text-primary" /> Thông báo
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text-primary">
                  Cập nhật chuyến đi
                </p>
                <p className="text-xs text-text-secondary">
                  Thông báo khi booking được xác nhận hoặc hủy.
                </p>
              </div>
              <div className="relative inline-block w-11 h-6 align-middle select-none">
                <input
                  type="checkbox"
                  checked={notifications.booking}
                  onChange={() => handleToggle("booking")}
                  className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-all duration-300 checked:right-0 checked:border-green-500 right-5"
                />
                <label
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ${
                    notifications.booking ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text-primary">
                  Tin tức & Khuyến mãi
                </p>
                <p className="text-xs text-text-secondary">
                  Nhận email về các ưu đãi tour mới nhất.
                </p>
              </div>
              <div className="relative inline-block w-11 h-6 align-middle select-none">
                <input
                  type="checkbox"
                  checked={notifications.promo}
                  onChange={() => handleToggle("promo")}
                  className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-all duration-300 checked:right-0 checked:border-green-500 right-5"
                />
                <label
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ${
                    notifications.promo ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text-primary">Hệ thống</p>
                <p className="text-xs text-text-secondary">
                  Thông báo bảo trì hoặc cập nhật tính năng.
                </p>
              </div>
              <div className="relative inline-block w-11 h-6 align-middle select-none">
                <input
                  type="checkbox"
                  checked={notifications.system}
                  onChange={() => handleToggle("system")}
                  className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-all duration-300 checked:right-0 checked:border-green-500 right-5"
                />
                <label
                  className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ${
                    notifications.system ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></label>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Preferences & Danger Zone */}
        <div className="space-y-8">
          {/* Display & 3D settings */}
          <div className="bg-white p-6 rounded-3xl border border-border-light shadow-sm overflow-visible">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-6">
              <IconDisplay className="w-5 h-5 text-primary" /> Trải nghiệm &
              Hiển thị
            </h3>
            <div className="space-y-5">
              {/* 3D Quality Setting */}
              <div className="space-y-2" ref={qualityRef}>
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Chất lượng Mô hình 3D
                </label>
                <div className="relative">
                  <div
                    onClick={() => setIsQualityOpen(!isQualityOpen)}
                    className={`
                                w-full px-4 py-3 rounded-xl border bg-bg-main/50 flex items-center justify-between cursor-pointer transition-all select-none
                                ${
                                  isQualityOpen
                                    ? "border-primary ring-1 ring-primary bg-white"
                                    : "border-border-light hover:border-primary/50"
                                }
                            `}
                  >
                    <span className="text-sm font-medium text-text-primary">
                      {quality3D.label}
                    </span>
                    <IconChevronDown
                      className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${
                        isQualityOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </div>
                  {isQualityOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-border-light py-2 z-50 animate-fade-in-up overflow-hidden">
                      {QUALITY_OPTIONS.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setQuality3D(opt);
                            setIsQualityOpen(false);
                          }}
                          className={`px-4 py-3 cursor-pointer transition-colors text-sm ${
                            quality3D.value === opt.value
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-text-primary hover:bg-bg-main"
                          }`}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-text-secondary italic">
                  Giảm chất lượng giúp tải nhanh hơn trên thiết bị yếu.
                </p>
              </div>

              {/* Currency Setting */}
              <div className="space-y-2" ref={currencyRef}>
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Đơn vị tiền tệ
                </label>
                <div className="relative">
                  <div
                    onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                    className={`
                                w-full px-4 py-3 rounded-xl border bg-bg-main/50 flex items-center justify-between cursor-pointer transition-all select-none
                                ${
                                  isCurrencyOpen
                                    ? "border-primary ring-1 ring-primary bg-white"
                                    : "border-border-light hover:border-primary/50"
                                }
                            `}
                  >
                    <span className="text-sm font-medium text-text-primary">
                      {currency.label}
                    </span>
                    <IconChevronDown
                      className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${
                        isCurrencyOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </div>
                  {isCurrencyOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-border-light py-2 z-50 animate-fade-in-up overflow-hidden">
                      {CURRENCY_OPTIONS.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            setCurrency(opt);
                            setIsCurrencyOpen(false);
                          }}
                          className={`px-4 py-3 cursor-pointer transition-colors text-sm ${
                            currency.value === opt.value
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-text-primary hover:bg-bg-main"
                          }`}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Delete Account (Giữ nguyên) */}
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-2">
              <IconTrash className="w-5 h-5" /> Vùng nguy hiểm
            </h3>
            <p className="text-sm text-red-500/80 mb-6 leading-relaxed">
              Xóa tài khoản sẽ xóa vĩnh viễn toàn bộ lịch sử đặt tour và thông
              tin cá nhân của bạn. Hành động này không thể hoàn tác.
            </p>
            <button className="w-full py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm">
              Yêu cầu xóa tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
