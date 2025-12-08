import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IconUser } from "../../../icons/IconUser";
import {
  IconCalendar,
  IconStar,
  IconMapPin,
  IconCheck,
} from "../../../icons/IconBox";
import IconMail from "../../../icons/IconMail";
import IconPhone from "../../../icons/IconPhone";
import {
  IconCamera,
  IconLock,
  IconWallet,
  IconCreditCard,
  IconPlus,
  IconLoader,
} from "../../../icons/IconCommon";
import { IconX } from "../../../icons/IconX";
import apiClient from "../../../lib/api-client";

// ============================================================================
// MOCK DATA
// ============================================================================
const initialData = {
  firstName: "Hoàng",
  lastName: "Nam",
  email: "hoangnam@gmail.com",
  phone: "0905 123 456",
  address: "12 Lê Lợi, TP. Huế",
  avatar: "/images/placeholders/avatar-placeholder.jpg",
  stats: { toursCompleted: 5, reviewsWritten: 3 },
  // Wallet data
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get("/users/me");

        // API returns flat object: { id, name, email, avatar_url, stats, ... }
        setFormData({
          firstName: response.name?.split(" ").slice(-1)[0] || "",
          lastName: response.name?.split(" ").slice(0, -1).join(" ") || "",
          email: response.email || "",
          phone: response.phone || response.phone_number || "",
          address: response.address || "",
          avatar: response.avatar_url || initialData.avatar,
          stats: {
            toursCompleted: response.stats?.completedBookings || 0,
            reviewsWritten: response.stats?.reviewsCount || 0,
          },
          wallet: initialData.wallet, // Keep mock wallet data for now
        });
      } catch (err) {
        console.error("Fetch profile error:", err);
        setError(err.message || "Không thể tải thông tin hồ sơ");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      setSuccessMessage("");

      // Prepare data for API
      const updateData = {
        name: `${formData.lastName} ${formData.firstName}`.trim(),
        phone_number: formData.phone,
        address: formData.address,
      };

      // Call API to update profile
      await apiClient.put("/users/me", updateData);

      // Update localStorage user info
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...user, ...updateData }));

      setSuccessMessage("Đã cập nhật thông tin thành công!");
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Update profile error:", err);
      setError(err.message || "Không thể cập nhật thông tin");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file ảnh hợp lệ");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setError("");

      // Create FormData
      const formData = new FormData();
      formData.append("avatar", file);

      // Upload to server
      const response = await apiClient.put("/users/me/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Server returns: { message, user: { avatar_url, ... } }
      const newAvatarUrl = response.user?.avatar_url || response.avatar_url;

      // Update local state with new avatar URL
      setFormData((prev) => ({
        ...prev,
        avatar: newAvatarUrl,
      }));

      // Update localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.avatar_url = newAvatarUrl;
      localStorage.setItem("user", JSON.stringify(user));

      setSuccessMessage("Đã cập nhật ảnh đại diện thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Upload avatar error:", err);
      setError(err.message || "Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    try {
      setError("");
      setSuccessMessage("");

      // Validation
      if (
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        setError("Vui lòng nhập đầy đủ thông tin");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError("Mật khẩu mới phải dài ít nhất 6 ký tự");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp");
        return;
      }

      setIsChangingPassword(true);

      // Call API
      await apiClient.patch("/users/password", {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      // Success - clear token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setSuccessMessage(
        "Đổi mật khẩu thành công! Đang chuyển đến trang đăng nhập..."
      );

      setTimeout(() => {
        window.location.href = "/auth/signin";
      }, 2000);
    } catch (err) {
      console.error("Change password error:", err);
      setError(err.message || "Không thể đổi mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <IconLoader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
        {error}
      </div>
    );
  }

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

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 flex items-center gap-2">
          <IconCheck className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

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
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isUploadingAvatar ? (
                  <IconLoader className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <IconCamera className="w-8 h-8 text-white" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <h2 className="text-xl font-bold text-text-primary mb-1">
              {formData.lastName} {formData.firstName}
            </h2>
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
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (isEditing) {
                      window.location.reload();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  {isEditing ? "Hủy" : "Chỉnh sửa"}
                </button>
                {isEditing && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-1 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? "Đang lưu..." : "Lưu"}
                  </button>
                )}
              </div>
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

          {/* Wallet & payment section */}
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
                    Cập nhật mật khẩu để bảo mật tài khoản
                  </p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 rounded-lg border border-border-light bg-white text-xs font-bold hover:border-primary hover:text-primary transition-all"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <IconLock className="w-5 h-5 text-primary" /> Đổi mật khẩu
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setError("");
                }}
                className="text-text-secondary hover:text-text-primary"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full px-4 py-3 rounded-xl bg-bg-main/50 border border-border-light focus:border-primary outline-none text-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  className="w-full px-4 py-3 rounded-xl bg-bg-main/50 border border-border-light focus:border-primary outline-none text-sm transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-4 py-3 rounded-xl bg-bg-main/50 border border-border-light focus:border-primary outline-none text-sm transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setError("");
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-border-light text-text-secondary font-bold hover:bg-bg-main/50 transition-all"
                  disabled={isChangingPassword}
                >
                  Hủy
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <IconLoader className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đổi mật khẩu"
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-xs text-yellow-800">
                ⚠️ Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại với mật khẩu
                mới.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
