import Booking from "../../models/Booking.js";
import Payout from "../../models/Payout.js";
import User from "../../models/User.js";
import Tour from "../../models/Tour.js";
import Role from "../../models/Role.js";

/**
 * GET /api/admin/dashboard
 * Trả: totalGross, totalPayouts (đã trả cho HDV), totalNet, pending counts
 * + Thống kê users, tours, bookings
 */
export async function adminDashboard(req, res) {
  try {
    // totalGross: tổng paid bookings
    const grossAgg = await Booking.aggregate([
      { $match: { status: { $in: ["paid", "completed"] } } },
      {
        $group: {
          _id: null,
          totalGross: {
            $sum: {
              $ifNull: ["$paid_amount", "$paidAmount", "$total_price", 0],
            },
          },
        },
      },
    ]);
    const totalGross = Number((grossAgg[0] && grossAgg[0].totalGross) || 0);

    // totalPayouts: tổng payout đã paid (dựa vào collection Payout)
    const payoutAgg = await Payout.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          totalPayouts: { $sum: { $ifNull: ["$payoutAmount", "$amount", 0] } },
        },
      },
    ]);
    const totalPayouts = Number(
      (payoutAgg[0] && payoutAgg[0].totalPayouts) || 0
    );

    const totalNet = totalGross - totalPayouts;

    const pendingPayoutCount = await Payout.countDocuments({
      status: { $ne: "paid" },
    });
    const pendingTourRequests = await (
      await import("../../models/TourRequest.js")
    ).default.countDocuments({ status: "pending" });

    // ===== THỐNG KÊ USERS =====
    // Lấy role IDs
    const roles = await Role.find({}).lean();
    const roleMap = {};
    roles.forEach((r) => {
      roleMap[r.name?.toLowerCase()] = r._id;
    });

    const totalUsers = await User.countDocuments({});
    const totalTourists = roleMap.tourist
      ? await User.countDocuments({ role_id: roleMap.tourist })
      : 0;
    const totalGuides = roleMap.guide
      ? await User.countDocuments({ role_id: roleMap.guide })
      : 0;
    const activeUsers = await User.countDocuments({ status: "active" });

    // ===== THỐNG KÊ TOURS =====
    const totalTours = await Tour.countDocuments({});
    const activeTours = await Tour.countDocuments({ status: "active" });
    const pendingApprovalTours = await Tour.countDocuments({
      "approval.status": "pending",
    });
    const approvedTours = await Tour.countDocuments({
      "approval.status": "approved",
    });

    // ===== THỐNG KÊ BOOKINGS =====
    // Bookings hôm nay
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Bookings theo trạng thái
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const bookingStatusMap = {};
    bookingsByStatus.forEach((b) => {
      bookingStatusMap[b._id] = b.count;
    });

    const totalBookings = await Booking.countDocuments({});
    const paidBookings = bookingStatusMap.paid || 0;
    const completedBookings = bookingStatusMap.completed || 0;
    const canceledBookings = bookingStatusMap.canceled || 0;
    const waitingGuideBookings = bookingStatusMap.waiting_guide || 0;
    const awaitingPaymentBookings = bookingStatusMap.awaiting_payment || 0;

    return res.json({
      // Doanh thu
      totalGross,
      totalPayouts,
      totalNet,
      pendingPayoutCount,
      pendingTourRequests,
      // Users
      totalUsers,
      totalTourists,
      totalGuides,
      activeUsers,
      // Tours
      totalTours,
      activeTours,
      pendingApprovalTours,
      approvedTours,
      // Bookings
      totalBookings,
      todayBookings,
      paidBookings,
      completedBookings,
      canceledBookings,
      waitingGuideBookings,
      awaitingPaymentBookings,
    });
  } catch (err) {
    console.error("adminDashboard error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
}

/**
 * GET /api/admin/dashboard/revenue-trend
 * Doanh thu theo 7 ngày gần nhất
 */
export async function getRevenueTrend(req, res) {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 30);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    // Aggregate bookings by day
    const revenueByDay = await Booking.aggregate([
      {
        $match: {
          status: { $in: ["paid", "completed"] },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: {
            $sum: {
              $ifNull: ["$paid_amount", "$paidAmount", "$total_price", 0],
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days with 0
    const revenueMap = {};
    revenueByDay.forEach((item) => {
      revenueMap[item._id] = {
        revenue: Number(item.revenue),
        count: item.count,
      };
    });

    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      });
      result.push({
        date: dateStr,
        label: dayLabel,
        revenue: revenueMap[dateStr]?.revenue || 0,
        count: revenueMap[dateStr]?.count || 0,
      });
    }

    return res.json(result);
  } catch (err) {
    console.error("getRevenueTrend error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
}
