// Thay đổi: thêm import và route GET /bookings (đặt trong file routes/guides.routes.js)

import express from "express";
import { auth } from "../middleware/auth.js";
import { authorize } from "../middleware/auth.js";
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
} from "../controllers/guides.dashboard.controller.js";
import {
  getMyBusyDates,
  addBusyDates,
  removeBusyDates,
  getGuideBusyDates,
  getAvailableGuides,
  getGuideCalendar,
} from "../controllers/guideDates.controller.js";

const router = express.Router();

router.post("/apply", auth, authorize("tourist"), applyGuide);
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
router.get("/me/tours", auth, authorize("guide"), getGuideTours);
router.delete("/me/tours/:id", auth, authorize("guide"), deleteGuideTour);

export default router;
