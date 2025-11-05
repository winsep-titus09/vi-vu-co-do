// server/routes/admin/locationCategories.routes.js
import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import {
    createCategory,
    updateCategory,
    deleteCategory,
} from "../../controllers/locationCategory.controller.js";

const router = express.Router();

// ADMIN ONLY
router.post("/", auth, authorize("admin"), createCategory);
router.patch("/:id", auth, authorize("admin"), updateCategory);
router.delete("/:id", auth, authorize("admin"), deleteCategory);

export default router;
