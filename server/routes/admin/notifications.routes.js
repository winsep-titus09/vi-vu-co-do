/**
 * server/routes/admin/notifications.routes.js
 *
 * Admin notifications routes: broadcast, history, stats, CRUD
 */
import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import {
  broadcastNotification,
  getNotificationHistory,
  getNotificationStats,
  getAdminNotifications,
  markNotificationAsRead,
  markAllAsRead,
} from "../../controllers/admin/notifications.controller.js";

const router = express.Router();

// All routes require admin auth
router.use(auth, authorize("admin"));

// ============================================================================
// BROADCAST
// ============================================================================
// POST /api/admin/notifications/broadcast - Send broadcast to users
router.post("/broadcast", broadcastNotification);

// ============================================================================
// HISTORY & STATS
// ============================================================================
// GET /api/admin/notifications/history - Get broadcast history
router.get("/history", getNotificationHistory);

// GET /api/admin/notifications/stats - Get notification statistics
router.get("/stats", getNotificationStats);

// ============================================================================
// ADMIN NOTIFICATIONS
// ============================================================================
// GET /api/admin/notifications - Get admin notifications
router.get("/", getAdminNotifications);

// PATCH /api/admin/notifications/read-all - Mark all as read
router.patch("/read-all", markAllAsRead);

// PATCH /api/admin/notifications/:id/read - Mark single notification as read
router.patch("/:id/read", markNotificationAsRead);

export default router;
