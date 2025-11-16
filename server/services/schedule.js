import cron from "node-cron";
import BlacklistedToken from "../models/BlacklistedToken.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";
import { notifyUser } from "./notify.js";
import Tour from "../models/Tour.js";

/**
 * Dọn dẹp token hết hạn – chạy mỗi ngày lúc 00:00
 */
cron.schedule("0 0 * * *", async () => {
    const now = new Date();
    const result = await BlacklistedToken.deleteMany({ expiredAt: { $lte: now } });
    console.log(`🧹 Dọn dẹp ${result.deletedCount} token hết hạn.`);
});

/**
 * Cron mỗi phút:
 * - Auto-cancel booking quá hạn thanh toán (awaiting_payment)
 * - Auto-reject booking quá hạn chờ HDV duyệt (waiting_guide)
 * - Prompt review sau khi tour kết thúc + auto-complete (như cũ)
 */
cron.schedule("* * * * *", async () => {
    const now = new Date();

    // 1) AUTO-CANCEL do quá hạn thanh toán
    try {
        const toCancel = await Booking.find({
            status: "awaiting_payment",
            payment_due_at: { $ne: null, $lte: now },
        })
            .select("_id customer_id tour_id payment_session")
            .lean();

        for (const b of toCancel) {
            try {
                // set status canceled, payment_session.expired nếu có
                await Booking.updateOne(
                    { _id: b._id, status: "awaiting_payment" },
                    {
                        $set: {
                            status: "canceled",
                            ...(b.payment_session
                                ? { "payment_session.status": "expired" }
                                : {}),
                        },
                    }
                );

                // notify user
                let tourName = `#${b._id}`;
                try {
                    const t = await Tour.findById(b.tour_id).lean();
                    if (t?.name) tourName = t.name;
                } catch { /* ignore */ }

                await notifyUser({
                    userId: b.customer_id,
                    type: "booking:cancelled",
                    content: `Booking cho tour ${tourName} đã bị hủy do quá hạn thanh toán.`,
                    url: `/booking/${b._id}`,
                    meta: { bookingId: b._id, tourId: b.tour_id, tourName },
                }).catch(() => { });
            } catch (err) {
                console.warn("auto-cancel booking error:", b?._id?.toString(), err?.message);
            }
        }
    } catch (err) {
        console.error("auto-cancel scan error:", err?.message);
    }

    // 2) AUTO-REJECT do quá hạn chờ HDV duyệt
    try {
        const toReject = await Booking.find({
            status: "waiting_guide",
            "guide_decision.status": "pending",
            guide_approval_due_at: { $ne: null, $lte: now },
        })
            .select("_id customer_id tour_id intended_guide_id")
            .lean();

        for (const b of toReject) {
            try {
                await Booking.updateOne(
                    { _id: b._id, status: "waiting_guide", "guide_decision.status": "pending" },
                    {
                        $set: {
                            status: "rejected",
                            guide_decision: {
                                status: "rejected",
                                decided_at: new Date(),
                                decided_by: undefined,
                                note: "Hệ thống từ chối do quá thời hạn chờ HDV.",
                            },
                        },
                    }
                );

                let tourName = `#${b._id}`;
                try {
                    const t = await Tour.findById(b.tour_id).lean();
                    if (t?.name) tourName = t.name;
                } catch { /* ignore */ }

                // Notify khách: dùng template 'booking:rejected' hiện có
                await notifyUser({
                    userId: b.customer_id,
                    type: "booking:rejected",
                    content: `Yêu cầu đặt tour ${tourName} đã bị từ chối do quá thời hạn chờ HDV.`,
                    url: `/booking/${b._id}`,
                    meta: { bookingId: b._id, tourId: b.tour_id, tourName, reason: "timeout_guide" },
                }).catch(() => { });
            } catch (err) {
                console.warn("auto-reject booking error:", b?._id?.toString(), err?.message);
            }
        }
    } catch (err) {
        console.error("auto-reject scan error:", err?.message);
    }

    // 3) PROMPT REVIEW + auto-complete như cũ
    try {
        const windowMs = 5 * 60 * 1000; // 5 phút gần nhất
        const since = new Date(now.getTime() - windowMs);

        // Lấy các booking kết thúc trong cửa sổ thời gian
        const bookings = await Booking.find({
            end_date: { $gt: since, $lte: now },
            status: { $in: ["paid", "completed"] }, // cho phép cả hai
        })
            .select("_id customer_id tour_id intended_guide_id end_date status")
            .lean();

        for (const b of bookings) {
            try {
                // Tuỳ chọn: cập nhật sang completed nếu còn ở trạng thái paid
                if (b.status === "paid") {
                    await Booking.updateOne(
                        { _id: b._id, status: "paid" },
                        { $set: { status: "completed" } }
                    ).catch(() => { });
                }

                const review = await Review.findOne({ bookingId: b._id }).lean();

                // 1) Chưa có tour_rating => nhắc đánh giá Tour
                if (!review || !review.tour_rating) {
                    const existsTourPrompt = await Notification.findOne({
                        audience: "user",
                        recipientId: b.customer_id,
                        type: "review:prompt:tour",
                        "meta.bookingId": b._id,
                    }).lean();

                    if (!existsTourPrompt) {
                        await notifyUser({
                            userId: b.customer_id,
                            type: "review:prompt:tour",
                            content: "Tour của bạn vừa kết thúc. Hãy đánh giá trải nghiệm tour.",
                            url: `/booking/${b._id}/review/tour`,
                            meta: { bookingId: b._id, tourId: b.tour_id },
                        });
                    }
                    continue; // chỉ khi đã đánh giá tour mới xét đến HDV
                }

                // 2) Đã đánh giá tour nhưng chưa đánh giá HDV => nhắc đánh giá HDV
                if (review.tour_rating && !review.guide_rating) {
                    const existsGuidePrompt = await Notification.findOne({
                        audience: "user",
                        recipientId: b.customer_id,
                        type: "review:prompt:guide",
                        "meta.bookingId": b._id,
                    }).lean();

                    if (!existsGuidePrompt) {
                        await notifyUser({
                            userId: b.customer_id,
                            type: "review:prompt:guide",
                            content: "Bạn đã đánh giá tour. Hãy tiếp tục đánh giá hướng dẫn viên.",
                            url: `/booking/${b._id}/review/guide`,
                            meta: { bookingId: b._id, tourId: b.tour_id, guideId: b.intended_guide_id },
                        });
                    }
                }
            } catch (innerErr) {
                console.warn("⚠ review prompt per booking error:", innerErr?.message);
            }
        }
    } catch (err) {
        console.error("❌ review prompt cron error:", err?.message);
    }
});