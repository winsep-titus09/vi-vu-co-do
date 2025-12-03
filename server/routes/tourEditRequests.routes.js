// server/routes/tourEditRequests.routes.js
import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import {
  createEditRequest,
  getMyEditRequests,
  getEditRequest,
  cancelEditRequest,
} from "../controllers/tourEditRequests.controller.js";

const router = express.Router();

// Guide routes
router.post("/", auth, authorize("guide"), createEditRequest);
router.get("/my", auth, authorize("guide"), getMyEditRequests);
router.get("/:id", auth, getEditRequest);
router.delete("/:id", auth, authorize("guide"), cancelEditRequest);

export default router;
