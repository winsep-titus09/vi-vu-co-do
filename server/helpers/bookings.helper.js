// server/helpers/bookings.helper.js
// Booking-related helpers: getTakenSlots, isGuideBusy, hasGuideLockedThisTourDate,
// plus date/duration helpers (toDateOrNull, addHours, getDurationHoursFromTour, rangesOverlap).

import mongoose from "mongoose";
import Booking from "../models/Booking.js";

const ObjectId = mongoose.Types.ObjectId;

/**
 * Danh sách trạng thái được coi là "giữ chỗ" / "đã nhận"
 * (booking ở các trạng thái này sẽ chiếm slot và làm HDV bận)
 */
export const ACTIVE_STATUSES = ["accepted", "awaiting_payment", "paid", "completed"];

/** Parse date or return null. Accepts YYYY-MM-DD (legacy interpreted as +07:00) or full ISO. */
export function toDateOrNull(input) {
    if (!input) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        return new Date(`${input}T00:00:00+07:00`);
    }
    const t = Date.parse(input);
    if (!Number.isNaN(t)) return new Date(t);
    return null;
}

/** Add hours to Date */
export function addHours(d, hours) {
    if (!d) return null;
    const x = new Date(d);
    x.setTime(x.getTime() + Math.round(Number(hours || 0) * 3600 * 1000));
    return x;
}

/**
 * Get duration in hours from tour document.
 * Priority:
 *  - tour.duration_hours if set and > 0
 *  - else fallback to tour.duration (days) * 24
 *  - default 24
 */
export function getDurationHoursFromTour(tour) {
    if (!tour) return 24;
    if (typeof tour.duration_hours === "number" && Number.isFinite(tour.duration_hours) && tour.duration_hours > 0) {
        return Number(tour.duration_hours);
    }
    const days = Number(tour.duration || 1);
    return Math.max(1, days) * 24;
}

/**
 * Range overlap check for half-open intervals [start, end)
 * Returns true if aStart < bEnd && bStart < aEnd
 */
export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
    if (!aStart || !aEnd || !bStart || !bEnd) return false;
    const as = new Date(aStart).getTime();
    const ae = new Date(aEnd).getTime();
    const bs = new Date(bStart).getTime();
    const be = new Date(bEnd).getTime();
    return as < be && bs < ae;
}

/** Tính tổng slot đã chiếm của 1 tour cho một occurrence (match by exact start datetime) */
export async function getTakenSlots(tourId, startDate) {
    const start = startDate ? new Date(startDate) : null;
    if (!tourId || !start) return 0;

    // Match bookings for the exact occurrence start datetime.
    // If your system groups by day instead, adjust query to YMD grouping.
    const bookings = await Booking.find({
        tour_id: tourId,
        start_date: start,
        status: { $in: ACTIVE_STATUSES },
    }).lean();

    let taken = 0;
    for (const b of bookings) {
        for (const p of (b.participants || [])) if (p.count_slot) taken += 1;
    }
    return taken;
}

/**
 * isGuideBusy
 * - guideId: ObjectId/string
 * - candidateStart, candidateEnd: Date objects or ISO strings
 * - excludeBookingId: optional booking id to exclude (when updating same booking)
 * - tourIdForSame: optional tour id to allow same-tour overlaps
 *
 * Return true if guide has an overlapping booking (status in ACTIVE_STATUSES) with a different tour.
 */
export async function isGuideBusy(guideId, candidateStart, candidateEnd, excludeBookingId = null, tourIdForSame = null) {
    if (!guideId || !candidateStart || !candidateEnd) return false;
    const start = new Date(candidateStart);
    const end = new Date(candidateEnd);

    // Query bookings that potentially overlap the candidate range
    const cond = {
        intended_guide_id: guideId,
        status: { $in: ACTIVE_STATUSES },
        start_date: { $lt: end },
        end_date: { $gt: start },
    };

    // Use Mongoose validation and casting; create ObjectId instance with `new` when needed
    if (excludeBookingId && mongoose.isValidObjectId(excludeBookingId)) {
        try {
            cond._id = { $ne: new ObjectId(excludeBookingId) };
        } catch (e) {
            // fallback to raw id if casting fails for some reason
            cond._id = { $ne: excludeBookingId };
        }
    }

    // Find overlapping bookings
    const docs = await Booking.find(cond).lean();

    // If same tour and overlap => not considered busy
    for (const b of docs) {
        const sameTour = tourIdForSame && String(b.tour_id) === String(tourIdForSame);
        const overlap = rangesOverlap(b.start_date, b.end_date || b.start_date, start, end);
        if (!overlap) continue;
        if (sameTour) {
            // same tour overlapping allowed (do not count busy)
            continue;
        }
        // overlap with a different tour => busy
        return true;
    }
    return false;
}

/**
 * hasGuideLockedThisTourDate
 * - checks if the guide has already 'locked' (accepted/awaiting_payment/paid/completed)
 *   this specific tour occurrence (exact start datetime).
 */
export async function hasGuideLockedThisTourDate(guideId, tourId, startDate, endDate = null) {
    if (!guideId || !tourId || !startDate) return false;
    const start = new Date(startDate);

    const cond = {
        intended_guide_id: guideId,
        tour_id: tourId,
        status: { $in: ACTIVE_STATUSES },
        start_date: start
    };

    const found = await Booking.findOne(cond).select("_id").lean();
    return !!found;
}