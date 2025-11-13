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

        // Validator mới KHÔNG bắt buộc departures
        const parsed = createTourRequestSchema.safeParse(req.body || {});
        if (!parsed.success) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ.", errors: parsed.error.flatten() });
        }
        const data = parsed.data;

        // validate locations (bắt buộc)
        const locations = normalizeLocations(data.locations);
        if (!locations.length) {
            return res.status(400).json({ message: "Cần chọn ít nhất 1 địa điểm." });
        }
        const locIds = locations.map(l => l.locationId);
        const locCount = await Location.countDocuments({ _id: { $in: locIds } });
        if (locCount !== locIds.length) return res.status(400).json({ message: "Có địa điểm không tồn tại." });

        // validate categories (multi | single)
        const categories = (data.categories && data.categories.length)
            ? data.categories
            : (data.category_id ? [data.category_id] : []);
        if (categories.length) {
            const catCount = await TourCategory.countDocuments({ _id: { $in: categories } });
            if (catCount !== categories.length) return res.status(400).json({ message: "Có danh mục không tồn tại." });
        }

        // Flexible-date defaults (đảm bảo có khi validator chưa set)
        const allow_custom_date = (data.allow_custom_date !== undefined) ? !!data.allow_custom_date : true;
        const fixed_departure_time = data.fixed_departure_time || "08:00";
        const min_days_before_start = Number.isInteger(data.min_days_before_start) ? data.min_days_before_start : 0;
        const max_days_advance = Number.isInteger(data.max_days_advance) ? data.max_days_advance : 180;
        const closed_weekdays = Array.isArray(data.closed_weekdays) ? data.closed_weekdays : [];
        const blackout_dates = Array.isArray(data.blackout_dates) ? data.blackout_dates : [];
        const per_date_capacity = (data.per_date_capacity === null || data.per_date_capacity === undefined)
            ? null
            : Number(data.per_date_capacity);

        // Lưu request (KHÔNG còn departures)
        const doc = await TourRequest.create({
            // cơ bản
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
            free_under_age: data.free_under_age ?? 11,

            // quan hệ
            guide_id: req.user._id,          // giữ tương thích ngược
            created_by: req.user._id,        // mới (nếu schema có)
            guides: (Array.isArray(data.guides) && data.guides.length)
                ? data.guides
                : [{ guideId: req.user._id, isMain: true }],
            locations,

            // ngày linh hoạt + giờ cố định
            allow_custom_date,
            fixed_departure_time,
            min_days_before_start,
            max_days_advance,
            closed_weekdays,
            blackout_dates,
            per_date_capacity,

            // quy trình duyệt (đơn giản hoá về status)
            status: "pending",
            reviewed_by: null,
            reviewed_at: null,
            reason_rejected: null,
            notes: null,
            notify_url: `/admin/tour-requests`, // sẽ chỉnh thành /:id khi admin mở
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
        const { status = "pending" } = req.query;
        const filter = {};
        if (status) filter.status = status; // dùng status, không dùng review.status

        const items = await TourRequest.find(filter)
            .populate("guide_id", "name avatar_url")
            .populate("categories", "name slug")
            .populate("locations.locationId", "name slug")
            .sort({ createdAt: -1 })
            .lean();

        return res.json(items);
    } catch (err) {
        console.error("listPendingTourRequests error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

// GET /admin/tour-requests/:id
export const getTourRequest = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID không hợp lệ." });
        const r = await TourRequest.findById(id)
            .populate("guide_id", "name avatar_url")
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
                duration: r.duration,
                price: r.price,
                max_guests: r.max_guests,
                category_id: r.category_id || null,
                categories,
                cover_image_url: r.cover_image_url || null,
                gallery: r.gallery || [],
                itinerary: r.itinerary || [],
                featured: !!r.featured,
                status: "active",

                created_by: r.created_by || r.guide_id,
                created_by_role: "guide",

                approval: { status: "approved", reviewed_by: req.user._id, reviewed_at: new Date(), notes: req.body?.notes || null },

                guides: (r.guides && r.guides.length) ? r.guides : [{ guideId: r.guide_id, isMain: true }],
                locations: r.locations || [],

                // Flexible date config
                allow_custom_date: r.allow_custom_date !== false,
                fixed_departure_time: r.fixed_departure_time || "08:00",
                min_days_before_start: Number.isInteger(r.min_days_before_start) ? r.min_days_before_start : 0,
                max_days_advance: Number.isInteger(r.max_days_advance) ? r.max_days_advance : 180,
                closed_weekdays: Array.isArray(r.closed_weekdays) ? r.closed_weekdays : [],
                blackout_dates: Array.isArray(r.blackout_dates) ? r.blackout_dates : [],
                per_date_capacity: r.per_date_capacity ?? null,
            }], { session });

            // cập nhật request
            r.status = "approved";
            r.reviewed_by = req.user._id;
            r.reviewed_at = new Date();
            r.reason_rejected = null;
            r.notes = req.body?.notes || null;
            r.tour_id = tourDoc._id;
            r.notify_url = `/admin/tour-requests/${r._id}`;
            await r.save({ session });

            // 🔔 Thông báo cho HDV
            await notifyUser({
                userId: r.created_by || r.guide_id,
                type: "tour_request:approved",
                content: `Yêu cầu tạo tour “${r.name}” đã được duyệt`,
                url: `/tours/${tourDoc.slug}`,
                meta: { tourId: tourDoc._id.toString(), requestId: r._id.toString() },
            });
        });

        return res.json({ message: "Đã duyệt yêu cầu và tạo tour thành công." });
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
        r.reviewed_by = req.user._id;
        r.reviewed_at = new Date();
        r.reason_rejected = notes || "Không đạt yêu cầu";
        r.notify_url = `/admin/tour-requests/${r._id}`;
        await r.save();

        // 🔔 Thông báo cho HDV
        await notifyUser({
            userId: r.created_by || r.guide_id,
            type: "tour_request:rejected",
            content: `Yêu cầu tạo tour “${r.name}” đã bị từ chối`,
            url: `/guide/tour-requests/${r._id}`,
            meta: { requestId: r._id.toString(), notes: r.reason_rejected },
        });

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
        const filter = { $or: [{ created_by: req.user._id }, { guide_id: req.user._id }] };
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
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID không hợp lệ." });

        if (roleNameOf(req.user) !== "guide") return res.status(403).json({ message: "Chỉ HDV." });

        const doc = await TourRequest.findOne({ _id: id, $or: [{ created_by: req.user._id }, { guide_id: req.user._id }] });
        if (!doc) return res.status(404).json({ message: "Không tìm thấy yêu cầu." });
        if (doc.status !== "pending") return res.status(403).json({ message: "Chỉ sửa khi còn pending." });

        const parsed = updateTourRequestSchema.safeParse(req.body || {});
        if (!parsed.success) {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ.", errors: parsed.error.flatten() });
        }
        const data = parsed.data;

        // validate locations nếu có
        if (data.locations?.length) {
            const normalized = normalizeLocations(data.locations);
            const ids = normalized.map(x => x.locationId);
            const cnt = await Location.countDocuments({ _id: { $in: ids } });
            if (cnt !== ids.length) return res.status(400).json({ message: "Danh sách địa điểm có phần tử không tồn tại." });
            data.locations = normalized;
        }

        // validate categories nếu có
        if (data.categories?.length) {
            const catCount = await TourCategory.countDocuments({ _id: { $in: data.categories } });
            if (catCount !== data.categories.length) {
                return res.status(400).json({ message: "Danh sách danh mục có phần tử không tồn tại." });
            }
        }

        Object.assign(doc, data);
        await doc.save();

        return res.json(doc);
    } catch (err) {
        console.error("updateTourRequest error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

// DELETE /api/tour-requests/:id   (guide chỉ khi pending)
export const deleteTourRequest = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID không hợp lệ." });

        if (roleNameOf(req.user) !== "guide") return res.status(403).json({ message: "Chỉ HDV." });

        const doc = await TourRequest.findOne({ _id: id, $or: [{ created_by: req.user._id }, { guide_id: req.user._id }] });
        if (!doc) return res.status(404).json({ message: "Không tìm thấy yêu cầu." });
        if (doc.status !== "pending") return res.status(403).json({ message: "Chỉ hủy khi còn pending." });

        await doc.deleteOne();
        return res.json({ message: "Đã xoá yêu cầu." });
    } catch (err) {
        console.error("deleteTourRequest error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};