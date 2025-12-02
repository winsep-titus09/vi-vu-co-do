import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import {
  adminDashboard,
  getRevenueTrend,
} from "../../controllers/admin/dashboard.controller.js";

const router = express.Router();

router.get("/", auth, authorize("admin"), adminDashboard);
router.get("/revenue-trend", auth, authorize("admin"), getRevenueTrend);

export default router;
