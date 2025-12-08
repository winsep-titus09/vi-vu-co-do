import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../features/auth/api";
import Spinner from "../../components/Loaders/Spinner";

export default function SignOut() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      const token = localStorage.getItem("token");
      try {
        // Chỉ gọi API khi còn token để tránh 404/401 không cần thiết
        if (token) {
          await authApi.logout();
        }
      } catch (error) {
        // Nuốt lỗi để không chặn luồng đăng xuất; backend có thể trả 404/401 khi token đã hết hạn
        console.warn("Logout warning:", error?.response?.status || error?.message);
      } finally {
        // Clear local storage regardless of API response
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to home page after 1.5s
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
        <Spinner className="text-primary" />
      </div>
      <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
        Đang đăng xuất...
      </h1>
      <p className="text-text-secondary">
        Hẹn gặp lại bạn trong những chuyến đi sắp tới!
      </p>
    </div>
  );
}
