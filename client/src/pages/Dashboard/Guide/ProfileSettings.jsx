import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  IconShieldCheck,
} from "../../../icons/IconCommon";
import {
  useMyGuideProfile,
  useUpdateGuideProfile,
} from "../../../features/guides/hooks";
import Spinner from "../../../components/Loaders/Spinner";

export default function GuideProfileSettings() {
  const [activeTab, setActiveTab] = useState("public"); // public | identity | finance

  // Available languages
  const availableLanguages = [
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

  // Fetch profile from API
  const {
    profile: apiProfile,
    isLoading,
    error,
    refetch,
  } = useMyGuideProfile();
  const { updateProfile, isUpdating } = useUpdateGuideProfile();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    expertise: "",
    introduction: "",
    languages: [],
    phone: "",
    bio_video_url: "",
    avatar_url: "",
    experience: "",
  });

  // Bank info state
  const [bankInfo, setBankInfo] = useState({
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
  });

  const [previewAvatar, setPreviewAvatar] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [message, setMessage] = useState(null);

  // Load profile data when fetched
  useEffect(() => {
    if (apiProfile) {
      setFormData({
        name: apiProfile.name || "",
        expertise: apiProfile.expertise || "",
        introduction: apiProfile.introduction || "",
        languages: apiProfile.languages || [],
        phone: apiProfile.phone || "",
        bio_video_url: apiProfile.bio_video_url || "",
        avatar_url: apiProfile.avatar_url || "",
        experience: apiProfile.experience || "",
      });
      setBankInfo({
        bank_name: apiProfile.bank_name || "",
        bank_account_number: apiProfile.bank_account_number || "",
        bank_account_name: apiProfile.bank_account_name || "",
      });
      setPreviewAvatar(apiProfile.avatar_url || "");
    }
  }, [apiProfile]);

  // Handle form change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setMessage(null);
  };

  // Handle bank info change
  const handleBankChange = (field, value) => {
    setBankInfo((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    setMessage(null);
  };

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: "Ảnh không được vượt quá 2MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
        handleChange("avatar_url", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save public profile
  const handleSavePublicProfile = async () => {
    const result = await updateProfile({
      name: formData.name,
      expertise: formData.expertise,
      introduction: formData.introduction,
      experience: formData.experience,
      languages: formData.languages, // Already an array of language codes
      phone: formData.phone,
      bio_video_url: formData.bio_video_url,
      avatar_url: formData.avatar_url,
    });

    if (result) {
      setMessage({ type: "success", text: "Đã lưu thông tin hồ sơ!" });
      setIsDirty(false);
      refetch();
    } else {
      setMessage({ type: "error", text: "Lưu thất bại. Vui lòng thử lại." });
    }
  };

  // Save bank info
  const handleSaveBankInfo = async () => {
    const result = await updateProfile({
      bank_name: bankInfo.bank_name,
      bank_account_number: bankInfo.bank_account_number,
      bank_account_name: bankInfo.bank_account_name,
    });

    if (result) {
      setMessage({ type: "success", text: "Đã lưu thông tin ngân hàng!" });
      setIsDirty(false);
      refetch();
    } else {
      setMessage({ type: "error", text: "Lưu thất bại. Vui lòng thử lại." });
    }
  };

  // Tabs Configuration
  const tabs = [
    { id: "public", label: "Thông tin công khai", icon: IconUser },
    { id: "identity", label: "Định danh & Chứng chỉ", icon: IconShieldCheck },
    { id: "finance", label: "Tài khoản nhận tiền", icon: IconWallet },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="text-primary font-bold hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

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
        {apiProfile?._id && (
          <Link
            to={`/guides/${apiProfile._id}`}
            target="_blank"
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            Xem trang hồ sơ
          </Link>
        )}
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
                  src={
                    previewAvatar ||
                    "/images/placeholders/avatar-placeholder.jpg"
                  }
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-md group-hover:opacity-90 transition-opacity"
                  alt="Avatar"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 rounded-full p-2 text-white backdrop-blur-sm">
                    <IconCamera className="w-6 h-6" />
                  </div>
                </div>
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleAvatarChange}
                  accept="image/*"
                />
              </div>
              <h2 className="text-xl font-bold text-text-primary">
                {formData.name || "Chưa có tên"}
              </h2>
              <p className="text-sm text-text-secondary mb-4">
                {formData.expertise || "Chưa có chuyên môn"}
              </p>

              <div className="flex flex-col gap-2">
                <label className="w-full py-2 rounded-lg border border-border-light text-xs font-bold text-text-secondary hover:text-primary hover:border-primary transition-all cursor-pointer">
                  Tải ảnh mới
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleAvatarChange}
                    accept="image/*"
                  />
                </label>
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
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm font-bold"
                  />
                  <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Chuyên môn
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.expertise}
                    onChange={(e) => handleChange("expertise", e.target.value)}
                    placeholder="VD: Hướng dẫn viên Di sản Huế"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm"
                  />
                  <IconFileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Giới thiệu bản thân
              </label>
              <textarea
                rows="4"
                value={formData.introduction}
                onChange={(e) => handleChange("introduction", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm resize-none leading-relaxed"
              ></textarea>
              <p className="text-[10px] text-text-secondary text-right">
                Một bio ấn tượng giúp tăng 30% tỉ lệ đặt tour.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Kinh nghiệm
              </label>
              <textarea
                rows="3"
                value={formData.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
                placeholder="Mô tả kinh nghiệm làm hướng dẫn viên của bạn..."
                className="w-full px-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm resize-none leading-relaxed"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Ngôn ngữ sử dụng
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableLanguages.map((lang) => {
                    const isSelected = Array.isArray(formData.languages)
                      ? formData.languages.includes(lang.code)
                      : false;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          const currentLangs = Array.isArray(formData.languages)
                            ? formData.languages
                            : [];
                          const newLangs = isSelected
                            ? currentLangs.filter((l) => l !== lang.code)
                            : [...currentLangs, lang.code];
                          handleChange("languages", newLangs);
                        }}
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
                <p className="text-[10px] text-text-secondary">
                  Chọn các ngôn ngữ bạn có thể sử dụng khi hướng dẫn tour.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Số điện thoại
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm"
                  />
                  <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Video giới thiệu (URL)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.bio_video_url}
                  onChange={(e) =>
                    handleChange("bio_video_url", e.target.value)
                  }
                  placeholder="https://youtube.com/... hoặc link video khác"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm"
                />
                <IconVideo className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-border-light">
              <button
                onClick={handleSavePublicProfile}
                disabled={!isDirty || isUpdating}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2 ${
                  isDirty && !isUpdating
                    ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isUpdating ? <Spinner size="sm" /> : null}
                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
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
                  value={apiProfile?.id_card_number || "Chưa cung cấp"}
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
                  {bankInfo.bank_name || "Chưa cập nhật"}
                </h3>
              </div>
              <IconWallet className="w-8 h-8 opacity-80" />
            </div>
            <div className="relative z-10 mt-8">
              <p className="text-2xl font-mono tracking-widest mb-4">
                {bankInfo.bank_account_number || "•••• •••• ••••"}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-white/70 uppercase">
                    Chủ tài khoản
                  </p>
                  <p className="font-bold uppercase tracking-wide">
                    {bankInfo.bank_account_name || formData.name}
                  </p>
                </div>
                {bankInfo.bank_account_number && (
                  <IconCheck className="w-6 h-6 text-green-400" />
                )}
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
                  <select
                    value={bankInfo.bank_name}
                    onChange={(e) =>
                      handleBankChange("bank_name", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm font-bold appearance-none cursor-pointer"
                  >
                    <option value="">-- Chọn ngân hàng --</option>
                    <option value="Vietcombank">Vietcombank</option>
                    <option value="Techcombank">Techcombank</option>
                    <option value="MB Bank">MB Bank</option>
                    <option value="BIDV">BIDV</option>
                    <option value="Agribank">Agribank</option>
                    <option value="VPBank">VPBank</option>
                    <option value="ACB">ACB</option>
                    <option value="Sacombank">Sacombank</option>
                    <option value="TPBank">TPBank</option>
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
                    value={bankInfo.bank_account_number}
                    onChange={(e) =>
                      handleBankChange("bank_account_number", e.target.value)
                    }
                    placeholder="Nhập số tài khoản"
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
                  value={bankInfo.bank_account_name}
                  onChange={(e) =>
                    handleBankChange(
                      "bank_account_name",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="Nhập tên chủ tài khoản (viết hoa)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm font-bold uppercase"
                />
                <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSaveBankInfo}
                disabled={isUpdating}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUpdating ? <Spinner size="sm" /> : null}
                {isUpdating ? "Đang lưu..." : "Lưu thông tin ngân hàng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
