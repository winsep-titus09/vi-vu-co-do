// server/controllers/locationCategory.controller.js
import LocationCategory from "../models/LocationCategory.js";
import Location from "../models/Location.js";
import { createLocationCategorySchema, updateLocationCategorySchema } from "../utils/validator.js";

/**
 * Tạo danh mục (ADMIN)
 * body: { name }
 */
export const createCategory = async (req, res) => {
    try {
        const parsed = createLocationCategorySchema.safeParse(req.body);
        if (!parsed.success) {
            const msg = parsed.error.issues.map(i => i.message).join("; ");
            return res.status(400).json({ message: msg });
        }
        const { name } = parsed.data;

        // kiểm tra trùng tên (unique index vẫn enforce, nhưng trả message đẹp)
        const existed = await LocationCategory.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
        if (existed) return res.status(409).json({ message: "Danh mục đã tồn tại." });

        const created = await LocationCategory.create({ name });
        return res.status(201).json({ message: "Tạo danh mục thành công.", data: created });
    } catch (err) {
        console.error("createCategory error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/**
 * Danh sách danh mục (PUBLIC)
 * query: q (search), page, limit
 */
export const listCategories = async (req, res) => {
    try {
        const { q = "", page = 1, limit = 20 } = req.query;
        const filter = q ? { name: { $regex: q, $options: "i" } } : {};
        const pg = Math.max(parseInt(page), 1);
        const lm = Math.min(Math.max(parseInt(limit), 1), 100);

        const [items, total] = await Promise.all([
            LocationCategory.find(filter).sort({ createdAt: -1 }).skip((pg - 1) * lm).limit(lm),
            LocationCategory.countDocuments(filter),
        ]);

        return res.json({
            data: items,
            pagination: { page: pg, limit: lm, total, pages: Math.ceil(total / lm) },
        });
    } catch (err) {
        console.error("listCategories error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/**
 * Lấy 1 danh mục (PUBLIC)
 */
export const getCategory = async (req, res) => {
    try {
        const item = await LocationCategory.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Không tìm thấy danh mục." });
        return res.json({ data: item });
    } catch (err) {
        console.error("getCategory error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/**
 * Cập nhật danh mục (ADMIN)
 */
export const updateCategory = async (req, res) => {
    try {
        const parsed = updateLocationCategorySchema.safeParse(req.body);
        if (!parsed.success) {
            const msg = parsed.error.issues.map(i => i.message).join("; ");
            return res.status(400).json({ message: msg });
        }
        const data = parsed.data;

        if (data.name) {
            const existed = await LocationCategory.findOne({
                _id: { $ne: req.params.id },
                name: { $regex: `^${data.name}$`, $options: "i" },
            });
            if (existed) return res.status(409).json({ message: "Tên danh mục đã tồn tại." });
        }

        const updated = await LocationCategory.findByIdAndUpdate(req.params.id, data, { new: true });
        if (!updated) return res.status(404).json({ message: "Không tìm thấy danh mục." });
        return res.json({ message: "Cập nhật thành công.", data: updated });
    } catch (err) {
        console.error("updateCategory error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/**
 * Xoá danh mục (ADMIN)
 * - Ngăn xoá nếu đang được tham chiếu bởi Location
 */
export const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;

        const inUse = await Location.countDocuments({ category_id: id });
        if (inUse > 0) {
            return res.status(400).json({
                message: `Không thể xoá: đang có ${inUse} địa điểm thuộc danh mục này.`,
            });
        }

        const deleted = await LocationCategory.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Không tìm thấy danh mục." });

        return res.json({ message: "Đã xoá danh mục thành công." });
    } catch (err) {
        console.error("deleteCategory error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};
