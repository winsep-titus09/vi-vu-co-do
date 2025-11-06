// server/controllers/tours.controller.js
import mongoose from "mongoose";
import slugify from "slugify";

import Tour from "../models/Tour.js";
import Location from "../models/Location.js";
import User from "../models/User.js";
import TourCategory from "../models/TourCategory.js";
import GuideProfile from "../models/GuideProfile.js";

import { createTourSchema, updateTourSchema } from "../utils/validator.js";
import { notifyAdmins, notifyUser } from "../services/notify.js";

// Lọc chỉ tour đã duyệt (public)
const buildPublicFilter = () => ({
    "approval.status": "approved",
    status: "active",
});

slugify.extend({ "đ": "d", "Đ": "D" });
async function makeUniqueSlug(Model, name) {
    const base = slugify(name, { lower: true, strict: true, locale: "vi" });
    let slug = base, i = 2;
    while (await Model.exists({ slug })) slug = `${base}-${i++}`;
    return slug;
}

function asConflictIfDuplicate(err) {
    if (err?.code === 11000) {
        const key = err?.keyPattern ? Object.keys(err.keyPattern)[0] : null;
        let message = "Dữ liệu đã tồn tại.";
        if (key === "slug") message = "Tên tour đã tồn tại (slug bị trùng). Hãy đổi tên hoặc chỉnh lại slug.";
        if (key === "name") message = "Tên tour đã tồn tại. Hãy chọn tên khác.";
        return { status: 409, body: { message, duplicateKey: key, keyValue: err?.keyValue || null } };
    }
    return null;
}

async function resolveRoleName(user) {
    const val = [user?.role_id?.name, user?.role?.name, user?.roleName, user?.role]
        .find(Boolean);
    return (val || "").toString().trim().toLowerCase();
}

/** GET /api/tours?q=&category_id=&page=&limit= */
export const listTours = async (req, res) => {
    try {
        const { q, category_id, page = 1, limit = 12 } = req.query;
        const filter = buildPublicFilter();

        if (q) filter.name = { $regex: q, $options: "i" };
        if (category_id && mongoose.isValidObjectId(category_id)) {
            filter.$or = [{ category_id }, { categories: category_id }];
        }

        const pg = Math.max(parseInt(page) || 1, 1);
        const lm = Math.min(Math.max(parseInt(limit) || 12, 1), 100);

        const [items, total] = await Promise.all([
            Tour.find(filter)
                .populate("category_id", "name")
                .populate("guides.guideId", "name avatar_url")
                .populate("locations.locationId", "name slug")
                .sort({ createdAt: -1 })
                .skip((pg - 1) * lm)
                .limit(lm),
            Tour.countDocuments(filter),
        ]);

        return res.json({ items, total, page: pg, pageSize: lm });
    } catch (err) {
        console.error("listTours error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** GET /api/tours/:token (id hoặc slug) */
export const getTour = async (req, res) => {
    try {
        const { token } = req.params;
        const isOid = mongoose.isValidObjectId(token);
        const filter = buildPublicFilter();

        const cond = isOid ? { _id: token, ...filter } : { slug: token, ...filter };
        const tour = await Tour.findOne(cond)
            .populate("category_id", "name")
            .populate("guides.guideId", "name avatar_url")
            .populate("locations.locationId", "name slug")
            .lean();

        if (!tour) return res.status(404).json({ message: "Không tìm thấy tour." });

        return res.json(tour); // <-- FIX: trả về tour
    } catch (err) {
        console.error("getTour error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** POST /api/tours  (Admin trực tiếp) */
export const createTour = async (req, res) => {
    try {
        const roleName = await resolveRoleName(req.user);
        if (!["admin", "guide"].includes(roleName)) {
            return res.status(403).json({ message: "Bạn không có quyền tạo tour." });
        }
        // HDV không được tạo trực tiếp (theo flow hiện tại)
        if (roleName === "guide") {
            return res.status(403).json({ message: "HDV không được tạo tour trực tiếp. Vui lòng gửi yêu cầu tại /api/tour-requests." });
        }

        // Không cho override approval từ body
        const { approval, ...incoming } = req.body || {};
        const parsed = createTourSchema.safeParse(incoming);
        if (!parsed.success) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ.", errors: parsed.error.flatten() });
        }
        const data = parsed.data;

        // ---- VALIDATE LOCATIONS (bắt buộc) ----
        const locations = Array.isArray(data.locations) ? data.locations : [];
        if (!locations.length) {
            return res.status(400).json({ message: "Cần chọn ít nhất 1 địa điểm cho tour." });
        }
        const locationIds = locations.map(i => i.locationId);
        const locCount = await Location.countDocuments({ _id: { $in: locationIds } });
        if (locCount !== locationIds.length) {
            return res.status(400).json({ message: "Danh sách địa điểm có phần tử không tồn tại." });
        }
        // Chuẩn hoá order & sort
        const normalizedLocations = locations
            .map((x, i) => ({ locationId: x.locationId, order: typeof x.order === "number" ? x.order : i }))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        // ---- VALIDATE CATEGORIES ----
        const categories = (data.categories && data.categories.length)
            ? data.categories
            : (data.category_id ? [data.category_id] : []);
        if (categories.length) {
            const catCount = await TourCategory.countDocuments({ _id: { $in: categories } });
            if (catCount !== categories.length) {
                return res.status(400).json({ message: "Danh sách danh mục có phần tử không tồn tại." });
            }
        }

        // ---- Flexible date defaults (nếu validator chưa set) ----
        const allow_custom_date = (data.allow_custom_date !== undefined) ? !!data.allow_custom_date : true;
        const fixed_departure_time = data.fixed_departure_time || "08:00";
        const min_days_before_start = Number.isInteger(data.min_days_before_start) ? data.min_days_before_start : 0;
        const max_days_advance = Number.isInteger(data.max_days_advance) ? data.max_days_advance : 180;
        const closed_weekdays = Array.isArray(data.closed_weekdays) ? data.closed_weekdays : [];
        const blackout_dates = Array.isArray(data.blackout_dates) ? data.blackout_dates : [];
        const per_date_capacity = (data.per_date_capacity === null || data.per_date_capacity === undefined)
            ? null
            : Number(data.per_date_capacity);

        // ---- slug duy nhất từ name ----
        const slug = await makeUniqueSlug(Tour, data.name);

        // ---- Tạo Tour ----
        const tour = await Tour.create({
            slug,
            name: data.name,
            description: data.description,
            duration: data.duration,
            price: data.price,
            max_guests: data.max_guests,
            category_id: data.category_id || null,
            categories,
            cover_image_url: data.cover_image_url || null,
            gallery: data.gallery || [],
            itinerary: data.itinerary || [],
            featured: !!data.featured,
            status: data.status || "active",

            // trace
            created_by: req.user._id,
            created_by_role: roleName,

            // phê duyệt: admin tạo -> approved
            approval: { status: "approved", reviewed_by: req.user._id, reviewed_at: new Date(), notes: null },

            // quan hệ
            guides: data.guides || [],
            locations: normalizedLocations,

            // ---- NGÀY LINH HOẠT + GIỜ CỐ ĐỊNH ----
            allow_custom_date,
            fixed_departure_time,
            min_days_before_start,
            max_days_advance,
            closed_weekdays,
            blackout_dates,
            per_date_capacity,
        });

        // 🔔 Thông báo cho team admin
        try {
            const adminName = req.user?.name || "Admin";
            await notifyAdmins({
                type: "tour:created",
                content: `${adminName} đã tạo tour mới: ${tour.name}`,
                url: `/admin/tours/${tour._id}`,
                meta: { tourId: tour._id.toString(), slug: tour.slug },
            });
        } catch (e) {
            console.warn("notifyAdmins tour:created failed:", e?.message);
        }

        // 🔔 (tuỳ chọn) notify các HDV được gán
        try {
            if (Array.isArray(tour.guides) && tour.guides.length) {
                for (const g of tour.guides) {
                    if (!g?.guideId) continue;
                    await notifyUser({
                        userId: g.guideId,
                        type: "tour:assigned",
                        content: `Bạn được chỉ định làm HDV cho tour: "${tour.name}"`,
                        url: `/tours/${tour.slug}`,
                        meta: { tourId: tour._id.toString(), isMain: !!g.isMain },
                    });
                }
            }
        } catch (e) {
            console.warn("notifyUser tour:assigned failed:", e?.message);
        }

        return res.status(201).json(tour);
    } catch (err) {
        const mapped = asConflictIfDuplicate(err);
        if (mapped) return res.status(mapped.status).json(mapped.body);
        console.error("createTour error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** PATCH /api/tours/:id  (admin; guide chỉ sửa tour của mình khi còn pending) */
export const updateTour = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID không hợp lệ." });

        const roleName = await resolveRoleName(req.user);

        const tour = await Tour.findById(id);
        if (!tour) return res.status(404).json({ message: "Không tìm thấy tour." });

        if (roleName === "guide") {
            const isOwner = tour.created_by?.toString() === req.user._id.toString();
            const isPending = tour.approval?.status === "pending";
            if (!isOwner || !isPending) {
                return res.status(403).json({ message: "Bạn chỉ có thể sửa tour mình tạo khi còn chờ duyệt." });
            }
        } else if (roleName !== "admin") {
            return res.status(403).json({ message: "Bạn không có quyền sửa tour." });
        }

        const parsed = updateTourSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ.", errors: parsed.error.flatten() });
        }
        const data = parsed.data;

        // cập nhật name -> slug duy nhất
        if (data.name && data.name !== tour.name) {
            tour.slug = await makeUniqueSlug(Tour, data.name);
        }

        // validate locations nếu gửi lên
        if (data.locations?.length) {
            const ids = data.locations.map((x) => x.locationId);
            const count = await Location.countDocuments({ _id: { $in: ids } });
            if (count !== ids.length) {
                return res.status(400).json({ message: "Danh sách địa điểm có phần tử không tồn tại." });
            }
            // chuẩn hoá & sort
            data.locations = data.locations
                .map((x, i) => ({ locationId: x.locationId, order: typeof x.order === "number" ? x.order : i }))
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        }

        // validate categories nếu có
        if (data.categories?.length) {
            const catCount = await TourCategory.countDocuments({ _id: { $in: data.categories } });
            if (catCount !== data.categories.length) {
                return res.status(400).json({ message: "Danh sách danh mục có phần tử không tồn tại." });
            }
        } else if (data.category_id && mongoose.isValidObjectId(data.category_id)) {
            // single category_id ok
        }

        if (roleName === "guide") {
            // guide không được sửa approval
            delete data.approval;
            // nếu sửa guides thì đảm bảo bản thân là isMain
            if (data.guides) {
                const me = req.user._id.toString();
                const hasMe = data.guides.some((g) => g.guideId?.toString() === me);
                if (!hasMe) data.guides.unshift({ guideId: req.user._id, isMain: true });
                data.guides = data.guides.map((g) => ({ ...g, isMain: g.guideId?.toString() === me }));
            }
        }

        Object.assign(tour, data);
        await tour.save();

        return res.json(tour);
    } catch (err) {
        const mapped = asConflictIfDuplicate(err);
        if (mapped) return res.status(mapped.status).json(mapped.body);
        console.error("updateTour error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** DELETE /api/tours/:id  (admin; guide chỉ xóa tour của mình khi pending) */
export const deleteTour = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID không hợp lệ." });

        const roleName = await resolveRoleName(req.user);

        const tour = await Tour.findById(id);
        if (!tour) return res.status(404).json({ message: "Không tìm thấy tour." });

        if (roleName === "guide") {
            const isOwner = tour.created_by?.toString() === req.user._id.toString();
            const isPending = tour.approval?.status === "pending";
            if (!isOwner || !isPending) {
                return res.status(403).json({ message: "Bạn chỉ có thể xóa tour mình tạo khi còn chờ duyệt." });
            }
        } else if (roleName !== "admin") {
            return res.status(403).json({ message: "Bạn không có quyền xóa tour." });
        }

        await tour.deleteOne();
        return res.json({ message: "Đã xóa tour." });
    } catch (err) {
        console.error("deleteTour error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** GET /api/tours/available-guides  (admin dùng khi tạo tour trực tiếp) */
export const listAvailableGuides = async (req, res) => {
    try {
        const users = await User.find()
            .populate({
                path: "role_id",
                match: { name: "guide" },
                select: "name",
            })
            .select("name avatar_url role_id")
            .lean();

        const guideUsers = users
            .filter((u) => u.role_id?.name === "guide")
            .map((u) => ({ _id: u._id, name: u.name, avatar_url: u.avatar_url }));

        const profiles = await GuideProfile.find({
            status: "approved",
            user_id: { $in: guideUsers.map((g) => g._id) }
        }).select("user_id").lean();

        const approvedIds = new Set(profiles.map((p) => p.user_id.toString()));
        const approvedGuides = guideUsers.filter((g) => approvedIds.has(g._id.toString()));

        return res.json(approvedGuides);
    } catch (err) {
        console.error("listAvailableGuides error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};
