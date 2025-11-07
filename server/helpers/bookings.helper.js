// server/helpers/bookings.helper.js
import Booking from "../models/Booking.js";

/**
 * Tính tổng số slot đã được giữ của tour trong ngày khởi hành cụ thể
 * @param {ObjectId} tourId 
 * @param {Date} startDate 
 * @returns {Promise<number>} tổng slot đã chiếm
 */
export const ACTIVE_STATUSES = ["accepted", "awaiting_payment", "paid", "completed"];

/** Tính tổng slot đã chiếm của 1 tour trong 1 ngày */
export async function getTakenSlots(tourId, startDate) {
    const bookings = await Booking.find({
        tour_id: tourId,
        start_date: startDate ? new Date(startDate) : null,
        status: { $in: ACTIVE_STATUSES },
    }).lean();

    let taken = 0;
    for (const b of bookings) {
        for (const p of (b.participants || [])) if (p.count_slot) taken += 1;
    }
    return taken;
}

/** true nếu hai khoảng ngày giao nhau (end có thể null → coi như = start) */
function overlap(aStart, aEnd, bStart, bEnd) {
    const aS = aStart ? new Date(aStart) : null;
    const aE = aEnd ? new Date(aEnd) : aS;
    const bS = bStart ? new Date(bStart) : null;
    const bE = bEnd ? new Date(bEnd) : bS;
    if (!aS || !bS) return false;
    return aS <= bE && bS <= aE;
}

/**
 * HDV đã "bận" trong khoảng ngày này bởi một booking khác? (khác _id)
 * Dùng để chặn HDV nhận tour khác trùng thời gian.
 */
export async function isGuideBusy(guideId, startDate, endDate, excludeBookingId = null) {
    const docs = await Booking.find({
        intended_guide_id: guideId,
        status: { $in: ACTIVE_STATUSES },
        // lọc sơ bộ theo ngày bắt đầu trùng ngày để giảm tải (logic giao nhau sẽ check tiếp)
        start_date: { $ne: null }
    }).lean();

    return docs.some(b => {
        if (excludeBookingId && String(b._id) === String(excludeBookingId)) return false;
        return overlap(b.start_date, b.end_date, startDate, endDate);
    });
}

/**
 * HDV đã từng NHẬN (accepted/awaiting_payment/paid/completed) CHÍNH tour này
 * ở CÙNG ngày (start_date/end_date) hay chưa?
 * Nếu có → các booking mới cùng tour + cùng ngày sẽ tự động bỏ qua bước duyệt.
 */
export async function hasGuideLockedThisTourDate(guideId, tourId, startDate, endDate) {
    const docs = await Booking.find({
        intended_guide_id: guideId,
        tour_id: tourId,
        status: { $in: ACTIVE_STATUSES },
    }).lean();

    return docs.some(b => overlap(b.start_date, b.end_date, startDate, endDate));
}
