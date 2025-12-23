import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { IconChevronDown } from "../../../icons/IconChevronDown";
import {
  IconBell,
  IconDisplay,
  IconTrash,
  IconLoader,
  IconBriefcase,
} from "../../../icons/IconCommon";
import { IconCheck } from "../../../icons/IconBox";
import {
  useMyGuideApplication,
  useApplyToBeGuide,
} from "../../../features/guides/hooks";
import {
  useUserPreferences,
  useDeleteAccountRequest,
} from "../../../features/users/hooks";
import { useToast } from "../../../components/Toast/useToast";
import ConfirmModal from "../../../components/Modals/ConfirmModal";

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

// Ngôn ngữ hỗ trợ lựa chọn (có thể chọn nhiều)
const AVAILABLE_LANGUAGES = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "ru", label: "Русский" },
  { code: "th", label: "ไทย" },
];

export default function SettingsPage() {
  const location = useLocation();
  const toast = useToast();

  // User preferences từ API
  const { preferences, updatePreferences, toggleNotification } =
    useUserPreferences();

  // Delete account request hook
  const {
    deleteRequest,
    isLoading: deleteLoading,
    isSubmitting: deleteSubmitting,
    requestDelete,
    cancelRequest,
  } = useDeleteAccountRequest();

  // Local state để hiển thị (sync với preferences từ API)
  const [notifications, setNotifications] = useState({
    booking: true,
    promo: false,
    system: true,
  });

  const [quality3D, setQuality3D] = useState(QUALITY_OPTIONS[0]);
  const [currency, setCurrency] = useState(CURRENCY_OPTIONS[0]);

  // Sync local state với preferences từ API
  useEffect(() => {
    if (preferences) {
      setNotifications(
        preferences.notifications || {
          booking: true,
          promo: false,
          system: true,
        }
      );

      const q3d = QUALITY_OPTIONS.find(
        (o) => o.value === preferences.display?.quality_3d
      );
      setQuality3D(q3d || QUALITY_OPTIONS[0]);

      const curr = CURRENCY_OPTIONS.find(
        (o) => o.value === preferences.display?.currency
      );
      setCurrency(curr || CURRENCY_OPTIONS[0]);
    }
  }, [preferences]);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Dropdown States
  const [isQualityOpen, setIsQualityOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  // Guide Application States
  const [showGuideForm, setShowGuideForm] = useState(false);
  const [guideFormData, setGuideFormData] = useState({
    about: "",
    expertise: "",
    languages: ["vi"],
    experience_years: 0,
    id_cards: [], // File[] từ input
    certificates: [], // File[] từ input (optional)
    bank_info: {
      bank_name: "",
      account_name: "",
      account_number: "",
    },
  });
  const [customLanguage, setCustomLanguage] = useState("");

  // Guide Application Hooks
  const {
    exists: hasApplication,
    status: applicationStatus,
    isLoading: loadingApplication,
    refetch: refetchApplication,
  } = useMyGuideApplication();
  const { apply, isSubmitting } = useApplyToBeGuide();

  const qualityRef = useRef(null);
  const currencyRef = useRef(null);

  // Check if coming from signup with guide intent
  useEffect(() => {
    if (location.state?.showGuideApply) {
      setShowGuideForm(true);
      if (location.state?.message) {
        toast.info("Thông báo", location.state.message);
      }
      // Clear state
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

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

  // Save notification setting to server
  const handleToggle = async (key) => {
    const newValue = !notifications[key];
    // Optimistic update
    setNotifications((prev) => ({ ...prev, [key]: newValue }));

    const result = await toggleNotification(key);
    if (result.success) {
      toast.success("Đã lưu", "Cài đặt thông báo đã được cập nhật");
    } else {
      // Revert on error
      setNotifications((prev) => ({ ...prev, [key]: !newValue }));
      toast.error(
        "Lỗi lưu cài đặt",
        result.error || "Không thể lưu cài đặt thông báo"
      );
    }
  };

  // Save quality to server
  const handleQualityChange = async (opt) => {
    const oldValue = quality3D;
    // Optimistic update
    setQuality3D(opt);
    setIsQualityOpen(false);

    const result = await updatePreferences({
      display: { quality_3d: opt.value },
    });
    if (result.success) {
      toast.success("Đã lưu", `Chất lượng 3D: ${opt.label}`);
    } else {
      // Revert on error
      setQuality3D(oldValue);
      toast.error(
        "Lỗi lưu cài đặt",
        result.error || "Không thể lưu chất lượng 3D"
      );
    }
  };

  // Save currency to server
  const handleCurrencyChange = async (opt) => {
    const oldValue = currency;
    // Optimistic update
    setCurrency(opt);
    setIsCurrencyOpen(false);

    const result = await updatePreferences({
      display: { currency: opt.value },
    });
    if (result.success) {
      toast.success("Đã lưu", `Đơn vị tiền tệ: ${opt.label}`);
    } else {
      // Revert on error
      setCurrency(oldValue);
      toast.error(
        "Lỗi lưu cài đặt",
        result.error || "Không thể lưu đơn vị tiền tệ"
      );
    }
  };

  // Toggle language selection (multi-select)
  const toggleLanguage = (code) => {
    setGuideFormData((prev) => {
      const current = Array.isArray(prev.languages) ? prev.languages : [];
      const exists = current.includes(code);
      const updated = exists
        ? current.filter((l) => l !== code)
        : [...current, code];
      return { ...prev, languages: updated };
    });
  };

  // Add custom language from text input
  const addCustomLanguage = () => {
    const value = customLanguage.trim();
    if (!value) return;
    setGuideFormData((prev) => {
      const current = Array.isArray(prev.languages) ? prev.languages : [];
      if (current.includes(value)) return prev;
      return { ...prev, languages: [...current, value] };
    });
    setCustomLanguage("");
  };

  // Handle delete account request
  const handleDeleteAccount = async () => {
    const result = await requestDelete("Người dùng yêu cầu xóa tài khoản");
    setShowDeleteModal(false);
    if (result.success) {
      toast.success(
        "Yêu cầu đã được gửi",
        "Admin sẽ xem xét và phản hồi yêu cầu xóa tài khoản của bạn."
      );
    } else {
      toast.error(
        "Lỗi gửi yêu cầu",
        result.error || "Không thể gửi yêu cầu xóa tài khoản"
      );
    }
  };

  // Handle cancel delete request
  const handleCancelDeleteRequest = async () => {
    const result = await cancelRequest();
    if (result.success) {
      toast.success("Đã hủy", "Yêu cầu xóa tài khoản đã được hủy.");
    } else {
      toast.error(
        "Lỗi hủy yêu cầu",
        result.error || "Không thể hủy yêu cầu xóa tài khoản"
      );
    }
  };

  // Handle guide application submit
  const handleGuideApply = async () => {
    if (!guideFormData.about.trim()) {
      toast.warning("Thiếu thông tin", "Vui lòng nhập giới thiệu về bản thân");
      return;
    }
    if (!guideFormData.expertise.trim()) {
      toast.warning("Thiếu thông tin", "Vui lòng nhập chuyên môn của bạn");
      return;
    }
    if (guideFormData.id_cards.length === 0) {
      toast.warning("Thiếu thông tin", "Vui lòng cung cấp ảnh CCCD/Thẻ HDV");
      return;
    }

    const result = await apply(guideFormData);
    if (result.success) {
      toast.success(
        "Thành công!",
        "Hồ sơ đã được gửi. Vui lòng chờ admin xét duyệt."
      );
      setShowGuideForm(false);
      refetchApplication();
    } else {
      toast.error("Lỗi đăng ký HDV", result.error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Delete Account Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Xác nhận xóa tài khoản"
        message="Bạn có chắc chắn muốn yêu cầu xóa tài khoản? Toàn bộ dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục."
        confirmText="Xóa tài khoản"
        confirmType="danger"
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Cài đặt hệ thống
        </h1>
        <p className="text-text-secondary text-sm">
          Tùy chỉnh trải nghiệm sử dụng ứng dụng của bạn.
        </p>
      </div>

      {/* BECOME A GUIDE SECTION */}
      <div className="bg-linear-to-r from-primary/10 to-secondary/10 p-6 rounded-3xl border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <IconBriefcase className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-primary mb-1">
              Trở thành Hướng dẫn viên
            </h3>

            {loadingApplication ? (
              <div className="flex items-center gap-2 text-text-secondary">
                <IconLoader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Đang kiểm tra...</span>
              </div>
            ) : hasApplication ? (
              // Show application status
              <div className="space-y-2">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
                    applicationStatus === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : applicationStatus === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {applicationStatus === "pending" && "⏳ Đang chờ duyệt"}
                  {applicationStatus === "approved" && "✅ Đã được duyệt"}
                  {applicationStatus === "rejected" && "❌ Đã bị từ chối"}
                </div>
                <p className="text-sm text-text-secondary">
                  {applicationStatus === "pending" &&
                    "Hồ sơ của bạn đang được admin xem xét. Bạn sẽ nhận được thông báo khi có kết quả."}
                  {applicationStatus === "approved" &&
                    "Chúc mừng! Bạn đã trở thành Hướng dẫn viên. Vui lòng đăng nhập lại để truy cập dashboard HDV."}
                  {applicationStatus === "rejected" &&
                    "Rất tiếc, hồ sơ của bạn chưa đạt yêu cầu. Bạn có thể gửi lại hồ sơ mới."}
                </p>
                {applicationStatus === "rejected" && (
                  <button
                    onClick={() => setShowGuideForm(true)}
                    className="mt-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Gửi lại hồ sơ
                  </button>
                )}
              </div>
            ) : (
              // Show apply button
              <>
                <p className="text-sm text-text-secondary mb-3">
                  Chia sẻ đam mê du lịch của bạn và kiếm thu nhập bằng cách trở
                  thành Hướng dẫn viên trên nền tảng.
                </p>
                <button
                  onClick={() => setShowGuideForm(true)}
                  className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Đăng ký làm HDV
                </button>
              </>
            )}
          </div>
        </div>

        {/* Guide Application Form */}
        {showGuideForm &&
          (!hasApplication || applicationStatus === "rejected") && (
            <div className="mt-6 pt-6 border-t border-primary/20 space-y-4 animate-fade-in">
              <h4 className="font-bold text-text-primary">
                Điền thông tin hồ sơ
              </h4>

              {/* About */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                  Giới thiệu về bản thân *
                </label>
                <textarea
                  value={guideFormData.about}
                  onChange={(e) =>
                    setGuideFormData((prev) => ({
                      ...prev,
                      about: e.target.value,
                    }))
                  }
                  placeholder="Mô tả kinh nghiệm, sở thích du lịch, điểm mạnh của bạn..."
                  className="w-full p-3 rounded-xl border border-border-light bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm resize-none"
                  rows={4}
                />
              </div>

              {/* Expertise */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                  Chuyên môn *
                </label>
                <input
                  type="text"
                  value={guideFormData.expertise}
                  onChange={(e) =>
                    setGuideFormData((prev) => ({
                      ...prev,
                      expertise: e.target.value,
                    }))
                  }
                  placeholder="VD: Di sản Huế, ẩm thực, trekking"
                  className="w-full p-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Nêu lĩnh vực bạn am hiểu nhất để admin duyệt nhanh hơn.
                </p>
              </div>

              {/* Experience */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                    Số năm kinh nghiệm
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={guideFormData.experience_years}
                    onChange={(e) =>
                      setGuideFormData((prev) => ({
                        ...prev,
                        experience_years: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full p-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                    Ngôn ngữ (chọn nhiều)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {AVAILABLE_LANGUAGES.map((lang) => {
                      const isSelected = Array.isArray(guideFormData.languages)
                        ? guideFormData.languages.includes(lang.code)
                        : false;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => toggleLanguage(lang.code)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            isSelected
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-text-secondary border-border-light hover:border-primary hover:text-primary"
                          }`}
                        >
                          {lang.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customLanguage}
                      onChange={(e) => setCustomLanguage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomLanguage();
                        }
                      }}
                      placeholder="Thêm ngôn ngữ khác (nhấn Enter để thêm)"
                      className="flex-1 p-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={addCustomLanguage}
                      className="px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors"
                    >
                      Thêm
                    </button>
                  </div>
                  {Array.isArray(guideFormData.languages) &&
                    guideFormData.languages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {guideFormData.languages.map((lang) => (
                          <span
                            key={lang}
                            className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
              </div>

              {/* ID Card File Upload */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                  Ảnh CCCD/Thẻ HDV * (tối đa 3 ảnh)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).slice(0, 3);
                    setGuideFormData((prev) => ({
                      ...prev,
                      id_cards: files,
                    }));
                  }}
                  className="w-full p-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {guideFormData.id_cards.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {guideFormData.id_cards.map((file, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full"
                      >
                        ✓ {file.name || file.url?.split("/").pop()}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-text-secondary mt-1">
                  Chụp ảnh CCCD 2 mặt hoặc thẻ Hướng dẫn viên (nếu có)
                </p>
              </div>

              {/* Certificates File Upload (Optional) */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                  Chứng chỉ (tùy chọn)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).slice(0, 5);
                    setGuideFormData((prev) => ({
                      ...prev,
                      certificates: files,
                    }));
                  }}
                  className="w-full p-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {guideFormData.certificates?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {guideFormData.certificates.map((file, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                      >
                        ✓ {file.name}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-text-secondary mt-1">
                  Chứng chỉ nghiệp vụ HDV, ngoại ngữ,... (nếu có)
                </p>
              </div>

              {/* Bank Info */}
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase block mb-2">
                  Thông tin ngân hàng (nhận tiền)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={guideFormData.bank_info.bank_name}
                    onChange={(e) =>
                      setGuideFormData((prev) => ({
                        ...prev,
                        bank_info: {
                          ...prev.bank_info,
                          bank_name: e.target.value,
                        },
                      }))
                    }
                    placeholder="Tên ngân hàng"
                    className="p-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm"
                  />
                  <input
                    type="text"
                    value={guideFormData.bank_info.account_name}
                    onChange={(e) =>
                      setGuideFormData((prev) => ({
                        ...prev,
                        bank_info: {
                          ...prev.bank_info,
                          account_name: e.target.value,
                        },
                      }))
                    }
                    placeholder="Tên chủ TK"
                    className="p-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm"
                  />
                  <input
                    type="text"
                    value={guideFormData.bank_info.account_number}
                    onChange={(e) =>
                      setGuideFormData((prev) => ({
                        ...prev,
                        bank_info: {
                          ...prev.bank_info,
                          account_number: e.target.value,
                        },
                      }))
                    }
                    placeholder="Số tài khoản"
                    className="p-3 rounded-xl border border-border-light bg-white focus:border-primary outline-none text-sm"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleGuideApply}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <IconLoader className="w-4 h-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <IconCheck className="w-4 h-4" />
                      Gửi hồ sơ
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowGuideForm(false)}
                  className="px-6 py-3 border border-border-light text-text-secondary font-bold rounded-xl hover:bg-bg-main transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
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
                          onClick={() => handleQualityChange(opt)}
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
                          onClick={() => handleCurrencyChange(opt)}
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

          {/* Delete Account */}
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2 mb-2">
              <IconTrash className="w-5 h-5" /> Vùng nguy hiểm
            </h3>

            {deleteLoading ? (
              <div className="flex items-center gap-2 text-text-secondary py-4">
                <IconLoader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Đang kiểm tra...</span>
              </div>
            ) : deleteRequest?.status === "pending" ? (
              // Show pending status
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold bg-yellow-100 text-yellow-700">
                  ⏳ Đang chờ admin xét duyệt
                </div>
                <p className="text-sm text-text-secondary">
                  Yêu cầu xóa tài khoản của bạn đang được xem xét. Bạn có thể
                  hủy yêu cầu nếu đổi ý.
                </p>
                <button
                  onClick={handleCancelDeleteRequest}
                  disabled={deleteSubmitting}
                  className="w-full py-3 bg-white border border-gray-300 text-text-primary font-bold rounded-xl text-sm hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteSubmitting ? (
                    <>
                      <IconLoader className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Hủy yêu cầu xóa"
                  )}
                </button>
              </div>
            ) : deleteRequest?.status === "rejected" ? (
              // Show rejected status
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold bg-red-100 text-red-700">
                  ❌ Yêu cầu đã bị từ chối
                </div>
                <p className="text-sm text-text-secondary">
                  Admin đã từ chối yêu cầu xóa tài khoản của bạn.
                  {deleteRequest.admin_notes && (
                    <span className="block mt-1 italic">
                      Lý do: {deleteRequest.admin_notes}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  Gửi lại yêu cầu xóa
                </button>
              </div>
            ) : (
              // Show default delete button
              <>
                <p className="text-sm text-red-500/80 mb-6 leading-relaxed">
                  Xóa tài khoản sẽ xóa vĩnh viễn toàn bộ lịch sử đặt tour và
                  thông tin cá nhân của bạn. Hành động này không thể hoàn tác.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  Yêu cầu xóa tài khoản
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
