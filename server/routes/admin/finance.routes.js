/**
 * server/routes/admin/finance.routes.js
 *
 * Admin finance routes
 */
import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import {
  getFinanceStats,
  getTransactions,
  getFinancePayouts,
  confirmPayout,
} from "../../controllers/admin/finance.controller.js";

const router = express.Router();

// Stats
router.get("/stats", auth, authorize("admin"), getFinanceStats);

// Transactions
router.get("/transactions", auth, authorize("admin"), getTransactions);

// Payouts
router.get("/payouts", auth, authorize("admin"), getFinancePayouts);
router.patch("/payouts/:id/confirm", auth, authorize("admin"), confirmPayout);

export default router;
