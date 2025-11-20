// src/components/Footer/Footer.jsx

import React from "react";
import { Link } from "react-router-dom";
import { IconMapPin } from "../../icons/IconBox.jsx";
import IconMail from "../../icons/IconMail.jsx";
import IconPhone from "../../icons/IconPhone.jsx";
import IconArrowRight from "../../icons/IconArrowRight.jsx";
import IconFacebook from "../../icons/IconFacebook.jsx";
import IconInstagram from "../../icons/IconInstagram.jsx";
import IconYoutube from "../../icons/IconYoutube.jsx";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-300 font-body">
      {/* --- 1. Newsletter Section --- */}
      <div className="border-b border-gray-800">
        <div className="container-main py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-2">
              <h3 className="text-2xl md:text-3xl font-heading font-bold text-white">
                Nhận tin tức du lịch mới nhất
              </h3>
              <p className="text-gray-400">
                Đăng ký để nhận thông tin về các tour độc quyền, ưu đãi đặc biệt
                và cẩm nang khám phá Huế hàng tuần.
              </p>
            </div>

            <form
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Địa chỉ email của bạn"
                className="flex-1 bg-gray-800 border border-gray-700 text-white px-5 py-3.5 rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-secondary text-[#1a1a1a] font-bold px-6 py-3.5 rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Đăng ký <IconArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* --- 2. Main Footer Info --- */}
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Cột 1: Logo, Intro & Socials (Đã khôi phục) */}
          <div className="space-y-6">
            {/* 1. Logo (Chỉ ảnh, trắng) */}
            <Link to="/" className="inline-block">
              <img
                src="/images/uploads/logo-hue-2.png"
                alt="Vi Vu Cố Đô"
                className="h-16 w-auto brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>

            {/* 2. Intro Text */}
            <p className="text-sm text-gray-400 leading-relaxed">
              Nền tảng kết nối du khách với những hướng dẫn viên bản địa am hiểu
              nhất, mang đến trải nghiệm văn hóa Huế chân thực và sâu sắc.
            </p>

            {/* 3. Social Icons */}
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-secondary hover:text-[#1a1a1a] transition-colors"
              >
                <IconFacebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-secondary hover:text-[#1a1a1a] transition-colors"
              >
                <IconInstagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-secondary hover:text-[#1a1a1a] transition-colors"
              >
                <IconYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Cột 2: Khám phá */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 font-heading">
              Khám phá
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  to="/tours"
                  className="hover:text-secondary transition-colors"
                >
                  Tour nổi bật
                </Link>
              </li>
              <li>
                <Link
                  to="/guides"
                  className="hover:text-secondary transition-colors"
                >
                  Hướng dẫn viên tiêu biểu
                </Link>
              </li>
              <li>
                <Link
                  to="/places"
                  className="hover:text-secondary transition-colors"
                >
                  Điểm đến di sản
                </Link>
              </li>
              <li>
                <Link
                  to="/3d-tours"
                  className="hover:text-secondary transition-colors"
                >
                  Trải nghiệm 3D
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="hover:text-secondary transition-colors"
                >
                  Cẩm nang du lịch
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Về chúng tôi */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 font-heading">
              Về Vi Vu Cố Đô
            </h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  to="/about"
                  className="hover:text-secondary transition-colors"
                >
                  Câu chuyện thương hiệu
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="hover:text-secondary transition-colors"
                >
                  Tuyển dụng HDV{" "}
                  <span className="ml-2 text-[10px] bg-secondary text-black px-1.5 py-0.5 rounded font-bold">
                    HOT
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/community"
                  className="hover:text-secondary transition-colors"
                >
                  Cộng đồng
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="hover:text-secondary transition-colors"
                >
                  Trung tâm hỗ trợ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-secondary transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 font-heading">
              Liên hệ
            </h4>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <IconMapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <span>70 Nguyễn Huệ, Thành phố Huế, Việt Nam</span>
              </li>
              <li className="flex items-center gap-3">
                <IconMail className="w-5 h-5 text-secondary flex-shrink-0" />
                <a
                  href="mailto:hello@vivucodo.com"
                  className="hover:text-white transition-colors"
                >
                  hello@vivucodo.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <IconPhone className="w-5 h-5 text-secondary flex-shrink-0" />
                <a
                  href="tel:+84905123456"
                  className="hover:text-white transition-colors"
                >
                  +84 909 090909
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* --- 3. Copyright & Legal --- */}
      <div className="border-t border-gray-800 bg-black/20">
        <div className="container-main py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] text-gray-500 font-medium">
          <p>
            &copy; {new Date().getFullYear()} Vi Vu Cố Đô. Bảo lưu mọi quyền.
          </p>
          <div className="flex gap-4">
            <Link
              to="/privacy"
              className="hover:text-gray-300 transition-colors"
            >
              Chính sách bảo mật
            </Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link
              to="/sitemap"
              className="hover:text-gray-300 transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
