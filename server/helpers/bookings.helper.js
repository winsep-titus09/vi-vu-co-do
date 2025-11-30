import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import GuideBusyDate from "../models/GuideDate.js";

const ObjectId = mongoose.Types.ObjectId;

/**
 * Danh sách trạng thái được coi là "giữ chỗ" / "đã nhận"
 * (booking ở các trạng thái này sẽ chiếm slot và làm HDV bận)
 */
export const ACTIVE_STATUSES = ["accepted", "awaiting_payment", "paid", "completed"];

/** Parse date or return null.  Accepts YYYY-MM-DD (legacy interpreted as +07:00) or full ISO.  */
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
 * Normalize date to midnight (00:00:00. 000) for comparison
 * @param {Date|string} date
 * @returns {Date|null}
 */
export function normalizeToMidnight(date) {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
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

/**
 * Check if a date falls within a range (inclusive)
 * @param {Date} date - The date to check
 * @param {Date} rangeStart - Start of range
 * @param {Date} rangeEnd - End of range
 * @returns {boolean}
 */
export function dateInRange(date, rangeStart, rangeEnd) {
    if (!date || !rangeStart || !rangeEnd) return false;
    const d = new Date(date).getTime();
    const s = new Date(rangeStart).getTime();
    const e = new Date(rangeEnd).getTime();
    return d >= s && d <= e;
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

// ==========================================
// NEW: GUIDE BUSY DATES HELPERS
// ==========================================

/**
 * Kiểm tra xem guide có bị đánh dấu bận vào ngày cụ thể không (full day)
 * @param {ObjectId|string} guideId - ID của hướng dẫn viên
 * @param {Date|string} targetDate - Ngày cần kiểm tra
 * @returns {Promise<boolean>} - true nếu guide đã đánh dấu bận cả ngày
 */
export async function isGuideMarkedBusy(guideId, targetDate) {
    if (!guideId || !targetDate) return false;

    const date = normalizeToMidnight(targetDate);
    if (!date) return false;

    const busyRecord = await GuideBusyDate.findOne({
        guide_id: guideId,
        date: date,
        is_full_day: true,
    }).lean();

    return !!busyRecord;
}

/**
 * Kiểm tra xem guide có bị đánh dấu bận vào khoảng thời gian cụ thể không
 * @param {ObjectId|string} guideId - ID của hướng dẫn viên
 * @param {Date|string} targetDate - Ngày cần kiểm tra
 * @param {string} startTime - Giờ bắt đầu (HH:mm), optional
 * @param {string} endTime - Giờ kết thúc (HH:mm), optional
 * @returns {Promise<boolean>} - true nếu guide bận trong khoảng thời gian đó
 */
export async function isGuideMarkedBusyAtTime(guideId, targetDate, startTime = null, endTime = null) {
    if (!guideId || !targetDate) return false;

    const date = normalizeToMidnight(targetDate);
    if (!date) return false;

    // Tìm record bận cho ngày này
    const busyRecord = await GuideBusyDate.findOne({
        guide_id: guideId,
        date: date,
    }).lean();

    if (!busyRecord) return false;

    // Nếu bận cả ngày thì luôn return true
    if (busyRecord.is_full_day) return true;

    // Nếu không có thời gian cụ thể để check, và guide có đánh dấu bận thì return true
    if (!startTime || !endTime) return true;

    // Kiểm tra overlap thời gian
    if (busyRecord.start_time && busyRecord.end_time) {
        // Convert time strings to minutes for comparison
        const toMinutes = (timeStr) => {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + m;
        };

        const busyStart = toMinutes(busyRecord.start_time);
        const busyEnd = toMinutes(busyRecord.end_time);
        const checkStart = toMinutes(startTime);
        const checkEnd = toMinutes(endTime);

        // Check overlap
        return checkStart < busyEnd && busyStart < checkEnd;
    }

    return true;
}

/**
 * Kiểm tra xem guide có khả dụng vào một ngày/khoảng thời gian cụ thể không
 * (kết hợp cả busy dates và existing bookings)
 * @param {ObjectId|string} guideId - ID của hướng dẫn viên
 * @param {Date|string} startDate - Ngày/giờ bắt đầu
 * @param {Date|string} endDate - Ngày/giờ kết thúc
 * @param {ObjectId|string|null} excludeBookingId - Booking ID cần loại trừ (khi update)
 * @param {ObjectId|string|null} tourId - Tour ID (để cho phép overlap cùng tour)
 * @returns {Promise<{available: boolean, reason: string|null}>}
 */
export async function checkGuideAvailability(guideId, startDate, endDate, excludeBookingId = null, tourId = null) {
    if (!guideId || !startDate) {
        return { available: false, reason: "Thiếu thông tin guide hoặc ngày." };
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    // 1. Kiểm tra đánh dấu bận
    const markedBusy = await isGuideMarkedBusy(guideId, start);
    if (markedBusy) {
        return { available: false, reason: "HDV đã đánh dấu bận vào ngày này." };
    }

    // 2.  Kiểm tra booking khác
    const hasBusyBooking = await isGuideBusy(guideId, start, end, excludeBookingId, tourId);
    if (hasBusyBooking) {
        return { available: false, reason: "HDV đã có tour khác trùng thời gian." };
    }

    return { available: true, reason: null };
}

/**
 * Kiểm tra xem guide có unavailable (bận) hay không
 * Wrapper function đơn giản trả về boolean
 * @param {ObjectId|string} guideId
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @param {ObjectId|string|null} excludeBookingId
 * @param {ObjectId|string|null} tourId
 * @returns {Promise<boolean>} - true nếu bận, false nếu rảnh
 */
export async function isGuideUnavailable(guideId, startDate, endDate, excludeBookingId = null, tourId = null) {
    const result = await checkGuideAvailability(guideId, startDate, endDate, excludeBookingId, tourId);
    return !result.available;
}

/**
 * Lấy danh sách ngày bận của guide trong khoảng thời gian
 * @param {ObjectId|string} guideId - ID của hướng dẫn viên
 * @param {Date|string} fromDate - Từ ngày
 * @param {Date|string} toDate - Đến ngày
 * @returns {Promise<Array<{date: Date, reason: string, is_full_day: boolean}>>}
 */
export async function getGuideBusyDatesInRange(guideId, fromDate, toDate) {
    if (!guideId) return [];

    const from = normalizeToMidnight(fromDate) || new Date();
    const to = toDate ? normalizeToMidnight(toDate) : null;

    const filter = {
        guide_id: guideId,
        date: { $gte: from },
    };

    if (to) {
        filter.date.$lte = to;
    }

    const busyDates = await GuideBusyDate.find(filter)
        .select("date reason is_full_day start_time end_time")
        .sort({ date: 1 })
        .lean();

    return busyDates;
}

/**
 * Lấy danh sách tất cả các ngày guide bận (cả từ busy dates và bookings)
 * @param {ObjectId|string} guideId - ID của hướng dẫn viên
 * @param {Date|string} fromDate - Từ ngày
 * @param {Date|string} toDate - Đến ngày
 * @returns {Promise<Array<{date: string, type: 'busy_marked'|'booking', info: object}>>}
 */
export async function getAllGuideBusyDatesInRange(guideId, fromDate, toDate) {
    if (!guideId) return [];

    const from = normalizeToMidnight(fromDate) || new Date();
    const to = toDate ? new Date(toDate) : new Date(from.getTime() + 90 * 24 * 60 * 60 * 1000); // Default 90 days
    to.setHours(23, 59, 59, 999);

    const results = [];

    // 1. Lấy ngày đánh dấu bận
    const markedBusy = await GuideBusyDate.find({
        guide_id: guideId,
        date: { $gte: from, $lte: to },
    })
        .select("date reason is_full_day")
        .lean();

    for (const mb of markedBusy) {
        results.push({
            date: mb.date.toISOString().split('T')[0],
            type: 'busy_marked',
            info: {
                reason: mb.reason,
                is_full_day: mb.is_full_day,
            }
        });
    }

    // 2. Lấy ngày có booking
    const bookings = await Booking.find({
        intended_guide_id: guideId,
        status: { $in: ACTIVE_STATUSES },
        start_date: { $lte: to },
        $or: [
            { end_date: { $gte: from } },
            { end_date: null, start_date: { $gte: from } },
        ],
    })
        .populate("tour_id", "name slug")
        .select("tour_id start_date end_date status")
        .lean();

    for (const b of bookings) {
        const startDate = new Date(b.start_date);
        const endDate = b.end_date ? new Date(b.end_date) : startDate;

        // Duyệt qua từng ngày của booking
        let current = new Date(Math.max(startDate.getTime(), from.getTime()));
        current.setHours(0, 0, 0, 0);

        while (current <= endDate && current <= to) {
            const dateKey = current.toISOString().split('T')[0];

            // Kiểm tra xem ngày này đã có trong results chưa
            const existing = results.find(r => r.date === dateKey && r.type === 'booking');
            if (!existing) {
                results.push({
                    date: dateKey,
                    type: 'booking',
                    info: {
                        booking_id: b._id,
                        tour_name: b.tour_id?.name || 'Tour',
                        tour_slug: b.tour_id?.slug,
                        status: b.status,
                    }
                });
            }

            current.setDate(current.getDate() + 1);
        }
    }

    // Sort by date
    results.sort((a, b) => a.date.localeCompare(b.date));

    return results;
}

/**
 * Kiểm tra xem có thể đánh dấu ngày bận không (không có booking đã accept)
 * @param {ObjectId|string} guideId - ID của hướng dẫn viên
 * @param {Date|string} targetDate - Ngày cần kiểm tra
 * @returns {Promise<{canMark: boolean, reason: string|null, conflictingBooking: object|null}>}
 */
export async function canMarkDateAsBusy(guideId, targetDate) {
    if (!guideId || !targetDate) {
        return { canMark: false, reason: "Thiếu thông tin.", conflictingBooking: null };
    }

    const date = normalizeToMidnight(targetDate);
    if (!date) {
        return { canMark: false, reason: "Ngày không hợp lệ.", conflictingBooking: null };
    }

    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);

    // Tìm booking đã accept trong ngày này
    const existingBooking = await Booking.findOne({
        intended_guide_id: guideId,
        status: { $in: ACTIVE_STATUSES },
        $or: [
            // Booking bắt đầu trong ngày này
            {
                start_date: { $gte: date, $lt: nextDay },
            },
            // Booking kéo dài qua ngày này
            {
                start_date: { $lt: date },
                end_date: { $gte: date },
            },
        ],
    })
        .populate("tour_id", "name slug")
        .populate("customer_id", "name")
        .select("tour_id customer_id start_date end_date status")
        .lean();

    if (existingBooking) {
        return {
            canMark: false,
            reason: "Đã có booking đã được xác nhận vào ngày này.",
            conflictingBooking: {
                _id: existingBooking._id,
                tour_name: existingBooking.tour_id?.name,
                customer_name: existingBooking.customer_id?.name,
                start_date: existingBooking.start_date,
                status: existingBooking.status,
            }
        };
    }

    return { canMark: true, reason: null, conflictingBooking: null };
}

/**
 * Lấy danh sách guide IDs bận vào ngày cụ thể
 * @param {Date|string} targetDate - Ngày cần kiểm tra
 * @returns {Promise<string[]>} - Mảng các guide IDs (string)
 */
export async function getBusyGuideIdsOnDate(targetDate) {
    const date = normalizeToMidnight(targetDate);
    if (!date) return [];

    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);

    // 1. Lấy guides đánh dấu bận
    const markedBusy = await GuideBusyDate.find({
        date: date,
        is_full_day: true,
    }).select("guide_id").lean();

    const busyFromMarked = markedBusy.map(r => r.guide_id.toString());

    // 2. Lấy guides có booking
    const bookings = await Booking.find({
        status: { $in: ACTIVE_STATUSES },
        intended_guide_id: { $exists: true, $ne: null },
        $or: [
            { start_date: { $gte: date, $lt: nextDay } },
            { start_date: { $lt: date }, end_date: { $gte: date } },
        ],
    }).select("intended_guide_id").lean();

    const busyFromBookings = bookings
        .filter(b => b.intended_guide_id)
        .map(b => b.intended_guide_id.toString());

    // Combine and dedupe
    const allBusy = [...new Set([...busyFromMarked, ...busyFromBookings])];

    return allBusy;
}

/**
 * Đếm số ngày bận của guide trong tháng
 * @param {ObjectId|string} guideId - ID của hướng dẫn viên
 * @param {number} year - Năm
 * @param {number} month - Tháng (1-12)
 * @returns {Promise<{markedBusy: number, hasBooking: number, total: number}>}
 */
export async function countGuideBusyDaysInMonth(guideId, year, month) {
    if (!guideId) return { markedBusy: 0, hasBooking: 0, total: 0 };

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Count marked busy days
    const markedBusyCount = await GuideBusyDate.countDocuments({
        guide_id: guideId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // Count days with bookings (unique days)
    const bookings = await Booking.find({
        intended_guide_id: guideId,
        status: { $in: ACTIVE_STATUSES },
        start_date: { $lte: endOfMonth },
        $or: [
            { end_date: { $gte: startOfMonth } },
            { end_date: null, start_date: { $gte: startOfMonth } },
        ],
    }).select("start_date end_date").lean();

    const bookingDays = new Set();
    for (const b of bookings) {
        const start = new Date(Math.max(new Date(b.start_date).getTime(), startOfMonth.getTime()));
        const end = b.end_date ? new Date(Math.min(new Date(b.end_date).getTime(), endOfMonth.getTime())) : start;

        let current = new Date(start);
        current.setHours(0, 0, 0, 0);

        while (current <= end) {
            bookingDays.add(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }
    }

    return {
        markedBusy: markedBusyCount,
        hasBooking: bookingDays.size,
        total: markedBusyCount + bookingDays.size, // Note: có thể overlap
    };
}