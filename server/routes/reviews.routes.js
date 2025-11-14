// server/routes/reviews.routes.js
import express from "express";
import { auth } from "../middleware/auth.js";
import {
    createTourReview,
    createGuideReview,
    getReviewForBooking,
    getTourRatingStats,
    getGuideRatingStats,
} from "../controllers/reviews.controller.js";

const router = express.Router();

// B1: đánh giá tour
router.post("/tour", auth, createTourReview);

// B2: đánh giá HDV
router.post("/guide", auth, createGuideReview);

// Xem review theo booking (chủ booking)
router.get("/bookings/:bookingId", auth, getReviewForBooking);

// Thống kê trung bình
router.get("/tours/:tourId/stats", getTourRatingStats);
router.get("/guides/:guideId/stats", getGuideRatingStats);

export default router;