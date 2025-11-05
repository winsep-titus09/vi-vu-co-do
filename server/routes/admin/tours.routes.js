// server/routes/admin/tours.routes.js
import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import { approveTour, rejectTour } from "../../controllers/tours.controller.js";

const router = express.Router();

router.patch("/:id/approve", auth, authorize("admin"), approveTour);
router.patch("/:id/reject", auth, authorize("admin"), rejectTour);

export default router;
