// Thêm endpoint calendar cho tour
import express from "express";
import { auth } from "../middleware/auth.js";
import {
    listTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    listAvailableGuides,
    listFeaturedTours,
    listTopRatedTours,
} from "../controllers/tours.controller.js";
import { getTourCalendar } from "../controllers/guideDates.controller.js";

const router = express.Router();

// Public
router.get("/", listTours);
router.get("/featured", listFeaturedTours);
router.get("/top-rated", listTopRatedTours);
router.get("/available-guides", auth, listAvailableGuides);

// Tour calendar (lấy dữ liệu ngày có booking, ngày guide bận)
router.get("/:tourId/calendar", getTourCalendar);

// Single tour
router.get("/:token", getTour);

// Admin/Guide
router.post("/", auth, createTour);
router.patch("/:id", auth, updateTour);
router.delete("/:id", auth, deleteTour);

export default router;