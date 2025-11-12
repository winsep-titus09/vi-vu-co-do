// server/routes/admin/paymentSettings.routes.js
import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import {
    listPaymentSettings,
    upsertPaymentSettingByGateway,
} from "../../controllers/admin/paymentSettings.controller.js";

const router = express.Router();

router.get("/", auth, authorize("admin"), listPaymentSettings);
router.patch("/:gateway", auth, authorize("admin"), upsertPaymentSettingByGateway);

export default router;