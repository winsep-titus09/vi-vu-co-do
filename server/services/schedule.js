import cron from "node-cron";
import BlacklistedToken from "../models/BlacklistedToken.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";
import { notifyUser } from "./notify.js";

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
 * - Xác định các booking vừa kết thúc trong khoảng 5 phút qua (tránh quét cả lịch sử).
 * - Nếu chưa có review tour -> gửi thông báo prompt đánh giá tour.
 * - Nếu đã có tour_rating nhưng chưa có guide_rating -> gửi prompt đánh giá HDV.
 * - Tuỳ chọn: chuyển booking từ "paid" sang "completed" khi đã kết thúc.
 */
cron.schedule("* * * * *", async () => {
    const now = new Date();
    const windowMs = 5 * 60 * 1000; // 5 phút gần nhất
    const since = new Date(now.getTime() - windowMs);

    try {
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