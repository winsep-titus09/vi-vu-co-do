import express from "express";
import { authLimiter } from "../middleware/rateLimit.js";
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", auth, logout);
router.get("/me", auth, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

export default router;
