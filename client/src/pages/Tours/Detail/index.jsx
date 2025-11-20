// src/pages/Tours/Detail/index.jsx

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import Breadcrumbs from "../../../components/Breadcrumbs/Breadcrumbs";
// Removed: import TourCard from "../../../components/Cards/TourCard"; // Không dùng TourCard trong gợi ý mới này

// Import icons
import {
  IconClock,
  IconMapPin,
  IconStar,
  IconPlay,
  Icon3D,
  IconWifi, // New: Ví dụ icon Wi-Fi
  IconShower, // New: Ví dụ icon Shower
  IconCalendar, // New: Ví dụ icon Calendar
  IconCheck, // New: Ví dụ icon Check
} from "../../../icons/IconBox"; // Đảm bảo các icon này tồn tại hoặc bạn có thể thay thế bằng icon khác phù hợp
import IconArrowRight from "../../../icons/IconArrowRight";
import { IconChevronDown } from "../../../icons/IconChevronDown";

// --- CONSTANTS & MOCK DATA ---
const BASE_PRICE = 42;
const CHILD_PRICE = 21;

const guideOptions = [
  { value: "random", label: "Ngẫu nhiên (Mặc định)" },
  { value: "vi", label: "HDV Tiếng Việt" },
  { value: "en", label: "HDV Tiếng Anh" },
  { value: "female", label: "HDV Nữ" },
  { value: "male", label: "HDV Nam" },
];

// [New] Mock Data cho Amenities
const tourAmenities = [
  {
    icon: <IconCheck className="w-5 h-5 text-primary" />,
    label: "Hướng dẫn viên chuyên nghiệp",
  },
  {
    icon: <IconCalendar className="w-5 h-5 text-primary" />,
    label: "Lịch trình linh hoạt",
  },
  {
    icon: <IconClock className="w-5 h-5 text-primary" />,
    label: "Tour đêm độc đáo",
  },
  {
    icon: <IconWifi className="w-5 h-5 text-primary" />,
    label: "Miễn phí Wi-Fi tại điểm dừng",
  }, // Ví dụ
  {
    icon: <IconMapPin className="w-5 h-5 text-primary" />,
    label: "Gặp mặt tại trung tâm",
  },
  {
    icon: <IconCheck className="w-5 h-5 text-primary" />,
    label: "Vé tham quan bao gồm",
  },
];

export default function TourDetailPage() {
  // --- FORM STATE ---
  const [selectedDate, setSelectedDate] = useState();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedGuide, setSelectedGuide] = useState(guideOptions[0]);
  const [note, setNote] = useState("");

  // --- UI STATE ---
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const dateRef = useRef(null);
  const guideRef = useRef(null);

  const totalPrice = adults * BASE_PRICE + children * CHILD_PRICE;

  // Click Outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setIsDateOpen(false);
      }
      if (guideRef.current && !guideRef.current.contains(event.target)) {
        setIsGuideOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setIsDateOpen(false);
  };

  const handleSelectGuide = (option) => {
    setSelectedGuide(option);
    setIsGuideOpen(false);
  };

  // Submit Handler
  const handleBooking = () => {
    if (!selectedDate) {
      alert("Vui lòng chọn ngày khởi hành để tiếp tục!");
      setIsDateOpen(true);
      return;
    }
    const bookingData = {
      tourId: "tour_hue_night_01",
      tourName: "Dạo bộ Phố Cổ về đêm",
      date: format(selectedDate, "yyyy-MM-dd"),
      guests: { adults, children },
      totalPrice,
      guidePreference: selectedGuide.value,
      note: note.trim(),
    };
    console.log("📦 Booking Data:", bookingData);
    alert(`Đã nhận yêu cầu đặt tour!\nTổng tiền: $${totalPrice}`);
  };

  return (
    <div className="min-h-screen bg-bg-main pb-20 pt-6">
      <div className="container-main space-y-8">
        <Breadcrumbs
          items={[
            { label: "Chuyến tham quan", href: "/tours" },
            { label: "Dạo bộ Phố Cổ về đêm" },
          ]}
        />

        <div className="flex flex-col gap-10">
          {/* 1. HEADER INFO */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Lịch sử • Đi bộ đêm • Nhóm nhỏ
                </p>
                <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-text-primary leading-tight">
                  Dạo bộ Phố Cổ ban đêm & <br className="hidden md:inline" />
                  Trải nghiệm 3D Nhà thờ Lớn
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <IconMapPin className="w-4 h-4" />
                    Phố cổ, trung tâm
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border-light"></span>
                  <span className="inline-flex items-center gap-1.5">
                    <IconClock className="w-4 h-4" />
                    3.5 giờ
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border-light"></span>
                  <span className="inline-flex items-center gap-1.5 text-[#BC4C00]">
                    <IconStar className="w-4 h-4" />
                    <span className="underline decoration-[#BC4C00]/30 underline-offset-2">
                      4.9 (122 đánh giá)
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. MEDIA GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[550px]">
            <div className="flex flex-col gap-3 w-full lg:h-full">
              <div className="relative w-full aspect-video lg:aspect-auto lg:flex-1 min-h-0 rounded-2xl overflow-hidden bg-black group cursor-pointer">
                <img
                  src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/dainoi5.jpg"
                  alt="Main Video Thumbnail"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition-opacity duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/40 text-white shadow-xl transition-transform duration-300 group-hover:scale-110 pl-1">
                    <IconPlay className="w-6 h-6 fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wide border border-white/10">
                  Video giới thiệu
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 h-16 sm:h-20 shrink-0">
                {/* Thumbnails */}
                <div className="rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all">
                  <img
                    src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg"
                    className="w-full h-full object-cover"
                    alt="thumb"
                  />
                </div>
                <div className="rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all">
                  <img
                    src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuatuhieu1.jpg"
                    className="w-full h-full object-cover"
                    alt="thumb"
                  />
                </div>
                <div className="rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all">
                  <img
                    src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/cautrangtien1.jpg"
                    className="w-full h-full object-cover"
                    alt="thumb"
                  />
                </div>
                <div className="rounded-xl overflow-hidden cursor-pointer bg-gray-100 flex items-center justify-center text-xs font-bold text-text-secondary border-2 border-transparent hover:border-primary transition-all hover:bg-primary/5 hover:text-primary">
                  +8 ảnh
                </div>
              </div>
            </div>
            <div className="w-full aspect-video lg:aspect-auto lg:h-full rounded-3xl border border-primary/20 bg-primary/5 p-1">
              <div className="h-full w-full rounded-[20px] bg-white border border-white/50 overflow-hidden relative group cursor-grab active:cursor-grabbing">
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm border border-primary/10">
                    <Icon3D className="w-3.5 h-3.5" /> 3D Model
                  </span>
                </div>
                <div className="absolute inset-0 bg-gray-900">
                  <img
                    src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/ngomon_3d_placeholder.jpg"
                    alt="3D Model"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="bg-primary/90 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-primary hover:scale-105 transition-all backdrop-blur-sm border border-white/20">
                      Tương tác 3D
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 text-white/60 text-[10px] font-medium uppercase tracking-wider">
                    Xoay • Phóng to • Khám phá
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. MAIN CONTENT (Overview & Itinerary) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 relative z-10 pt-6">
            <div className="md:col-span-7 space-y-8">
              <section className="space-y-3">
                <h2 className="text-2xl font-heading font-bold text-text-primary">
                  Tổng quan
                </h2>
                <div className="prose prose-sm text-text-secondary leading-relaxed space-y-3">
                  <p>
                    Khi đèn thành phố vừa sáng, bạn bước vào những con ngõ hẹp
                    và sân yên tĩnh nơi khói hương quyện quanh mái ngói. Chuyến
                    đi bộ này đan xen kiến trúc, khẩu truyền và nghi lễ thường
                    nhật làm nên diện mạo Phố Cổ về đêm.
                  </p>
                  <p>
                    Bạn sẽ khám phá các đền ít người biết, phố nghề và quảng
                    trường nhà thờ biểu tượng, được hỗ trợ bởi mô hình 3D tương
                    tác hé lộ các lớp kiến trúc của di tích.
                  </p>
                </div>
              </section>
              <section className="space-y-4">
                <h2 className="text-2xl font-heading font-bold text-text-primary">
                  Lịch trình
                </h2>
                <div className="relative border-l-2 border-border-light ml-3 space-y-6 pb-2">
                  {[
                    {
                      time: "7:30 PM",
                      title: "Gặp tại quảng trường & định hướng 3D",
                      desc: "Giới thiệu, lưu ý an toàn, và xem nhanh mô hình 3D mặt tiền nhà thờ.",
                    },
                    {
                      time: "8:15 PM",
                      title: "Đền ẩn & bàn thờ ngõ",
                      desc: "Thăm hai đền trong khu phố và quan sát lễ dâng buổi tối kèm bối cảnh từ HDV.",
                    },
                    {
                      time: "9:30 PM",
                      title: "Kể chuyện tại quán trà",
                      desc: "Kết thúc với thưởng trà truyền thống và phần hỏi đáp về lịch sử.",
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="relative pl-6 group">
                      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-primary group-hover:bg-primary transition-colors"></div>
                      <span className="text-xs font-bold text-primary uppercase tracking-wide">
                        {item.time}
                      </span>
                      <h4 className="text-base font-bold text-text-primary mt-0.5">
                        {item.title}
                      </h4>
                      <p className="text-sm text-text-secondary mt-1">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* 4. SIDEBAR (Guide & Booking Form) */}
            <div className="md:col-span-5 space-y-6 h-fit md:sticky md:top-24">
              <div className="rounded-3xl border border-border-light bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-text-primary font-heading">
                    Hướng dẫn viên
                  </h3>
                  <Link
                    to="/guides/1"
                    className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    Xem hồ sơ <IconArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    <img
                      src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/guides/guide_female_1.jpg"
                      className="w-full h-full object-cover"
                      alt="Guide"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">
                      Minh Hương
                    </p>
                    <p className="text-[10px] text-text-secondary uppercase tracking-wide">
                      Nhà sử học • EN / VI
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-[#BC4C00] font-bold mt-0.5">
                      <IconStar className="w-3 h-3" /> 4.9
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border-light bg-white p-5 shadow-lg shadow-black/5 space-y-5">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-text-secondary">Giá từ</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-heading font-bold text-primary">
                        ${BASE_PRICE}
                      </span>
                      <span className="text-xs text-text-secondary">
                        / người
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-700 text-[10px] font-bold">
                      Miễn phí hủy 24h
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1" ref={dateRef}>
                    <label className="text-xs font-bold text-text-secondary uppercase">
                      Ngày đi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div
                        onClick={() => setIsDateOpen(!isDateOpen)}
                        className={`w-full rounded-xl border px-3 py-2.5 text-sm text-left cursor-pointer transition-all select-none bg-bg-main/50 hover:border-primary/50 ${
                          isDateOpen
                            ? "border-primary ring-1 ring-primary bg-white"
                            : "border-border-light"
                        }`}
                      >
                        <span
                          className={
                            selectedDate
                              ? "text-text-primary"
                              : "text-text-secondary/60"
                          }
                        >
                          {selectedDate
                            ? format(selectedDate, "dd/MM/yyyy")
                            : "Chọn ngày"}
                        </span>
                      </div>
                      {isDateOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 z-50 animate-fade-in-up">
                          <div className="bg-white rounded-xl shadow-xl border border-border-light p-3">
                            <DayPicker
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleSelectDate}
                              locale={vi}
                              modifiersClassNames={{
                                selected:
                                  "bg-primary text-white rounded-full hover:bg-primary",
                                today: "text-primary font-bold",
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-secondary uppercase">
                        Người lớn (${BASE_PRICE})
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={adults}
                        onChange={(e) =>
                          setAdults(Math.max(1, parseInt(e.target.value) || 0))
                        }
                        className="w-full rounded-xl border border-border-light bg-bg-main/50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-secondary uppercase">
                        Trẻ em (${CHILD_PRICE})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={children}
                        onChange={(e) =>
                          setChildren(
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="w-full rounded-xl border border-border-light bg-bg-main/50 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1" ref={guideRef}>
                    <label className="text-xs font-bold text-text-secondary uppercase">
                      Ưu tiên hướng dẫn viên
                    </label>
                    <div className="relative">
                      <div
                        onClick={() => setIsGuideOpen(!isGuideOpen)}
                        className={`w-full rounded-xl border px-3 py-2.5 text-sm flex items-center justify-between cursor-pointer transition-all select-none bg-bg-main/50 hover:border-primary/50 ${
                          isGuideOpen
                            ? "border-primary ring-1 ring-primary bg-white"
                            : "border-border-light"
                        }`}
                      >
                        <span className="text-text-primary truncate">
                          {selectedGuide.label}
                        </span>
                        <IconChevronDown
                          className={`h-4 w-4 text-text-secondary transition-transform duration-200 ${
                            isGuideOpen ? "rotate-180 text-primary" : ""
                          }`}
                        />
                      </div>
                      {isGuideOpen && (
                        <div className="absolute top-full left-0 w-full mt-2 z-50 animate-fade-in-up">
                          <div className="bg-white rounded-xl shadow-xl border border-border-light py-1 overflow-hidden max-h-60 overflow-y-auto">
                            {guideOptions.map((option) => (
                              <div
                                key={option.value}
                                onClick={() => handleSelectGuide(option)}
                                className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                                  selectedGuide.value === option.value
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-text-primary hover:bg-bg-main hover:text-primary"
                                }`}
                              >
                                {option.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-secondary uppercase">
                      Ghi chú
                    </label>
                    <textarea
                      rows="2"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full rounded-xl border border-border-light bg-bg-main/50 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-all placeholder:text-text-secondary/60"
                      placeholder="Yêu cầu đặc biệt (ăn chay, xe lăn...)"
                    ></textarea>
                  </div>
                </div>
                <div className="pt-3 border-t border-border-light">
                  <div className="flex justify-between text-sm font-medium text-text-primary mb-4">
                    <span>Tổng cộng</span>
                    <span className="font-bold text-lg text-primary">
                      ${totalPrice}
                    </span>
                  </div>
                  <button
                    onClick={handleBooking}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary text-white font-bold py-3.5 hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                  >
                    Đặt ngay <IconArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-center text-text-secondary mt-2">
                    Thanh toán an toàn qua VNPay / MoMo
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 6. AMENITIES & RULES SECTION (NEW) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-border-light">
            {/* Left Column: Image with overlay */}
            <div className="relative rounded-3xl overflow-hidden bg-bg-main shadow-xl min-h-[300px] md:min-h-[400px]">
              <img
                src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/chuathienmu2.jpg" // Ảnh nền lớn
                alt="Scenic view"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              {/* Guide/Expert Card Overlay (Top Right) */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-3 flex items-center space-x-3 shadow-lg border border-white/20">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                  <img
                    src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/guides/guide_female_1.jpg"
                    alt="Marina Joseph"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary leading-tight">
                    Minh Hương
                  </p>
                  <div className="flex text-[#BC4C00] text-xs mt-0.5">
                    <IconStar className="w-3 h-3" />
                    <IconStar className="w-3 h-3" />
                    <IconStar className="w-3 h-3" />
                    <IconStar className="w-3 h-3" />
                    <IconStar className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Smaller Image with Play Button (Bottom Left) */}
              <div className="absolute bottom-6 left-6 w-32 h-32 rounded-xl overflow-hidden shadow-2xl border-4 border-white group cursor-pointer">
                <img
                  src="https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/thiennhien/hoanghon.jpg" // Ảnh nhỏ
                  alt="Video thumbnail"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-sm text-white border border-white/50 transition-transform group-hover:scale-110">
                    <IconPlay className="w-5 h-5 fill-current pl-0.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Amenities & Rules */}
            <div className="space-y-10">
              {/* Amenities */}
              <div>
                <h3 className="text-2xl font-heading font-bold text-text-primary mb-5">
                  Tiện ích & Bao gồm
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {tourAmenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-text-secondary"
                    >
                      {amenity.icon}
                      <span className="text-sm font-medium">
                        {amenity.label}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="mt-8 px-6 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-md hover:bg-orange-600 transition-colors">
                  TƯ VẤN TỪ CHUYÊN GIA CỦA CHÚNG TÔI
                </button>
              </div>

              {/* Tour Rules */}
              <div>
                <h3 className="text-2xl font-heading font-bold text-text-primary mb-5">
                  Quy tắc Tour
                </h3>
                <div className="prose prose-sm text-text-secondary leading-relaxed">
                  <p>
                    Để đảm bảo chuyến tham quan diễn ra suôn sẻ và an toàn, quý
                    khách vui lòng tuân thủ các quy tắc sau:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      Đến điểm tập trung đúng giờ (15 phút trước giờ khởi hành).
                    </li>
                    <li>
                      Mặc trang phục lịch sự, phù hợp khi thăm các địa điểm tôn
                      giáo.
                    </li>
                    <li>Không vứt rác, giữ gìn vệ sinh chung.</li>
                    <li>Tuân thủ hướng dẫn của HDV trong suốt hành trình.</li>
                    <li>Trẻ em dưới 12 tuổi phải có người lớn đi kèm.</li>
                  </ul>
                  <p>
                    Mọi thắc mắc hoặc yêu cầu đặc biệt, vui lòng liên hệ trước
                    với chúng tôi.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. REVIEWS */}
          <div className="pt-10 border-t border-border-light">
            <h2 className="text-2xl font-heading font-bold text-text-primary mb-6">
              Đánh giá{" "}
              <span className="text-lg font-normal text-text-secondary">
                (122)
              </span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-border-light p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">
                        Aisha Rahman
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        Tháng 3, 2025
                      </p>
                    </div>
                  </div>
                  <div className="flex text-[#BC4C00]">
                    <IconStar className="w-3.5 h-3.5" />
                    <IconStar className="w-3.5 h-3.5" />
                    <IconStar className="w-3.5 h-3.5" />
                    <IconStar className="w-3.5 h-3.5" />
                    <IconStar className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed italic">
                  "Mô hình 3D thực sự giúp tôi hình dung được kiến trúc..."
                </p>
              </div>
              <div className="bg-white border border-border-light p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">
                        Minh Anh
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        Tháng 2, 2025
                      </p>
                    </div>
                  </div>
                  <div className="flex text-[#BC4C00]">
                    <IconStar className="w-3.5 h-3.5" />
                    <IconStar className="w-3.5 h-3.5" />
                    <IconStar className="w-3.5 h-3.5" />
                    <IconStar className="w-3.5 h-3.5" />
                    <IconStar className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed italic">
                  "Một trải nghiệm không thể quên..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
