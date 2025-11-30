// routes/users.routes.js
import express from "express";
import { auth } from "../middleware/auth.js";
import { getProfile, updateProfile, updateProfileWithAvatar, changePassword } from "../controllers/users.controller.js";
import { upload } from "../services/uploader.js";

const router = express.Router();

// GET /api/users/me
router.get("/me", auth, getProfile);
router.put("/me", auth, updateProfile);
router.put("/me/avatar", auth, upload.single("avatar"), updateProfileWithAvatar);
router.patch("/password", auth, changePassword);

export default router;
