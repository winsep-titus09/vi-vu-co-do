// src/components/Filters/FilterBar.jsx

import React, { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { toursApi } from "../../features/tours/api";
import { IconSearch } from "../../icons/IconSearch";
import { IconChevronDown } from "../../icons/IconChevronDown";
import { IconCalendar } from "../../icons/IconCalendar";
import IconTag from "../../icons/IconTag";
import { IconCheck } from "../../icons/IconBox";

export default function FilterBar({ onFilterChange }) {
  // Theme dropdown state
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [categories, setCategories] = useState([]);
  const themeRef = useRef(null);

  // Date dropdown state
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(undefined);
  const dateRef = useRef(null);

  // Other filters
  const [keyword, setKeyword] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [smallGroup, setSmallGroup] = useState(false);
  const [has3DPreview, setHas3DPreview] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await toursApi.getCategories();
        const categoriesData = Array.isArray(response?.categories)
          ? response.categories
          : [];
        setCategories(categoriesData);
      } catch (err) {
        console.error("Fetch categories error:", err);
      }
    };

    fetchCategories();
  }, []);

  // Xử lý click outside (Dùng chung logic)
  useEffect(() => {
    function handleClickOutside(event) {
      // Đóng Theme dropdown
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setIsThemeOpen(false);
      }
      // Đóng Date dropdown
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setIsDateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTheme = (theme) => {
    setSelectedTheme(theme);
    setIsThemeOpen(false);
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setIsDateOpen(false);
  };

  const handleSearch = () => {
    if (onFilterChange) {
      onFilterChange({
        keyword,
        category: selectedTheme,
        date: selectedDate,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        smallGroup,
        has3DPreview,
      });
    }
  };

  const handleClearFilters = () => {
    setKeyword("");
    setSelectedTheme("");
    setSelectedDate(undefined);
    setMaxPrice("");
    setSmallGroup(false);
    setHas3DPreview(false);
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  // Auto-trigger search when Enter is pressed in keyword input
  const handleKeywordKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Class chung cho các ô Input/Trigger để đảm bảo đồng bộ
  const triggerClasses = (isOpen) => `
    group relative h-full flex items-center w-full rounded-2xl border bg-bg-main/30 py-2.5 text-sm cursor-pointer transition-all select-none
    ${
      isOpen
        ? "bg-white border-primary ring-1 ring-primary"
        : "border-border-light hover:border-primary/50"
    }
  `;

  return (
    <div className="rounded-3xl border border-white/60 bg-white p-3 shadow-card backdrop-blur-sm">
      <div className="flex flex-col md:flex-row gap-2">
        {/* 1. TỪ KHÓA */}
        <div className="relative group w-full md:flex-[2]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <IconSearch className="h-5 w-5 text-text-secondary group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Tìm điểm đến..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeywordKeyPress}
            className="block w-full rounded-2xl border border-border-light bg-bg-main/30 pl-11 pr-4 py-2.5 text-sm text-text-primary outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-secondary/60"
          />
        </div>

        {/* 2. CHỦ ĐỀ (Custom Dropdown) */}
        <div className="relative w-full md:flex-[1.5]" ref={themeRef}>
          <div
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            className={`${triggerClasses(isThemeOpen)} pl-11 pr-10`}
          >
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <IconTag
                className={`h-5 w-5 transition-colors ${
                  isThemeOpen
                    ? "text-primary"
                    : "text-text-secondary group-hover:text-primary"
                }`}
              />
            </div>

            <span
              className={`truncate ${
                selectedTheme ? "text-text-primary" : "text-text-secondary/60"
              }`}
            >
              {selectedTheme
                ? categories.find((c) => c._id === selectedTheme)?.name
                : "Chủ đề"}
            </span>

            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              <IconChevronDown
                className={`h-4 w-4 text-text-secondary transition-transform duration-200 ${
                  isThemeOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </div>
          </div>

          {isThemeOpen && (
            <div className="absolute top-full left-0 w-full mt-2 z-50 animate-fade-in-up">
              <div className="bg-white rounded-2xl shadow-xl border border-border-light py-2 overflow-hidden">
                <div
                  onClick={() => handleSelectTheme("")}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    selectedTheme === ""
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-text-primary hover:bg-bg-main hover:text-primary"
                  }`}
                >
                  Tất cả chủ đề
                </div>
                {categories.map((category) => (
                  <div
                    key={category._id}
                    onClick={() => handleSelectTheme(category._id)}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                      selectedTheme === category._id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-text-primary hover:bg-bg-main hover:text-primary"
                    }`}
                  >
                    {category.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. NGÀY KHỞI HÀNH (Cập nhật: Custom Dropdown giống Chủ đề) */}
        <div className="relative w-full md:flex-1" ref={dateRef}>
          <div
            onClick={() => setIsDateOpen(!isDateOpen)}
            // Sử dụng chung class triggerClasses
            className={`${triggerClasses(isDateOpen)} pl-11 pr-4`}
          >
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <IconCalendar
                className={`h-5 w-5 transition-colors ${
                  isDateOpen
                    ? "text-primary"
                    : "text-text-secondary group-hover:text-primary"
                }`}
              />
            </div>

            <span
              className={`truncate ${
                selectedDate ? "text-text-primary" : "text-text-secondary/60"
              }`}
            >
              {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Ngày đi"}
            </span>
          </div>

          {/* Dropdown Lịch */}
          {isDateOpen && (
            <div className="absolute top-full left-0 mt-2 z-50 animate-fade-in-up">
              <div className="bg-white rounded-2xl shadow-xl border border-border-light p-2">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleSelectDate}
                  locale={vi}
                  modifiersClassNames={{
                    selected: "rdp-day-selected", // Cần đảm bảo CSS app.css hỗ trợ class này hoặc màu mặc định
                    today: "rdp-day-today font-bold text-primary",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 4. NGÂN SÁCH */}
        <div className="relative group w-full md:flex-1">
          <input
            type="number"
            placeholder="Giá tối đa"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="block w-full rounded-2xl border border-border-light bg-bg-main/30 pl-5 pr-8 py-2.5 text-sm text-text-primary outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-text-secondary/60"
          />
          <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-bold text-text-secondary pointer-events-none">
            $
          </span>
        </div>

        {/* 5. NÚT TÌM KIẾM */}
        <button
          onClick={handleSearch}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200 flex-none active:scale-95"
        >
          <IconSearch className="h-5 w-5" />
          <span className="hidden lg:inline">Tìm kiếm</span>
        </button>
      </div>

      {/* Tùy chọn phụ */}
      <div className="mt-3 flex flex-wrap items-center gap-4 px-2 pt-2 border-t border-border-light/40">
        <div className="flex-1"></div>

        <button
          onClick={handleClearFilters}
          className="text-xs font-bold text-text-secondary hover:text-red-500 transition-colors underline decoration-transparent hover:decoration-red-500 underline-offset-2"
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
}
