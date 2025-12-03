// server/routes/admin/tourEditRequests.routes.js
import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import {
  listAllEditRequests,
  getEditRequest,
  approveEditRequest,
  rejectEditRequest,
} from "../../controllers/tourEditRequests.controller.js";

const router = express.Router();

// Admin routes for tour edit requests
router.get("/", auth, authorize("admin"), listAllEditRequests);
router.get("/:id", auth, authorize("admin"), getEditRequest);
router.patch("/:id/approve", auth, authorize("admin"), approveEditRequest);
router.patch("/:id/reject", auth, authorize("admin"), rejectEditRequest);

export default router;
