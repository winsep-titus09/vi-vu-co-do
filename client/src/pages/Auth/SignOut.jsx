import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Loaders/Spinner";

export default function SignOut() {
  const navigate = useNavigate();

  useEffect(() => {
    // Logic xóa token/session ở đây
    console.log("Clearing session...");

    // Chuyển hướng sau 1.5s để người dùng kịp nhìn thấy thông báo
    const timer = setTimeout(() => {
      navigate("/");
    }, 1500);

    return () => clearTimeout(timer);
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
