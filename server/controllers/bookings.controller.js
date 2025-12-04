// server/controllers/bookings.controller.js
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Payout from "../models/Payout.js";
import { notifyAdmins, notifyUser } from "../services/notify.js";
import {
    getTakenSlots,
    isGuideBusy,
    hasGuideLockedThisTourDate,
    toDateOrNull,
    addHours,
    getDurationHoursFromTour,
    isGuideMarkedBusy
} from "../helpers/bookings.helper.js";

const ObjectId = mongoose.Types.ObjectId;

/**
 * Price computation: 
 * - Adults (age >= 12): full price
 * - Children (age < 12): 50% price
 */
function computePrice({ basePrice, participants }) {
    let total = 0;
    const normalized = participants.map((p) => {
        const age = typeof p.age_provided === "number" ? p.age_provided : 30; // default adult
        const isChild = age < 12;
        const price = isChild ? Math.round(Number(basePrice) / 2) : Number(basePrice);
        total += price;
        return {
            full_name: p.full_name || null,
            age_provided: typeof p.age_provided === "number" ? p.age_provided : null,
            is_child: isChild,
            count_slot: true, // Tất cả đều chiếm slot
            price_applied: price,
            seat_index: p.seat_index ?? null,
            is_primary_contact: !!p.is_primary_contact,
        };
    });
    return { total, normalized };
}

// read minutes from env (fallback)
function minutesFromEnv(name, fallback) {
    const v = Number(process.env[name]);
    return Number.isFinite(v) && v > 0 ? v : fallback;
}
function isAdmin(user) {
    return user?.role_id?.name === "admin" || user?.role === "admin";
}
function isOwner(user, booking) {
    return String(user?._id) === String(booking.customer_id);
}

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
            contact = {},
        } = req.body;

        const start = toDateOrNull(start_date);
        const end = toDateOrNull(end_date);

        if (start_date && !start) {
            return res.status(400).json({
                message: "start_date không hợp lệ.  Dùng 'YYYY-MM-DD' hoặc ISO 8601.",
                received: start_date,
            });
        }
        if (end_date && !end) {
            return res.status(400).json({
                message: "end_date không hợp lệ. Dùng 'YYYY-MM-DD' hoặc ISO 8601.",
                received: end_date,
            });
        }

        // no past start (compare to current moment)
        const now = new Date();
        if (start && start < now) {
            return res.status(400).json({ message: "start_date phải ở tương lai (không được chọn thời điểm quá khứ)." });
        }

        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        if (!tour_id) return res.status(400).json({ message: "Thiếu tour_id" });

        const tour = await Tour.findById(tour_id).lean();
        if (!tour) return res.status(404).json({ message: "Tour không tồn tại" });

        // ========== KIỂM TRA NGÀY BLACKOUT CỦA TOUR ==========
        if (start && Array.isArray(tour.blackout_dates) && tour.blackout_dates.length > 0) {
            const startNormalized = new Date(start);
            startNormalized.setHours(0, 0, 0, 0);

            const isBlackout = tour.blackout_dates.some(bd => {
                const blackoutDate = new Date(bd);
                blackoutDate.setHours(0, 0, 0, 0);
                return blackoutDate.getTime() === startNormalized.getTime();
            });

            if (isBlackout) {
                return res.status(409).json({
                    message: "Tour không khả dụng vào ngày này (ngày blackout).",
                    code: "BLACKOUT_DATE",
                });
            }
        }

        // ========== KIỂM TRA NGÀY ĐÓNG CỬA THEO THỨ ==========
        if (start && Array.isArray(tour.closed_weekdays) && tour.closed_weekdays.length > 0) {
            const dayOfWeek = start.getDay(); // 0 = Sunday, 6 = Saturday
            if (tour.closed_weekdays.includes(dayOfWeek)) {
                const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                return res.status(409).json({
                    message: `Tour không hoạt động vào ${dayNames[dayOfWeek]}. `,
                    code: "CLOSED_WEEKDAY",
                });
            }
        }

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
                    seat_index: null,
                });
            }

            if (Array.isArray(children_ages) && children_ages.length) {
                for (let i = 0; i < Math.min(children, children_ages.length); i++) {
                    const age = Number(children_ages[i]);
                    participantsInput.push({
                        full_name: null,
                        age_provided: Number.isFinite(age) ? age : 5,
                        is_primary_contact: false,
                        seat_index: null,
                    });
                }
                for (let i = children_ages.length; i < children; i++) {
                    participantsInput.push({
                        full_name: null,
                        age_provided: 5,
                        is_primary_contact: false,
                        seat_index: null,
                    });
                }
            } else {
                for (let i = 0; i < children; i++) {
                    participantsInput.push({
                        full_name: null,
                        age_provided: 5,
                        is_primary_contact: false,
                        seat_index: null,
                    });
                }
            }
        }

        const basePrice = Number(tour.price || 0);
        const { total, normalized } = computePrice({ basePrice, participants: participantsInput });

        const requested = normalized.filter((p) => p.count_slot).length;
        const taken = await getTakenSlots(tour._id, start);
        const remaining = Math.max((Number(tour.max_guests) || 0) - taken, 0);

        if (requested > remaining) {
            return res.status(409).json({
                message: `Không đủ chỗ.  Còn ${remaining} slot, nhưng yêu cầu ${requested}. `,
                code: "INSUFFICIENT_SLOTS",
                meta: { remaining, requested },
            });
        }

        // choose intended guide
        const intendedGuide =
            guide_id ||
            (tour.guide_id ? String(tour.guide_id) : tour.guides?.[0]?.guideId ? String(tour.guides[0].guideId) : null);

        // Compute end based on duration_hours (if present) or fallback to days->hours
        const durationHours = getDurationHoursFromTour(tour);
        const computedEnd = end ?? (start ? addHours(start, durationHours) : null);

        const approvalMins = minutesFromEnv("BOOKING_GUIDE_APPROVAL_TIMEOUT_MINUTES", 120);
        const paymentMins = minutesFromEnv("BOOKING_PAYMENT_TIMEOUT_MINUTES", 60);

        let status = "waiting_guide";
        let guide_decision = { status: "pending" };
        let guide_approval_due_at = null;
        let payment_due_at = null;

        // ========== KIỂM TRA GUIDE AVAILABILITY ==========
        if (intendedGuide && start) {
            // 1. Kiểm tra guide có đánh dấu bận ngày này không (GuideBusyDate)
            const markedBusy = await isGuideMarkedBusy(intendedGuide, start);
            if (markedBusy) {
                // Thử tìm guide khác khả dụng trong tour
                const alternativeGuide = await findAlternativeGuide(tour, start, computedEnd);

                if (alternativeGuide) {
                    return res.status(409).json({
                        message: "HDV chính đã đánh dấu bận vào ngày này.  Vui lòng chọn ngày khác hoặc HDV khác.",
                        code: "GUIDE_MARKED_BUSY",
                        suggestion: {
                            alternativeGuideId: alternativeGuide._id,
                            alternativeGuideName: alternativeGuide.name,
                        },
                    });
                }

                return res.status(409).json({
                    message: "HDV đã đánh dấu bận vào ngày này. Vui lòng chọn ngày khác.",
                    code: "GUIDE_MARKED_BUSY",
                });
            }

            // 2.  Kiểm tra guide có booking trùng với tour khác không
            const busy = await isGuideBusy(intendedGuide, start, computedEnd, null, tour._id);
            if (busy) {
                // Thử tìm guide khác khả dụng trong tour
                const alternativeGuide = await findAlternativeGuide(tour, start, computedEnd);

                if (alternativeGuide) {
                    return res.status(409).json({
                        message: "HDV đã bận thời gian này với tour khác.  Vui lòng chọn thời gian khác hoặc HDV khác.",
                        code: "GUIDE_HAS_BOOKING",
                        suggestion: {
                            alternativeGuideId: alternativeGuide._id,
                            alternativeGuideName: alternativeGuide.name,
                        },
                    });
                }

                return res.status(409).json({
                    message: "HDV đã bận thời gian này với tour khác.  Vui lòng chọn thời gian khác hoặc HDV khác.",
                    code: "GUIDE_HAS_BOOKING",
                });
            }

            // 3.  Kiểm tra guide đã lock ngày này cho tour này chưa
            // Lưu ý: Không còn auto-approve, booking vẫn cần guide duyệt thủ công
            // const locked = await hasGuideLockedThisTourDate(intendedGuide, tour._id, start, computedEnd);
        }

        // ========== KIỂM TRA TẤT CẢ GUIDE CỦA TOUR ĐỀU BẬN ==========
        if (!intendedGuide && start) {
            // Nếu không chỉ định guide, kiểm tra xem có guide nào khả dụng không
            const availableGuide = await findAlternativeGuide(tour, start, computedEnd);
            if (!availableGuide) {
                return res.status(409).json({
                    message: "Tất cả HDV của tour đều bận vào ngày này. Vui lòng chọn ngày khác.",
                    code: "ALL_GUIDES_BUSY",
                });
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
            tour_price: basePrice, // store fixed tour price for guide payout
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

        // Lấy thông tin customer để truyền vào email
        const customer = await User.findById(userId).select("name email phone").lean();
        const groupSize = normalized.filter((p) => p.count_slot).length;
        const tourDate = start ? start.toLocaleDateString("vi-VN") : "";

        if (status === "awaiting_payment") {
            await notifyUser({
                userId,
                type: "booking:approved",
                content: `Yêu cầu đặt tour ${tourName} đã được hệ thống xác nhận.  Vui lòng thanh toán. `,
                url: `/booking/${booking._id}`,
                meta: {
                    bookingId: booking._id,
                    bookingCode,
                    tourId: booking.tour_id,
                    tourName,
                    tourDate,
                    amount: total.toLocaleString("vi-VN") + " VNĐ",
                    dueDate: payment_due_at ? new Date(payment_due_at).toLocaleString("vi-VN") : undefined,
                    bookingUrl,
                    paymentUrl: `${process.env.APP_BASE_URL}/booking/${booking._id}/payment`,
                },
            }).catch(() => { });
        } else {
            if (intendedGuide) {
                // Lấy thông tin guide để truyền vào email
                const guide = await User.findById(intendedGuide).select("name").lean();

                await notifyUser({
                    userId: intendedGuide,
                    type: "booking:request",
                    content: `Có yêu cầu đặt tour ${tourName} cần bạn xác nhận. `,
                    url: `/guide/bookings/${booking._id}`,
                    meta: {
                        bookingId: booking._id,
                        bookingCode,
                        tourId: booking.tour_id,
                        tourName,
                        tourDate,
                        groupSize: groupSize.toString(),
                        amount: total.toLocaleString("vi-VN") + " VNĐ",
                        // Thông tin khách hàng
                        userName: customer?.name || "",
                        userPhone: contact?.phone || customer?.phone || "",
                        userEmail: customer?.email || "",
                        // Thông tin guide
                        guideName: guide?.name || "",
                        guideBookingUrl,
                        bookingUrl: guideBookingUrl,
                    },
                }).catch(() => { });
            }
            await notifyUser({
                userId,
                type: "booking:created",
                content: `Đã gửi yêu cầu đặt tour ${tourName}. Vui lòng chờ HDV duyệt. `,
                url: `/booking/${booking._id}`,
                meta: {
                    bookingId: booking._id,
                    bookingCode,
                    tourId: booking.tour_id,
                    tourName,
                    tourDate,
                    groupSize: groupSize.toString(),
                    amount: total.toLocaleString("vi-VN") + " VNĐ",
                    bookingUrl,
                },
            }).catch(() => { });
        }

        res.status(201).json({ booking });
    } catch (e) {
        console.error("createBooking error:", e);
        res.status(500).json({ message: "Lỗi tạo booking", error: e.message });
    }
};

/**
 * Helper: Tìm guide khả dụng thay thế trong danh sách guides của tour
 * @param {Object} tour - Tour document
 * @param {Date} startDate - Ngày bắt đầu
 * @param {Date} endDate - Ngày kết thúc
 * @returns {Promise<Object|null>} - User object hoặc null
 */
async function findAlternativeGuide(tour, startDate, endDate) {
    if (!tour || !startDate) return null;

    // Lấy tất cả guide IDs của tour
    const guideIds = [];
    if (tour.guide_id) guideIds.push(String(tour.guide_id));
    if (Array.isArray(tour.guides)) {
        tour.guides.forEach((g) => {
            if (g.guideId) guideIds.push(String(g.guideId));
        });
    }

    // Loại bỏ duplicate
    const uniqueGuideIds = [...new Set(guideIds)];

    if (uniqueGuideIds.length === 0) return null;

    for (const gId of uniqueGuideIds) {
        // Kiểm tra đánh dấu bận
        const markedBusy = await isGuideMarkedBusy(gId, startDate);
        if (markedBusy) continue;

        // Kiểm tra booking trùng
        const busy = await isGuideBusy(gId, startDate, endDate, null, tour._id);
        if (busy) continue;

        // Guide này khả dụng, lấy thông tin
        const guideUser = await User.findById(gId).select("name avatar_url").lean();
        if (guideUser) {
            return guideUser;
        }
    }

    return null;
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

        const isGuideOwner = booking.intended_guide_id && String(booking.intended_guide_id) === String(user._id);
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

        const requested = (booking.participants || []).filter((p) => p.count_slot).length;
        const taken = await getTakenSlots(booking.tour_id, booking.start_date);
        const remaining = Math.max((Number(tourDoc.max_guests) || 0) - taken, 0);

        if (requested > remaining) {
            return res.status(409).json({
                message: `Không đủ chỗ để duyệt. Còn ${remaining} slot, cần ${requested}.`,
                meta: { remaining, requested },
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
        const totalPrice = booking.total_price ? Number(booking.total_price.toString()) : 0;
        const tourDate = booking.start_date ? new Date(booking.start_date).toLocaleDateString("vi-VN") : "";

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
                tourDate,
                amount: totalPrice.toLocaleString("vi-VN") + " VNĐ",
                dueDate: booking.payment_due_at ? new Date(booking.payment_due_at).toLocaleString("vi-VN") : undefined,
                bookingUrl,
                paymentUrl: `${process.env.APP_BASE_URL}/booking/${booking._id}/payment`,
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

        const isGuideOwner = booking.intended_guide_id && String(booking.intended_guide_id) === String(user._id);
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

        const bookingUrl = `${process.env.APP_BASE_URL}/booking/${booking._id}`;

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
                reason: note || "Không có lý do cụ thể",
                bookingUrl,
            },
        }).catch(() => { });

        res.json({ booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi từ chối booking", error: e.message });
    }
};

/**
 * COMPLETE booking: Tính tiền HDV theo total_price (theo đầu người và số lượt booking)
 * Công thức:
 *   - guideEarning = total_price - (total_price * 15%) 
 *   - total_price đã được tính theo số người (trẻ em < 11 tuổi miễn phí)
 */
export const completeBooking = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const booking = await Booking.findById(id).session(session);
        if (!booking) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Booking không tồn tại" });
        }

        // Prevent re-processing
        if (booking.payoutProcessed) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Booking đã xử lý payout" });
        }

        // Permission check
        const isUserAdmin = user?.role === "admin" || user?.role_id?.name === "admin";
        const isAssignedGuide = booking.intended_guide_id && String(booking.intended_guide_id) === String(user._id);
        if (!isUserAdmin && !isAssignedGuide) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "Bạn không có quyền hoàn tất booking này" });
        }

        // ===== Tính tiền HDV theo total_price (theo đầu người) =====
        const totalRevenue = booking.total_price ? Number(booking.total_price.toString()) : 0;

        // Tính số người tính phí (count_slot = true)
        const paidParticipants = (booking.participants || []).filter(p => p.count_slot).length;

        // ===== PHÍ SÀN 15% =====
        const platformFeePercentage = 0.15; // Đã thay đổi từ 0.10 thành 0.15
        const platformFee = Math.round(totalRevenue * platformFeePercentage);

        // HDV nhận = Tổng doanh thu - Phí sàn (15%)
        const guideEarning = totalRevenue - platformFee;

        // Normalize occurrence date to midnight
        const occDate = booking.start_date ? new Date(booking.start_date) : null;
        if (!occDate) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Booking thiếu start_date" });
        }
        occDate.setHours(0, 0, 0, 0);

        // Prepare payout doc
        const reference = `payout-booking-${String(booking._id)}-${Date.now().toString(36)}`;
        const payoutPayload = {
            tourId: booking.tour_id,
            tourDate: occDate,
            guideId: booking.intended_guide_id,
            baseAmount: totalRevenue,
            percentage: platformFeePercentage, // 0.15
            payoutAmount: guideEarning,
            relatedBookingIds: [booking._id],
            status: "pending",
            reference,
            createdBy: user?._id || null,
            paidParticipants: paidParticipants,
        };

        let payoutDoc;
        try {
            const created = await Payout.create([payoutPayload], { session });
            payoutDoc = created[0];

            payoutDoc.status = "paid";
            payoutDoc.paidAt = new Date();
            payoutDoc.paidBy = user?._id || null;
            await payoutDoc.save({ session });

            // Credit guide balance
            if (booking.intended_guide_id) {
                const guide = await User.findById(booking.intended_guide_id).session(session);
                if (!guide) throw new Error("Guide không tồn tại");
                guide.balance = (guide.balance || 0) + guideEarning;
                await guide.save({ session });

                // Create ledger transaction
                try {
                    await Transaction.create([{
                        bookingId: booking._id,
                        userId: guide._id,
                        payeeUserId: guide._id,
                        amount: mongoose.Types.Decimal128.fromString(String(totalRevenue)),
                        commission_fee: mongoose.Types.Decimal128.fromString(String(platformFee)),
                        net_amount: mongoose.Types.Decimal128.fromString(String(guideEarning)),
                        transaction_type: "payout",
                        status: "confirmed",
                        payment_gateway: "system",
                        transaction_code: `payout-${payoutDoc._id}`,
                        note: `Payout for booking ${booking._id} - ${paidParticipants} người - Phí sàn 15%`
                    }], { session });
                } catch (txErr) {
                    console.error("completeBooking: failed to create Transaction ledger:", txErr);
                }
            }
        } catch (createErr) {
            if (createErr && createErr.code === 11000) {
                payoutDoc = await Payout.findOne({
                    tourId: booking.tour_id,
                    tourDate: occDate,
                    guideId: booking.intended_guide_id
                }).session(session);

                if (!payoutDoc) {
                    throw createErr;
                }

                const has = (payoutDoc.relatedBookingIds || []).some(bid => String(bid) === String(booking._id));
                if (!has) {
                    payoutDoc.relatedBookingIds = payoutDoc.relatedBookingIds || [];
                    payoutDoc.relatedBookingIds.push(booking._id);
                    payoutDoc.baseAmount = (payoutDoc.baseAmount || 0) + totalRevenue;
                    payoutDoc.payoutAmount = (payoutDoc.payoutAmount || 0) + guideEarning;
                    await payoutDoc.save({ session });

                    if (booking.intended_guide_id) {
                        const guide = await User.findById(booking.intended_guide_id).session(session);
                        if (guide) {
                            guide.balance = (guide.balance || 0) + guideEarning;
                            await guide.save({ session });

                            await Transaction.create([{
                                bookingId: booking._id,
                                userId: guide._id,
                                payeeUserId: guide._id,
                                amount: mongoose.Types.Decimal128.fromString(String(totalRevenue)),
                                commission_fee: mongoose.Types.Decimal128.fromString(String(platformFee)),
                                net_amount: mongoose.Types.Decimal128.fromString(String(guideEarning)),
                                transaction_type: "payout",
                                status: "confirmed",
                                payment_gateway: "system",
                                transaction_code: `payout-${payoutDoc._id}-${booking._id}`,
                                note: `Additional payout for booking ${booking._id} - Phí sàn 15%`
                            }], { session });
                        }
                    }
                }
            } else {
                throw createErr;
            }
        }

        // Link booking -> payout and mark processed
        booking.payoutId = payoutDoc ? payoutDoc._id : null;
        booking.platformFee = platformFee;
        booking.guideEarning = guideEarning;
        booking.status = "completed";
        booking.payoutProcessed = true;
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Notify guide/customer
        try {
            if (booking.intended_guide_id) {
                await notifyUser({
                    userId: booking.intended_guide_id,
                    type: "booking:completed",
                    content: `Booking #${booking._id} đã hoàn tất. Số người: ${paidParticipants}. Tổng doanh thu: ${totalRevenue.toLocaleString('vi-VN')} VNĐ.  Thực nhận: ${guideEarning.toLocaleString('vi-VN')} VNĐ (đã trừ phí sàn 15%: ${platformFee.toLocaleString('vi-VN')} VNĐ).`,
                    url: `/guide/bookings/${booking._id}`,
                    meta: {
                        bookingId: booking._id,
                        guideEarning,
                        platformFee,
                        platformFeePercentage: 15,
                        totalRevenue,
                        paidParticipants
                    }
                }).catch(() => { });
            }
            await notifyUser({
                userId: booking.customer_id,
                type: "booking:completed:customer",
                content: `Booking #${booking._id} đã hoàn tất. Cảm ơn bạn! `,
                url: `/booking/${booking._id}`,
                meta: { bookingId: booking._id }
            }).catch(() => { });
        } catch (nErr) {
            console.error("completeBooking: notify error", nErr);
        }

        return res.json({ ok: true, booking });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("completeBooking error:", err);
        return res.status(500).json({ message: "Lỗi hoàn tất booking", error: err.message });
    }
};

/**
 * Get bookings for current user
 */
export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        // query params
        const { status, page = 1, limit = 50, grouped = "false" } = req.query;
        const pg = Math.max(Number(page) || 1, 1);
        const lm = Math.min(Math.max(Number(limit) || 50, 1), 500);

        // base condition: bookings belonging to current user
        const cond = { customer_id: userId };
        if (status) cond.status = status;

        // prepare population for tour -> also populate nested locations.locationId
        const tourPopulate = {
            path: "tour_id",
            select: "name slug cover_image_url locations",
            populate: {
                path: "locations.locationId",
                select: "name slug address province city",
            },
        };
        const guidePopulate = { path: "intended_guide_id", select: "name avatar_url" };

        // if grouped -> return grouped buckets (cap to reasonable amount)
        if (String(grouped).toLowerCase() === "true") {
            const items = await Booking.find(cond)
                .populate(tourPopulate)
                .populate(guidePopulate)
                .sort({ start_date: 1, createdAt: -1 })
                .limit(1000)
                .lean();

            const now = new Date();
            const groups = { upcoming: [], canceled: [], completed: [], others: [] };

            for (const b of items) {
                const s = (b.status || "").toString();

                if (s === "completed") {
                    groups.completed.push(b);
                    continue;
                }
                if (["canceled", "rejected"].includes(s)) {
                    groups.canceled.push(b);
                    continue;
                }

                // Decide upcoming: has start_date in the future and not canceled/rejected/completed
                let isUpcoming = false;
                try {
                    const start = toDateOrNull(b.start_date);
                    if (start && start > now) isUpcoming = true;
                } catch (e) {
                    isUpcoming = false;
                }

                if (isUpcoming) {
                    groups.upcoming.push(b);
                } else {
                    groups.others.push(b);
                }
            }

            return res.json({
                ok: true,
                grouped: true,
                total: items.length,
                groups,
            });
        }

        // Normal (paginated) listing
        const total = await Booking.countDocuments(cond);
        const items = await Booking.find(cond)
            .populate(tourPopulate)
            .populate(guidePopulate)
            .sort({ createdAt: -1 })
            .skip((pg - 1) * lm)
            .limit(lm)
            .lean();

        return res.json({
            ok: true,
            total,
            page: pg,
            limit: lm,
            bookings: items,
        });
    } catch (e) {
        console.error("getMyBookings error:", e);
        res.status(500).json({ message: "Lỗi lấy danh sách booking", error: e.message });
    }
};

/**
 * Get single booking
 */
export const getBooking = async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(400).json({ message: "booking id không hợp lệ" });
        const doc = await Booking.findById(id)
            .populate("tour_id", "name slug cover_image_url images duration location fixed_departure_time")
            .populate("customer_id", "name email phone_number avatar_url")
            .populate("intended_guide_id", "name avatar_url");
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
                meta: { bookingId: booking._id, reason: booking.cancel_reason || "" },
            }).catch(() => { });

            if (booking.intended_guide_id) {
                await notifyUser({
                    userId: booking.intended_guide_id,
                    type: "booking:canceled:guide",
                    content: `Booking #${booking._id} cho tour đã bị huỷ.`,
                    url: `/guide/bookings/${booking._id}`,
                    meta: { bookingId: booking._id },
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
            const requestedAt = booking.cancel_requested_at ? booking.cancel_requested_at.toLocaleString() : new Date().toLocaleString();

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
                supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || "",
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
                supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || "",
            };
            await notifyUser({
                userId: booking.customer_id,
                type: "booking:refund_requested:confirm",
                content: `Yêu cầu hủy và hoàn tiền cho booking #${booking._id} đã được gửi tới admin.`,
                url: `/booking/${booking._id}`,
                meta: userMeta,
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
                supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || "",
            };

            await notifyUser({
                userId: booking.customer_id,
                type: "booking:refunded",
                content: `Booking #${booking._id} đã được huỷ và hoàn tiền.`,
                url: `/booking/${booking._id}`,
                meta: userMeta,
            }).catch(() => { });

            // notify admins for audit
            await notifyAdmins({
                type: "refund:confirmed",
                content: `Admin đã hoàn tiền cho booking ${booking._id}`,
                meta: {
                    bookingId: booking._id,
                    transactionId: txn._id,
                    amount,
                    confirmedBy: user.name || user._id,
                },
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
            meta: { bookingId: booking._id },
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
            supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || "",
        };

        await notifyUser({
            userId: booking.customer_id,
            type: "booking:refund_requested",
            content: `Yêu cầu hoàn tiền cho booking #${booking._id} đã được tạo.`,
            url: `/booking/${booking._id}`,
            meta: userMeta,
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
                adminUrl,
            },
        }).catch(() => { });

        return res.json({ transaction: txn, booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi tạo refund", error: e.message });
    }
};

/**
 * Admin confirm refund (after manual transfer or gateway refund)
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
        const bookingCode = booking ? String(booking._id) : txn.bookingId ? String(txn.bookingId) : "";
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
            supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || "",
        };

        await notifyUser({
            userId: txn.userId,
            type: "booking:refunded",
            content: `Hoàn tiền cho booking #${txn.bookingId} đã hoàn tất.`,
            url: `/booking/${txn.bookingId}`,
            meta: userMeta,
        }).catch(() => { });

        // notify admins for audit
        await notifyAdmins({
            type: "refund:confirmed",
            content: `Refund confirmed for booking ${txn.bookingId} (txn ${txn._id}).`,
            meta: {
                bookingId: txn.bookingId,
                transactionId: txn._id,
                amount: txn.amount ? txn.amount.toString() : "",
                confirmedBy: user.name || user._id,
            },
        }).catch(() => { });

        return res.json({ transaction: txn, booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi confirm refund", error: e.message });
    }
};

/**
 * Get bookings assigned to guide (with optional filters)
 */
export const getGuideBookings = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const { status, page = 1, limit = 50, grouped = "false" } = req.query;
        const pg = Math.max(Number(page) || 1, 1);
        const lm = Math.min(Math.max(Number(limit) || 50, 1), 200);

        // parse status string -> array of tokens; supports commas, pipes, parentheses
        function parseStatusTokens(s) {
            if (!s) return null;
            let raw = String(s).trim();
            // replace parentheses with commas so accepted(completed) -> "accepted,completed"
            raw = raw.replace(/[()]/g, ",");
            const parts = raw.split(/[,|]/).map((p) => p.trim()).filter(Boolean);
            return parts;
        }

        const tokens = parseStatusTokens(status);

        // Base condition: bookings assigned to this guide
        const baseCond = { intended_guide_id: userId };

        // If no tokens -> return all bookings for guide (paginated)
        if (!tokens || tokens.length === 0) {
            const total = await Booking.countDocuments(baseCond);
            const items = await Booking.find(baseCond)
                .populate("tour_id", "name slug cover_image_url")
                .populate("customer_id", "name email avatar_url")
                .sort({ createdAt: -1 })
                .skip((pg - 1) * lm)
                .limit(lm)
                .lean();

            if (String(grouped).toLowerCase() === "true") {
                const groups = { received: [], canceled: [], completed: [], others: [] };
                for (const b of items) {
                    const s = (b.status || "").toString();
                    if (b?.guide_decision?.status === "accepted" || ["accepted", "awaiting_payment", "paid"].includes(s))
                        groups.received.push(b);
                    else if (["canceled", "rejected"].includes(s)) groups.canceled.push(b);
                    else if (s === "completed") groups.completed.push(b);
                    else groups.others.push(b);
                }
                return res.json({ ok: true, total, page: pg, limit: lm, grouped: true, groups });
            }

            return res.json({ ok: true, total, page: pg, limit: lm, bookings: items });
        }

        // tokens present -> construct OR clauses supporting aliases
        const orClauses = [];
        for (const t of tokens) {
            const key = String(t).toLowerCase();
            if (key === "accepted" || key === "received") {
                // accepted: either guide_decision.status == 'accepted' OR booking.status in awaiting_payment/paid/accepted
                orClauses.push({ "guide_decision.status": "accepted" });
                orClauses.push({ status: { $in: ["awaiting_payment", "paid", "accepted"] } });
            } else if (key === "completed") {
                orClauses.push({ status: "completed" });
            } else if (key === "paid") {
                orClauses.push({ status: "paid" });
            } else if (key === "awaiting_payment") {
                orClauses.push({ status: "awaiting_payment" });
            } else if (key === "canceled" || key === "cancelled" || key === "rejected") {
                orClauses.push({ status: { $in: ["canceled", "rejected"] } });
            } else {
                // literal status fallback
                orClauses.push({ status: key });
            }
        }

        // final condition = assigned to guide AND (one of orClauses)
        const cond = { ...baseCond, $or: orClauses };

        const total = await Booking.countDocuments(cond);
        const items = await Booking.find(cond)
            .populate("tour_id", "name slug cover_image_url")
            .populate("customer_id", "name email avatar_url")
            .sort({ createdAt: -1 })
            .skip((pg - 1) * lm)
            .limit(lm)
            .lean();

        if (String(grouped).toLowerCase() === "true") {
            const groups = { received: [], canceled: [], completed: [], others: [] };
            for (const b of items) {
                const s = (b.status || "").toString();
                if (b?.guide_decision?.status === "accepted" || ["accepted", "awaiting_payment", "paid"].includes(s))
                    groups.received.push(b);
                else if (["canceled", "rejected"].includes(s)) groups.canceled.push(b);
                else if (s === "completed") groups.completed.push(b);
                else groups.others.push(b);
            }
            return res.json({ ok: true, total, page: pg, limit: lm, grouped: true, groups });
        }

        return res.json({ ok: true, total, page: pg, limit: lm, bookings: items });
    } catch (err) {
        console.error("getGuideBookings error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
};