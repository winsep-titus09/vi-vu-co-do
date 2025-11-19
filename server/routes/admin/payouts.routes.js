import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import {
    createManualPayout,
    markPayoutPaid,
    listPayouts
} from "../../controllers/admin/payouts.controller.js";

const router = express.Router();

// Create payouts manually for one occurrence (all guides or just one)
router.post("/manual", auth, authorize("admin"), createManualPayout);

// Mark a payout as paid after manual transfer
router.patch("/:id/mark-paid", auth, authorize("admin"), markPayoutPaid);

// List payouts
router.get("/", auth, authorize("admin"), listPayouts);

export default router;