// Thay đổi: thêm import và route GET /bookings (đặt trong file routes/guides.routes.js)

import express from "express";
import { auth } from "../middleware/auth.js";
import { authorize } from "../middleware/auth.js";
import { upload } from "../services/uploader.js";
import {
  applyGuide,
  getMyGuideApplication,
} from "../controllers/guideApplication.controller.js";
import {
  getMyGuideProfile,
  updateMyGuideProfile,
  uploadGuideVideo,
  getPublicGuideProfile,
  listFeaturedGuides,
  listTopRatedGuides,
} from "../controllers/guideProfile.controller.js";
import { getGuideBookings } from "../controllers/bookings.controller.js";
import {
  guideDashboard,
  getGuideMonthlyEarnings,
  getGuideTours,
  deleteGuideTour,
  getGuideWeeklyStats,
} from "../controllers/guides.dashboard.controller.js";
import {
  getMyGuideReviews,
  replyToReview,
} from "../controllers/reviews.controller.js";
import {
  getMyBusyDates,
  addBusyDates,
  removeBusyDates,
  getGuideBusyDates,
  getAvailableGuides,
  getGuideCalendar,
} from "../controllers/guideDates.controller.js";

const router = express.Router();

// Guide Application - hỗ trợ multipart/form-data với file upload
router.post(
  "/apply",
  auth,
  authorize("tourist"),
  upload.fields([
    { name: "id_cards", maxCount: 3 },
    { name: "certificates", maxCount: 5 },
  ]),
  applyGuide
);
router.get("/apply/me", auth, getMyGuideApplication);

router.get("/profile/me", auth, authorize("guide"), getMyGuideProfile);
router.put(
  "/profile/me",
  auth,
  authorize("guide"),
  uploadGuideVideo,
  updateMyGuideProfile
);

// Guide-specific endpoints
router.get("/bookings", auth, authorize("guide"), getGuideBookings);

// ========== BUSY DATES ==========
// HDV quản lý ngày bận của mình
router.get("/busy-dates", auth, authorize("guide"), getMyBusyDates);
router.post("/busy-dates", auth, authorize("guide"), addBusyDates);
router.delete("/busy-dates", auth, authorize("guide"), removeBusyDates);
// Fallback POST route for removing busy dates (some proxies don't support DELETE with body)
router.post("/busy-dates/remove", auth, authorize("guide"), removeBusyDates);

// Lấy calendar của HDV
router.get("/calendar", auth, authorize("guide"), getGuideCalendar);

// Lấy danh sách HDV khả dụng (public hoặc auth)
router.get("/available", getAvailableGuides);

// Lấy ngày bận của 1 HDV cụ thể (public)
router.get("/:guideId/busy-dates", getGuideBusyDates);

// ========== END BUSY DATES ==========

router.get("/featured", listFeaturedGuides);
router.get("/top-rated", listTopRatedGuides);
router.get("/profile/:guideId", getPublicGuideProfile);

router.get("/me/dashboard", auth, guideDashboard);
router.get(
  "/me/earnings/monthly",
  auth,
  authorize("guide"),
  getGuideMonthlyEarnings
);
router.get("/me/weekly-stats", auth, authorize("guide"), getGuideWeeklyStats);
router.get("/me/tours", auth, authorize("guide"), getGuideTours);
router.delete("/me/tours/:id", auth, authorize("guide"), deleteGuideTour);

// Guide reviews management
router.get("/me/reviews", auth, authorize("guide"), getMyGuideReviews);
router.post(
  "/me/reviews/:reviewId/reply",
  auth,
  authorize("guide"),
  replyToReview
);

export default router;
