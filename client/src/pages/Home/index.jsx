// src/pages/Home/index.jsx

import React from "react";
import Hero from "../../components/Hero/Hero"; // <-- 1. Import lại Hero
import StatsSection from "./StatsSection"; // <-- 2. Import StatsSection
import FeaturedTours from "./FeaturedTours";
import CategoriesSection from "./CategoriesSection";
import FeaturedGuides from "./FeaturedGuides";
import Heritage3DSection from "./Heritage3DSection";
import FeaturedPosts from "./FeaturedPosts";

/**
 * Trang chủ:
 * - Navbar (được render từ MainLayout)
 * - Hero Section (Mới)
 * - Tour Nổi Bật Section
 */
export default function HomePage() {
  return (
    <>
      {/* 1. Render Hero Section */}
      <Hero />

      {/* 2. CẬP NHẬT: Thêm Stats Section (Section bản đồ & số liệu) */}
      <StatsSection />

      {/* 2. Thêm Categories Section (Grid 01-06) */}
      <CategoriesSection />

      {/* 3. Thay thế section placeholder cũ bằng FeaturedTours */}
      <FeaturedTours />

      <FeaturedGuides />

      <Heritage3DSection />

      <FeaturedPosts />
    </>
  );
}
