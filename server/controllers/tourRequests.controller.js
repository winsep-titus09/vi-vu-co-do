// server/controllers/tourRequests.controller.js
import mongoose from "mongoose";

import TourRequest from "../models/TourRequest.js";
import Tour from "../models/Tour.js";
import Location from "../models/Location.js";
import TourCategory from "../models/TourCategory.js";

import { createTourRequestSchema, updateTourRequestSchema } from "../utils/validator.js";
import { notifyAdmins, notifyUser } from "../services/notify.js";
import { makeUniqueSlug } from "../utils/slug.js"; // dùng utils slug dùng chung

function roleNameOf(user) {
    return (user?.role_id?.name || user?.role || "").toString().trim().toLowerCase();
}

function normalizeLocations(locs = []) {
    return (Array.isArray(locs) ? locs : [])
        .map((x, i) => ({ locationId: x.locationId, order: Number.isInteger(x.order) ? x.order : i }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** ===================== GUIDE FLOW ===================== **/

// POST /api/tour-requests   (Guide gửi đề xuất tour)
export const submitTourRequest = async (req, res) => {
    try {
        if (roleNameOf(req.user) !== "guide") {
            return res.status(403).json({ message: "Chỉ HDV mới được gửi yêu cầu tạo tour." });
        }

        const parsed = createTourRequestSchema.safeParse(req.body || {});
        if (!parsed.success) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ", detail: parsed.error.format() });
        }

        const {
            name,
            description,
            duration,
            duration_hours,
            price,
            max_guests,
            categories,
            cover_image_url,
            gallery,
            itinerary,
            featured,
            free_under_age,
            guides,
            locations,
            allow_custom_date,
            fixed_departure_time,
            min_days_before_start,
            max_days_advance,
            closed_weekdays,
            blackout_dates,
            per_date_capacity
        } = parsed.data;

        // normalize locations & validate existence
        const locIds = (Array.isArray(locations) ? locations.map(l => l.locationId) : []).filter(Boolean);
        if (locIds.length === 0) {
            return res.status(400).json({ message: "Danh sách địa điểm rỗng." });
        }
        const locCnt = await Location.countDocuments({ _id: { $in: locIds } });
        if (locCnt !== locIds.length) return res.status(400).json({ message: "Danh sách địa điểm có phần tử không tồn tại." });

        const doc = await TourRequest.create({
            name,
            description,
            duration: Number(duration || 1),
            duration_hours: typeof duration_hours !== "undefined" ? (duration_hours === null ? null : Number(duration_hours)) : null,
            price,
            max_guests: Number(max_guests || 0),
            category_id: (categories && categories.length) ? categories[0] : null,
            categories: categories || [],
            cover_image_url: cover_image_url || null,
            gallery: gallery || [],
            itinerary: itinerary || [],
            featured: !!featured,
            free_under_age: Number(free_under_age || 11),
            guides: (Array.isArray(guides) && guides.length) ? guides : [{ guideId: req.user._id, isMain: true }],
            locations: normalizeLocations(locations),
            allow_custom_date: allow_custom_date !== false,
            fixed_departure_time: fixed_departure_time || "08:00",
            min_days_before_start: Number.isInteger(min_days_before_start) ? min_days_before_start : 0,
            max_days_advance: Number.isInteger(max_days_advance) ? max_days_advance : 180,
            closed_weekdays: Array.isArray(closed_weekdays) ? closed_weekdays : [],
            blackout_dates: Array.isArray(blackout_dates) ? blackout_dates : [],
            per_date_capacity: per_date_capacity ?? null,
            status: "pending",
            reviewed_by: null,
            reviewed_at: null,
            reason_rejected: null,
            notes: null,
            created_by: req.user._id,
            notify_url: `/admin/tour-requests`
        });

        // 🔔 Thông báo cho Admin
        try {
            const guideName = req.user?.name || "Một hướng dẫn viên";
            await notifyAdmins({
                type: "tour_request:new",
                content: `${guideName} gửi yêu cầu tạo tour: ${doc.name}`,
                url: `/admin/tour-requests/${doc._id}`,
                meta: { requestId: doc._id.toString(), guideId: req.user._id.toString() },
            });
        } catch (e) {
            console.warn("notifyAdmins tour_request:new failed:", e?.message);
        }

        return res.status(201).json({ message: "Đã gửi yêu cầu tạo tour. Vui lòng chờ duyệt.", request_id: doc._id });
    } catch (err) {
        console.error("submitTourRequest error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** ===================== ADMIN FLOW ===================== **/

// GET /admin/tour-requests?status=pending&page=&limit=
export const listPendingTourRequests = async (req, res) => {
    try {
        const { status = "pending", page = 1, limit = 50 } = req.query;
        const filter = {};
        if (status) filter.status = status; // dùng status, không dùng review.status

        const pg = Math.max(Number(page) || 1, 1);
        const lm = Math.min(Math.max(Number(limit) || 50, 1), 200);

        const [items, total] = await Promise.all([
            TourRequest.find(filter)
                .populate("created_by", "name avatar_url")
                .populate("guides.guideId", "name avatar_url")
                .populate("categories", "name slug")
                .populate("locations.locationId", "name slug")
                .sort({ createdAt: -1 })
                .skip((pg - 1) * lm)
                .limit(lm)
                .lean(),
            TourRequest.countDocuments(filter)
        ]);

        return res.json({ items, total, page: pg, pageSize: lm });
    } catch (err) {
        console.error("listPendingTourRequests error:", err);
        if (err && err.name === "StrictPopulateError") {
            return res.status(500).json({ message: "Populate failed: check populated fields against schema.", detail: err.message });
        }
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

// GET /admin/tour-requests/:id
export const getTourRequest = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID không hợp lệ." });
        const r = await TourRequest.findById(id)
            .populate("created_by", "name avatar_url")
            .populate("guides.guideId", "name avatar_url")
            .populate("categories", "name slug")
            .populate("locations.locationId", "name slug")
            .lean();

        if (!r) return res.status(404).json({ message: "Không tìm thấy yêu cầu." });
        return res.json(r);
    } catch (err) {
        console.error("getTourRequest error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

// PATCH /admin/tour-requests/:id/approve
export const approveTourRequest = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID không hợp lệ." });

        await session.withTransaction(async () => {
            const r = await TourRequest.findById(id).session(session);
            if (!r) throw new Error("NOT_FOUND");
            if (r.status !== "pending") throw new Error("ALREADY_PROCESSED");

            // Validate locations
            const locIds = (r.locations || []).map(x => x.locationId);
            const locCnt = await Location.countDocuments({ _id: { $in: locIds } });
            if (locCnt !== locIds.length) throw new Error("INVALID_LOCATIONS");

            // categories
            const categories = (r.categories && r.categories.length)
                ? r.categories
                : (r.category_id ? [r.category_id] : []);

            // Tạo Tour từ request (ngày linh hoạt)
            const slug = await makeUniqueSlug(Tour, r.name);

            const [tourDoc] = await Tour.create([{
                slug,
                name: r.name,
                description: r.description,
                // keep legacy duration (days) for compatibility – derive from duration_hours if necessary
                duration: r.duration || Math.max(1, Math.ceil((r.duration_hours ?? 24) / 24)),
                // store duration_hours explicitly if provided
                duration_hours: (typeof r.duration_hours !== "undefined") ? (r.duration_hours === null ? null : r.duration_hours) : null,
                price: r.price,
                max_guests: r.max_guests,
                category_id: r.category_id || null,
                categories,
                cover_image_url: r.cover_image_url || null,
                gallery: r.gallery || [],
                itinerary: r.itinerary || [],
                featured: !!r.featured,
                status: "active",

                created_by: r.created_by || (Array.isArray(r.guides) && r.guides[0] ? r.guides[0].guideId : null),
                created_by_role: "guide",

                // Flexible date config
                allow_custom_date: r.allow_custom_date !== false,
                fixed_departure_time: r.fixed_departure_time || "08:00",
                min_days_before_start: Number.isInteger(r.min_days_before_start) ? r.min_days_before_start : 0,
                max_days_advance: Number.isInteger(r.max_days_advance) ? r.max_days_advance : 180,
                closed_weekdays: Array.isArray(r.closed_weekdays) ? r.closed_weekdays : [],
                blackout_dates: Array.isArray(r.blackout_dates) ? r.blackout_dates : [],
                per_date_capacity: r.per_date_capacity ?? null,

                guides: (r.guides && r.guides.length) ? r.guides : [],
                locations: r.locations || []
            }], { session });

            // cập nhật request
            r.status = "approved";
            r.reviewed_by = req.user ? req.user._id : null;
            r.reviewed_at = new Date();
            await r.save({ session });

            // notify guide (creator)
            try {
                await notifyUser({
                    userId: r.created_by,
                    type: "tour_request:approved",
                    content: `Yêu cầu tạo tour "${r.name}" đã được phê duyệt.`,
                    url: `/guide/tour-requests/${r._id}`,
                    meta: { requestId: r._id, tourId: tourDoc._id }
                });
            } catch (e) {
                console.warn("notifyUser tour_request:approved failed:", e?.message);
            }

            return res.json({ message: "Yêu cầu đã được phê duyệt.", tourId: tourDoc._id });
        });
    } catch (err) {
        if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Không tìm thấy yêu cầu." });
        if (err.message === "ALREADY_PROCESSED") return res.status(409).json({ message: "Yêu cầu đã được xử lý." });
        if (err.message === "INVALID_LOCATIONS") return res.status(400).json({ message: "Danh sách địa điểm có phần tử không tồn tại." });
        console.error("approveTourRequest error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    } finally {
        session.endSession();
    }
};

// PATCH /admin/tour-requests/:id/reject
export const rejectTourRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body || {};

        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID không hợp lệ." });
        const r = await TourRequest.findById(id);
        if (!r) return res.status(404).json({ message: "Không tìm thấy yêu cầu." });
        if (r.status !== "pending") return res.status(409).json({ message: "Yêu cầu đã được xử lý." });

        r.status = "rejected";
        r.reviewed_by = req.user ? req.user._id : null;
        r.reviewed_at = new Date();
        r.reason_rejected = notes || null;
        await r.save();

        // notify guide
        try {
            await notifyUser({
                userId: r.created_by,
                type: "tour_request:rejected",
                content: `Yêu cầu tạo tour “${r.name}” đã bị từ chối`,
                url: `/guide/tour-requests/${r._id}`,
                meta: { requestId: r._id.toString(), notes: r.reason_rejected },
            });
        } catch (e) {
            console.warn("notifyUser tour_request:rejected failed:", e?.message);
        }

        return res.json({ message: "Đã từ chối yêu cầu tạo tour." });
    } catch (err) {
        console.error("rejectTourRequest error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** =============== (Tuỳ chọn) GUIDE quản lý request của mình =============== **/

// GET /api/tour-requests/mine
export const listMyTourRequests = async (req, res) => {
    try {
        if (roleNameOf(req.user) !== "guide") return res.status(403).json({ message: "Chỉ HDV." });
        const { status, page = 1, limit = 12 } = req.query;

        const filter = { $or: [{ created_by: req.user._id }, { "guides.guideId": req.user._id }] };
        if (status) filter.status = status;

        const pg = Math.max(parseInt(page) || 1, 1);
        const lm = Math.min(Math.max(parseInt(limit) || 12, 1), 100);

        const [items, total] = await Promise.all([
            TourRequest.find(filter)
                .populate("categories", "name")
                .populate("locations.locationId", "name slug")
                .sort({ createdAt: -1 })
                .skip((pg - 1) * lm)
                .limit(lm)
                .lean(),
            TourRequest.countDocuments(filter),
        ]);

        return res.json({ items, total, page: pg, pageSize: lm });
    } catch (err) {
        console.error("listMyTourRequests error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

// PATCH /api/tour-requests/:id   (guide chỉ khi pending)
export const updateTourRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const parsed = updateTourRequestSchema.safeParse(req.body || {});
        if (!parsed.success) return res.status(400).json({ message: "Dữ liệu không hợp lệ", detail: parsed.error.format() });

        const r = await TourRequest.findById(id);
        if (!r) return res.status(404).json({ message: "Không tìm thấy yêu cầu." });
        if (r.status !== "pending") return res.status(409).json({ message: "Chỉ có thể cập nhật khi trạng thái pending." });
        if (String(r.created_by) !== String(req.user._id)) return res.status(403).json({ message: "Bạn không có quyền sửa yêu cầu này." });

        Object.assign(r, parsed.data);
        await r.save();
        return res.json({ message: "Đã cập nhật yêu cầu.", request: r });
    } catch (err) {
        console.error("updateTourRequest error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

export const deleteTourRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const r = await TourRequest.findById(id);
        if (!r) return res.status(404).json({ message: "Không tìm thấy yêu cầu." });
        if (String(r.created_by) !== String(req.user._id)) return res.status(403).json({ message: "Bạn không có quyền xóa yêu cầu này." });
        if (r.status !== "pending") return res.status(409).json({ message: "Chỉ có thể xóa khi trạng thái pending." });

        await r.deleteOne();
        return res.json({ message: "Đã xóa yêu cầu." });
    } catch (err) {
        console.error("deleteTourRequest error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};