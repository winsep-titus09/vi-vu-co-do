// server/routes/admin/tours.routes.js
import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import { listPendingTours, approveTour, rejectTour } from "../../controllers/admin/tours.controller.js";

const router = express.Router();

router.get("/pending", auth, authorize("admin"), listPendingTours);
router.patch("/:id/approve", auth, authorize("admin"), approveTour);
router.patch("/:id/reject", auth, authorize("admin"), rejectTour);

export default router;
