// src/components/Navbar/Navbar.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { IconSearch } from "../../icons/IconSearch";
import { IconUser } from "../../icons/IconUser";
import { IconMenu } from "../../icons/IconMenu";
import { IconX } from "../../icons/IconX";
import { IconChevronDown } from "../../icons/IconChevronDown";
import {
  IconSettings,
  IconHistory,
  IconLogout,
  IconDashboard,
  IconMap,
  IconFlag,
  IconUsers,
} from "../../icons/IconCommon";
import Drawer from "../Modals/Drawer";
import { listArticleCategories } from "../../features/posts/api";

// ============================================================================
// CUSTOM HOOK: useAuth - Quản lý user state
// ============================================================================
function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (cross-tab sync)
    const handleStorage = (e) => {
      if (e.key === "token" || e.key === "user") {
        checkAuth();
      }
    };

    // Listen for custom auth event (same-tab sync)
    const handleAuthChange = () => checkAuth();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, [checkAuth]);

  return { user, isLoading, refresh: checkAuth };
}

// ============================================================================
// SEARCH MODAL COMPONENT
// ============================================================================
function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [recentSearches] = useState([
    "Đại Nội Huế",
    "Tour sông Hương",
    "Chùa Thiên Mụ",
  ]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/tours?search=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery("");
    }
  };

  const handleQuickSearch = (term) => {
    navigate(`/tours?search=${encodeURIComponent(term)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative max-w-2xl mx-auto mt-20 px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative">
            <IconSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-text-secondary" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm tour, địa điểm, hướng dẫn viên..."
              className="w-full pl-14 pr-12 py-5 text-lg border-0 focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary"
            >
              <IconX className="w-5 h-5" />
            </button>
          </form>

          {/* Quick Links */}
          <div className="border-t border-border-light p-5">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
              Tìm kiếm nhanh
            </p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleQuickSearch(term)}
                  className="px-4 py-2 bg-gray-100 hover:bg-primary/10 hover:text-primary rounded-full text-sm font-medium transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Quick Categories */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Link
                to="/tours"
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group"
              >
                <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <IconFlag className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-text-primary text-sm">Tours</p>
                  <p className="text-xs text-text-secondary">Khám phá</p>
                </div>
              </Link>
              <Link
                to="/places"
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group"
              >
                <div className="p-2 bg-green-100 rounded-lg text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <IconMap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-text-primary text-sm">
                    Địa điểm
                  </p>
                  <p className="text-xs text-text-secondary">Di tích</p>
                </div>
              </Link>
              <Link
                to="/guides"
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
              >
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <IconUsers className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-text-primary text-sm">HDV</p>
                  <p className="text-xs text-text-secondary">Hướng dẫn viên</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Keyboard hint */}
          <div className="px-5 py-3 bg-gray-50 border-t border-border-light flex items-center justify-between text-xs text-text-secondary">
            <span>
              Nhấn{" "}
              <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-mono">
                Enter
              </kbd>{" "}
              để tìm kiếm
            </span>
            <span>
              Nhấn{" "}
              <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-mono">
                ESC
              </kbd>{" "}
              để đóng
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// USER DROPDOWN COMPONENT
// ============================================================================
function UserDropdown({ user, onLogout }) {
  const getDashboardLink = () => {
    switch (user.role) {
      case "admin":
        return { path: "/dashboard/admin", label: "Admin Panel" };
      case "guide":
        return { path: "/dashboard/guide", label: "Kênh HDV" };
      default:
        return { path: "/dashboard/tourist", label: "Dashboard" };
    }
  };

  const getProfileLink = () => {
    switch (user.role) {
      case "guide":
        return "/dashboard/guide/profile-settings";
      default:
        return "/dashboard/tourist/profile";
    }
  };

  const getHistoryLink = () => {
    switch (user.role) {
      case "guide":
        return "/dashboard/guide/schedule";
      default:
        return "/dashboard/tourist/history";
    }
  };

  const dashboard = getDashboardLink();

  const getRoleBadge = () => {
    switch (user.role) {
      case "admin":
        return (
          <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-bold">
            Admin
          </span>
        );
      case "guide":
        return (
          <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-bold">
            HDV
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-bold">
            Thành viên
          </span>
        );
    }
  };

  return (
    <div className="relative group z-50">
      {/* Trigger Button */}
      <button className="flex items-center gap-1.5 p-1 rounded-full border border-transparent hover:bg-gray-100 transition-all group-hover:border-border-light">
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 bg-primary-light shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary font-bold">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>
      </button>

      {/* Dropdown Content */}
      <div className="absolute top-full right-0 w-60 pt-3 opacity-0 pointer-events-none scale-95 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:scale-100 transition-all duration-200 ease-out">
        <div className="bg-white rounded-2xl shadow-xl border border-border-light overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 bg-linear-to-r from-primary/5 to-primary/10 border-b border-border-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-primary-light">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-text-primary truncate">
                  {user.name}
                </p>
                <div className="flex items-center gap-2">{getRoleBadge()}</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to={dashboard.path}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-primary/5 hover:text-primary font-medium transition-colors"
            >
              <IconDashboard className="w-4 h-4" />
              {dashboard.label}
            </Link>
            {user.role !== "admin" && (
              <Link
                to={getProfileLink()}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-primary/5 hover:text-primary font-medium transition-colors"
              >
                <IconSettings className="w-4 h-4" />
                Hồ sơ của tôi
              </Link>
            )}
            {user.role !== "admin" && (
              <Link
                to={getHistoryLink()}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-primary/5 hover:text-primary font-medium transition-colors"
              >
                <IconHistory className="w-4 h-4" />
                {user.role === "guide" ? "Lịch trình" : "Lịch sử đặt chỗ"}
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-border-light py-2">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 font-bold transition-colors"
            >
              <IconLogout className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN NAVBAR COMPONENT
// ============================================================================
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [blogCategories, setBlogCategories] = useState([]);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch blog categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const articles = await listArticleCategories();
        setBlogCategories(articles || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Re-check user on location change
  useEffect(() => {
    window.dispatchEvent(new Event("auth-change"));
  }, [location.pathname]);

  const isBlogActive = location.pathname.startsWith("/blog");

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setOpenMobileSubmenu(null);
  };

  const handleSubmenuToggle = (menuName) => {
    setOpenMobileSubmenu(openMobileSubmenu === menuName ? null : menuName);
  };

  const handleLogout = () => {
    navigate("/auth/signout");
  };

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ============================================================================
  // STYLES
  // ============================================================================
  const navLinkClasses = ({ isActive }) =>
    `text-base px-3 py-2 rounded-btn transition-all duration-200 ${
      isActive
        ? "bg-primary/10 text-primary font-semibold shadow-sm"
        : "text-text-primary hover:bg-gray-100 hover:text-primary font-medium"
    }`;

  const dropdownBtnClasses = (isActive) =>
    `text-base px-3 py-2 rounded-btn flex items-center gap-1 transition-all duration-200 ${
      isActive
        ? "bg-primary/10 text-primary font-semibold shadow-sm"
        : "text-text-primary hover:bg-gray-100 hover:text-primary font-medium"
    }`;

  return (
    <>
      <header className="border-b border-border-light bg-bg-main/95 backdrop-blur-sm sticky top-0 z-40 transition-all">
        <div className="container-main flex items-center justify-between gap-4 py-5">
          {/* 1. Logo */}
          <NavLink
            to="/"
            className="inline-flex items-center gap-3 group shrink-0"
          >
            <img
              src="/images/uploads/logo-hue-2.jpg"
              alt="Vi Vu Cố Đô"
              className="h-12 w-auto object-contain"
            />
          </NavLink>

          {/* 2. Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-2">
            <NavLink to="/" className={navLinkClasses}>
              Trang chủ
            </NavLink>
            <NavLink to="/tours" className={navLinkClasses}>
              Chuyến tham quan
            </NavLink>

            {/* Dropdown "Cẩm nang" */}
            <div className="relative group">
              <button
                type="button"
                className={dropdownBtnClasses(isBlogActive)}
              >
                Cẩm nang <IconChevronDown className="h-4 w-4 opacity-70" />
              </button>
              <div className="absolute top-full left-0 w-48 pt-4 opacity-0 pointer-events-none scale-95 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:scale-100 transition-all duration-200 ease-out">
                <div className="bg-white rounded-card shadow-card border border-border-light py-2 overflow-hidden">
                  <NavLink
                    to="/blog"
                    className="block px-4 py-2.5 text-base text-text-primary hover:bg-primary-light hover:text-primary font-medium"
                  >
                    Tất cả bài viết
                  </NavLink>
                  {blogCategories.length > 0 && (
                    <div className="my-1 border-t border-border-light" />
                  )}
                  {blogCategories.map((category) => (
                    <NavLink
                      key={category._id}
                      to={`/blog/${category.slug}`}
                      className="block px-4 py-2.5 text-base text-text-primary hover:bg-primary-light hover:text-primary"
                    >
                      {category.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>

            <NavLink to="/places" className={navLinkClasses}>
              Địa điểm
            </NavLink>
            <NavLink to="/guides" className={navLinkClasses}>
              Hướng dẫn viên
            </NavLink>
          </nav>

          {/* 3. Actions (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search Button - Icon only */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full text-text-secondary hover:bg-gray-100 hover:text-primary transition-colors"
              aria-label="Tìm kiếm (⌘K)"
              title="Tìm kiếm (⌘K)"
            >
              <IconSearch className="h-5 w-5" />
            </button>

            <div className="h-5 w-px bg-border-light"></div>

            {/* User Menu or Login */}
            {user ? (
              <UserDropdown user={user} onLogout={handleLogout} />
            ) : (
              <NavLink
                to="/auth/signin"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 font-bold text-sm transition-colors"
              >
                <IconUser className="h-5 w-5" />
                Đăng nhập
              </NavLink>
            )}
          </div>

          {/* 4. Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full text-text-primary hover:bg-gray-100 transition-colors"
              aria-label="Tìm kiếm"
            >
              <IconSearch className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-border-light w-10 h-10 text-text-primary hover:bg-primary-light hover:border-primary/30 transition-colors"
              aria-label="Mở menu"
              onClick={toggleMenu}
            >
              <IconMenu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Mobile Drawer */}
      <Drawer isOpen={isMobileMenuOpen} onClose={toggleMenu}>
        <div className="flex flex-col h-full bg-bg-main">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border-light">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-border-light bg-primary-light">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">
                    {user.name}
                  </p>
                  <p className="text-xs text-text-secondary capitalize">
                    {user.role === "admin"
                      ? "Quản trị viên"
                      : user.role === "guide"
                      ? "Hướng dẫn viên"
                      : "Thành viên"}
                  </p>
                </div>
              </div>
            ) : (
              <span className="font-heading font-bold text-lg text-primary">
                Menu
              </span>
            )}
            <button
              type="button"
              className="btn-icon btn-ghost text-text-primary"
              onClick={toggleMenu}
              aria-label="Đóng menu"
            >
              <IconX className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
            <NavLink
              to="/"
              onClick={toggleMenu}
              className={({ isActive }) =>
                `block p-3 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-text-primary"
                }`
              }
            >
              Trang chủ
            </NavLink>
            <NavLink
              to="/tours"
              onClick={toggleMenu}
              className={({ isActive }) =>
                `block p-3 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-text-primary"
                }`
              }
            >
              Chuyến tham quan
            </NavLink>

            {/* Blog Accordion */}
            <div>
              <button
                type="button"
                onClick={() => handleSubmenuToggle("blog")}
                className={`w-full flex justify-between items-center p-3 rounded-lg text-base font-medium ${
                  isBlogActive ? "text-primary" : "text-text-primary"
                }`}
              >
                Cẩm nang
                <IconChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openMobileSubmenu === "blog" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openMobileSubmenu === "blog" && (
                <div className="ml-4 pl-4 border-l border-border-light flex flex-col gap-1 my-1">
                  <NavLink
                    to="/blog"
                    onClick={toggleMenu}
                    className="block p-2 text-sm text-text-secondary hover:text-primary font-medium"
                  >
                    Tất cả bài viết
                  </NavLink>
                  {blogCategories.map((category) => (
                    <NavLink
                      key={category._id}
                      to={`/blog/${category.slug}`}
                      onClick={toggleMenu}
                      className="block p-2 text-sm text-text-secondary hover:text-primary"
                    >
                      {category.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <NavLink
              to="/places"
              onClick={toggleMenu}
              className={({ isActive }) =>
                `block p-3 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-text-primary"
                }`
              }
            >
              Địa điểm
            </NavLink>
            <NavLink
              to="/guides"
              onClick={toggleMenu}
              className={({ isActive }) =>
                `block p-3 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-text-primary"
                }`
              }
            >
              Hướng dẫn viên
            </NavLink>

            <div className="my-2 border-t border-border-light" />

            {/* Auth Section */}
            {user ? (
              <>
                <Link
                  to={
                    user.role === "admin"
                      ? "/dashboard/admin"
                      : user.role === "guide"
                      ? "/dashboard/guide"
                      : "/dashboard/tourist"
                  }
                  onClick={toggleMenu}
                  className="flex items-center gap-3 p-3 text-base font-medium text-text-primary hover:bg-gray-50 rounded-lg"
                >
                  <IconDashboard className="w-5 h-5" />
                  {user.role === "admin"
                    ? "Admin Panel"
                    : user.role === "guide"
                    ? "Kênh HDV"
                    : "Dashboard"}
                </Link>
                {user.role !== "admin" && (
                  <Link
                    to={
                      user.role === "guide"
                        ? "/dashboard/guide/guide-profile"
                        : "/dashboard/tourist/profile"
                    }
                    onClick={toggleMenu}
                    className="flex items-center gap-3 p-3 text-base font-medium text-text-primary hover:bg-gray-50 rounded-lg"
                  >
                    <IconSettings className="w-5 h-5" />
                    Hồ sơ của tôi
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="flex w-full items-center gap-3 p-3 text-base font-bold text-red-500 hover:bg-red-50 rounded-lg text-left"
                >
                  <IconLogout className="w-5 h-5" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <NavLink
                to="/auth/signin"
                onClick={toggleMenu}
                className="flex items-center justify-center gap-2 p-3 text-base font-bold text-white bg-primary rounded-lg mt-2"
              >
                <IconUser className="w-5 h-5" />
                Đăng nhập / Đăng ký
              </NavLink>
            )}
          </nav>
        </div>
      </Drawer>
    </>
  );
}
