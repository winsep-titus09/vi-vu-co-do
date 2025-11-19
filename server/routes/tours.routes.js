import express from "express";
import mongoose from "mongoose";
import { auth, authorize } from "../middleware/auth.js";
import {
    listTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    listAvailableGuides,
    listFeaturedTours,
    listTopRatedTours
} from "../controllers/tours.controller.js";
import { checkTourDate, checkMultipleTourDates } from "../controllers/tourAvailability.controller.js";

const router = express.Router();

// PUBLIC routes
router.get("/", listTours);
router.get("/available-guides", auth, authorize("admin", "guide", "tourist"), listAvailableGuides);

// IMPORTANT: register specific list routes BEFORE the catch-all "/:token"
router.get("/featured", listFeaturedTours);
router.get("/top-rated", listTopRatedTours);

// CHECK DATE endpoints (đặt TRƯỚC catch-all ":token")
router.get("/:id/check-date", checkTourDate);
router.post("/:id/check-dates", checkMultipleTourDates);

// id hoặc slug (catch-all)
router.get("/:token", getTour);

// create/update/delete (protected)
router.post("/", auth, authorize("admin", "guide"), createTour);
router.patch("/:id", auth, authorize("admin", "guide"), updateTour);
router.delete("/:id", auth, authorize("admin"), deleteTour);

export default router;