// routes/articleCategories.routes.js (PUBLIC)
import express from "express";
import { listArticleCategoriesPublic, getArticleCategoryBySlugPublic } from "../controllers/articleCategories.controller.js";

const router = express.Router();

router.get("/", listArticleCategoriesPublic);
router.get("/slug/:slug", getArticleCategoryBySlugPublic);

export default router;