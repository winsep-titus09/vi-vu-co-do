// server/routes/public.routes.js
import express from "express";
import { getPublicStats } from "../controllers/public.controller.js";

const router = express.Router();

// GET /api/public/stats - Get public statistics for homepage
router.get("/stats", getPublicStats);

export default router;
