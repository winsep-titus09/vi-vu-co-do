import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import {
  listAdminTours,
  listPendingTours,
  approveTour,
  rejectTour,
} from "../../controllers/admin/tours.controller.js";
import {
  listToursRevenue,
  getTourRevenue,
} from "../../controllers/admin/revenue.controller.js"; // <-- thêm import

const router = express.Router();

// List all tours with filters
router.get("/", auth, authorize("admin"), listAdminTours);
router.get("/pending", auth, authorize("admin"), listPendingTours);
router.patch("/:id/approve", auth, authorize("admin"), approveTour);
router.patch("/:id/reject", auth, authorize("admin"), rejectTour);

// NEW: danh sách tour + tổng doanh thu
router.get("/revenues", auth, authorize("admin"), listToursRevenue);

// NEW: chi tiết doanh thu 1 tour, groupBy=date trả doanh thu theo đợt/ngày
router.get("/:tourId/revenue", auth, authorize("admin"), getTourRevenue);

export default router;
