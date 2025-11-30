// routes/admin/articleCategories.routes.js
import express from "express";
import { auth, authorize } from "../../middleware/auth.js";
import {
    listArticleCategoriesAdmin,
    getArticleCategoryAdmin,
    createArticleCategory,
    updateArticleCategory,
    deleteArticleCategory,
} from "../../controllers/articleCategories.controller.js";

const router = express.Router();

router.use(auth, authorize("admin"));

router.get("/", listArticleCategoriesAdmin);
router.get("/:id", getArticleCategoryAdmin);
router.post("/", createArticleCategory);
router.put("/:id", updateArticleCategory);
router.patch("/:id", updateArticleCategory);
router.delete("/:id", deleteArticleCategory);

export default router;