// server/routes/bookings.routes.js
import express from "express";
import { auth } from "../middleware/auth.js";
import {
    createBooking,
    getMyBookings,
    getBooking,
    guideApproveBooking,
    guideRejectBooking,
    cancelBooking,
    adminCancelBooking,
    adminCreateRefund,
    adminConfirmRefund,
    completeBooking
} from "../controllers/bookings.controller.js";

const router = express.Router();

router.post("/", auth, createBooking);
router.get("/", auth, getMyBookings);
router.get("/:id", auth, getBooking);

// Guide actions
router.post("/:id/approve", auth, guideApproveBooking);
router.post("/:id/reject", auth, guideRejectBooking);

// Guide or admin mark complete after tour
router.post("/:id/complete", auth, completeBooking);

// Cancel / Refund actions
// Owner or admin cancels (owner uses this)
router.post("/:id/cancel", auth, cancelBooking);

// Admin endpoints (protected in controller by role check)
router.post("/:id/admin/cancel", auth, adminCancelBooking);
router.post("/:id/admin/refund", auth, adminCreateRefund);
// Confirm refund transaction (admin)
router.post("/transactions/:txnId/admin/confirm-refund", auth, adminConfirmRefund);

export default router;