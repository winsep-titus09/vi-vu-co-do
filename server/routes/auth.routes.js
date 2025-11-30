import express from "express";
import { authLimiter } from "../middleware/rateLimit.js";
import { register, login, logout } from "../controllers/auth.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", auth, logout);

export default router;
