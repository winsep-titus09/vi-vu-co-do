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
    // Cho phép ISO 8601 đầy đủ
    const t = Date.parse(input);
    if (!Number.isNaN(t)) return new Date(t);
    return null; // không parse được
}

// <11 tuổi miễn phí, không chiếm slot
function computePrice({ basePrice, participants }) {
    let total = 0;
    const normalized = participants.map(p => {
        const isFree = (typeof p.age_provided === "number") ? (p.age_provided < 11) : false;
        const price = isFree ? 0 : Number(basePrice);
        if (!isFree) total += price;
        return {
            full_name: p.full_name || null,
            age_provided: typeof p.age_provided === "number" ? p.age_provided : null,
            is_free: isFree,
            count_slot: !isFree,
            price_applied: price,
            seat_index: p.seat_index ?? null,
            is_primary_contact: !!p.is_primary_contact,
        };
    });
    return { total, normalized };
}

// Helper tại chỗ: cộng ngày
function addDays(d, days) {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
}

// Helper đọc phút từ ENV (fallback nếu không có)
function minutesFromEnv(name, fallback) {
    const v = Number(process.env[name]);
    return Number.isFinite(v) && v > 0 ? v : fallback;
}

/**
 * Hỗ trợ nhập THUẬN TIỆN từ FE:
 * - Nếu FE gửi participants[] (hiện hành) -> dùng như cũ
 * - Nếu FE gửi adults (số người lớn) và children (số trẻ em <11) -> backend sinh participants tương ứng
 *   + adults: mỗi phần tử age_provided đặt 30 (non-free) và count_slot=true
 *   + children: mỗi phần tử age_provided đặt 5 (miễn phí theo chính sách hiện tại) và count_slot=false
 * Lưu ý: nếu bạn muốn children có phí, FE nên gửi ages hoặc participants chi tiết.
 */
export const createBooking = async (req, res) => {
    try {
        const userId = req.user?._id;
        const {
            tour_id,
            start_date,
            end_date,
            participants = null, // có thể null, nếu FE dùng counts
            guide_id,
            // optional short form:
            adults: adultsCountFromBody,
            children: childrenCountFromBody,
            children_ages, // optional array nếu FE có tuổi cụ thể
            contact = {}
        } = req.body;

        const start = toDateOrNull(start_date);
        const end = toDateOrNull(end_date);

        if (start_date && !start) {
            return res.status(400).json({
                message: "start_date không hợp lệ. Dùng 'YYYY-MM-DD' hoặc ISO 8601.",
                received: start_date
            });
        }
        if (end_date && !end) {
            return res.status(400).json({
                message: "end_date không hợp lệ. Dùng 'YYYY-MM-DD' hoặc ISO 8601.",
                received: end_date
            });
        }

        // Không cho chọn ngày quá khứ (so sánh theo 0h hôm nay)
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (start && start < todayStart) {
            return res.status(400).json({ message: "start_date phải ở tương lai (không được chọn ngày quá khứ)." });
        }

        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        if (!tour_id) return res.status(400).json({ message: "Thiếu tour_id" });

        const tour = await Tour.findById(tour_id).lean();
        if (!tour) return res.status(404).json({ message: "Tour không tồn tại" });

        // --- Build participants array: use provided participants OR the simplified counts ---
        let participantsInput = null;

        if (Array.isArray(participants) && participants.length) {
            participantsInput = participants;
        } else {
            // If FE uses counts: prefer explicit adults/children. Coerce to numbers.
            const adults = Number(adultsCountFromBody || 0);
            const children = Number(childrenCountFromBody || 0);

            // If neither participants nor counts provided -> error
            if (adults <= 0 && children <= 0) {
                return res.status(400).json({ message: "Thiếu participants hoặc adults/children counts." });
            }

            participantsInput = [];

            // create adults entries (age 30 default)
            for (let i = 0; i < adults; i++) {
                participantsInput.push({
                    full_name: null,
                    age_provided: 30,
                    is_primary_contact: i === 0, // first adult can be primary contact
                    seat_index: null
                });
            }

            // create children entries.
            // If client supplied children_ages array, map them; else use default age 5 (treated as <11 free).
            if (Array.isArray(children_ages) && children_ages.length) {
                // only take up to children count or length provided
                for (let i = 0; i < Math.min(children, children_ages.length); i++) {
                    const age = Number(children_ages[i]);
                    participantsInput.push({
                        full_name: null,
                        age_provided: Number.isFinite(age) ? age : 5,
                        is_primary_contact: false,
                        seat_index: null
                    });
                }
                // if children count > ages length, create default age entries for remainder
                for (let i = children_ages.length; i < children; i++) {
                    participantsInput.push({
                        full_name: null,
                        age_provided: 5,
                        is_primary_contact: false,
                        seat_index: null
                    });
                }
            } else {
                for (let i = 0; i < children; i++) {
                    participantsInput.push({
                        full_name: null,
                        age_provided: 5,
                        is_primary_contact: false,
                        seat_index: null
                    });
                }
            }
        }

        // --- price calculation using existing computePrice helper ---
        const basePrice = Number(tour.price || 0);
        const { total, normalized } = computePrice({ basePrice, participants: participantsInput });

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

        // Chọn HDV ưu tiên
        const intendedGuide =
            guide_id ||
            (tour.guide_id ? String(tour.guide_id) : (tour.guides?.[0]?.guideId ? String(tour.guides[0].guideId) : null));

        // Tính end_date nếu client KHÔNG gửi: start_date + (duration - 1) ngày
        const durationDays = Math.max(Number(tour?.duration || 1), 1);
        const computedEnd = end ?? (start ? addDays(start, durationDays - 1) : null);

        // Thời hạn (phút) từ ENV
        const approvalMins = minutesFromEnv("BOOKING_GUIDE_APPROVAL_TIMEOUT_MINUTES", 120);
        const paymentMins = minutesFromEnv("BOOKING_PAYMENT_TIMEOUT_MINUTES", 60);

        // === AUTO-APPROVE: nếu HDV này đã “nhận” CHÍNH tour này ở CÙNG ngày
        let status = "waiting_guide";
        let guide_decision = { status: "pending" };
        let guide_approval_due_at = null;
        let payment_due_at = null;

        if (intendedGuide) {
            const busy = await isGuideBusy(intendedGuide, start, computedEnd, null, tour._id);
            if (busy) {
                return res.status(409).json({
                    message: "HDV đã bận thời gian này với tour khác. Vui lòng chọn ngày khác hoặc HDV khác.",
                });
            }

            const locked = await hasGuideLockedThisTourDate(intendedGuide, tour._id, start, computedEnd);
            if (locked) {
                status = "awaiting_payment";
                guide_decision = {
                    status: "accepted",
                    decided_at: new Date(),
                    decided_by: intendedGuide,
                };
                payment_due_at = new Date(Date.now() + paymentMins * 60 * 1000);
            }
        }

        // Nếu vẫn chờ HDV duyệt → đặt hạn duyệt
        if (status === "waiting_guide") {
            guide_approval_due_at = new Date(Date.now() + approvalMins * 60 * 1000);
        }

        const booking = await Booking.create({
            customer_id: userId,
            tour_id,
            intended_guide_id: intendedGuide || null,
            start_date: start ?? null,
            end_date: computedEnd ?? null,
            contact,
            total_price: total,
            participants: normalized,
            status,
            guide_decision,
            guide_approval_due_at,
            payment_due_at,
        });

        // Chuẩn bị meta chung (đảm bảo có bookingCode/bookingUrl/guideBookingUrl)
        const bookingCode = String(booking._id);
        const bookingUrl = `${process.env.APP_BASE_URL}/booking/${booking._id}`;
        const guideBookingUrl = `${process.env.APP_BASE_URL}/guide/bookings/${booking._id}`;
        const tourName = tour.name || `#${booking._id}`;

        // Thông báo
        if (status === "awaiting_payment") {
            // Đã auto-approve → báo KH thanh toán
            await notifyUser({
                userId,
                type: "booking:approved",
                content: `Yêu cầu đặt tour ${tourName} đã được hệ thống xác nhận. Vui lòng thanh toán.`,
                url: `/booking/${booking._id}`,
                meta: {
                    bookingId: booking._id,
                    bookingCode,
                    tourId: booking._id ? booking._id : booking.tour_id,
                    tourName,
                    dueDate: payment_due_at ? new Date(payment_due_at).toISOString() : undefined,
                    bookingUrl,
                },
            }).catch(() => { });
        } else {
            // Còn chờ HDV duyệt
            if (intendedGuide) {
                await notifyUser({
                    userId: intendedGuide,
                    type: "booking:request",
                    content: `Có yêu cầu đặt tour ${tourName} cần bạn xác nhận.`,
                    url: `/guide/bookings/${booking._id}`,
                    meta: {
                        bookingId: booking._id,
                        bookingCode,
                        tourId: booking._id ? booking._id : booking.tour_id,
                        tourName,
                        guideBookingUrl,
                    },
                }).catch(() => { });
            }
            await notifyUser({
                userId,
                type: "booking:created",
                content: `Đã gửi yêu cầu đặt tour ${tourName}. Vui lòng chờ HDV duyệt.`,
                url: `/booking/${booking._id}`,
                meta: {
                    bookingId: booking._id,
                    bookingCode,
                    tourId: booking._id ? booking._id : booking.tour_id,
                    tourName,
                    bookingUrl,
                },
            }).catch(() => { });
        }

        res.status(201).json({ booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi tạo booking", error: e.message });
    }
};

export const guideApproveBooking = async (req, res) => {
    try {
        const user = req.user;
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

        const tourDoc = await Tour.findById(booking.tour_id).lean();
        if (!tourDoc) return res.status(404).json({ message: "Tour không tồn tại" });
        const tourName = tourDoc?.name || `#${booking._id}`;

        const requested = (booking.participants || []).filter(p => p.count_slot).length;
        const taken = await getTakenSlots(booking.tour_id, booking.start_date);
        const remaining = Math.max((Number(tourDoc.max_guests) || 0) - taken, 0);

        if (requested > remaining) {
            return res.status(409).json({
                message: `Không đủ chỗ để duyệt. Còn ${remaining} slot, cần ${requested}.`,
                meta: { remaining, requested }
            });
        }

        const busy = await isGuideBusy(
            booking.intended_guide_id || user._id,
            booking.start_date,
            booking.end_date,
            booking._id,
            booking.tour_id
        );
        if (busy) {
            return res.status(409).json({
                message: "Bạn đã nhận một tour khác trùng thời gian. Không thể duyệt booking này.",
            });
        }

        const paymentMins = minutesFromEnv("BOOKING_PAYMENT_TIMEOUT_MINUTES", 60);
        booking.status = "awaiting_payment";
        booking.guide_decision = {
            status: "accepted",
            decided_at: new Date(),
            decided_by: user._id,
        };
        booking.payment_due_at = new Date(Date.now() + paymentMins * 60 * 1000);
        await booking.save();

        const bookingCode = String(booking._id);
        const bookingUrl = `${process.env.APP_BASE_URL}/booking/${booking._id}`;

        await notifyUser({
            userId: booking.customer_id,
            type: "booking:approved",
            content: `Yêu cầu đặt tour ${tourName} đã được HDV duyệt. Vui lòng thanh toán.`,
            url: `/booking/${booking._id}`,
            meta: {
                bookingId: booking._id,
                bookingCode,
                tourId: booking.tour_id,
                tourName,
                dueDate: booking.payment_due_at ? new Date(booking.payment_due_at).toISOString() : undefined,
                bookingUrl,
            },
        }).catch(() => { });

        res.json({ booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi duyệt booking", error: e.message });
    }
};

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

        const tourDoc = await Tour.findById(booking.tour_id).lean();
        const tourName = tourDoc?.name || `#${booking._id}`;

        booking.status = "rejected";
        booking.guide_decision = {
            status: "rejected",
            decided_at: new Date(),
            decided_by: user._id,
            note: note || undefined,
        };
        await booking.save();

        // Gửi notify kèm lý do trong meta.reason để template email có thể thay thế {{ reason }}
        await notifyUser({
            userId: booking.customer_id,
            type: "booking:rejected",
            content: `HDV đã từ chối yêu cầu đặt tour ${tourName}${note ? `: ${note}` : ""}`,
            url: `/booking/${booking._id}`,
            meta: {
                bookingId: booking._id,
                bookingCode: String(booking._id),
                tourId: booking.tour_id,
                tourName,
                reason: note || "",
                bookingUrl: `${process.env.APP_BASE_URL}/booking/${booking._id}`
            },
        }).catch(() => { });

        res.json({ booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi từ chối booking", error: e.message });
    }
};

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