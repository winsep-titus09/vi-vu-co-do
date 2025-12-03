// server/routes/upload.routes.js
import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { upload } from "../services/uploader.js";
import { uploadImage, uploadImages } from "../controllers/upload.controller.js";

const router = Router();

// Single image upload
router.post("/image", auth, upload.single("image"), uploadImage);

// Multiple images upload (max 10)
router.post("/images", auth, upload.array("images", 10), uploadImages);

export default router;
