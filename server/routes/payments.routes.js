// server/routes/payments.routes.js
import express from "express";
import { auth } from "../middleware/auth.js";
import { createCheckout, ipnHandler, returnHandler } from "../controllers/payments.controller.js";

const router = express.Router();

router.post("/checkout", auth, createCheckout);
router.post("/ipn", ipnHandler);
router.get("/return", returnHandler);

export default router;
