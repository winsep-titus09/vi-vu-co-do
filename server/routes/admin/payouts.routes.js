import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import {
    createManualPayout,
    markPayoutPaid,
    listPayouts,
    previewPayout
} from "../../controllers/admin/payouts.controller.js";

const router = express.Router();

router.post("/manual", auth, authorize("admin"), createManualPayout);
router.patch("/:id/mark-paid", auth, authorize("admin"), markPayoutPaid);
router.get("/", auth, authorize("admin"), listPayouts);
router.get("/preview", auth, authorize("admin"), previewPayout);

export default router;