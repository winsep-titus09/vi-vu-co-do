// server/routes/tours.routes.js
import express from "express";
import mongoose from "mongoose";
import { auth, authorize } from "../middleware/auth.js";
import {
    listTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    listAvailableGuides
} from "../controllers/tours.controller.js";
import { checkTourDate, checkMultipleTourDates } from "../controllers/tourAvailability.controller.js";

const router = express.Router();

// public
router.get("/", listTours);
router.get("/available-guides", auth, authorize("admin", "guide", "tourist"), listAvailableGuides);

// CHECK DATE endpoints (đặt TRƯỚC catch-all ":token")
router.get("/:id/check-date", checkTourDate);
router.post("/:id/check-dates", checkMultipleTourDates);

// id hoặc slug (dùng token như Locations)
router.get("/:token", getTour);

// create/update/delete
router.post("/", auth, authorize("admin", "guide"), createTour);
router.patch("/:id", auth, authorize("admin", "guide"), updateTour);
router.delete("/:id", auth, authorize("admin", "guide"), deleteTour);

export default router;