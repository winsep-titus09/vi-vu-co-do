// server/controllers/bookings.controller.js
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import { notifyAdmins, notifyUser } from "../services/notify.js";
import { getTakenSlots, isGuideBusy, hasGuideLockedThisTourDate } from "../helpers/bookings.helper.js";

const ObjectId = mongoose.Types.ObjectId;

/**
 * Helpers
 */

// Parse date or return null. Accepts YYYY-MM-DD (interpreted as +07:00) or full ISO.
function toDateOrNull(input) {
    if (!input) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        return new Date(`${input}T00:00:00+07:00`);
    }
    const t = Date.parse(input);
    if (!Number.isNaN(t)) return new Date(t);
    return null;
}

// Price computation: children <11 free (no slot)
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

// add days helper
function addDays(d, days) {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
}

// read minutes from env (fallback)
function minutesFromEnv(name, fallback) {
    const v = Number(process.env[name]);
    return Number.isFinite(v) && v > 0 ? v : fallback;
}

function isAdmin(user) { return user?.role_id?.name === "admin" || user?.role === "admin"; }
function isOwner(user, booking) { return String(user?._id) === String(booking.customer_id); }

/**
 * Create booking
 */
export const createBooking = async (req, res) => {
    try {
        const userId = req.user?._id;
        const {
            tour_id,
            start_date,
            end_date,
            participants = null,
            guide_id,
            adults: adultsCountFromBody,
            children: childrenCountFromBody,
            children_ages,
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

        // no past start
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (start && start < todayStart) {
            return res.status(400).json({ message: "start_date phải ở tương lai (không được chọn ngày quá khứ)." });
        }

        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        if (!tour_id) return res.status(400).json({ message: "Thiếu tour_id" });

        const tour = await Tour.findById(tour_id).lean();
        if (!tour) return res.status(404).json({ message: "Tour không tồn tại" });

        // Build participants array (support simplified adults/children)
        let participantsInput = null;

        if (Array.isArray(participants) && participants.length) {
            participantsInput = participants;
        } else {
            const adults = Number(adultsCountFromBody || 0);
            const children = Number(childrenCountFromBody || 0);

            if (adults <= 0 && children <= 0) {
                return res.status(400).json({ message: "Thiếu participants hoặc adults/children counts." });
            }

            participantsInput = [];

            for (let i = 0; i < adults; i++) {
                participantsInput.push({
                    full_name: null,
                    age_provided: 30,
                    is_primary_contact: i === 0,
                    seat_index: null
                });
            }

            if (Array.isArray(children_ages) && children_ages.length) {
                for (let i = 0; i < Math.min(children, children_ages.length); i++) {
                    const age = Number(children_ages[i]);
                    participantsInput.push({
                        full_name: null,
                        age_provided: Number.isFinite(age) ? age : 5,
                        is_primary_contact: false,
                        seat_index: null
                    });
                }
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

        const basePrice = Number(tour.price || 0);
        const { total, normalized } = computePrice({ basePrice, participants: participantsInput });

        const requested = normalized.filter(p => p.count_slot).length;
        const taken = await getTakenSlots(tour._id, start);
        const remaining = Math.max((Number(tour.max_guests) || 0) - taken, 0);

        if (requested > remaining) {
            return res.status(409).json({
                message: `Không đủ chỗ. Còn ${remaining} slot, nhưng yêu cầu ${requested}.`,
                meta: { remaining, requested }
            });
        }

        // choose intended guide
        const intendedGuide =
            guide_id ||
            (tour.guide_id ? String(tour.guide_id) : (tour.guides?.[0]?.guideId ? String(tour.guides[0].guideId) : null));

        const durationDays = Math.max(Number(tour?.duration || 1), 1);
        const computedEnd = end ?? (start ? addDays(start, durationDays - 1) : null);

        const approvalMins = minutesFromEnv("BOOKING_GUIDE_APPROVAL_TIMEOUT_MINUTES", 120);
        const paymentMins = minutesFromEnv("BOOKING_PAYMENT_TIMEOUT_MINUTES", 60);

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

        const bookingCode = String(booking._id);
        const bookingUrl = `${process.env.APP_BASE_URL}/booking/${booking._id}`;
        const guideBookingUrl = `${process.env.APP_BASE_URL}/guide/bookings/${booking._id}`;
        const tourName = tour.name || `#${booking._id}`;

        if (status === "awaiting_payment") {
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

/**
 * Guide approves booking -> awaiting_payment
 */
export const guideApproveBooking = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: "Booking không tồn tại" });

        const isGuideOwner =
            booking.intended_guide_id && String(booking.intended_guide_id) === String(user._id);
        const isUserAdmin = user?.role === "admin" || user?.role_id?.name === "admin";
        if (!isGuideOwner && !isUserAdmin) {
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

/**
 * Guide rejects booking
 */
export const guideRejectBooking = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { note } = req.body || {};

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: "Booking không tồn tại" });

        const isGuideOwner =
            booking.intended_guide_id && String(booking.intended_guide_id) === String(user._id);
        const isUserAdmin = user?.role === "admin" || user?.role_id?.name === "admin";
        if (!isGuideOwner && !isUserAdmin) {
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

/**
 * Get bookings for current user
 */
export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { status } = req.query;
        const cond = { customer_id: userId };
        if (status) cond.status = status;

        const list = await Booking.find(cond).sort({ createdAt: -1 });
        res.json({ bookings: list });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi lấy danh sách booking" });
    }
};

/**
 * Get single booking
 */
export const getBooking = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(400).json({ message: "booking id không hợp lệ" });
        const doc = await Booking.findById(id);
        if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
        res.json({ booking: doc });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi lấy booking", error: e.message });
    }
};

/* ============================
   Cancel & Refund Endpoints
   ============================ */

/**
 * Owner or admin cancel booking
 * - If booking.status === waiting_guide || awaiting_payment -> cancel immediately
 * - If booking.status === paid:
 *    - If owner: create refund transaction (pending), mark cancel_requested and notify admins
 *    - If admin: use adminCancelBooking endpoint (can refund immediately)
 */
export const cancelBooking = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { reason } = req.body || {};

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: "Booking không tồn tại" });

        if (!isOwner(user, booking) && !isAdmin(user)) {
            return res.status(403).json({ message: "Bạn không có quyền huỷ booking này" });
        }

        // If waiting_guide OR awaiting_payment -> cancel now
        if (booking.status === "waiting_guide" || booking.status === "awaiting_payment") {
            booking.status = "canceled";
            booking.canceled_at = new Date();
            booking.canceled_by = user._id;
            booking.cancel_reason = reason || null;
            booking.payment_due_at = null;
            booking.guide_approval_due_at = null;
            await booking.save();

            await notifyUser({
                userId: booking.customer_id,
                type: "booking:canceled",
                content: `Booking #${booking._id} đã bị huỷ.`,
                url: `/booking/${booking._id}`,
                meta: { bookingId: booking._id, reason: booking.cancel_reason || "" }
            }).catch(() => { });

            if (booking.intended_guide_id) {
                await notifyUser({
                    userId: booking.intended_guide_id,
                    type: "booking:canceled:guide",
                    content: `Booking #${booking._id} cho tour đã bị huỷ.`,
                    url: `/guide/bookings/${booking._id}`,
                    meta: { bookingId: booking._id }
                }).catch(() => { });
            }

            return res.json({ booking });
        }

        // If paid -> owner requests refund (create pending refund txn)
        if (booking.status === "paid") {
            // If already has refund txn, return it
            if (booking.refund_transaction_id) {
                const existing = await Transaction.findById(booking.refund_transaction_id);
                if (existing) {
                    return res.status(200).json({ message: "Refund request đã tồn tại", transaction: existing });
                }
            }

            const amount = booking.total_price ? Number(booking.total_price.toString()) : 0;
            const txn = await Transaction.create({
                bookingId: booking._id,
                userId: booking.customer_id,
                amount,
                net_amount: amount,
                transaction_type: "refund",
                status: "pending",
                payment_gateway: booking.payment_session?.gateway || "manual",
                note: `Customer requested cancel: ${reason || ""}`,
            });

            booking.refund_transaction_id = txn._id;
            booking.cancel_requested = true;
            booking.cancel_requested_at = new Date();
            booking.cancel_requested_by = user._id;
            booking.cancel_requested_note = reason || null;
            await booking.save();

            // prepare rich meta for emails/templates
            const customer = await User.findById(booking.customer_id).lean().catch(() => null);
            const bookingCode = String(booking._id);
            const bookingUrl = `${process.env.APP_BASE_URL}/booking/${booking._id}`;
            const adminUrl = `${process.env.APP_BASE_URL}/admin/refunds/${txn._id}`;
            const requestedAt = (booking.cancel_requested_at || new Date()).toLocaleString();

            const adminMeta = {
                bookingId: booking._id,
                bookingCode,
                amount,
                customerName: customer?.name || "",
                customerEmail: customer?.email || "",
                transactionId: txn._id,
                message: reason || "",
                requestedAt,
                bookingUrl,
                adminUrl,
                supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || ""
            };

            // Notify admins (email + internal notify)
            await notifyAdmins({
                type: "refund:requested",
                content: `Khách yêu cầu hoàn tiền cho booking #${booking._id}. Vui lòng kiểm tra và xử lý.`,
                meta: adminMeta,
            }).catch(() => { });

            // Notify customer confirm request received (include amount & requestedAt)
            const userMeta = {
                bookingId: booking._id,
                bookingCode,
                amount,
                message: reason || "",
                requestedAt,
                bookingUrl,
                transactionId: txn._id,
                supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || ""
            };
            await notifyUser({
                userId: booking.customer_id,
                type: "booking:refund_requested:confirm",
                content: `Yêu cầu hủy và hoàn tiền cho booking #${booking._id} đã được gửi tới admin.`,
                url: `/booking/${booking._id}`,
                meta: userMeta
            }).catch(() => { });

            return res.status(201).json({ message: "Refund request created", transaction: txn, booking });
        }

        return res.status(400).json({ message: `Không thể huỷ booking ở trạng thái ${booking.status}` });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi huỷ booking", error: e.message });
    }
};

/**
 * Admin cancel booking (can optionally create & confirm refund immediately)
 */
export const adminCancelBooking = async (req, res) => {
    try {
        const user = req.user;
        if (!isAdmin(user)) return res.status(403).json({ message: "Chỉ admin" });

        const { id } = req.params;
        const { reason, createAndConfirmRefund = false } = req.body || {};

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: "Booking không tồn tại" });

        // If paid and admin chooses to refund immediately
        if (booking.status === "paid" && createAndConfirmRefund) {
            const amount = booking.total_price ? Number(booking.total_price.toString()) : 0;
            const txn = await Transaction.create({
                bookingId: booking._id,
                userId: booking.customer_id,
                amount,
                net_amount: amount,
                transaction_type: "refund",
                status: "confirmed", // admin confirms immediately
                payment_gateway: booking.payment_session?.gateway || "manual",
                transaction_code: null,
                note: `Admin refund on cancel: ${reason || ""}`,
                confirmed_by: user._id,
                confirmed_at: new Date(),
            });

            booking.status = "canceled";
            booking.canceled_at = new Date();
            booking.canceled_by = user._id;
            booking.cancel_reason = reason || null;
            booking.refund_transaction_id = txn._id;
            await booking.save();

            // rich meta for user/email
            const customer = await User.findById(booking.customer_id).lean().catch(() => null);
            const bookingCode = String(booking._id);
            const bookingUrl = `${process.env.APP_BASE_URL}/booking/${booking._id}`;
            const adminUrl = `${process.env.APP_BASE_URL}/admin/refunds/${txn._id}`;

            const userMeta = {
                bookingId: booking._id,
                bookingCode,
                amount,
                transactionId: txn._id,
                transactionCode: txn.transaction_code || "",
                confirmedBy: user.name || user._id,
                confirmedAt: txn.confirmed_at ? txn.confirmed_at.toLocaleString() : new Date().toLocaleString(),
                bookingUrl,
                supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || ""
            };

            await notifyUser({
                userId: booking.customer_id,
                type: "booking:refunded",
                content: `Booking #${booking._id} đã được huỷ và hoàn tiền.`,
                url: `/booking/${booking._id}`,
                meta: userMeta
            }).catch(() => { });

            // notify admins for audit
            await notifyAdmins({
                type: "refund:confirmed",
                content: `Admin đã hoàn tiền cho booking ${booking._id}`,
                meta: {
                    bookingId: booking._id,
                    transactionId: txn._id,
                    amount,
                    confirmedBy: user.name || user._id
                }
            }).catch(() => { });

            return res.json({ booking, transaction: txn });
        }

        // Otherwise just cancel (no refund)
        booking.status = "canceled";
        booking.canceled_at = new Date();
        booking.canceled_by = user._id;
        booking.cancel_reason = reason || null;
        booking.payment_due_at = null;
        booking.guide_approval_due_at = null;
        await booking.save();

        await notifyUser({
            userId: booking.customer_id,
            type: "booking:canceled",
            content: `Booking #${booking._id} đã bị huỷ bởi admin.`,
            url: `/booking/${booking._id}`,
            meta: { bookingId: booking._id }
        }).catch(() => { });

        return res.json({ booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi admin cancel", error: e.message });
    }
};

/**
 * Admin create refund request (pending) for a paid booking
 */
export const adminCreateRefund = async (req, res) => {
    try {
        const user = req.user;
        if (!isAdmin(user)) return res.status(403).json({ message: "Chỉ admin" });

        const { id } = req.params;
        const { amount, note } = req.body || {};

        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ message: "Booking không tồn tại" });
        if (booking.status !== "paid") return res.status(400).json({ message: "Booking chưa ở trạng thái đã thanh toán" });

        const refundAmount = Number(amount ?? (booking.total_price ? booking.total_price.toString() : 0)) || 0;

        const txn = await Transaction.create({
            bookingId: booking._id,
            userId: booking.customer_id,
            amount: refundAmount,
            net_amount: refundAmount,
            transaction_type: "refund",
            status: "pending",
            payment_gateway: booking.payment_session?.gateway || "manual",
            note: note || `Refund requested by admin ${user._id}`,
        });

        booking.refund_transaction_id = txn._id;
        await booking.save();

        const customer = await User.findById(booking.customer_id).lean().catch(() => null);
        const bookingCode = String(booking._id);
        const bookingUrl = `${process.env.APP_BASE_URL}/booking/${booking._id}`;
        const adminUrl = `${process.env.APP_BASE_URL}/admin/refunds/${txn._id}`;

        const userMeta = {
            bookingId: booking._id,
            bookingCode,
            amount: refundAmount,
            message: note || "",
            bookingUrl,
            transactionId: txn._id,
            requestedAt: new Date().toLocaleString(),
            supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || ""
        };

        await notifyUser({
            userId: booking.customer_id,
            type: "booking:refund_requested",
            content: `Yêu cầu hoàn tiền cho booking #${booking._id} đã được tạo.`,
            url: `/booking/${booking._id}`,
            meta: userMeta
        }).catch(() => { });

        await notifyAdmins({
            type: "refund:pending",
            content: `Refund pending for booking ${booking._id}`,
            meta: {
                bookingId: booking._id,
                bookingCode,
                amount: refundAmount,
                transactionId: txn._id,
                customerName: customer?.name || "",
                customerEmail: customer?.email || "",
                adminUrl
            }
        }).catch(() => { });

        return res.json({ transaction: txn, booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi tạo refund", error: e.message });
    }
};

/**
 * Admin confirm refund (after manual transfer or gateway refund)
 * - Confirm txn, set booking canceled, notify user.
 */
export const adminConfirmRefund = async (req, res) => {
    try {
        const user = req.user;
        if (!isAdmin(user)) return res.status(403).json({ message: "Chỉ admin" });

        const { txnId } = req.params;
        const { transaction_code } = req.body || {};

        if (!ObjectId.isValid(txnId)) return res.status(400).json({ message: "txnId không hợp lệ" });

        const txn = await Transaction.findById(txnId);
        if (!txn) return res.status(404).json({ message: "Transaction không tồn tại" });
        if (txn.transaction_type !== "refund") return res.status(400).json({ message: "Transaction không phải refund" });
        if (txn.status === "confirmed") return res.status(400).json({ message: "Refund đã được xác nhận" });

        txn.status = "confirmed";
        txn.confirmed_by = user._id;
        txn.confirmed_at = new Date();
        if (transaction_code) txn.transaction_code = transaction_code;
        await txn.save();

        // Update booking
        const booking = await Booking.findById(txn.bookingId);
        if (booking) {
            booking.status = "canceled";
            booking.canceled_at = new Date();
            booking.canceled_by = user._id;
            booking.refund_transaction_id = txn._id;
            await booking.save();
        }

        // rich meta for user notify
        const customer = await User.findById(txn.userId).lean().catch(() => null);
        const bookingCode = booking ? String(booking._id) : (txn.bookingId ? String(txn.bookingId) : "");
        const bookingUrl = `${process.env.APP_BASE_URL}/booking/${txn.bookingId || ""}`;

        const userMeta = {
            bookingId: txn.bookingId,
            bookingCode,
            amount: txn.amount ? txn.amount.toString() : "",
            transactionId: txn._id,
            transactionCode: txn.transaction_code || transaction_code || "",
            confirmedBy: user.name || user._id,
            confirmedAt: txn.confirmed_at ? txn.confirmed_at.toLocaleString() : new Date().toLocaleString(),
            bookingUrl,
            supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || ""
        };

        await notifyUser({
            userId: txn.userId,
            type: "booking:refunded",
            content: `Hoàn tiền cho booking #${txn.bookingId} đã hoàn tất.`,
            url: `/booking/${txn.bookingId}`,
            meta: userMeta
        }).catch(() => { });

        // notify admins for audit
        await notifyAdmins({
            type: "refund:confirmed",
            content: `Refund confirmed for booking ${txn.bookingId} (txn ${txn._id}).`,
            meta: {
                bookingId: txn.bookingId,
                transactionId: txn._id,
                amount: txn.amount ? txn.amount.toString() : "",
                confirmedBy: user.name || user._id
            }
        }).catch(() => { });

        return res.json({ transaction: txn, booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi confirm refund", error: e.message });
    }
};