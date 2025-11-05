// server/routes/admin/locations.routes.js
import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import multer from "multer";
import {
    createLocation,
    updateLocation,
    deleteLocation,
    createThreeDForLocation,
    updateThreeDForLocation,
    deleteThreeDForLocation,
} from "../../controllers/admin/locations.controller.js";

// Dùng memoryStorage như các phần khác
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

const router = express.Router();

// Tạo location: images[], video, model3d (tùy chọn)
router.post(
    "/",
    auth,
    authorize("admin"),
    upload.fields([
        { name: "images", maxCount: 10 },
        { name: "video", maxCount: 1 },
        { name: "model3d", maxCount: 1 },
    ]),
    createLocation
);

// Cập nhật location: có thể thêm ảnh mới, thay video
router.patch(
    "/:id",
    auth,
    authorize("admin"),
    upload.fields([
        { name: "images", maxCount: 10 },
        { name: "video", maxCount: 1 },
    ]),
    updateLocation
);

// Xóa location
router.delete("/:id", auth, authorize("admin"), deleteLocation);

// Thêm/Sửa/Xóa 3D cho location
router.post(
    "/:id/three-d",
    auth,
    authorize("admin"),
    upload.fields([{ name: "model3d", maxCount: 1 }]),
    createThreeDForLocation
);

router.patch(
    "/:id/three-d/:modelId",
    auth,
    authorize("admin"),
    upload.fields([{ name: "model3d", maxCount: 1 }]), // có thể kèm file mới
    updateThreeDForLocation
);

router.delete(
    "/:id/three-d/:modelId",
    auth,
    authorize("admin"),
    deleteThreeDForLocation
);

export default router;
