import mongoose from "mongoose";
import ArticleComment from "../models/ArticleComment.js";
import Article from "../models/Article.js";

/**
 * Get comments for an article (public)
 * GET /articles/:articleId/comments
 */
export const getArticleComments = async (req, res) => {
  try {
    const { articleId } = req.params;
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);
    const skip = (page - 1) * limit;

    // Validate articleId
    if (!mongoose.isValidObjectId(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    // Check if article exists and is published
    const article = await Article.findOne({
      _id: articleId,
      "approval.status": "approved",
      status: "active",
    });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Get top-level comments (parentId = null)
    const filter = {
      articleId,
      parentId: null,
      status: "active",
    };

    const [comments, total] = await Promise.all([
      ArticleComment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name avatar_url")
        .lean(),
      ArticleComment.countDocuments(filter),
    ]);

    // Get replies for each comment (limit 3 per comment initially)
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await ArticleComment.find({
          parentId: comment._id,
          status: "active",
        })
          .sort({ createdAt: 1 })
          .limit(3)
          .populate("userId", "name avatar_url")
          .lean();

        const totalReplies = await ArticleComment.countDocuments({
          parentId: comment._id,
          status: "active",
        });

        return {
          ...comment,
          replies,
          totalReplies,
          hasMoreReplies: totalReplies > 3,
        };
      })
    );

    return res.json({
      items: commentsWithReplies,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getArticleComments error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Get replies for a comment
 * GET /articles/:articleId/comments/:commentId/replies
 */
export const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);
    const skip = (page - 1) * limit;

    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const filter = {
      parentId: commentId,
      status: "active",
    };

    const [replies, total] = await Promise.all([
      ArticleComment.find(filter)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name avatar_url")
        .lean(),
      ArticleComment.countDocuments(filter),
    ]);

    return res.json({
      items: replies,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getCommentReplies error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Create a comment (authenticated)
 * POST /articles/:articleId/comments
 */
export const createComment = async (req, res) => {
  try {
    const user = req.user;
    const { articleId } = req.params;
    const { content, parentId } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập để bình luận" });
    }

    if (!mongoose.isValidObjectId(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({ message: "Bình luận không được quá 2000 ký tự" });
    }

    // Check if article exists and is published
    const article = await Article.findOne({
      _id: articleId,
      "approval.status": "approved",
      status: "active",
    });

    if (!article) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
    }

    // If replying to a comment, validate parentId
    if (parentId) {
      if (!mongoose.isValidObjectId(parentId)) {
        return res.status(400).json({ message: "Invalid parent comment ID" });
      }

      const parentComment = await ArticleComment.findOne({
        _id: parentId,
        articleId,
        status: "active",
      });

      if (!parentComment) {
        return res.status(404).json({ message: "Bình luận gốc không tồn tại" });
      }

      // Don't allow nested replies (only 1 level deep)
      if (parentComment.parentId) {
        return res.status(400).json({ message: "Không thể trả lời bình luận lồng nhau" });
      }
    }

    const comment = await ArticleComment.create({
      articleId,
      userId: user._id,
      content: content.trim(),
      parentId: parentId || null,
    });

    // Populate user info for response
    await comment.populate("userId", "name avatar_url");

    return res.status(201).json({
      message: "Đã đăng bình luận",
      data: comment,
    });
  } catch (err) {
    console.error("createComment error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Update own comment (authenticated)
 * PUT /articles/:articleId/comments/:commentId
 */
export const updateComment = async (req, res) => {
  try {
    const user = req.user;
    const { commentId } = req.params;
    const { content } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
    }

    const comment = await ArticleComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Bình luận không tồn tại" });
    }

    // Only owner can update
    if (String(comment.userId) !== String(user._id)) {
      return res.status(403).json({ message: "Không có quyền chỉnh sửa bình luận này" });
    }

    comment.content = content.trim();
    await comment.save();

    await comment.populate("userId", "name avatar_url");

    return res.json({
      message: "Đã cập nhật bình luận",
      data: comment,
    });
  } catch (err) {
    console.error("updateComment error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Delete own comment (authenticated) or admin delete
 * DELETE /articles/:articleId/comments/:commentId
 */
export const deleteComment = async (req, res) => {
  try {
    const user = req.user;
    const { commentId } = req.params;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const comment = await ArticleComment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Bình luận không tồn tại" });
    }

    // Owner or admin can delete
    const isOwner = String(comment.userId) === String(user._id);
    const isAdmin = user.role === "admin" || user?.role_id?.name === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Không có quyền xóa bình luận này" });
    }

    // Soft delete - change status to deleted
    comment.status = "deleted";
    await comment.save();

    // Also soft delete all replies
    await ArticleComment.updateMany(
      { parentId: comment._id },
      { status: "deleted" }
    );

    return res.json({ message: "Đã xóa bình luận" });
  } catch (err) {
    console.error("deleteComment error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export default {
  getArticleComments,
  getCommentReplies,
  createComment,
  updateComment,
  deleteComment,
};
