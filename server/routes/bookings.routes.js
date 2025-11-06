// server/routes/bookings.routes.js
import express from "express";
import { auth } from "../middleware/auth.js";
import {
    createBooking,
    getMyBookings,
    getBooking,
    guideApproveBooking,
    guideRejectBooking,
} from "../controllers/bookings.controller.js";

const router = express.Router();

router.post("/", auth, createBooking);
router.get("/", auth, getMyBookings);
router.get("/:id", auth, getBooking);

router.post("/:id/approve", auth, guideApproveBooking);
router.post("/:id/reject", auth, guideRejectBooking);

export default router;
