// server/helpers/bookings.helper.js
import Booking from "../models/Booking.js";

/**
 * Danh sách trạng thái được coi là "giữ chỗ" / "đã nhận"
 * (booking ở các trạng thái này sẽ chiếm slot và làm HDV bận, trừ khi là cùng tour + cùng ngày)
 */
export const ACTIVE_STATUSES = ["accepted", "awaiting_payment", "paid", "completed"];

/** Tính tổng slot đã chiếm của 1 tour trong 1 ngày cụ thể */
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
 * HDV đã "bận" trong khoảng ngày này bởi một booking khác?
 *
 * Logic mới:
 * - Vẫn coi HDV bận nếu đã có booking trùng khoảng thời gian ở tour khác.
 * - KHÔNG coi là bận nếu:
 *      + Booking đang xét cùng tour (tourIdForSame)
 *      + Và cùng khoảng ngày (overlap) => cho phép nhiều booking của cùng tour + ngày đó (miễn còn slot).
 *
 * @param {string|ObjectId} guideId
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {string|ObjectId|null} excludeBookingId  (bỏ qua booking chính nó)
 * @param {string|ObjectId|null} tourIdForSame     (nếu truyền, bỏ qua busy các booking cùng tour + overlap ngày)
 * @returns {Promise<boolean>} true nếu HDV bận bởi tour khác hoặc khác ngày
 */
export async function isGuideBusy(guideId, startDate, endDate, excludeBookingId = null, tourIdForSame = null) {
    const docs = await Booking.find({
        intended_guide_id: guideId,
        status: { $in: ACTIVE_STATUSES },
        start_date: { $ne: null }
    }).lean();

    return docs.some(b => {
        if (excludeBookingId && String(b._id) === String(excludeBookingId)) return false;

        const sameTour = tourIdForSame && String(b.tour_id) === String(tourIdForSame);
        const isOverlap = overlap(b.start_date, b.end_date, startDate, endDate);

        // Nếu là cùng tour & overlap → cho phép (không tính busy)
        if (sameTour && isOverlap) return false;

        // Các trường hợp còn lại: overlap với tour khác → busy
        return isOverlap;
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