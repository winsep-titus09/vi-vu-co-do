// server/routes/admin/users.routes.js
import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import {
  listUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getUserStats,
} from "../../controllers/admin/users.controller.js";

const router = express.Router();

// GET /api/admin/users - List all users with filters
router.get("/", auth, authorize("admin"), listUsers);

// GET /api/admin/users/stats - Get user statistics
router.get("/stats", auth, authorize("admin"), getUserStats);

// GET /api/admin/users/:id - Get user by ID
router.get("/:id", auth, authorize("admin"), getUserById);

// PUT /api/admin/users/:id/status - Update user status (active/banned)
router.put("/:id/status", auth, authorize("admin"), updateUserStatus);

// DELETE /api/admin/users/:id - Delete user permanently
router.delete("/:id", auth, authorize("admin"), deleteUser);

export default router;
