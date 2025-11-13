// server/routes/admin/articles.routes.js
// CRUD + quản lý ảnh đại diện (đã gắn multer cho cả create/update để nhận multipart nếu có file)
import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import { upload } from "../../services/uploader.js";
import {
    createArticle,
    updateArticle,
    deleteArticle,
    setFeatureImage,
    setFeatureImageByUrl,
    deleteFeatureImage,
} from "../../controllers/articles.controller.js";

const router = express.Router();

router.use(auth, authorize("admin"));

// Create (JSON hoặc multipart – nếu multipart, key file là "feature_image")
router.post("/", upload.single("feature_image"), createArticle);

// Update (JSON hoặc multipart – nếu multipart, key file là "feature_image")
router.put("/:id", upload.single("feature_image"), updateArticle);
router.patch("/:id", upload.single("feature_image"), updateArticle);

// Delete bài viết
router.delete("/:id", deleteArticle);

// Quản lý ảnh đại diện (tùy chọn nếu muốn tách riêng)
router.post("/:id/feature-image", upload.single("feature_image"), setFeatureImage); // cập nhật ảnh bằng file
router.post("/:id/feature-image/by-url", setFeatureImageByUrl); // cập nhật ảnh bằng URL
router.delete("/:id/feature-image", deleteFeatureImage); // xóa ảnh

export default router;