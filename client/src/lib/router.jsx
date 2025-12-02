// src/lib/router.jsx

import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// ============================================================================
// LAYOUTS
// ============================================================================
import MainLayout from "../layouts/MainLayout"; // Layout cho khách vãng lai (Public)
// Layout riêng cho từng đối tượng (Lazy load)
const TouristLayout = lazy(() => import("../layouts/TouristLayout"));
const GuideLayout = lazy(() => import("../layouts/GuideLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));

// ============================================================================
// PAGES: PUBLIC
// ============================================================================
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

// ============================================================================
// PAGES: AUTH
// ============================================================================
const AuthPage = lazy(() => import("../pages/Auth/AuthPage"));
const SignOutPage = lazy(() => import("../pages/Auth/SignOut"));

// ============================================================================
// PAGES: BOOKING
// ============================================================================
const BookingStepReview = lazy(() => import("../pages/Booking/StepReview"));
const BookingStepPayment = lazy(() => import("../pages/Booking/StepPayment"));
const BookingStepReceipt = lazy(() => import("../pages/Booking/StepReceipt"));

// ============================================================================
// PAGES: DASHBOARD (3 ROLES)
// ============================================================================

// Tourist Dashboard Pages
const TouristDashboard = lazy(() => import("../pages/Dashboard/Tourist/index"));
const TouristHistory = lazy(() => import("../pages/Dashboard/Tourist/History"));
const TouristProfile = lazy(() => import("../pages/Dashboard/Tourist/Profile"));
const TouristSettings = lazy(() =>
  import("../pages/Dashboard/Tourist/Settings")
);
const TouristNotifications = lazy(() =>
  import("../pages/Dashboard/Tourist/Notifications")
);
const TouristTransactionHistory = lazy(() =>
  import("../pages/Dashboard/Tourist/TransactionHistory")
);
const TouristInvoices = lazy(() =>
  import("../pages/Dashboard/Tourist/Invoices")
);

// 2. Guide Dashboard Pages
const GuideDashboard = lazy(() => import("../pages/Dashboard/Guide/index"));
const GuideMyTours = lazy(() => import("../pages/Dashboard/Guide/MyTours"));
const GuideCreateTour = lazy(() =>
  import("../pages/Dashboard/Guide/CreateTour")
);
const GuideEditTour = lazy(() => import("../pages/Dashboard/Guide/EditTour"));
const GuideSchedule = lazy(() => import("../pages/Dashboard/Guide/Schedule"));
const GuideEarnings = lazy(() => import("../pages/Dashboard/Guide/Earnings"));
const GuideProfileSettings = lazy(() =>
  import("../pages/Dashboard/Guide/ProfileSettings")
);
const GuideReviews = lazy(() => import("../pages/Dashboard/Guide/Reviews"));
const GuideMyPosts = lazy(() => import("../pages/Dashboard/Guide/MyPosts"));
const GuideCreatePost = lazy(() =>
  import("../pages/Dashboard/Guide/CreatePost")
);
const GuideEditPost = lazy(() => import("../pages/Dashboard/Guide/EditPost"));
const GuideBookingRequests = lazy(() =>
  import("../pages/Dashboard/Guide/BookingRequests")
);
const GuideBookingDetail = lazy(() =>
  import("../pages/Dashboard/Guide/BookingDetail")
);
const GuideNotifications = lazy(() =>
  import("../pages/Dashboard/Guide/Notifications")
);

// 3. Admin Dashboard Pages
const AdminDashboard = lazy(() => import("../pages/Dashboard/Admin/index"));
const AdminCategories = lazy(() =>
  import("../pages/Dashboard/Admin/Categories")
);
const AdminModels3D = lazy(() => import("../pages/Dashboard/Admin/Models3D"));
const AdminNotifications = lazy(() =>
  import("../pages/Dashboard/Admin/Notifications")
);
const AdminUsers = lazy(() => import("../pages/Dashboard/Admin/Users"));
const AdminTours = lazy(() => import("../pages/Dashboard/Admin/Tours"));
const AdminPlaces = lazy(() => import("../pages/Dashboard/Admin/Places"));
const AdminFinance = lazy(() => import("../pages/Dashboard/Admin/Finance"));
const AdminSettings = lazy(() => import("../pages/Dashboard/Admin/Settings"));
const AdminPosts = lazy(() => import("../pages/Dashboard/Admin/Posts"));
const AdminReviews = lazy(() => import("../pages/Dashboard/Admin/Reviews"));

// ============================================================================
// PAGES: ERROR
// ============================================================================
const NotFoundPage = lazy(() => import("../pages/Error/NotFound"));
const ServerErrorPage = lazy(() => import("../pages/Error/ServerError"));

// ============================================================================
// FALLBACK COMPONENT
// ============================================================================
import Spinner from "../components/Loaders/Spinner";
const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-bg-main">
    <Spinner />
  </div>
);

// ============================================================================
// ROUTER CONFIGURATION
// ============================================================================
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
            <AuthPage />
          </Suspense>
        ),
      },
      {
        path: "auth/signup",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AuthPage />
          </Suspense>
        ),
      },
      {
        path: "auth/signout",
        element: (
          <Suspense fallback={<PageFallback />}>
            <SignOutPage />
          </Suspense>
        ),
      },

      // Booking
      {
        path: "booking/review",
        element: (
          <Suspense fallback={<PageFallback />}>
            <BookingStepReview />
          </Suspense>
        ),
      },
      {
        path: "booking/payment",
        element: (
          <Suspense fallback={<PageFallback />}>
            <BookingStepPayment />
          </Suspense>
        ),
      },
      {
        path: "booking/receipt/:bookingId",
        element: (
          <Suspense fallback={<PageFallback />}>
            <BookingStepReceipt />
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
      {
        path: "notifications",
        element: (
          <Suspense fallback={<PageFallback />}>
            <TouristNotifications />
          </Suspense>
        ),
      },
      {
        path: "transaction-history",
        element: (
          <Suspense fallback={<PageFallback />}>
            <TouristTransactionHistory />
          </Suspense>
        ),
      },
      {
        path: "invoices",
        element: (
          <Suspense fallback={<PageFallback />}>
            <TouristInvoices />
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
      {
        path: "my-tours",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideMyTours />
          </Suspense>
        ),
      },
      {
        path: "create-tour",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideCreateTour />
          </Suspense>
        ),
      },
      {
        path: "edit-tour/:id",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideEditTour />
          </Suspense>
        ),
      },
      {
        path: "schedule",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideSchedule />
          </Suspense>
        ),
      },
      {
        path: "earnings",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideEarnings />
          </Suspense>
        ),
      },
      {
        path: "profile-settings",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideProfileSettings />
          </Suspense>
        ),
      },
      {
        path: "reviews",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideReviews />
          </Suspense>
        ),
      },
      {
        path: "posts",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideMyPosts />
          </Suspense>
        ),
      },
      {
        path: "create-post",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideCreatePost />
          </Suspense>
        ),
      },
      {
        path: "edit-post/:id",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideEditPost />
          </Suspense>
        ),
      },
      {
        path: "requests",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideBookingRequests />
          </Suspense>
        ),
      },
      {
        path: "requests/:id",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideBookingDetail />
          </Suspense>
        ),
      },
      {
        path: "notifications",
        element: (
          <Suspense fallback={<PageFallback />}>
            <GuideNotifications />
          </Suspense>
        ),
      },
      // Các route con khác của Guide sẽ thêm ở đây...
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
      {
        path: "users",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminUsers />
          </Suspense>
        ),
      },
      {
        path: "tours",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminTours />
          </Suspense>
        ),
      },
      {
        path: "places",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminPlaces />
          </Suspense>
        ),
      },
      {
        path: "finance",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminFinance />
          </Suspense>
        ),
      },
      {
        path: "settings",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminSettings />
          </Suspense>
        ),
      },
      {
        path: "posts",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminPosts />
          </Suspense>
        ),
      },
      {
        path: "reviews",
        element: (
          <Suspense fallback={<PageFallback />}>
            <AdminReviews />
          </Suspense>
        ),
      },
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
