// server/routes/tours.routes.js
import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import { createTour, listAvailableGuides } from "../controllers/tours.controller.js";

const router = express.Router();

// Guide hoặc Admin đều có thể tạo tour
router.post("/", auth, authorize("guide", "admin"), createTour);

// Người dùng (đăng nhập) xem danh sách HDV khả dụng để chọn khi đặt tour
router.get("/available-guides", auth, listAvailableGuides);

export default router;
