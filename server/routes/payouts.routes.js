import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import {
    createPayoutRequest,
    getMyPayoutRequests,
    adminListPayoutRequests,
    adminApprovePayoutRequest,
    adminRejectPayoutRequest
} from "../controllers/payouts.controller.js";

const router = express.Router();

// HDV tạo yêu cầu rút
router.post("/", auth, createPayoutRequest);
// HDV xem các yêu cầu rút của họ
router.get("/", auth, getMyPayoutRequests);

// Admin xem danh sách tất cả yêu cầu rút
router.get("/admin/list", auth, authorize("admin"), adminListPayoutRequests);
// Admin approve/reject
router.post("/admin/:id/approve", auth, authorize("admin"), adminApprovePayoutRequest);
router.post("/admin/:id/reject", auth, authorize("admin"), adminRejectPayoutRequest);

export default router;