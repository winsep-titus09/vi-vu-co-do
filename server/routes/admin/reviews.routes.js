// server/routes/admin/reviews.routes.js
import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import {
  listReviews,
  updateReviewStatus,
  deleteReview,
  getReviewStats,
} from "../../controllers/admin/reviews.controller.js";

const router = express.Router();

// GET /api/admin/reviews - List all reviews with filters
router.get("/", auth, authorize("admin"), listReviews);

// GET /api/admin/reviews/stats - Get review statistics
router.get("/stats", auth, authorize("admin"), getReviewStats);

// PUT /api/admin/reviews/:id/status - Update review status
router.put("/:id/status", auth, authorize("admin"), updateReviewStatus);

// DELETE /api/admin/reviews/:id - Delete review permanently
router.delete("/:id", auth, authorize("admin"), deleteReview);

export default router;
