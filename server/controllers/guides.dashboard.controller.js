import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";

/**
 * GET /api/guides/me/dashboard
 * Trả: danh sách tour HDV được gán (gross, percentage, guideShare, bookingsCount) + tổng
 */
export async function guideDashboard(req, res) {
    try {
        const guideId = req.user._id;
        // Lấy tour mà guide được gán
        const tours = await Tour.find({ "guides.guideId": guideId })
            .select("name slug guides")
            .lean();

        if (!tours.length) return res.json({ items: [], totalGross: 0, totalGuideShare: 0 });

        const tourIds = tours.map(t => t._id);

        // Aggregate bookings: tổng số tiền paid theo tour
        const pipeline = [
            {
                $match: {
                    tour_id: { $in: tourIds },
                    status: { $in: ["paid", "completed"] } // tùy theo hệ thống, chỉnh status phù hợp
                }
            },
            { $group: { _id: "$tour_id", gross: { $sum: { $ifNull: ["$paid_amount", "$paidAmount", "$total_price", 0] } }, bookingsCount: { $sum: 1 } } }
        ];

        const agg = await Booking.aggregate(pipeline);

        const aggMap = new Map(agg.map(a => [String(a._id), a]));

        const items = tours.map(t => {
            const entry = aggMap.get(String(t._id)) || { gross: 0, bookingsCount: 0 };
            const guideEntry = (t.guides || []).find(g => String(g.guideId) === String(guideId)) || {};
            const percentage = (typeof guideEntry.percentage === "number") ? guideEntry.percentage : 0;
            const guideShare = Math.round((entry.gross || 0) * percentage);
            return {
                tourId: t._id,
                name: t.name,
                slug: t.slug,
                gross: Number(entry.gross || 0),
                bookingsCount: entry.bookingsCount || 0,
                percentage,
                guideShare
            };
        });

        const totalGross = items.reduce((s, it) => s + it.gross, 0);
        const totalGuideShare = items.reduce((s, it) => s + it.guideShare, 0);

        return res.json({ items, totalGross, totalGuideShare });
    } catch (err) {
        console.error("guideDashboard error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
}