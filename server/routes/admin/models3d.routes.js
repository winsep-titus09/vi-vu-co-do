// server/routes/admin/models3d.routes.js
import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import multer from "multer";
import {
  listModels3D,
  createModel3D,
  updateModel3D,
  deleteModel3D,
} from "../../controllers/admin/models3d.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

const router = express.Router();

// GET /api/admin/models3d - List all 3D models
router.get("/", auth, authorize("admin"), listModels3D);

// POST /api/admin/models3d - Create new 3D model
router.post(
  "/",
  auth,
  authorize("admin"),
  upload.fields([
    { name: "model3d", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createModel3D
);

// PUT /api/admin/models3d/:id - Update 3D model
router.put(
  "/:id",
  auth,
  authorize("admin"),
  upload.fields([
    { name: "model3d", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  updateModel3D
);

// DELETE /api/admin/models3d/:id - Delete 3D model
router.delete("/:id", auth, authorize("admin"), deleteModel3D);

export default router;
