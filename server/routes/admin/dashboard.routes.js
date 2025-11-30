import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import { adminDashboard } from "../../controllers/admin/dashboard.controller.js";

const router = express.Router();

router.get("/", auth, authorize("admin"), adminDashboard);

export default router;