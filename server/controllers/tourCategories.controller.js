// server/controllers/tourCategories.controller.js
import mongoose from "mongoose";
import TourCategory from "../models/TourCategory.js";
import Tour from "../models/Tour.js";
import { createTourCategorySchema, updateTourCategorySchema } from "../utils/validator.js";

export const listTourCategories = async (req, res) => {
    try {
        const { status, q } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (q) filter.name = { $regex: q, $options: "i" };

        const items = await TourCategory.find(filter).sort({ order: 1, createdAt: -1 }).lean();
        res.json(items);
    } catch (err) {
        console.error("listTourCategories error:", err);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** GET /api/tour-categories/:token
 * Trả về danh sách tour thuộc category (phân trang + search)
 * Query: ?page=1&limit=12&q=keyword&includeCategory=1
 * - Mặc định chỉ trả tours; nếu includeCategory=1 thì kèm meta của category.
 */
export const getTourCategory = async (req, res) => {
    try {
        const { token } = req.params;
        const { page = 1, limit = 12, q, includeCategory } = req.query;

        // Lấy category theo id hoặc slug
        const isOid = mongoose.isValidObjectId(token);
        const catCond = isOid ? { _id: token } : { slug: token };
        const category = await TourCategory.findOne(catCond).lean();
        if (!category) return res.status(404).json({ message: "Không tìm thấy danh mục tour." });

        // Lọc tour: thuộc category, đã duyệt & active
        const filter = {
            // chỉ hiển thị tour approved + active (public)
            status: "active",
            "approval.status": "approved",
            // match cả field cũ và mới
            $or: [
                { category_id: category._id },
                { categories: category._id },
            ],
        };

        if (q) filter.name = { $regex: q, $options: "i" };

        const pg = Math.max(parseInt(page) || 1, 1);
        const lm = Math.min(Math.max(parseInt(limit) || 12, 1), 100);

        const [items, total] = await Promise.all([
            Tour.find(filter)
                .populate("category_id", "name")
                .populate("guides.guideId", "name avatar_url")
                .populate({ path: "locations.locationId", select: "name slug" })
                .sort({ createdAt: -1 })
                .skip((pg - 1) * lm)
                .limit(lm)
                .lean(),
            Tour.countDocuments(filter),
        ]);

        // Mặc định chỉ trả tours; thêm ?includeCategory=1 để kèm meta
        if (String(includeCategory) === "1") {
            return res.json({
                category: {
                    _id: category._id,
                    name: category.name,
                    slug: category.slug,
                    description: category.description ?? "",
                    icon: category.icon ?? null,
                    cover_image_url: category.cover_image_url ?? null,
                    order: category.order ?? 0,
                    status: category.status,
                },
                items,
                total,
                page: pg,
                pageSize: lm,
            });
        }

        return res.json({ items, total, page: pg, pageSize: lm });
    } catch (err) {
        console.error("getTourCategory error:", err);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** POST /api/tour-categories (admin) */
export const createTourCategory = async (req, res) => {
    try {
        const parsed = createTourCategorySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ.", errors: parsed.error.flatten() });
        }
        const data = parsed.data;
        const doc = await TourCategory.create(data);
        res.status(201).json(doc);
    } catch (err) {
        // duplicate key
        if (err?.code === 11000) {
            return res.status(409).json({ message: "Tên hoặc slug danh mục đã tồn tại." });
        }
        console.error("createTourCategory error:", err);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** PATCH /api/tour-categories/:id (admin) */
export const updateTourCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID không hợp lệ." });

        const parsed = updateTourCategorySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ.", errors: parsed.error.flatten() });
        }
        const data = parsed.data;

        const doc = await TourCategory.findById(id);
        if (!doc) return res.status(404).json({ message: "Không tìm thấy danh mục tour." });

        Object.assign(doc, data);
        await doc.save();
        res.json(doc);
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ message: "Tên hoặc slug danh mục đã tồn tại." });
        }
        console.error("updateTourCategory error:", err);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** DELETE /api/tour-categories/:id (admin)
 * Không xóa nếu còn tour đang tham chiếu. Có thể dùng ?force=nullify để gỡ tham chiếu.
 */
export const deleteTourCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { force } = req.query; // "nullify" để gỡ category_id khỏi tour
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID không hợp lệ." });

        const doc = await TourCategory.findById(id);
        if (!doc) return res.status(404).json({ message: "Không tìm thấy danh mục tour." });

        const used = await Tour.countDocuments({ category_id: id });
        if (used > 0 && force !== "nullify") {
            return res.status(409).json({
                message: `Danh mục đang được dùng bởi ${used} tour. Dùng ?force=nullify để gỡ liên kết trước khi xóa.`,
            });
        }

        if (used > 0 && force === "nullify") {
            await Tour.updateMany({ category_id: id }, { $set: { category_id: null } });
        }

        await doc.deleteOne();
        res.json({ message: "Đã xóa danh mục tour." });
    } catch (err) {
        console.error("deleteTourCategory error:", err);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};
