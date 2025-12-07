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
  useMyGuideApplication,
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

  const experienceOptions = [
    { value: 1, label: "1 năm" },
    { value: 2, label: "2 năm" },
    { value: 3, label: "3 năm" },
    { value: 5, label: "5 năm" },
    { value: 7, label: "7 năm" },
    { value: 10, label: "10 năm" },
    { value: 15, label: "15 năm" },
    { value: 20, label: "20 năm" },
  ];

  // Fetch profile from API
  const {
    profile: apiProfile,
    isLoading,
    error,
    refetch,
  } = useMyGuideProfile();
  const { updateProfile, isUpdating } = useUpdateGuideProfile();
  const {
    application,
    status: applicationStatus,
    isLoading: isAppLoading,
    error: appError,
    refetch: refetchApplication,
  } = useMyGuideApplication();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    expertise: "",
    introduction: "",
    languages: [],
    phone: "",
    bio_video_url: "",
    avatar_url: "",
    cover_image_url: "",
    experience: 0,
  });

  // Bank info state
  const [bankInfo, setBankInfo] = useState({
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
  });

  const [previewAvatar, setPreviewAvatar] = useState("");
  const [previewCover, setPreviewCover] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [message, setMessage] = useState(null);

  // Load profile data when fetched
  useEffect(() => {
    if (apiProfile) {
      const parsedExperience = Number.isFinite(Number(apiProfile.experience))
        ? Number(apiProfile.experience)
        : 0;
      setFormData({
        name: apiProfile.name || "",
        expertise: apiProfile.expertise || "",
        introduction: apiProfile.introduction || "",
        languages: apiProfile.languages || [],
        phone: apiProfile.phone || "",
        bio_video_url: apiProfile.bio_video_url || "",
        avatar_url: apiProfile.avatar_url || "",
        cover_image_url: apiProfile.cover_image_url || "",
        experience: parsedExperience,
      });
      setBankInfo({
        bank_name: apiProfile.bank_name || "",
        bank_account_number: apiProfile.bank_account_number || "",
        bank_account_name: apiProfile.bank_account_name || "",
      });
      setPreviewAvatar(apiProfile.avatar_url || "");
      setPreviewCover(apiProfile.cover_image_url || "");
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

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "Cover không vượt quá 5MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCover(reader.result);
        handleChange("cover_image_url", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetCover = () => {
    setPreviewCover("");
    handleChange("cover_image_url", "");
  };

  // Save public profile
  const handleSavePublicProfile = async () => {
    const result = await updateProfile({
      name: formData.name,
      expertise: formData.expertise,
      introduction: formData.introduction,
      experience: Number.isFinite(Number(formData.experience))
        ? Number(formData.experience)
        : 0,
      languages: formData.languages, // Already an array of language codes
      phone: formData.phone,
      bio_video_url: formData.bio_video_url,
      avatar_url: formData.avatar_url,
      cover_image_url: formData.cover_image_url,
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

  // Hồ sơ định danh (đã gửi cho admin)
  const idCardFiles = application?.id_cards || [];
  const certificateFiles = [
    ...(application?.certificates || []),
    ...(application?.language_certificates || []),
  ];

  const publicProfileId =
    apiProfile?.user_id?._id || apiProfile?.user_id || apiProfile?._id;

  const coverPreview =
    previewCover ||
    formData.cover_image_url ||
    "/images/placeholders/cover-placeholder.jpg";

  const statusDisplay = (() => {
    const status = applicationStatus || apiProfile?.status;
    if (status === "pending")
      return {
        label: "Đang chờ duyệt",
        desc: "Bạn đã gửi giấy tờ. Admin sẽ xem xét và phản hồi sớm.",
        color: "amber",
      };
    if (status === "approved")
      return {
        label: "Tài khoản đã được xác thực",
        desc: "Giấy tờ đã được admin phê duyệt. Bạn có thể nhận tour.",
        color: "green",
      };
    if (status === "rejected")
      return {
        label: "Hồ sơ bị từ chối",
        desc:
          application?.admin_notes ||
          "Vui lòng cập nhật hoặc gửi lại hồ sơ để được xét duyệt.",
        color: "red",
      };
    return {
      label: "Chưa cung cấp giấy tờ",
      desc: "Gửi hồ sơ định danh để được xét duyệt và nhận tour.",
      color: "gray",
    };
  })();

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
        {publicProfileId && (
          <Link
            to={`/guides/${publicProfileId}`}
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
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase">
                Ảnh cover hồ sơ
              </label>
              <div className="relative w-full aspect-[3/1] rounded-2xl overflow-hidden bg-bg-main/60 border border-border-light">
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-end gap-2 p-3 bg-gradient-to-b from-black/20 via-transparent to-black/30">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-sm font-bold text-text-primary shadow border border-border-light cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
                    <IconUpload className="w-4 h-4" /> Tải ảnh
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleCoverChange}
                      accept="image/*"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleResetCover}
                    className="px-3 py-2 rounded-lg border border-border-light bg-white/80 text-sm font-bold text-text-secondary hover:text-primary hover:border-primary transition-colors"
                  >
                    Dùng ảnh mặc định
                  </button>
                </div>
                <div className="absolute bottom-2 left-3 text-[11px] font-bold text-white/90 bg-black/40 px-2 py-1 rounded-md border border-white/10">
                  Khuyến nghị 1600x533 (tỉ lệ 3:1)
                </div>
              </div>
            </div>

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
              <div className="relative">
                <select
                  value={formData.experience}
                  onChange={(e) =>
                    handleChange("experience", Number(e.target.value))
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary outline-none text-sm font-bold appearance-none cursor-pointer"
                >
                  <option value={0}>Dưới 1 năm</option>
                  {experienceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <IconShield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              </div>
              <p className="text-[10px] text-text-secondary">
                Chọn số năm kinh nghiệm để hiển thị trên hồ sơ.
              </p>
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
          <div
            className={`rounded-2xl p-4 flex gap-4 items-start border ${
              statusDisplay.color === "green"
                ? "bg-green-50 border-green-100"
                : statusDisplay.color === "amber"
                ? "bg-amber-50 border-amber-100"
                : statusDisplay.color === "red"
                ? "bg-red-50 border-red-100"
                : "bg-gray-50 border-border-light"
            }`}
          >
            <div
              className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 ${
                statusDisplay.color === "green"
                  ? "text-green-600"
                  : statusDisplay.color === "amber"
                  ? "text-amber-600"
                  : statusDisplay.color === "red"
                  ? "text-red-600"
                  : "text-text-secondary"
              }`}
            >
              <IconShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-bold text-text-primary">
                  {statusDisplay.label}
                </h3>
                {isAppLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/80 border border-border-light"
                  >
                    {applicationStatus || apiProfile?.status || "N/A"}
                  </span>
                )}
                {appError ? (
                  <button
                    onClick={refetchApplication}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Thử tải lại
                  </button>
                ) : null}
              </div>
              <p className="text-sm text-text-secondary mt-1">
                {statusDisplay.desc}
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-border-light shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-lg font-bold text-text-primary">
                Giấy tờ định danh
              </h3>
              <button
                onClick={refetchApplication}
                className="text-sm font-bold text-primary hover:underline"
              >
                Làm mới trạng thái
              </button>
            </div>

            {isAppLoading ? (
              <div className="flex items-center gap-2 text-text-secondary">
                <Spinner size="sm" />
                <span>Đang tải hồ sơ...</span>
              </div>
            ) : idCardFiles.length > 0 || certificateFiles.length > 0 ? (
              <>
                {idCardFiles.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase">
                      Ảnh giấy tờ đã gửi
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {idCardFiles.map((file, idx) => (
                        <a
                          key={`${file.url}-${idx}`}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="relative aspect-video rounded-2xl border border-border-light overflow-hidden group"
                        >
                          <img
                            src={file.url}
                            alt={file.name || "ID document"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                            Xem chi tiết
                          </div>
                          <div className="absolute left-3 bottom-3 px-2 py-1 rounded-full bg-white/85 text-[11px] font-bold text-text-primary border border-border-light">
                            {file.name || "Tệp giấy tờ"}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {certificateFiles.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase">
                      Chứng chỉ / Giấy tờ khác
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {certificateFiles.map((file, idx) => (
                        <a
                          key={`${file.url}-${idx}`}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl border border-border-light hover:border-primary/40 transition-colors bg-bg-main/40"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary border border-border-light">
                            <IconFileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-text-primary line-clamp-1">
                              {file.name || `Chứng chỉ ${idx + 1}`}
                            </p>
                            <p className="text-[11px] text-text-secondary line-clamp-1">
                              Nhấn để mở tài liệu
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-border-light bg-bg-main/40 text-sm text-text-secondary">
                Chưa thấy giấy tờ nào được gửi. Nếu bạn đã nộp, nhấn "Làm mới" để cập nhật.
              </div>
            )}

            <div className="pt-2 text-center text-xs text-text-secondary">
              Thông tin định danh được xử lý bởi admin. Nếu cần cập nhật, vui lòng liên hệ hỗ trợ hoặc gửi lại hồ sơ.
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: FINANCE (Visual Upgrade) --- */}
      {activeTab === "finance" && (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          {/* Card Preview Visual */}
          <div className="bg-linear-to-br from-[#2C3E50] to-[#4CA1AF] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
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
