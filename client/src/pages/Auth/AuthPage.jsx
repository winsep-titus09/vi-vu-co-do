import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../features/auth/api";
import {
  IconMail,
  IconLock,
  IconArrowRight,
  IconArrowLeft,
  IconUser,
  IconCheckCircle,
  IconFacebook,
  IconGoogle,
  IconHueCitadel,
  IconLoader,
} from "../../icons/IconCommon";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignUp = location.pathname === "/auth/signup";

  // States
  const [role, setRole] = useState("tourist");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  // Forgot password logic
  const [viewState, setViewState] = useState("login"); // 'login' | 'forgot' | 'sent'
  const [forgotEmail, setForgotEmail] = useState("");

  // Reset view state khi chuyển tab Đăng ký/Đăng nhập
  useEffect(() => {
    if (isSignUp) setViewState("login");
    setError("");
    setFormData({ fullName: "", email: "", password: "" });
  }, [isSignUp]);

  const toggleMode = () => {
    navigate(isSignUp ? "/auth/signin" : "/auth/signup");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // Sign up
        const response = await authApi.signUp({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: role,
        });

        // Store token and user data
        if (response.token) {
          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
        }
      } else {
        // Sign in
        const response = await authApi.signIn({
          email: formData.email,
          password: formData.password,
        });

        // Store token and user data
        if (response.token) {
          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
        }
      }

      // Navigate based on role
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData.role === "tourist") {
        navigate("/dashboard/tourist");
      } else if (userData.role === "guide") {
        navigate("/dashboard/guide");
      } else if (userData.role === "admin") {
        navigate("/dashboard/admin");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await authApi.forgotPassword(forgotEmail);
      setViewState("sent");
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Không thể gửi email. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-main p-4 relative overflow-hidden">
      {/* Decor Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <img
          src="/images/placeholders/map-bg.png"
          className="w-full h-full object-cover"
          alt="pattern"
        />
      </div>

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[1000px] min-h-[600px] overflow-hidden flex flex-col md:flex-row">
        {/* --- FORM CONTAINER: SIGN UP (ĐĂNG KÝ) --- */}
        <div
          className={`absolute top-0 h-full w-full md:w-1/2 transition-all duration-700 ease-in-out flex items-center justify-center p-8 bg-white ${
            isSignUp
              ? "left-0 opacity-100 z-10"
              : "left-0 opacity-0 z-0 pointer-events-none"
          }`}
        >
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-heading font-bold text-text-primary text-center mb-2">
              Tạo tài khoản
            </h1>
            <p className="text-text-secondary text-center mb-6 text-sm">
              Trở thành thành viên để nhận ưu đãi.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button
                onClick={() => setRole("tourist")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  role === "tourist"
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-secondary hover:text-primary"
                }`}
              >
                Du khách
              </button>
              <button
                onClick={() => setRole("guide")}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  role === "guide"
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-secondary hover:text-primary"
                }`}
              >
                Hướng dẫn viên
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                  required
                />
                <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              </div>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                  required
                />
                <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                  required
                />
                <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              </div>
              <button
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <IconLoader className="w-5 h-5 animate-spin" />
                ) : (
                  "Đăng ký ngay"
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-text-secondary">
              <span className="w-full h-px bg-border-light"></span>
              <span>hoặc</span>
              <span className="w-full h-px bg-border-light"></span>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button className="p-3 rounded-full border border-border-light hover:bg-gray-50 transition-colors">
                <IconGoogle className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full border border-border-light hover:bg-gray-50 transition-colors text-[#1877F2]">
                <IconFacebook className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-6 text-center text-sm md:hidden">
              Đã có tài khoản?{" "}
              <span
                onClick={toggleMode}
                className="text-primary font-bold cursor-pointer"
              >
                Đăng nhập
              </span>
            </p>
          </div>
        </div>

        {/* --- FORM CONTAINER: SIGN IN + FORGOT PASSWORD (ĐĂNG NHẬP & QUÊN MK) --- */}
        <div
          className={`absolute top-0 h-full w-full md:w-1/2 transition-all duration-700 ease-in-out flex items-center justify-center p-8 bg-white ${
            isSignUp
              ? "left-1/2 opacity-0 z-0 pointer-events-none translate-x-full"
              : "left-1/2 opacity-100 z-10 translate-x-0"
          } md:left-1/2`}
        >
          <div className="w-full max-w-sm relative overflow-hidden">
            {/* 1. LOGIN FORM */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                viewState === "login"
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-full opacity-0 absolute top-0 w-full"
              }`}
            >
              <h1 className="text-3xl font-heading font-bold text-text-primary text-center mb-2">
                Đăng nhập
              </h1>
              <p className="text-text-secondary text-center mb-6 text-sm">
                Chào mừng bạn quay trở lại!
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="flex justify-center gap-4 mb-6">
                <button className="p-3 rounded-full border border-border-light hover:bg-gray-50 transition-colors">
                  <IconGoogle className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-full border border-border-light hover:bg-gray-50 transition-colors text-[#1877F2]">
                  <IconFacebook className="w-5 h-5" />
                </button>
              </div>
              <p className="text-center text-xs text-text-secondary mb-4">
                hoặc sử dụng tài khoản
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                    required
                  />
                  <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                    required
                  />
                  <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded text-primary focus:ring-primary w-4 h-4 border-gray-300"
                    />
                    <span className="text-text-secondary">Ghi nhớ tôi</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setViewState("forgot")}
                    className="font-bold text-primary hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <button
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <IconLoader className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Đăng nhập <IconArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
              <p className="mt-6 text-center text-sm md:hidden">
                Chưa có tài khoản?{" "}
                <span
                  onClick={toggleMode}
                  className="text-primary font-bold cursor-pointer"
                >
                  Đăng ký
                </span>
              </p>
            </div>

            {/* 2. FORGOT PASSWORD FORM */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                viewState === "forgot"
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0 absolute top-0 w-full"
              }`}
            >
              <button
                onClick={() => setViewState("login")}
                className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary mb-4 font-bold"
              >
                <IconArrowLeft className="w-4 h-4" /> Quay lại
              </button>
              <h1 className="text-3xl font-heading font-bold text-text-primary text-center mb-2">
                Quên mật khẩu?
              </h1>
              <p className="text-text-secondary text-center mb-8 text-sm">
                Đừng lo! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt
                lại mật khẩu.
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Nhập địa chỉ email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                    required
                  />
                  <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                </div>
                <button
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? (
                    <IconLoader className="w-5 h-5 animate-spin" />
                  ) : (
                    "Gửi link khôi phục"
                  )}
                </button>
              </form>
            </div>

            {/* 3. SUCCESS SENT STATE */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                viewState === "sent"
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0 absolute top-0 w-full"
              }`}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-scale-up">
                  <IconCheckCircle className="w-10 h-10" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">
                  Đã gửi email!
                </h1>
                <p className="text-text-secondary text-sm mb-8">
                  Vui lòng kiểm tra hộp thư đến (và thư mục spam) để lấy lại mật
                  khẩu.
                </p>
                <button
                  onClick={() => setViewState("login")}
                  className="w-full py-3 border border-border-light text-text-secondary rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
                >
                  Quay lại Đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- OVERLAY CONTAINER --- */}
        <div
          className={`hidden md:block absolute top-0 left-0 h-full w-1/2 overflow-hidden transition-transform duration-700 ease-in-out z-20 ${
            isSignUp ? "translate-x-[100%]" : "translate-x-0"
          }`}
        >
          <div className="relative w-full h-full bg-primary text-white">
            <img
              src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg"
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
              alt="Hue"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-purple-900/80"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full p-10 text-center z-10">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-float">
                <IconHueCitadel className="w-12 h-12 text-white" />
              </div>
              <div className="transition-all duration-500">
                <h2 className="text-4xl font-heading font-bold mb-4">
                  {isSignUp ? "Đã có tài khoản?" : "Chào bạn mới!"}
                </h2>
                <p className="text-white/80 mb-8 text-lg font-light">
                  {isSignUp
                    ? "Kết nối ngay để tiếp tục hành trình khám phá Huế mộng mơ."
                    : "Đăng ký ngay để bắt đầu hành trình cá nhân hóa của riêng bạn."}
                </p>
                <button
                  onClick={toggleMode}
                  className="px-8 py-3 rounded-full border-2 border-white text-white font-bold hover:bg-white hover:text-primary transition-all shadow-lg"
                >
                  {isSignUp ? "Đăng nhập" : "Đăng ký"}
                </button>
              </div>
            </div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
