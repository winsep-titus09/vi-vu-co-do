// src/pages/Home/index.jsx

import React, { lazy, Suspense } from "react";
import Hero from "../../components/Hero/Hero";
import StatsSection from "./StatsSection";
import LazySection from "../../components/Common/LazySection";

// Lazy load các section không cần thiết ngay lập tức
const FeaturedTours = lazy(() => import("./FeaturedTours"));
const CategoriesSection = lazy(() => import("./CategoriesSection"));
const FeaturedGuides = lazy(() => import("./FeaturedGuides"));
const Heritage3DSection = lazy(() => import("./Heritage3DSection"));
const FeaturedPosts = lazy(() => import("./FeaturedPosts"));

/**
 * Trang chủ:
 * - Navbar (được render từ MainLayout)
 * - Hero Section (Mới)
 * - Tour Nổi Bật Section
 */
export default function HomePage() {
  return (
    <>
      {/* 1. Render Hero Section - Load ngay (above the fold) */}
      <Hero />

      {/* 2. Stats Section - Load ngay (near fold) */}
      <StatsSection />

      {/* 3. Categories Section - Lazy load */}
      <LazySection minHeight="500px">
        <CategoriesSection />
      </LazySection>

      {/* 4. Featured Tours - Lazy load */}
      <LazySection minHeight="600px">
        <FeaturedTours />
      </LazySection>

      {/* 5. Featured Guides - Lazy load */}
      <LazySection minHeight="500px">
        <FeaturedGuides />
      </LazySection>

      {/* 6. Heritage 3D Section - Lazy load (heavy component) */}
      <LazySection minHeight="700px" rootMargin="300px">
        <Heritage3DSection />
      </LazySection>

      {/* 7. Featured Posts - Lazy load */}
      <LazySection minHeight="500px">
        <FeaturedPosts />
      </LazySection>
    </>
  );
}
