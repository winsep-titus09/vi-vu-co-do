// server/controllers/tours.controller.js
import slugify from "slugify";
import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import GuideProfile from "../models/GuideProfile.js";
import { createTourSchema } from "../utils/validator.js";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const ensureUniqueSlug = async (base) => {
    let slug = slugify(base, { lower: true, strict: true });
    if (!slug) slug = "tour";
    let i = 0;
    while (await Tour.exists({ slug })) {
        i += 1;
        slug = `${slugify(base, { lower: true, strict: true })}-${i}`;
    }
    return slug;
};

export const createTour = async (req, res) => {
    try {
        const role = req.user?.role_id?.name; // 'admin' | 'guide' | 'tourist'
        if (!["admin", "guide"].includes(role)) {
            return res.status(403).json({ message: "Chỉ admin hoặc hướng dẫn viên mới được tạo tour." });
        }

        const parsed = createTourSchema.safeParse(req.body);
        if (!parsed.success) {
            const msg = parsed.error.issues.map(i => i.message).join("; ");
            return res.status(400).json({ message: "Dữ liệu không hợp lệ", details: msg });
        }
        const payload = parsed.data;

        // Tạo slug duy nhất
        const slug = await ensureUniqueSlug(payload.name);

        // Khung tour ban đầu
        const doc = {
            name: payload.name,
            slug,
            description: payload.description,
            duration: payload.duration,
            price: payload.price,
            max_guests: payload.max_guests,
            category_id: payload.category_id ? toObjectId(payload.category_id) : undefined,
            cover_image_url: payload.cover_image_url ?? null,
            gallery: payload.gallery,
            itinerary: payload.itinerary,
            featured: payload.featured,
            status: payload.status,           // active/inactive (hiển thị)
            free_under_age: payload.free_under_age,
            guides: [],
            locations: payload.locations?.map(l => ({ locationId: toObjectId(l.locationId), order: l.order })),
            created_by: req.user._id,         // NEW
            approval_status: "pending"        // default, sẽ sửa nếu admin
        };

        if (role === "guide") {
            // guide tạo → chờ duyệt
            doc.guide_id = req.user._id; // giữ tương thích legacy
            doc.guides = [{ guideId: req.user._id, isMain: true }];
            doc.approval_status = "pending";
        }

        if (role === "admin") {
            // admin tạo → duyệt ngay
            doc.approval_status = "approved";

            // Nếu admin truyền sẵn guides → kiểm tra tồn tại & đúng role
            if (payload.guides?.length) {
                const guideIds = payload.guides.map(g => toObjectId(g.guideId));
                const guides = await User.find({ _id: { $in: guideIds } }).populate("role_id");
                const invalid = guides.filter(u => u?.role_id?.name !== "guide" || u.status !== "active");
                if (invalid.length) {
                    return res.status(400).json({ message: "Có HDV không hợp lệ hoặc không hoạt động." });
                }
                doc.guides = payload.guides.map(g => ({
                    guideId: toObjectId(g.guideId),
                    isMain: !!g.isMain
                }));
                // Nếu có HDV main → đồng bộ legacy guide_id
                const main = doc.guides.find(g => g.isMain);
                if (main) doc.guide_id = main.guideId;
            } else {
                // Không đính kèm HDV nào → để khách tự chọn HDV khả dụng khi đặt
                doc.guides = [];
                doc.guide_id = undefined;
            }
        }

        const created = await Tour.create(doc);
        // Chuẩn hoá giá về number cho response
        const json = created.toObject();
        json.price = created.priceNumber;

        return res.status(201).json({ message: "Tạo tour thành công", data: json });
    } catch (err) {
        console.error("createTour error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

// (Optional) liệt kê HDV khả dụng (đơn giản): role=guide, user.active & profile approved
export const listAvailableGuides = async (req, res) => {
    try {
        const q = (req.query.q || "").trim();
        const date = req.query.date; // để dành mở rộng kiểm tra lịch bận

        // filter cơ bản
        const guides = await User.find().populate("role_id");
        const filtered = guides.filter(u => u?.role_id?.name === "guide" && u.status === "active");

        // join profile để kiểm tra profile.status
        const guideIds = filtered.map(u => u._id);
        const profiles = await GuideProfile.find({ user_id: { $in: guideIds }, status: "approved" });
        const profileMap = new Map(profiles.map(p => [String(p.user_id), p]));

        let result = filtered
            .filter(u => profileMap.has(String(u._id)))
            .filter(u => !q || u.name.toLowerCase().includes(q.toLowerCase()))
            .map(u => ({
                id: u._id,
                name: u.name,
                avatar_url: u.avatar_url || null,
                phone_number: u.phone_number || null
            }));

        // TODO: nếu có module lịch bận thì loại trừ guide đã bận theo `date`
        return res.json({ data: result, count: result.length });
    } catch (err) {
        console.error("listAvailableGuides error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

// (Optional) Admin duyệt / từ chối tour
export const approveTour = async (req, res) => {
    try {
        const id = req.params.id;
        const updated = await Tour.findByIdAndUpdate(
            id,
            { $set: { approval_status: "approved" } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Không tìm thấy tour" });
        const json = updated.toObject();
        json.price = updated.priceNumber;
        return res.json({ message: "Đã duyệt tour", data: json });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

export const rejectTour = async (req, res) => {
    try {
        const id = req.params.id;
        const updated = await Tour.findByIdAndUpdate(
            id,
            { $set: { approval_status: "rejected" } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Không tìm thấy tour" });
        const json = updated.toObject();
        json.price = updated.priceNumber;
        return res.json({ message: "Đã từ chối tour", data: json });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};
