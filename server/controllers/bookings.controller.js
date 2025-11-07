// server/controllers/bookings.controller.js
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import { notifyAdmins, notifyUser } from "../services/notify.js";
import { getTakenSlots, isGuideBusy, hasGuideLockedThisTourDate } from "../helpers/bookings.helper.js";

function toDateOrNull(input) {
    if (!input) return null;
    // Ưu tiên YYYY-MM-DD (theo timezone Asia/Bangkok +07:00)
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        return new Date(`${input}T00:00:00+07:00`);
    }
    // Cho phép ISO 8601 đầy đủ: 2025-12-20T09:30:00+07:00
    const t = Date.parse(input);
    if (!Number.isNaN(t)) return new Date(t);
    return null; // không parse được
}

// <11 tuổi miễn phí, không chiếm slot
function computePrice({ basePrice, participants }) {
    let total = 0;
    const normalized = participants.map(p => {
        const isFree = p.age_provided < 11;
        const price = isFree ? 0 : Number(basePrice);
        if (!isFree) total += price;
        return {
            full_name: p.full_name,
            age_provided: p.age_provided,
            is_free: isFree,
            count_slot: !isFree,
            price_applied: price,
            seat_index: null,
            is_primary_contact: !!p.is_primary_contact,
        };
    });
    return { total, normalized };
}

// 1) USER tạo booking => CHỜ HDV DUYỆT (hoặc AUTO-APPROVE nếu HDV đã khóa tour+ngày)
export const createBooking = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { tour_id, start_date, end_date, participants = [], contact = {}, guide_id } = req.body;

        const start = toDateOrNull(start_date);
        const end = toDateOrNull(end_date);

        if (start_date && !start) {
            return res.status(400).json({
                message: "start_date không hợp lệ. Dùng 'YYYY-MM-DD' (VD: 2025-12-20) hoặc ISO 8601 (VD: 2025-12-20T00:00:00+07:00).",
                received: start_date
            });
        }
        if (end_date && !end) {
            return res.status(400).json({
                message: "end_date không hợp lệ. Dùng 'YYYY-MM-DD' hoặc ISO 8601.",
                received: end_date
            });
        }

        // Không cho chọn ngày quá khứ (so sánh theo 07:00, 0h hôm nay)
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (start && start < todayStart) {
            return res.status(400).json({ message: "start_date phải ở tương lai (không được chọn ngày quá khứ)." });
        }

        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        if (!tour_id || !participants.length) {
            return res.status(400).json({ message: "Thiếu tour_id hoặc participants" });
        }

        const tour = await Tour.findById(tour_id).lean();
        if (!tour) return res.status(404).json({ message: "Tour không tồn tại" });

        const basePrice = Number(tour.price || 0);
        const { total, normalized } = computePrice({ basePrice, participants });

        // 🔒 SLOT CHECK (tránh overbook) — kiểm tra TRƯỚC khi tạo
        const requested = normalized.filter(p => p.count_slot).length;
        const taken = await getTakenSlots(tour._id, start);
        const remaining = Math.max((Number(tour.max_guests) || 0) - taken, 0);

        if (requested > remaining) {
            return res.status(409).json({
                message: `Không đủ chỗ. Còn ${remaining} slot, nhưng yêu cầu ${requested}.`,
                meta: { remaining, requested }
            });
        }

        const intendedGuide =
            guide_id ||
            (tour.guide_id ? String(tour.guide_id) : (tour.guides?.[0]?.guideId ? String(tour.guides[0].guideId) : null));

        // === AUTO-APPROVE: nếu HDV này đã “nhận” CHÍNH tour này ở CÙNG ngày (accepted/awaiting_payment/paid/completed)
        let status = "waiting_guide";
        let guide_decision = { status: "pending" };

        if (intendedGuide) {
            const busy = await isGuideBusy(intendedGuide, start, end);
            if (busy) {
                return res.status(409).json({
                    message: "HDV đã bận thời gian này. Vui lòng chọn ngày khác hoặc HDV khác.",
                });
            }
        }

        const booking = await Booking.create({
            customer_id: userId,
            tour_id,
            intended_guide_id: intendedGuide || null,
            start_date: start ?? null,     // ✅ dùng bản đã parse
            end_date: end ?? null,         // ✅ dùng bản đã parse
            contact,
            total_price: total,
            participants: normalized,
            status,
            guide_decision,
        });

        // Thông báo
        if (status === "awaiting_payment") {
            // Đã auto-approve → báo KH thanh toán, KHÔNG cần ping HDV nữa
            await notifyUser(userId, {
                type: "booking:approved",
                content: `Yêu cầu đặt tour ${tour.name || `#${booking._id}`} đã được hệ thống xác nhận. Vui lòng thanh toán.`,
                url: `/booking/${booking._id}`,
                meta: { bookingId: booking._id, tourId: tour._id },
            }).catch(() => { });
        } else {
            // Còn chờ HDV duyệt
            if (intendedGuide) {
                await notifyUser({
                    userId: intendedGuide,
                    type: "booking:request",
                    content: `Có yêu cầu đặt tour ${tour.name || `#${booking._id}`} cần bạn xác nhận.`,
                    url: `/guide/bookings/${booking._id}`,
                    meta: { bookingId: booking._id, tourId: tour._id },
                }).catch(() => { });
            }
            await notifyUser(userId, {
                type: "booking:created",
                content: `Đã gửi yêu cầu đặt tour ${tour.name || `#${booking._id}`}. Vui lòng chờ HDV duyệt.`,
                url: `/booking/${booking._id}`,
                meta: { bookingId: booking._id },
            }).catch(() => { });
        }

        res.status(201).json({ booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi tạo booking", error: e.message });
    }
};

// 2) HDV đồng ý => CHỜ THANH TOÁN (không notify admin ở đây)
export const guideApproveBooking = async (req, res) => {
    try {
        const user = req.user; // {_id, role, ...}
        const { id } = req.params;

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: "Booking không tồn tại" });

        const isGuideOwner =
            booking.intended_guide_id && String(booking.intended_guide_id) === String(user._id);
        const isAdmin = user?.role === "admin";
        if (!isGuideOwner && !isAdmin) {
            return res.status(403).json({ message: "Bạn không có quyền duyệt booking này" });
        }
        if (booking.status !== "waiting_guide" || booking.guide_decision?.status !== "pending") {
            return res.status(400).json({ message: "Booking không ở trạng thái chờ HDV" });
        }

        // 🔧 LOAD TOUR để có tour.name dùng trong content thông báo
        const tourDoc = await Tour.findById(booking.tour_id).lean();
        if (!tourDoc) return res.status(404).json({ message: "Tour không tồn tại" });
        const tourName = tourDoc?.name || `#${booking._id}`;

        // 🔒 SLOT CHECK lần 2 (tránh race condition)
        const requested = (booking.participants || []).filter(p => p.count_slot).length;
        const taken = await getTakenSlots(booking.tour_id, booking.start_date);
        const remaining = Math.max((Number(tourDoc.max_guests) || 0) - taken, 0);

        if (requested > remaining) {
            return res.status(409).json({
                message: `Không đủ chỗ để duyệt. Còn ${remaining} slot, cần ${requested}.`,
                meta: { remaining, requested }
            });
        }

        // ❗ BUSY CHECK: nếu HDV đã bận bởi 1 booking khác trùng ngày/khoảng ngày → CHẶN duyệt
        const busy = await isGuideBusy(
            booking.intended_guide_id || user._id,
            booking.start_date,
            booking.end_date,
            booking._id
        );
        if (busy) {
            return res.status(409).json({
                message: "Bạn đã nhận một tour khác trùng thời gian. Không thể duyệt booking này.",
            });
        }

        // Cập nhật trạng thái
        booking.status = "awaiting_payment";
        booking.guide_decision = {
            status: "accepted",
            decided_at: new Date(),
            decided_by: user._id,
        };
        await booking.save();

        // Notify USER: mời thanh toán (dùng tourName thay vì id)
        await notifyUser({
            userId: booking.customer_id,
            type: "booking:approved",
            content: `Yêu cầu đặt tour ${tourName} đã được HDV duyệt. Vui lòng thanh toán.`,
            url: `/booking/${booking._id}`,
            meta: { bookingId: booking._id, tourId: booking.tour_id, tourName },
        }).catch(() => { });

        // LƯU Ý: không notify admin ở bước này (chỉ notify khi IPN paid)

        res.json({ booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi duyệt booking", error: e.message });
    }
};

// 3) HDV từ chối
export const guideRejectBooking = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { note } = req.body || {};

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: "Booking không tồn tại" });

        const isGuideOwner =
            booking.intended_guide_id && String(booking.intended_guide_id) === String(user._id);
        const isAdmin = user?.role === "admin";
        if (!isGuideOwner && !isAdmin) {
            return res.status(403).json({ message: "Bạn không có quyền từ chối booking này" });
        }
        if (booking.status !== "waiting_guide" || booking.guide_decision?.status !== "pending") {
            return res.status(400).json({ message: "Booking không ở trạng thái chờ HDV" });
        }

        // 🔧 TẢI TOUR để có tên tour cho thông báo
        const tourDoc = await Tour.findById(booking.tour_id).lean();
        const tourName = tourDoc?.name || `#${booking._id}`;

        // Cập nhật trạng thái booking
        booking.status = "rejected";
        booking.guide_decision = {
            status: "rejected",
            decided_at: new Date(),
            decided_by: user._id,
            note: note || null,
        };
        await booking.save();

        // Thông báo cho USER (đúng chữ ký notifyUser nhận object)
        await notifyUser({
            userId: booking.customer_id,
            type: "booking:rejected",
            content: `HDV đã từ chối yêu cầu đặt tour ${tourName}${note ? `: ${note}` : ""}`,
            url: `/booking/${booking._id}`,
            meta: { bookingId: booking._id, tourId: booking.tour_id, tourName },
        }).catch(() => { });

        res.json({ booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi từ chối booking", error: e.message });
    }
};

// 4) USER xem danh sách (hỗ trợ ?status=)
export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { status } = req.query;
        const cond = { customer_id: userId };
        if (status) cond.status = status;

        const list = await Booking.find(cond).sort({ createdAt: -1 });
        res.json({ bookings: list });
    } catch {
        res.status(500).json({ message: "Lỗi lấy danh sách booking" });
    }
};

export const getBooking = async (req, res) => {
    const { id } = req.params;
    const doc = await Booking.findById(id);
    if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
    res.json({ booking: doc });
};
