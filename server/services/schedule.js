import cron from "node-cron";
import BlacklistedToken from "../models/BlacklistedToken.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import Notification from "../models/Notification.js";
import { notifyUser } from "./notify.js";

// Dọn dẹp token hết hạn – chạy mỗi ngày lúc 00:00
cron.schedule("0 0 * * *", async () => {
    const now = new Date();
    const result = await BlacklistedToken.deleteMany({ expiredAt: { $lte: now } });
    console.log(`🧹 Dọn dẹp ${result.deletedCount} token hết hạn.`);
});

// Nhắc real-time đánh giá sau khi tour kết thúc – chạy mỗi phút
cron.schedule("* * * * *", async () => {
    const now = new Date();
    const since = new Date(now.getTime() - 5 * 60 * 1000); // cửa sổ 5 phút gần nhất để giảm tải và tránh gửi trễ

    // Lấy các booking vừa kết thúc (đã paid/completed)
    const bookings = await Booking.find({
        end_date: { $gt: since, $lte: now },
        status: { $in: ["paid", "completed"] },
    })
        .select("_id customer_id tour_id intended_guide_id end_date")
        .lean();

    for (const b of bookings) {
        try {
            const review = await Review.findOne({ bookingId: b._id }).lean();
            // Nếu chưa có hoặc chưa có tour_rating -> nhắc đánh giá Tour
            if (!review || !review.tour_rating) {
                const exists = await Notification.findOne({
                    audience: "user",
                    recipientId: b.customer_id,
                    type: "review:prompt:tour",
                    "meta.bookingId": b._id,
                }).lean();
                if (!exists) {
                    await notifyUser({
                        userId: b.customer_id,
                        type: "review:prompt:tour",
                        content: "Tour của bạn vừa kết thúc. Hãy đánh giá trải nghiệm tour.",
                        url: `/booking/${b._id}/review/tour`,
                        meta: { bookingId: b._id, tourId: b.tour_id },
                    });
                }
                continue;
            }

            // Nếu đã có tour_rating nhưng chưa có guide_rating -> nhắc đánh giá HDV
            if (review.tour_rating && !review.guide_rating) {
                const exists = await Notification.findOne({
                    audience: "user",
                    recipientId: b.customer_id,
                    type: "review:prompt:guide",
                    "meta.bookingId": b._id,
                }).lean();
                if (!exists) {
                    await notifyUser({
                        userId: b.customer_id,
                        type: "review:prompt:guide",
                        content: "Bạn đã đánh giá tour. Hãy tiếp tục đánh giá hướng dẫn viên.",
                        url: `/booking/${b._id}/review/guide`,
                        meta: { bookingId: b._id, tourId: b.tour_id, guideId: b.intended_guide_id },
                    });
                }
            }
        } catch (e) {
            console.warn("review prompt cron error:", e?.message);
        }
    }
});