// server/routes/admin.refunds.routes.js
import express from "express";
import { auth } from "../../middleware/auth.js";
import {
    listRefundRequests,
    getRefundRequest,
    confirmRefundRequest,
    rejectRefundRequest
} from "../../controllers/admin/refunds.controller.js";

const router = express.Router();

// All routes require auth; controller checks admin role
router.get("/", auth, listRefundRequests);                 // ?status=pending
router.get("/:txnId", auth, getRefundRequest);
router.post("/:txnId/confirm", auth, confirmRefundRequest);
router.post("/:txnId/reject", auth, rejectRefundRequest);

export default router;