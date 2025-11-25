import Booking from "../../models/Booking.js";
import Payout from "../../models/Payout.js";

/**
 * GET /api/admin/dashboard
 * Trả: totalGross, totalPayouts (đã trả cho HDV), totalNet, pending counts
 */
export async function adminDashboard(req, res) {
    try {
        // totalGross: tổng paid bookings
        const grossAgg = await Booking.aggregate([
            { $match: { status: { $in: ["paid", "completed"] } } },
            { $group: { _id: null, totalGross: { $sum: { $ifNull: ["$paid_amount", "$paidAmount", "$total_price", 0] } } } }
        ]);
        const totalGross = Number((grossAgg[0] && grossAgg[0].totalGross) || 0);

        // totalPayouts: tổng payout đã paid (dựa vào collection Payout)
        const payoutAgg = await Payout.aggregate([
            { $match: { status: "paid" } },
            { $group: { _id: null, totalPayouts: { $sum: { $ifNull: ["$payoutAmount", "$amount", 0] } } } }
        ]);
        const totalPayouts = Number((payoutAgg[0] && payoutAgg[0].totalPayouts) || 0);

        const totalNet = totalGross - totalPayouts;

        const pendingPayoutCount = await Payout.countDocuments({ status: { $ne: "paid" } });
        const pendingTourRequests = await (await import("../../models/TourRequest.js")).default.countDocuments({ status: "pending" });

        return res.json({
            totalGross,
            totalPayouts,
            totalNet,
            pendingPayoutCount,
            pendingTourRequests
        });
    } catch (err) {
        console.error("adminDashboard error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
}