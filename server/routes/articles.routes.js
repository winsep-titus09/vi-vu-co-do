import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import {
    listArticlesPublic,
    getArticlePublic,
    createArticle,
    updateMyArticle,
    deleteArticle,
    deleteFeatureImage,
    adminListArticles,
    adminApproveArticle,
    adminRejectArticle,
    listMyArticles
} from "../controllers/articles.controller.js";

const router = express.Router();

// Admin routes first (avoid /admin vs /:id conflicts)
router.get("/admin", auth, authorize("admin"), adminListArticles);
router.patch("/admin/:id/approve", auth, authorize("admin"), adminApproveArticle);
router.patch("/admin/:id/reject", auth, authorize("admin"), adminRejectArticle);

// Guide routes
router.post("/", auth, authorize("guide"), createArticle);
router.get("/mine", auth, authorize("guide"), listMyArticles);
router.put("/:id", auth, authorize("guide"), updateMyArticle);

// Delete (author or admin) and delete images
router.delete("/:id", auth, deleteArticle); // delete permission checked in controller
router.delete("/:id/feature-image", auth, deleteFeatureImage); // remove cover or image via ?url=

// Public
router.get("/", listArticlesPublic);
router.get("/:id", getArticlePublic);

export default router;