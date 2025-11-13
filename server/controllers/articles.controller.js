// server/controllers/articles.controller.js
// CRUD + quản lý ảnh đại diện (feature image)
// - Create/Update: chấp nhận JSON hoặc multipart/form-data (nếu route gắn upload.single('feature_image'))
// - Content chỉ chữ: tự động loại bỏ thẻ <img> khi tạo/cập nhật

import mongoose from "mongoose";
import Article from "../models/Article.js";
import ArticleCategory from "../models/ArticleCategory.js";
import { ensureUniqueSlug, toSlug } from "../utils/slug.js";
import {
    uploadBufferToCloudinary,
    uploadFromUrlToCloudinary,
    deleteFromCloudinary,
} from "../services/uploader.js";

/* Helpers */
const toObjectId = (id) => {
    try {
        return new mongoose.Types.ObjectId(id);
    } catch {
        return null;
    }
};
const parseBoolLoose = (v) => {
    if (typeof v === "boolean") return v;
    if (typeof v === "string") return ["1", "true", "yes", "on"].includes(v.toLowerCase());
    return undefined;
};
// Loại bỏ <img ...> trong content
const stripImageTags = (html = "") => String(html || "").replace(/<img[\s\S]*?>/gi, "");

// Validate + resolve categoryId (nếu có)
async function resolveCategoryId(categoryId) {
    if (typeof categoryId === "undefined") return undefined;
    if (categoryId === null || categoryId === "") return null;
    const cid = toObjectId(categoryId);
    if (!cid) {
        const e = new Error("CategoryId không hợp lệ.");
        e.status = 400;
        throw e;
    }
    const exists = await ArticleCategory.findById(cid).lean();
    if (!exists) {
        const e = new Error("Danh mục không tồn tại.");
        e.status = 404;
        throw e;
    }
    return cid;
}

const populateDoc = async (id) =>
    Article.findById(id)
        .populate("authorId", "name email")
        .populate("categoryId", "name slug")
        .lean();

/* PUBLIC (tham khảo) */
export const listArticlesPublic = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page || "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100);
        const skip = (page - 1) * limit;

        const q = (req.query.q || "").trim();
        const categoryId = req.query.categoryId ? toObjectId(req.query.categoryId) : undefined;
        const categorySlug = (req.query.categorySlug || "").trim().toLowerCase();
        const featuredStr = req.query.featured;
        const featured =
            typeof featuredStr !== "undefined" ? ["1", "true", "yes"].includes(String(featuredStr).toLowerCase()) : undefined;

        const sort = (() => {
            const s = String(req.query.sort || "");
            if (!s) return { publishedAt: -1, createdAt: -1 };
            const [field, dir] = s.split(":");
            const direction = dir === "asc" ? 1 : -1;
            const allowed = ["publishedAt", "createdAt", "updatedAt", "title", "featured"];
            if (!allowed.includes(field)) return { publishedAt: -1, createdAt: -1 };
            return { [field]: direction };
        })();

        const filter = { status: "published" };
        if (q) filter.$or = [{ title: { $regex: q, $options: "i" } }, { slug: { $regex: toSlug(q), $options: "i" } }];
        if (categoryId) filter.categoryId = categoryId;
        if (categorySlug) {
            const cat = await ArticleCategory.findOne({ slug: categorySlug }).lean();
            filter.categoryId = cat?._id || null;
        }
        if (typeof featured === "boolean") filter.featured = featured;

        const [items, total] = await Promise.all([
            Article.find(filter)
                .populate("authorId", "name avatar_url")
                .populate("categoryId", "name slug")
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Article.countDocuments(filter),
        ]);

        res.json({ data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) || 1 } });
    } catch (err) {
        console.error("listArticlesPublic error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

export const getArticlePublic = async (req, res) => {
    try {
        const id = toObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "ID không hợp lệ." });
        const item = await Article.findOne({ _id: id, status: "published" })
            .populate("authorId", "name avatar_url")
            .populate("categoryId", "name slug")
            .lean();
        if (!item) return res.status(404).json({ message: "Bài viết không tồn tại hoặc chưa được xuất bản." });
        res.json(item);
    } catch (err) {
        console.error("getArticlePublic error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

export const getArticleBySlugPublic = async (req, res) => {
    try {
        const slug = (req.params.slug || "").toLowerCase();
        if (!slug) return res.status(400).json({ message: "Slug không hợp lệ." });
        const item = await Article.findOne({ slug, status: "published" })
            .populate("authorId", "name avatar_url")
            .populate("categoryId", "name slug")
            .lean();
        if (!item) return res.status(404).json({ message: "Bài viết không tồn tại hoặc chưa được xuất bản." });
        res.json(item);
    } catch (err) {
        console.error("getArticleBySlugPublic error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

/* CREATE (unified JSON/multipart) */
export const createArticle = async (req, res) => {
    try {
        const body = req.body || {};
        const title = (body.title || "").trim();
        const content = body.content;

        if (!title) return res.status(400).json({ message: "Tiêu đề là bắt buộc." });
        if (typeof content !== "string") return res.status(400).json({ message: "Nội dung là bắt buộc." });

        const categoryRef = await resolveCategoryId(body.categoryId);
        const slug = await ensureUniqueSlug(Article, body.slug || title);

        const status = body.status ? String(body.status) : "published";
        if (!["draft", "published"].includes(status)) {
            return res.status(400).json({ message: "Trạng thái không hợp lệ." });
        }
        const publishedAt = status === "published" ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : undefined;

        const doc = await Article.create({
            title,
            slug,
            content: stripImageTags(content),
            authorId: req.user._id,
            ...(typeof categoryRef !== "undefined" && { categoryId: categoryRef }),
            featured: !!parseBoolLoose(body.featured),
            status,
            ...(publishedAt && { publishedAt }),
        });

        const hasFile = !!req.file;
        const featureImageUrl = body.featureImageUrl ? String(body.featureImageUrl).trim() : "";
        if (hasFile || featureImageUrl) {
            const uploaded = hasFile
                ? await uploadBufferToCloudinary(req.file.buffer, `articles/${doc._id}/feature`, {
                    transformation: [{ quality: "auto", fetch_format: "auto" }],
                })
                : await uploadFromUrlToCloudinary(featureImageUrl, `articles/${doc._id}/feature`, {
                    transformation: [{ quality: "auto", fetch_format: "auto" }],
                });

            await Article.findByIdAndUpdate(doc._id, {
                $set: { feature_image_url: uploaded.secure_url, feature_image_public_id: uploaded.public_id },
            });
        }

        const populated = await populateDoc(doc._id);
        return res.status(201).json({ message: "Tạo bài viết thành công", data: populated });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ message: err.message });
        if (err?.code === 11000) return res.status(409).json({ message: "Slug bài viết đã tồn tại." });
        console.error("createArticleUnified error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

/* UPDATE (unified JSON/multipart) */
export const updateArticle = async (req, res) => {
    try {
        const id = toObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "ID không hợp lệ." });

        const doc = await Article.findById(id);
        if (!doc) return res.status(404).json({ message: "Không tìm thấy bài viết." });

        const body = req.body || {};
        let titleChanged = false;

        if (typeof body.title === "string") {
            const t = body.title.trim();
            if (!t) return res.status(400).json({ message: "Tiêu đề không được để trống." });
            if (t !== doc.title) titleChanged = true;
            doc.title = t;
        }
        if (typeof body.content === "string") {
            doc.content = stripImageTags(body.content);
        }

        if (typeof body.categoryId !== "undefined") {
            const categoryRef = await resolveCategoryId(body.categoryId);
            if (categoryRef === null) doc.categoryId = undefined;
            else if (categoryRef !== undefined) doc.categoryId = categoryRef;
        }

        if (typeof body.featured !== "undefined") {
            doc.featured = !!parseBoolLoose(body.featured);
        }

        if (typeof body.status !== "undefined") {
            if (!["draft", "published"].includes(body.status)) {
                return res.status(400).json({ message: "Trạng thái không hợp lệ." });
            }
            doc.status = body.status;
            if (doc.status === "published") {
                doc.publishedAt = body.publishedAt ? new Date(body.publishedAt) : new Date();
            } else {
                doc.publishedAt = undefined;
            }
        } else if (typeof body.publishedAt !== "undefined") {
            if (doc.status !== "published") {
                return res.status(400).json({ message: "Không thể đặt publishedAt khi bài viết đang ở trạng thái nháp." });
            }
            doc.publishedAt = body.publishedAt ? new Date(body.publishedAt) : doc.publishedAt || new Date();
        }

        if (typeof body.slug !== "undefined" || titleChanged) {
            const base = body.slug || doc.title;
            if (!base) return res.status(400).json({ message: "Slug không hợp lệ." });
            doc.slug = await ensureUniqueSlug(Article, base, doc._id);
        }

        await doc.save();

        // Ảnh: nếu có file hoặc featureImageUrl, thay ảnh
        const hasFile = !!req.file;
        const featureImageUrl = body.featureImageUrl ? String(body.featureImageUrl).trim() : "";
        if (hasFile || typeof body.featureImageUrl !== "undefined") {
            if (doc.feature_image_public_id) {
                await deleteFromCloudinary(doc.feature_image_public_id, "image");
                doc.feature_image_public_id = null;
                doc.feature_image_url = null;
            }

            if (hasFile) {
                const r = await uploadBufferToCloudinary(req.file.buffer, `articles/${doc._id}/feature`, {
                    transformation: [{ quality: "auto", fetch_format: "auto" }],
                });
                doc.feature_image_url = r.secure_url;
                doc.feature_image_public_id = r.public_id;
            } else if (featureImageUrl) {
                const r = await uploadFromUrlToCloudinary(featureImageUrl, `articles/${doc._id}/feature`, {
                    transformation: [{ quality: "auto", fetch_format: "auto" }],
                });
                doc.feature_image_url = r.secure_url;
                doc.feature_image_public_id = r.public_id;
            }
            await doc.save();
        }

        const populated = await populateDoc(doc._id);
        res.json({ message: "Cập nhật bài viết thành công", data: populated });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ message: err.message });
        if (err?.code === 11000) return res.status(409).json({ message: "Slug bài viết đã tồn tại." });
        console.error("updateArticleUnified error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

/* DELETE bài viết */
export const deleteArticle = async (req, res) => {
    try {
        const id = toObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "ID không hợp lệ." });
        const doc = await Article.findById(id).lean();
        if (!doc) return res.status(404).json({ message: "Không tìm thấy bài viết." });

        if (doc.feature_image_public_id) {
            await deleteFromCloudinary(doc.feature_image_public_id, "image");
        }
        await Article.deleteOne({ _id: id });
        res.json({ message: "Xóa bài viết thành công" });
    } catch (err) {
        console.error("deleteArticle error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

/* ẢNH ĐẠI DIỆN: cập nhật bằng file */
export const setFeatureImage = async (req, res) => {
    try {
        const id = toObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "ID không hợp lệ." });
        const doc = await Article.findById(id);
        if (!doc) return res.status(404).json({ message: "Không tìm thấy bài viết." });
        if (!req.file) return res.status(400).json({ message: "Thiếu file 'feature_image'." });

        if (doc.feature_image_public_id) {
            await deleteFromCloudinary(doc.feature_image_public_id, "image");
        }
        const r = await uploadBufferToCloudinary(req.file.buffer, `articles/${doc._id}/feature`, {
            transformation: [{ quality: "auto", fetch_format: "auto" }],
        });
        doc.feature_image_url = r.secure_url;
        doc.feature_image_public_id = r.public_id;
        await doc.save();

        res.json({ message: "Cập nhật ảnh đại diện thành công", feature_image_url: doc.feature_image_url });
    } catch (err) {
        console.error("setFeatureImage error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

/* ẢNH ĐẠI DIỆN: cập nhật bằng URL */
export const setFeatureImageByUrl = async (req, res) => {
    try {
        const id = toObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "ID không hợp lệ." });
        const doc = await Article.findById(id);
        if (!doc) return res.status(404).json({ message: "Không tìm thấy bài viết." });

        const url = (req.body?.url || "").trim();
        if (!url) return res.status(400).json({ message: "Thiếu url." });

        if (doc.feature_image_public_id) {
            await deleteFromCloudinary(doc.feature_image_public_id, "image");
        }
        const r = await uploadFromUrlToCloudinary(url, `articles/${doc._id}/feature`, {
            transformation: [{ quality: "auto", fetch_format: "auto" }],
        });
        doc.feature_image_url = r.secure_url;
        doc.feature_image_public_id = r.public_id;
        await doc.save();

        res.json({ message: "Cập nhật ảnh đại diện thành công", feature_image_url: doc.feature_image_url });
    } catch (err) {
        console.error("setFeatureImageByUrl error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

/* XÓA ẢNH ĐẠI DIỆN */
export const deleteFeatureImage = async (req, res) => {
    try {
        const id = toObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "ID không hợp lệ." });
        const doc = await Article.findById(id);
        if (!doc) return res.status(404).json({ message: "Không tìm thấy bài viết." });

        if (doc.feature_image_public_id) {
            await deleteFromCloudinary(doc.feature_image_public_id, "image");
        }
        doc.feature_image_url = null;
        doc.feature_image_public_id = null;
        await doc.save();

        res.json({ message: "Đã xoá ảnh đại diện." });
    } catch (err) {
        console.error("deleteFeatureImage error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};