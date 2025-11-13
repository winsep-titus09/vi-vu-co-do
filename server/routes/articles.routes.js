// server/routes/articles.routes.js
// Public routes (tham khảo) để bạn kiểm tra bài viết vừa tạo
import express from "express";
import {
    listArticlesPublic,
    getArticlePublic,
    getArticleBySlugPublic,
    listFeaturedArticlesPublic,
} from "../controllers/articles.controller.js";

const router = express.Router();

router.get("/", listArticlesPublic);
router.get("/featured", listFeaturedArticlesPublic);
router.get("/slug/:slug", getArticleBySlugPublic);
router.get("/:id", getArticlePublic);

export default router;