import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import { listToursRevenue, getTourRevenue } from "../../controllers/admin/revenue.controller.js";

const router = express.Router();

// Danh sách tất cả tour + tổng doanh thu (admin)
router.get("/tours/revenues", auth, authorize("admin"), listToursRevenue);

// Chi tiết doanh thu 1 tour, optional groupBy=date
router.get("/tours/:tourId/revenue", auth, authorize("admin"), getTourRevenue);

export default router;