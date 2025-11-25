// src/lib/router.jsx

import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// --- Layouts ---
import MainLayout from "../layouts/MainLayout"; // Layout cho khách vãng lai (Public)
// Layout riêng cho từng đối tượng (Lazy load)
const TouristLayout = lazy(() => import("../layouts/TouristLayout"));
const GuideLayout = lazy(() => import("../layouts/GuideLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));

// --- Pages: Public (Khách vãng lai) ---
import HomePage from "../pages/Home/index"; // Load trang chủ ngay lập tức (Eager load)

// Lazy load các trang con để tối ưu hiệu suất
const ToursPage = lazy(() => import("../pages/Tours/index"));
const TourDetailPage = lazy(() => import("../pages/Tours/Detail/index"));
const PlacesPage = lazy(() => import("../pages/Places/index"));
const PlaceDetailPage = lazy(() => import("../pages/Places/PlaceDetail"));
const GuidesPage = lazy(() => import("../pages/Guides/index"));
const GuideProfilePage = lazy(() => import("../pages/Guides/Profile/index"));
const BlogPage = lazy(() => import("../pages/Blog/index"));
const PostDetailPage = lazy(() => import("../pages/Blog/PostDetail"));

// --- Pages: Auth ---
const SignInPage = lazy(() => import("../pages/Auth/SignIn"));
const SignUpPage = lazy(() => import("../pages/Auth/SignUp"));
// const SignOutPage = lazy(() => import("../pages/Auth/SignOut"));

// --- Pages: Dashboard (3 Roles) ---

// 1. Tourist Dashboard Pages
const TouristDashboard = lazy(() => import("../pages/Dashboard/Tourist/index"));
const TouristHistory = lazy(() => import("../pages/Dashboard/Tourist/History"));
const TouristProfile = lazy(() => import("../pages/Dashboard/Tourist/Profile"));
const TouristSettings = lazy(() =>
  import("../pages/Dashboard/Tourist/Settings")
);

// 2. Guide Dashboard Pages
const GuideDashboard = lazy(() => import("../pages/Dashboard/Guide/index"));
// const GuideTours = lazy(() => import("../pages/Dashboard/Guide/MyTours")); // Ví dụ quản lý tour

// 3. Admin Dashboard Pages
const AdminDashboard = lazy(() => import("../pages/Dashboard/Admin/index"));
const AdminCategories = lazy(() =>
  import("../pages/Dashboard/Admin/Categories")
);
const AdminModels3D = lazy(() => import("../pages/Dashboard/Admin/Models3D"));
const AdminNotifications = lazy(() =>
  import("../pages/Dashboard/Admin/Notifications")
);

// --- Pages: Error ---
const NotFoundPage = lazy(() => import("../pages/Error/NotFound"));
const ServerErrorPage = lazy(() => import("../pages/Error/ServerError"));

// --- Fallback Component (Loading Spinner) ---
import Spinner from "../components/Loaders/Spinner";
const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-bg-main">
    <Spinner />
  </div>
);

// --- Router Configuration ---
const router = createBrowserRouter([
  // 1. PUBLIC ROUTES (Sử dụng MainLayout - Có Navbar & Footer chuẩn)
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },

      // Tours
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

      // Places (Địa điểm)
      {
        path: "places",
        element: (
          <Suspense fallback={<PageFallback />}>
            <PlacesPage />
          </Suspense>
        ),
      },
      {
        path: "places/:id",
        element: (
          <Suspense fallback={<PageFallback />}>
            <PlaceDetailPage />
          </Suspense>
        ),
      },

      // Guides (Hướng dẫn viên)
      {
        path: "guides",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuidesPage />
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

      // Blog (Cẩm nang)
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

      // Authentication
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

      // Test Error Page
      {
        path: "500",
        element: (
          <Suspense fallback={<PageFallback />}>
            <ServerErrorPage />
          </Suspense>
        ),
      },
    ],
  },

  // 2. TOURIST DASHBOARD (Sử dụng TouristLayout - Gần gũi, giữ Navbar)
  {
    path: "/dashboard/tourist",
    element: (
      <Suspense fallback={<PageFallback />}>
        <TouristLayout />
      </Suspense>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageFallback />}>
            <TouristDashboard />
          </Suspense>
        ),
      },
      {
        path: "history",
        element: (
          <Suspense fallback={<PageFallback />}>
            <TouristHistory />
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<PageFallback />}>
            <TouristProfile />
          </Suspense>
        ),
      },
      {
        path: "settings",
        element: (
          <Suspense fallback={<PageFallback />}>
            <TouristSettings />
          </Suspense>
        ),
      },
      // Các route con khác của Tourist sẽ thêm ở đây (ví dụ: wishlist...)
    ],
  },

  // 3. GUIDE DASHBOARD (Sử dụng GuideLayout - Workspace chuyên nghiệp)
  {
    path: "/dashboard/guide",
    element: (
      <Suspense fallback={<PageFallback />}>
        <GuideLayout />
      </Suspense>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideDashboard />
          </Suspense>
        ),
      },
      // Các route con của Guide: schedule, earnings, tours...
    ],
  },

  // 4. ADMIN DASHBOARD (Sử dụng AdminLayout - Dark Sidebar, Full Control)
  {
    path: "/dashboard/admin",
    element: (
      <Suspense fallback={<PageFallback />}>
        <AdminLayout />
      </Suspense>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      {
        path: "categories",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminCategories />
          </Suspense>
        ),
      },
      {
        path: "models-3d",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminModels3D />
          </Suspense>
        ),
      },
      {
        path: "notifications",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminNotifications />
          </Suspense>
        ),
      },
      // Các route quản lý users, tours...
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
