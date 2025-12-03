// routes/users.routes.js
import express from "express";
import { auth } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  updateProfileWithAvatar,
  changePassword,
  getPreferences,
  updatePreferences,
  requestDeleteAccount,
  cancelDeleteRequest,
  getDeleteRequestStatus,
} from "../controllers/users.controller.js";
import { upload } from "../services/uploader.js";

const router = express.Router();

// GET /api/users/me
router.get("/me", auth, getProfile);
router.put("/me", auth, updateProfile);
router.put(
  "/me/avatar",
  auth,
  upload.single("avatar"),
  updateProfileWithAvatar
);
router.patch("/password", auth, changePassword);

// Preferences
router.get("/me/preferences", auth, getPreferences);
router.put("/me/preferences", auth, updatePreferences);

// Delete account request
router.get("/me/delete-request", auth, getDeleteRequestStatus);
router.post("/me/delete-request", auth, requestDeleteAccount);
router.delete("/me/delete-request", auth, cancelDeleteRequest);

export default router;
