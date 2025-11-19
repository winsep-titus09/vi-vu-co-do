// src/lib/router.jsx

import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
// Import DashboardLayout (nếu bạn có layout riêng cho admin/user)
// import DashboardLayout from '../layouts/DashboardLayout';

// --- Tải lười (Lazy Loading) các trang ---
// Tải trang chủ ngay lập tức vì đây là trang đầu tiên
import HomePage from "../pages/Home/index";
// Tải lười các trang khác để tối ưu
const ToursPage = lazy(() => import("../pages/Tours/index"));
const TourDetailPage = lazy(() => import("../pages/Tours/Detail/index"));
const PlacesPage = lazy(() => import("../pages/Places/index"));
const GuideProfilePage = lazy(() => import("../pages/Guides/Profile/index"));
const BlogPage = lazy(() => import("../pages/Blog/index"));
const PostDetailPage = lazy(() => import("../pages/Blog/PostDetail"));
const SignInPage = lazy(() => import("../pages/Auth/SignIn"));
const SignUpPage = lazy(() => import("../pages/Auth/SignUp"));
const NotFoundPage = lazy(() => import("../pages/Error/NotFound"));

// Component Fallback (hiển thị khi trang đang tải lười)
import Spinner from "../components/Loaders/Spinner";
const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Spinner />
  </div>
);

// --- Định nghĩa các routes ---
const router = createBrowserRouter([
  {
    // Layout chính (Navbar + Footer)
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFoundPage />, // Hiển thị trang 404 nếu route không khớp
    children: [
      {
        index: true, // Đây là route cho trang chủ (path: '/')
        element: <HomePage />,
      },
      // Thêm Suspense để bao bọc các route tải lười
      {
        path: "tours",
        element: (
          <Suspense fallback={<PageFallback />}>
            <ToursPage />
          </Suspense>
        ),
      },
      {
        path: "tours/:id",
        element: (
          <Suspense fallback={<PageFallback />}>
            <TourDetailPage />
          </Suspense>
        ),
      },
      {
        path: "places",
        element: (
          <Suspense fallback={<PageFallback />}>
            <PlacesPage />
          </Suspense>
        ),
      },
      {
        path: "guides/:id",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideProfilePage />
          </Suspense>
        ),
      },
      {
        path: "blog",
        element: (
          <Suspense fallback={<PageFallback />}>
            <BlogPage />
          </Suspense>
        ),
      },
      {
        path: "blog/:slug",
        element: (
          <Suspense fallback={<PageFallback />}>
            <PostDetailPage />
          </Suspense>
        ),
      },
      {
        path: "auth/signin",
        element: (
          <Suspense fallback={<PageFallback />}>
            <SignInPage />
          </Suspense>
        ),
      },
      {
        path: "auth/signup",
        element: (
          <Suspense fallback={<PageFallback />}>
            <SignUpPage />
          </Suspense>
        ),
      },
      // (Bạn có thể thêm các route cho Dashboard sau...)
    ],
  },
]);

/**
 * Component AppRouter:
 * Cung cấp router cho toàn bộ ứng dụng.
 */
export default function AppRouter() {
  return <RouterProvider router={router} />;
}
