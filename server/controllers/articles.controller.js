import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";
import Article from "../models/Article.js";
import {
  stripImageTags,
  excerptText,
  extractImageUrls,
} from "../utils/html.js";
import { notifyUser, notifyAdmins } from "../services/notify.js";
import { ensureUniqueSlug } from "../utils/slug.js";

/* Allowed tags/attrs for sanitizer */
const DEFAULT_ALLOWED_TAGS = sanitizeHtml.defaults.allowedTags.concat([
  "img",
  "h1",
  "h2",
  "h3",
  "iframe",
  "figure",
  "figcaption",
]);
const DEFAULT_ALLOWED_ATTRS = {
  a: ["href", "name", "target", "rel"],
  img: ["src", "alt", "title", "width", "height"],
  iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen"],
  "*": ["class", "style"],
};

function sanitizeContent(rawHtml = "") {
  return sanitizeHtml(rawHtml, {
    allowedTags: DEFAULT_ALLOWED_TAGS,
    allowedAttributes: DEFAULT_ALLOWED_ATTRS,
    allowedSchemes: ["http", "https", "data"],
    transformTags: {
      img: (tagName, attribs) => {
        return {
          tagName: "img",
          attribs: {
            src: attribs.src || "",
            alt: attribs.alt || "",
            title: attribs.title || "",
            loading: "lazy",
            width: attribs.width || "",
            height: attribs.height || "",
          },
        };
      },
    },
  });
}

/** Public: list approved articles */
export const listArticlesPublic = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 100);
    const skip = (page - 1) * limit;

    const filter = {
      "approval.status": "approved",
      status: "active",
      authorId: { $exists: true, $ne: null },
    };

    if (req.query.q) {
      const q = req.query.q.trim();
      filter.$or = [
        { title: new RegExp(q, "i") },
        { summary: new RegExp(q, "i") },
      ];
    }

    // Filter by category if provided
    if (
      req.query.categoryId &&
      mongoose.isValidObjectId(req.query.categoryId)
    ) {
      filter.categoryId = req.query.categoryId;
    }

    const [items, total] = await Promise.all([
      Article.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("authorId", "name avatar_url")
        .populate("categoryId", "name slug")
        .lean(),
      Article.countDocuments(filter),
    ]);

    return res.json({ items, page, limit, total });
  } catch (err) {
    console.error("listArticlesPublic error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** Public: get single article (only approved + has author) */
export const getArticlePublic = async (req, res) => {
  try {
    const { id } = req.params;

    // Build query - support both ObjectId and slug
    const query = {
      "approval.status": "approved",
      status: "active",
      authorId: { $exists: true, $ne: null },
    };

    // Check if id is a valid ObjectId, otherwise treat as slug
    if (mongoose.isValidObjectId(id)) {
      query._id = id;
    } else {
      query.slug = id;
    }

    const doc = await Article.findOne(query)
      .populate("authorId", "name avatar_url bio")
      .populate("categoryId", "name slug")
      .lean();

    if (!doc)
      return res
        .status(404)
        .json({ message: "Article not found or not approved" });
    return res.json(doc);
  } catch (err) {
    console.error("getArticlePublic error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** Public: get related articles (same category or by same author) */
export const getRelatedArticles = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit || "4", 10), 10);

    // Find the current article first
    let currentArticle;
    if (mongoose.isValidObjectId(id)) {
      currentArticle = await Article.findById(id).lean();
    } else {
      currentArticle = await Article.findOne({ slug: id }).lean();
    }

    if (!currentArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Build query for related articles
    const baseFilter = {
      _id: { $ne: currentArticle._id }, // exclude current article
      "approval.status": "approved",
      status: "active",
      authorId: { $exists: true, $ne: null },
    };

    let relatedArticles = [];

    // Strategy 1: Same category
    if (currentArticle.categoryId) {
      relatedArticles = await Article.find({
        ...baseFilter,
        categoryId: currentArticle.categoryId,
      })
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(limit)
        .populate("authorId", "name avatar_url")
        .populate("categoryId", "name slug")
        .lean();
    }

    // Strategy 2: If not enough, get by same author
    if (relatedArticles.length < limit && currentArticle.authorId) {
      const excludeIds = [currentArticle._id, ...relatedArticles.map(a => a._id)];
      const byAuthor = await Article.find({
        ...baseFilter,
        _id: { $nin: excludeIds },
        authorId: currentArticle.authorId,
      })
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(limit - relatedArticles.length)
        .populate("authorId", "name avatar_url")
        .populate("categoryId", "name slug")
        .lean();

      relatedArticles = [...relatedArticles, ...byAuthor];
    }

    // Strategy 3: If still not enough, get latest articles
    if (relatedArticles.length < limit) {
      const excludeIds = [currentArticle._id, ...relatedArticles.map(a => a._id)];
      const latest = await Article.find({
        ...baseFilter,
        _id: { $nin: excludeIds },
      })
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(limit - relatedArticles.length)
        .populate("authorId", "name avatar_url")
        .populate("categoryId", "name slug")
        .lean();

      relatedArticles = [...relatedArticles, ...latest];
    }

    return res.json({ items: relatedArticles });
  } catch (err) {
    console.error("getRelatedArticles error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** Guide: create article (author forced to req.user._id; approval = pending) */
export const createArticle = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const body = req.body || {};
    const rawHtml = String(body.content_html || "");
    const content = sanitizeContent(rawHtml);
    const excerptRaw = stripImageTags(content);
    const excerpt = excerptText(excerptRaw, 300);
    const images = extractImageUrls(content);

    const title = String(body.title || "").trim();
    const slugBase =
      (body.slug && String(body.slug).trim()) ||
      title ||
      `article-${Date.now()}`;
    const slug = await ensureUniqueSlug(Article, slugBase);

    const doc = await Article.create({
      title,
      slug,
      summary: body.summary ? String(body.summary).trim() : undefined,
      content_html: content,
      excerpt,
      cover_image: body.cover_image || images[0] || null,
      images,
      categoryId: body.categoryId || null,
      authorId: user._id,
      createdBy: user._id,
      status: "pending",
      approval: { status: "pending" },
    });

    // notify admins that a new article needs review
    try {
      await notifyAdmins({
        type: "article:created",
        content: `Bài viết mới "${doc.title}" cần duyệt`,
        meta: {
          articleId: doc._id,
          articleTitle: doc.title,
          guideName: user.name,
          guideEmail: user.email,
        },
      });
    } catch (e) {
      console.warn("notifyAdmins for article create failed:", e);
    }

    return res
      .status(201)
      .json({ message: "Bài viết đã gửi để duyệt", data: doc });
  } catch (err) {
    console.error("createArticle error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** Guide: list own articles */
export const listMyArticles = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 200);
    const skip = (page - 1) * limit;

    const filter = { authorId: user._id };

    const [items, total] = await Promise.all([
      Article.find(filter)
        .populate("categoryId", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    return res.json({ items, page, limit, total });
  } catch (err) {
    console.error("listMyArticles error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** Guide: get single own article (any status) */
export const getMyArticle = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const doc = await Article.findOne({ _id: id, authorId: user._id })
      .populate("categoryId", "name slug")
      .lean();

    if (!doc) return res.status(404).json({ message: "Article not found" });

    return res.json(doc);
  } catch (err) {
    console.error("getMyArticle error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** Guide: update own article (resets approval to pending) */
export const updateMyArticle = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const doc = await Article.findById(id);
    if (!doc) return res.status(404).json({ message: "Article not found" });
    if (!doc.authorId || String(doc.authorId) !== String(user._id))
      return res.status(403).json({ message: "Không có quyền chỉnh sửa" });

    const body = req.body || {};
    const rawHtml = String(body.content_html || doc.content_html || "");
    const content = sanitizeContent(rawHtml);
    const excerpt = excerptText(stripImageTags(content), 300);
    const images = extractImageUrls(content);

    // update allowed fields only
    doc.title = body.title ? String(body.title).trim() : doc.title;
    const slugBase =
      (body.slug && String(body.slug).trim()) ||
      doc.slug ||
      doc.title ||
      `article-${doc._id}`;
    doc.slug = await ensureUniqueSlug(Article, slugBase, doc._id);
    doc.summary = body.summary ? String(body.summary).trim() : doc.summary;
    doc.content_html = content;
    doc.excerpt = excerpt;
    doc.cover_image = body.cover_image || images[0] || doc.cover_image;
    doc.images = images.length ? images : doc.images;

    // reset approval so admin re-reviews
    doc.approval = {
      status: "pending",
      reviewed_by: null,
      reviewed_at: null,
      notes: null,
    };
    doc.status = "pending";
    await doc.save();

    // notify admins of update
    try {
      await notifyAdmins({
        type: "article:updated",
        content: `Bài viết "${doc.title}" đã được cập nhật và cần duyệt lại`,
        meta: {
          articleId: doc._id,
          articleTitle: doc.title,
          guideName: user.name,
          guideEmail: user.email,
        },
      });
    } catch (e) {
      console.warn("notifyAdmins for article update failed:", e);
    }

    return res.json({
      message: "Cập nhật thành công. Bài sẽ được duyệt lại.",
      data: doc,
    });
  } catch (err) {
    console.error("updateMyArticle error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** DELETE article (author or admin) */
export const deleteArticle = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const doc = await Article.findById(id);
    if (!doc) return res.status(404).json({ message: "Article not found" });

    // allow author or admin to delete
    const isAuthor = doc.authorId && String(doc.authorId) === String(user._id);
    const isAdmin = user.role === "admin" || user?.role_id?.name === "admin";
    if (!isAuthor && !isAdmin)
      return res.status(403).json({ message: "Không có quyền xóa bài" });

    // Delete the article
    await Article.findByIdAndDelete(id);

    // optional: notify author/admin (if deleted by admin)
    try {
      if (isAdmin && doc.authorId) {
        await notifyUser({
          userId: doc.authorId,
          type: "article:deleted",
          content: `Bài viết "${doc.title}" đã bị xóa bởi quản trị viên.`,
          url: "/guide/articles",
          meta: { articleId: doc._id, articleTitle: doc.title, slug: doc.slug },
        });
      }
    } catch (e) {
      console.warn("notifyUser after delete failed:", e);
    }

    return res.json({ message: "Đã xóa bài viết" });
  } catch (err) {
    console.error("deleteArticle error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * DELETE feature image or image url from article
 * - If query param ?url=<imageUrl> provided => remove that image from doc.images array
 * - Otherwise remove cover_image (set to null)
 * Permissions: author OR admin can remove images
 */
export const deleteFeatureImage = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const imageUrl = req.query.url; // optional

    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const doc = await Article.findById(id);
    if (!doc) return res.status(404).json({ message: "Article not found" });

    const isAuthor = doc.authorId && String(doc.authorId) === String(user._id);
    const isAdmin = user.role === "admin" || user?.role_id?.name === "admin";
    if (!isAuthor && !isAdmin)
      return res.status(403).json({ message: "Không có quyền xóa ảnh" });

    // If url provided => remove from images array
    if (imageUrl) {
      const prevLen = (doc.images || []).length;
      doc.images = (doc.images || []).filter((u) => u !== imageUrl);
      if (doc.cover_image === imageUrl) {
        doc.cover_image = null;
      }
      if ((doc.images || []).length === prevLen) {
        return res
          .status(404)
          .json({ message: "Ảnh không tồn tại trong bài viết" });
      }

      await doc.save();

      // optional: delete from storage if uploader exposes a delete function
      try {
        const uploader = await import("../services/uploader.js").catch(
          () => null
        );
        if (uploader && typeof uploader.deleteFileByUrl === "function") {
          await uploader.deleteFileByUrl(imageUrl).catch(() => { });
        }
      } catch (e) { }

      return res.json({ message: "Đã xóa ảnh khỏi bài viết.", data: doc });
    }

    // Otherwise remove cover_image
    if (!doc.cover_image) {
      return res
        .status(400)
        .json({ message: "Bài viết không có ảnh bìa để xóa." });
    }

    const removedUrl = doc.cover_image;
    doc.cover_image = null;

    // Also remove from images array if present
    doc.images = (doc.images || []).filter((u) => u !== removedUrl);

    await doc.save();

    try {
      const uploader = await import("../services/uploader.js").catch(
        () => null
      );
      if (uploader && typeof uploader.deleteFileByUrl === "function") {
        await uploader.deleteFileByUrl(removedUrl).catch(() => { });
      }
    } catch (e) { }

    return res.json({ message: "Đã xóa ảnh bìa.", data: doc });
  } catch (err) {
    console.error("deleteFeatureImage error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** Admin: list articles with filter (pending/approved/rejected) */
export const adminListArticles = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) {
      if (status === "pending") filter["approval.status"] = "pending";
      else if (status === "approved") filter["approval.status"] = "approved";
      else if (status === "rejected") filter["approval.status"] = "rejected";
    }

    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const docs = await Article.find(filter)
      .sort({ createdAt: -1 })
      .skip((pg - 1) * limit)
      .limit(Number(limit))
      .populate({
        path: "authorId",
        select: "name email role_id",
        populate: { path: "role_id", select: "name" },
      })
      .populate("categoryId", "name slug")
      .lean();

    // Transform authorId to author for frontend compatibility
    const items = docs.map((doc) => ({
      ...doc,
      author: doc.authorId
        ? {
          _id: doc.authorId._id,
          name: doc.authorId.name,
          email: doc.authorId.email,
          role: doc.authorId.role_id?.name || null,
        }
        : null,
      category: doc.categoryId || null,
    }));

    return res.json({ items, page: pg });
  } catch (err) {
    console.error("adminListArticles error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** Admin: approve article */
export const adminApproveArticle = async (req, res) => {
  try {
    const admin = req.user;
    const { id } = req.params;
    const { notes } = req.body || {};
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const doc = await Article.findById(id);
    if (!doc) return res.status(404).json({ message: "Article not found" });
    if (!doc.authorId)
      return res
        .status(400)
        .json({ message: "Bài viết phải có tác giả trước khi duyệt" });

    doc.approval = {
      status: "approved",
      reviewed_by: admin._id,
      reviewed_at: new Date(),
      notes: notes || null,
    };
    doc.status = "active";
    doc.publishedAt = new Date();
    await doc.save();

    // notify author
    try {
      await notifyUser({
        userId: doc.authorId,
        type: "article:approved",
        content: `Bài viết "${doc.title}" đã được duyệt.`,
        url: `/blog/${doc.slug || doc._id}`,
        meta: { articleId: doc._id, articleTitle: doc.title, slug: doc.slug },
      });
    } catch (e) {
      console.warn("notifyUser article approved failed:", e);
    }

    return res.json({ message: "Đã duyệt bài", data: doc });
  } catch (err) {
    console.error("adminApproveArticle error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** Admin: reject article */
export const adminRejectArticle = async (req, res) => {
  try {
    const admin = req.user;
    const { id } = req.params;
    const { notes } = req.body || {};
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const doc = await Article.findById(id);
    if (!doc) return res.status(404).json({ message: "Article not found" });

    doc.approval = {
      status: "rejected",
      reviewed_by: admin._id,
      reviewed_at: new Date(),
      notes: notes || null,
    };
    doc.status = "inactive";
    await doc.save();

    // notify author
    try {
      if (doc.authorId) {
        await notifyUser({
          userId: doc.authorId,
          type: "article:rejected",
          content: `Bài viết "${doc.title}" đã bị từ chối.`,
          url: `/guide/articles/${doc._id}`,
          meta: { articleId: doc._id, articleTitle: doc.title, slug: doc.slug, notes: notes || "" },
        });
      }
    } catch (e) {
      console.warn("notifyUser article rejected failed:", e);
    }

    return res.json({ message: "Đã từ chối bài", data: doc });
  } catch (err) {
    console.error("adminRejectArticle error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** Admin: create article/notification (auto-approved) */
export const adminCreateArticle = async (req, res) => {
  try {
    const admin = req.user;
    if (!admin) return res.status(401).json({ message: "Unauthorized" });

    const body = req.body || {};
    const rawHtml = String(body.content_html || "");
    const content = sanitizeContent(rawHtml);
    const excerptRaw = stripImageTags(content);
    const excerpt = excerptText(excerptRaw, 300);
    const images = extractImageUrls(content);

    const title = String(body.title || "").trim();
    const slugBase =
      (body.slug && String(body.slug).trim()) ||
      title ||
      `article-${Date.now()}`;
    const slug = await ensureUniqueSlug(Article, slugBase);

    const doc = await Article.create({
      title,
      slug,
      summary: body.summary ? String(body.summary).trim() : undefined,
      content_html: content,
      excerpt,
      cover_image: body.cover_image || images[0] || null,
      images,
      categoryId: body.categoryId || null,
      authorId: admin._id,
      createdBy: admin._id,
      // Admin posts: set type, audience, and auto-approve
      type: body.type || "system",
      audience: body.audience || "all",
      status: "active",
      approval: {
        status: "approved",
        reviewed_by: admin._id,
        reviewed_at: new Date(),
        notes: "Auto-approved (admin)",
      },
      publishedAt: new Date(),
    });

    return res
      .status(201)
      .json({ message: "Đã đăng thông báo thành công", data: doc });
  } catch (err) {
    console.error("adminCreateArticle error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** Admin: update any article */
export const adminUpdateArticle = async (req, res) => {
  try {
    const admin = req.user;
    const { id } = req.params;
    if (!admin) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const doc = await Article.findById(id);
    if (!doc) return res.status(404).json({ message: "Article not found" });

    const body = req.body || {};
    const rawHtml = String(body.content_html || doc.content_html || "");
    const content = sanitizeContent(rawHtml);
    const excerpt = excerptText(stripImageTags(content), 300);
    const images = extractImageUrls(content);

    // update fields
    doc.title = body.title ? String(body.title).trim() : doc.title;
    const slugBase =
      (body.slug && String(body.slug).trim()) ||
      doc.slug ||
      doc.title ||
      `article-${doc._id}`;
    doc.slug = await ensureUniqueSlug(Article, slugBase, doc._id);
    doc.summary = body.summary ? String(body.summary).trim() : doc.summary;
    doc.content_html = content;
    doc.excerpt = excerpt;
    doc.cover_image =
      body.cover_image !== undefined ? body.cover_image : doc.cover_image;
    doc.images = images.length ? images : doc.images;

    // Update optional fields for admin posts
    if (body.type !== undefined) doc.type = body.type;
    if (body.audience !== undefined) doc.audience = body.audience;
    if (body.categoryId !== undefined) doc.categoryId = body.categoryId || null;

    await doc.save();

    return res.json({
      message: "Cập nhật thành công",
      data: doc,
    });
  } catch (err) {
    console.error("adminUpdateArticle error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

export default {
  listArticlesPublic,
  getArticlePublic,
  getRelatedArticles,
  createArticle,
  listMyArticles,
  getMyArticle,
  updateMyArticle,
  deleteArticle,
  deleteFeatureImage,
  adminListArticles,
  adminApproveArticle,
  adminRejectArticle,
  adminCreateArticle,
  adminUpdateArticle,
};
