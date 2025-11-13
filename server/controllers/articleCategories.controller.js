import mongoose from "mongoose";
import Article from "../models/Article.js";
import ArticleCategory from "../models/ArticleCategory.js";
import { ensureUniqueSlug, toSlug } from "../utils/slug.js";

const toObjectId = (id) => {
    try {
        return new mongoose.Types.ObjectId(id);
    } catch {
        return null;
    }
};

// PUBLIC
export const listArticleCategoriesPublic = async (_req, res) => {
    try {
        const items = await ArticleCategory.find().sort({ name: 1 }).lean();
        res.json(items);
    } catch (err) {
        console.error("listArticleCategoriesPublic error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

export const getArticleCategoryBySlugPublic = async (req, res) => {
    try {
        const slug = (req.params.slug || "").toLowerCase();
        if (!slug) return res.status(400).json({ message: "Slug không hợp lệ." });
        const item = await ArticleCategory.findOne({ slug }).lean();
        if (!item) return res.status(404).json({ message: "Không tìm thấy danh mục." });
        res.json(item);
    } catch (err) {
        console.error("getArticleCategoryBySlugPublic error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

// ADMIN
export const listArticleCategoriesAdmin = async (req, res) => {
    try {
        const { q } = req.query;
        const filter = {};
        if (q) {
            filter.$or = [{ name: { $regex: q, $options: "i" } }, { slug: { $regex: toSlug(q), $options: "i" } }];
        }
        const items = await ArticleCategory.find(filter).sort({ createdAt: -1 }).lean();
        res.json({ data: items });
    } catch (err) {
        console.error("listArticleCategoriesAdmin error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

export const getArticleCategoryAdmin = async (req, res) => {
    try {
        const id = toObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "ID không hợp lệ." });

        const item = await ArticleCategory.findById(id).lean();
        if (!item) return res.status(404).json({ message: "Không tìm thấy danh mục." });
        res.json(item);
    } catch (err) {
        console.error("getArticleCategoryAdmin error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

export const createArticleCategory = async (req, res) => {
    try {
        const name = (req.body.name || "").trim();
        if (!name) return res.status(400).json({ message: "Tên danh mục là bắt buộc." });

        const slug = await ensureUniqueSlug(ArticleCategory, req.body.slug || name);

        const created = await ArticleCategory.create({ name, slug });
        res.status(201).json({ message: "Tạo danh mục thành công", data: created });
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ message: "Tên hoặc slug danh mục đã tồn tại." });
        }
        console.error("createArticleCategory error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

export const updateArticleCategory = async (req, res) => {
    try {
        const id = toObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "ID không hợp lệ." });

        const name = typeof req.body.name === "string" ? req.body.name.trim() : undefined;
        const update = {};
        if (typeof name !== "undefined") {
            if (!name) return res.status(400).json({ message: "Tên danh mục không được rỗng." });
            update.name = name;
        }

        if (typeof req.body.slug !== "undefined") {
            const baseSlug = req.body.slug || update.name || "";
            if (!baseSlug) return res.status(400).json({ message: "Slug không hợp lệ." });
            update.slug = await ensureUniqueSlug(ArticleCategory, baseSlug, id);
        }

        const updated = await ArticleCategory.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
        if (!updated) return res.status(404).json({ message: "Không tìm thấy danh mục." });

        res.json({ message: "Cập nhật danh mục thành công", data: updated });
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ message: "Tên hoặc slug danh mục đã tồn tại." });
        }
        console.error("updateArticleCategory error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

export const deleteArticleCategory = async (req, res) => {
    try {
        const id = toObjectId(req.params.id);
        if (!id) return res.status(400).json({ message: "ID không hợp lệ." });

        const cat = await ArticleCategory.findById(id).lean();
        if (!cat) return res.status(404).json({ message: "Không tìm thấy danh mục." });

        const count = await Article.countDocuments({ categoryId: id });
        if (count > 0) {
            return res.status(400).json({ message: "Không thể xóa danh mục khi còn bài viết liên quan." });
        }

        await ArticleCategory.deleteOne({ _id: id });
        res.json({ message: "Xóa danh mục thành công" });
    } catch (err) {
        console.error("deleteArticleCategory error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};