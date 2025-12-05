import express from "express";
import {
  getArticleComments,
  getCommentReplies,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/articleComments.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

// Public routes
// GET /api/articles/:articleId/comments - Get comments for an article
router.get("/", getArticleComments);

// GET /api/articles/:articleId/comments/:commentId/replies - Get replies for a comment
router.get("/:commentId/replies", getCommentReplies);

// Protected routes (require authentication)
// POST /api/articles/:articleId/comments - Create a comment
router.post("/", auth, createComment);

// PUT /api/articles/:articleId/comments/:commentId - Update own comment
router.put("/:commentId", auth, updateComment);

// DELETE /api/articles/:articleId/comments/:commentId - Delete comment
router.delete("/:commentId", auth, deleteComment);

export default router;
