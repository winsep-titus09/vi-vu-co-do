// server/controllers/public.controller.js
import User from "../models/User.js";
import Tour from "../models/Tour.js";
import Location from "../models/Location.js";
import Booking from "../models/Booking.js";
import Role from "../models/Role.js";

/**
 * GET /api/public/stats
 * Trả về thống kê tổng quan cho trang chủ (public, không cần auth)
 */
export async function getPublicStats(req, res) {
  try {
    // Cache key for Redis (if using)
    const cacheKey = "public:stats";

    // Get guide role ID
    const guideRole = await Role.findOne({ name: /guide/i }).lean();
    const guideRoleId = guideRole?._id;

    // Run all queries in parallel
    const [totalGuides, totalLocations, totalTours, completedBookings] =
      await Promise.all([
        // Count active guides
        guideRoleId
          ? User.countDocuments({ role_id: guideRoleId, status: "active" })
          : Promise.resolve(0),
        // Count locations
        Location.countDocuments({ status: "active" }),
        // Count approved tours
        Tour.countDocuments({
          "approval.status": "approved",
          status: "active",
        }),
        // Count completed bookings (satisfied customers)
        Booking.countDocuments({ status: "completed" }),
      ]);

    const stats = {
      totalGuides,
      totalLocations,
      totalTours,
      completedBookings,
      // Formatted for display
      formatted: {
        guides: formatNumber(totalGuides),
        locations: formatNumber(totalLocations),
        tours: formatNumber(totalTours),
        customers: formatNumber(completedBookings),
      },
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching public stats:", error);
    res.status(500).json({
      message: "Không thể tải thống kê",
      error: error.message,
    });
  }
}

// Helper function to format numbers
function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K+";
  }
  return num + "+";
}
