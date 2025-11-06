// server/routes/tourCategories.routes.js
import express from "express";
import mongoose from "mongoose";
import { auth, authorize } from "../middleware/auth.js";
import {
    listTourCategories,
    getTourCategory,
    createTourCategory,
    updateTourCategory,
    deleteTourCategory,
} from "../controllers/tourCategories.controller.js";

const router = express.Router();

// PUBLIC
router.get("/", listTourCategories);
router.get("/:token", getTourCategory);

// ADMIN
router.post("/", auth, authorize("admin"), createTourCategory);
router.patch("/:id", auth, authorize("admin"), updateTourCategory);
router.delete("/:id", auth, authorize("admin"), deleteTourCategory);

export default router;
