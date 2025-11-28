import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Transaction from "../models/Transaction.js";

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

export async function getGuideMonthlyEarnings(req, res) {
    try {
        const guideId = req.user && req.user._id;
        if (!guideId) return res.status(401).json({ message: "Unauthorized" });

        // ensure valid ObjectId
        if (!mongoose.isValidObjectId(guideId)) {
            return res.status(400).json({ message: "Invalid guide id" });
        }
        const guideObjId = new mongoose.Types.ObjectId(String(guideId));

        const year = parseInt(req.query.year, 10) || new Date().getFullYear();
        const mode = (req.query.mode || "paid").toLowerCase();

        if (mode !== "paid") {
            return res.status(400).json({ message: "mode chỉ hỗ trợ 'paid' hiện tại" });
        }

        // time window (UTC)
        const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
        const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));

        const match = {
            payeeUserId: guideObjId,
            status: { $in: ["confirmed", "completed", "paid"] },
            $or: [
                { processedAt: { $gte: start, $lt: end } },
                { createdAt: { $gte: start, $lt: end } }
            ]
        };

        const pipeline = [
            { $match: match },
            { $addFields: { net_amount_num: { $toDouble: { $ifNull: ["$net_amount", "$amount", 0] } } } },
            {
                $group: {
                    _id: {
                        year: { $year: { $toDate: { $ifNull: ["$processedAt", "$createdAt"] } } },
                        month: { $month: { $toDate: { $ifNull: ["$processedAt", "$createdAt"] } } }
                    },
                    total: { $sum: "$net_amount_num" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ];

        const agg = await Transaction.aggregate(pipeline);

        // Build months 1..12
        const months = Array.from({ length: 12 }, (_, i) => {
            const m = agg.find(a => a._id && a._id.month === i + 1);
            return {
                year,
                month: i + 1,
                total: m ? Number(m.total) : 0,
                count: m ? m.count : 0
            };
        });

        const totalYear = months.reduce((s, m) => s + m.total, 0);

        return res.json({ year, months, totalYear });
    } catch (err) {
        console.error("getGuideMonthlyEarnings error:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
}