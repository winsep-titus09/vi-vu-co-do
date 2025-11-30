// server/controllers/tourAvailability.controller.js
import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import { getTakenSlots, isGuideBusy } from "../helpers/bookings.helper.js";

// Parse "YYYY-MM-DD" -> Date 00:00:00+07:00, hoặc nhận ISO 8601
function toDateAtLocal(input) {
    if (!input) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return new Date(`${input}T00:00:00+07:00`);
    const t = Date.parse(input);
    if (!Number.isNaN(t)) return new Date(t);
    return null;
}

function dayKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
}

function daysDiffUTC(a, b) {
    const MS = 24 * 60 * 60 * 1000;
    const a0 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    const b0 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((a0 - b0) / MS);
}

function sameDate(d1, d2) {
    return d1.getFullYear() === d2.getFullYear()
        && d1.getMonth() === d2.getMonth()
        && d1.getDate() === d2.getDate();
}

function inBlackout(date, blackoutDates = []) {
    return blackoutDates.some((bd) => {
        try {
            const d = new Date(bd);
            return sameDate(d, date);
        } catch {
            return false;
        }
    });
}

function toInt(v, def = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
}

async function evaluateDate({ tour, date, requestedSlots, guideId }) {
    const reasons = [];
    const today = new Date();
    const constraints = {
        allow_custom_date: !!tour.allow_custom_date,
        fixed_departure_time: tour.fixed_departure_time || "08:00",
        min_days_before_start: toInt(tour.min_days_before_start, 0),
        max_days_advance: toInt(tour.max_days_advance, 180),
        closed_weekdays: Array.isArray(tour.closed_weekdays) ? tour.closed_weekdays : [],
        blackout_dates: Array.isArray(tour.blackout_dates) ? tour.blackout_dates.map((d) => dayKey(new Date(d))) : [],
        per_date_capacity: tour.per_date_capacity == null ? null : toInt(tour.per_date_capacity),
        max_guests: toInt(tour.max_guests, 0),
    };

    if (!constraints.allow_custom_date) {
        reasons.push("custom_date_disabled");
    }

    // Không cho chọn ngày quá khứ
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (date < todayStart) {
        reasons.push("past_date");
    }

    // min_days_before_start
    const diffFromToday = daysDiffUTC(date, today);
    if (diffFromToday < constraints.min_days_before_start) {
        reasons.push("min_days_before_start");
    }

    // max_days_advance
    if (diffFromToday > constraints.max_days_advance) {
        reasons.push("max_days_advance");
    }

    // closed_weekdays
    if (constraints.closed_weekdays.includes(date.getDay())) {
        reasons.push("closed_weekday");
    }

    // blackout_dates
    if (inBlackout(date, tour.blackout_dates)) {
        reasons.push("in_blackout");
    }

    // Capacity
    const capacity = constraints.per_date_capacity == null
        ? constraints.max_guests
        : constraints.per_date_capacity;

    // Tính số slot đã chiếm
    const taken = await getTakenSlots(tour._id, date);
    const remaining = Math.max(capacity - taken, 0);

    if (requestedSlots > remaining) {
        reasons.push("no_capacity");
    }

    // HDV bận (tuỳ chọn)
    if (guideId) {
        const busy = await isGuideBusy(guideId, date, null);
        if (busy) reasons.push("guide_busy");
    }

    return {
        date: dayKey(date),
        valid: reasons.length === 0,
        reasons,
        capacity,
        taken,
        remaining,
        constraints,
    };
}

async function suggestDates({ tour, startFrom, requestedSlots, guideId, days = 14, limit = 5 }) {
    const out = [];
    let cursor = new Date(startFrom.getTime());
    for (let i = 0; i < days && out.length < limit; i += 1) {
        const check = await evaluateDate({ tour, date: cursor, requestedSlots, guideId });
        if (check.valid) out.push(check.date);
        cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }
    return out;
}

// GET /api/tours/:id/check-date?date=YYYY-MM-DD&participants=3&guideId=<optional>
export const checkTourDate = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID không hợp lệ." });

        const dateStr = req.query.date;
        const participants = toInt(req.query.participants, 1);
        const guideId = req.query.guideId && mongoose.isValidObjectId(req.query.guideId) ? req.query.guideId : null;

        const date = toDateAtLocal(dateStr);
        if (!date) return res.status(400).json({ message: "date không hợp lệ. Dùng YYYY-MM-DD hoặc ISO 8601." });

        const tour = await Tour.findOne({ _id: id, status: "active", "approval.status": "approved" }).lean();
        if (!tour) return res.status(404).json({ message: "Không tìm thấy tour." });

        const result = await evaluateDate({ tour, date, requestedSlots: participants, guideId });
        if (!result.valid) {
            const startFrom = new Date(date.getTime() + 24 * 60 * 60 * 1000);
            result.suggest = await suggestDates({ tour, startFrom, requestedSlots: participants, guideId });
        }
        return res.json(result);
    } catch (err) {
        console.error("checkTourDate error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

// POST /api/tours/:id/check-dates
// Body: { dates: ["2025-12-20","2025-12-21",...], participants: 3, guideId?: "..." }
export const checkMultipleTourDates = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID không hợp lệ." });

        const body = req.body || {};
        const dates = Array.isArray(body.dates) ? body.dates : [];
        if (!dates.length) return res.status(400).json({ message: "Thiếu danh sách dates." });

        const participants = toInt(body.participants, 1);
        const guideId = body.guideId && mongoose.isValidObjectId(body.guideId) ? body.guideId : null;

        const tour = await Tour.findOne({ _id: id, status: "active", "approval.status": "approved" }).lean();
        if (!tour) return res.status(404).json({ message: "Không tìm thấy tour." });

        const results = [];
        for (const ds of dates) {
            const d = toDateAtLocal(ds);
            if (!d) {
                results.push({ date: String(ds), valid: false, reasons: ["invalid_date"] });
                continue;
            }
            results.push(await evaluateDate({ tour, date: d, requestedSlots: participants, guideId }));
        }

        return res.json({ items: results });
    } catch (err) {
        console.error("checkMultipleTourDates error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};