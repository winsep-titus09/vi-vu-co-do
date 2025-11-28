import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// --- INLINE ICONS ---
const IconMail = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <rect width="20" height="16" x="2" y="4" rx="2" />{" "}
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />{" "}
  </svg>
);
const IconLock = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />{" "}
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />{" "}
  </svg>
);
const IconArrowRight = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <path d="M5 12h14" /> <path d="m12 5 7 7-7 7" />{" "}
  </svg>
);
const IconArrowLeft = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <path d="M19 12H5" /> <path d="m12 19-7-7 7-7" />{" "}
  </svg>
);
const IconUser = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />{" "}
    <circle cx="12" cy="7" r="4" />{" "}
  </svg>
);
const IconCheckCircle = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />{" "}
    <polyline points="22 4 12 14.01 9 11.01" />{" "}
  </svg>
);
const IconFacebook = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    {" "}
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />{" "}
  </svg>
);
const IconHueCitadel = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <path d="M3 21h18" /> <path d="M5 21V7l8-4 8 4v14" /> <path d="M13 11h-2" />{" "}
    <path d="M13 17h-2" /> <path d="M9 21v-5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v5" />{" "}
  </svg>
);
const IconGoogleInline = ({ className }) => (
  <svg
    viewBox="0 0 48 48"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {" "}
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />{" "}
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />{" "}
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />{" "}
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />{" "}
    <path fill="none" d="M0 0h48v48H0z" />{" "}
  </svg>
);
const IconLoader = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {" "}
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />{" "}
  </svg>
);

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignUp = location.pathname === "/auth/signup";

  // States
  const [role, setRole] = useState("tourist");
  const [isLoading, setIsLoading] = useState(false);

  // [NEW] Logic Quên mật khẩu
  const [viewState, setViewState] = useState("login"); // 'login' | 'forgot' | 'sent'

  // Reset view state khi chuyển tab Đăng ký/Đăng nhập
  useEffect(() => {
    if (isSignUp) setViewState("login");
  }, [isSignUp]);

  const toggleMode = () => {
    navigate(isSignUp ? "/auth/signin" : "/auth/signup");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (role === "tourist") navigate("/dashboard/tourist");
      else navigate("/dashboard/guide");
    }, 1500);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setViewState("sent"); // Chuyển sang màn hình thông báo đã gửi
    }, 1500);
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
              ? "left-0 opacity-100 z-20"
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                  required
                />
                <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              </div>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                  required
                />
                <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Mật khẩu"
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
                <IconGoogleInline className="w-5 h-5" />
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
              : "left-1/2 opacity-100 z-20 translate-x-0"
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

              <div className="flex justify-center gap-4 mb-6">
                <button className="p-3 rounded-full border border-border-light hover:bg-gray-50 transition-colors">
                  <IconGoogleInline className="w-5 h-5" />
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-bg-main/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
                    required
                  />
                  <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Mật khẩu"
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

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Nhập địa chỉ email"
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
          className={`hidden md:block absolute top-0 left-0 h-full w-1/2 overflow-hidden transition-transform duration-700 ease-in-out z-50 ${
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
