import mongoose from "mongoose";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Transaction from "../models/Transaction.js";
import TourRequest from "../models/TourRequest.js";
import User from "../models/User.js"; // THÊM IMPORT

/**
 * GET /api/guides/me/dashboard
 * Trả: danh sách tour HDV được gán (gross, percentage, guideShare, bookingsCount) + tổng + availableBalance
 */
export async function guideDashboard(req, res) {
  try {
    const guideId = req.user._id;

    // Lấy balance từ User
    const guide = await User.findById(guideId).select("balance").lean();
    const availableBalance = guide?.balance || 0;

    // Lấy tour mà guide được gán
    const tours = await Tour.find({ "guides.guideId": guideId })
      .select("name slug guides")
      .lean();

    if (!tours.length)
      return res.json({ items: [], totalGross: 0, totalGuideShare: 0, availableBalance });

    const tourIds = tours.map((t) => t._id);

    // Aggregate bookings: tổng số tiền paid theo tour
    const pipeline = [
      {
        $match: {
          tour_id: { $in: tourIds },
          intended_guide_id: guideId,
          status: { $in: ["paid", "completed"] },
        },
      },
      {
        $group: {
          _id: "$tour_id",
          gross: {
            $sum: {
              $ifNull: ["$paid_amount", "$paidAmount", "$total_price", 0],
            },
          },
          bookingsCount: { $sum: 1 },
        },
      },
    ];

    const agg = await Booking.aggregate(pipeline);

    const aggMap = new Map(agg.map((a) => [String(a._id), a]));

    const items = tours.map((t) => {
      const entry = aggMap.get(String(t._id)) || { gross: 0, bookingsCount: 0 };
      const guideEntry =
        (t.guides || []).find((g) => String(g.guideId) === String(guideId)) ||
        {};
      const percentage =
        typeof guideEntry.percentage === "number" ? guideEntry.percentage : 0.1;
      const guideShare = Math.round((entry.gross || 0) * (1 - percentage));
      return {
        tourId: t._id,
        name: t.name,
        slug: t.slug,
        gross: Number(entry.gross || 0),
        bookingsCount: entry.bookingsCount || 0,
        percentage,
        guideShare,
      };
    });

    const totalGross = items.reduce((s, it) => s + it.gross, 0);
    const totalGuideShare = items.reduce((s, it) => s + it.guideShare, 0);

    return res.json({ items, totalGross, totalGuideShare, availableBalance });
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
      return res
        .status(400)
        .json({ message: "mode chỉ hỗ trợ 'paid' hiện tại" });
    }

    // time window (UTC)
    const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));

    const pipeline = [
      {
        $match: {
          intended_guide_id: guideObjId,
          status: "completed",
          payoutProcessed: true,
        },
      },
      {
        $addFields: {
          earningValue: {
            $toDouble: { $ifNull: ["$guideEarning", 0] },
          },
          earningDate: {
            $ifNull: [
              {
                $cond: [{ $ifNull: ["$start_date", false] }, "$start_date", null],
              },
              "$createdAt",
            ],
          },
        },
      },
      {
        $match: {
          earningDate: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$earningDate" },
            month: { $month: "$earningDate" },
          },
          total: { $sum: "$earningValue" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ];

    const agg = await Booking.aggregate(pipeline);

    // Build months 1..12
    const months = Array.from({ length: 12 }, (_, i) => {
      const m = agg.find((a) => a._id && a._id.month === i + 1);
      return {
        year,
        month: i + 1,
        total: m ? Number(m.total) : 0,
        count: m ? m.count : 0,
      };
    });

    const totalYear = months.reduce((s, m) => s + m.total, 0);

    return res.json({ year, months, totalYear });
  } catch (err) {
    console.error("getGuideMonthlyEarnings error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
}

/**
 * GET /api/guides/me/tours
 * Lấy danh sách tours của HDV (bao gồm cả TourRequest và Tour)
 * Query: status (all | approved | pending | rejected | draft | hidden)
 */
export async function getGuideTours(req, res) {
  try {
    const guideId = req.user._id;
    const { status, page = 1, limit = 50 } = req.query;

    const pg = Math.max(parseInt(page) || 1, 1);
    const lm = Math.min(Math.max(parseInt(limit) || 50, 1), 100);

    let items = [];
    let total = 0;

    if (!status || status === "all") {
      // Lấy cả Tour và TourRequest
      const [tours, requests] = await Promise.all([
        Tour.find({ "guides.guideId": guideId })
          .populate("category_id", "name")
          .populate("guides.guideId", "name avatar_url")
          .populate("locations.locationId", "name slug")
          .populate("itinerary.locationId", "name")
          .select("+edit_allowed_until +last_approved_edit_request")
          .sort({ createdAt: -1 })
          .lean(),
        TourRequest.find({ created_by: guideId })
          .populate("categories", "name")
          .populate("guides.guideId", "name avatar_url")
          .populate("locations.locationId", "name slug")
          .populate("itinerary.locationId", "name")
          .sort({ createdAt: -1 })
          .lean(),
      ]);

      // Map tours và requests to unified format
      // Use approval.status for tour approval state
      const mappedTours = tours.map((t) => {
        const approvalStatus = t.approval?.status;
        let displayStatus = "pending";
        if (approvalStatus === "approved") displayStatus = "active";
        else if (approvalStatus === "rejected") displayStatus = "rejected";
        else if (approvalStatus === "pending") displayStatus = "pending";
        else if (t.status === "active") displayStatus = "active"; // fallback

        return {
          ...t,
          type: "tour",
          displayStatus,
        };
      });

      const mappedRequests = requests
        .filter((r) => r.status !== "approved") // Đã approved sẽ có trong Tour
        .map((r) => ({
          ...r,
          type: "request",
          displayStatus: r.status, // pending, rejected
        }));

      const all = [...mappedTours, ...mappedRequests].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      total = all.length;
      items = all.slice((pg - 1) * lm, pg * lm);
    } else if (status === "approved") {
      // Chỉ lấy Tour đã duyệt (approval.status = approved)
      const filter = {
        "guides.guideId": guideId,
        "approval.status": "approved",
      };
      const [tours, cnt] = await Promise.all([
        Tour.find(filter)
          .populate("category_id", "name")
          .populate("guides.guideId", "name avatar_url")
          .populate("locations.locationId", "name slug")
          .populate("itinerary.locationId", "name")
          .select("+edit_allowed_until +last_approved_edit_request")
          .sort({ createdAt: -1 })
          .skip((pg - 1) * lm)
          .limit(lm)
          .lean(),
        Tour.countDocuments(filter),
      ]);
      items = tours.map((t) => ({
        ...t,
        type: "tour",
        displayStatus: "active",
      }));
      total = cnt;
    } else if (status === "pending") {
      // Lấy Tour chờ duyệt (approval.status = pending) VÀ TourRequest pending
      const [pendingTours, pendingRequests] = await Promise.all([
        Tour.find({
          "guides.guideId": guideId,
          "approval.status": "pending",
        })
          .populate("category_id", "name")
          .populate("guides.guideId", "name avatar_url")
          .populate("locations.locationId", "name slug")
          .populate("itinerary.locationId", "name")
          .select("+edit_allowed_until +last_approved_edit_request")
          .sort({ createdAt: -1 })
          .lean(),
        TourRequest.find({ created_by: guideId, status: "pending" })
          .populate("categories", "name")
          .populate("guides.guideId", "name avatar_url")
          .populate("locations.locationId", "name slug")
          .populate("itinerary.locationId", "name")
          .sort({ createdAt: -1 })
          .lean(),
      ]);

      const mappedTours = pendingTours.map((t) => ({
        ...t,
        type: "tour",
        displayStatus: "pending",
      }));
      const mappedRequests = pendingRequests.map((r) => ({
        ...r,
        type: "request",
        displayStatus: "pending",
      }));

      const all = [...mappedTours, ...mappedRequests].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      total = all.length;
      items = all.slice((pg - 1) * lm, pg * lm);
    } else if (status === "rejected") {
      // Lấy Tour bị từ chối (approval.status = rejected) VÀ TourRequest rejected
      const [rejectedTours, rejectedRequests] = await Promise.all([
        Tour.find({
          "guides.guideId": guideId,
          "approval.status": "rejected",
        })
          .populate("category_id", "name")
          .populate("guides.guideId", "name avatar_url")
          .populate("locations.locationId", "name slug")
          .populate("itinerary.locationId", "name")
          .select("+edit_allowed_until +last_approved_edit_request")
          .sort({ createdAt: -1 })
          .lean(),
        TourRequest.find({ created_by: guideId, status: "rejected" })
          .populate("categories", "name")
          .populate("guides.guideId", "name avatar_url")
          .populate("locations.locationId", "name slug")
          .populate("itinerary.locationId", "name")
          .sort({ createdAt: -1 })
          .lean(),
      ]);

      const mappedTours = rejectedTours.map((t) => ({
        ...t,
        type: "tour",
        displayStatus: "rejected",
      }));
      const mappedRequests = rejectedRequests.map((r) => ({
        ...r,
        type: "request",
        displayStatus: "rejected",
      }));

      const all = [...mappedTours, ...mappedRequests].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      total = all.length;
      items = all.slice((pg - 1) * lm, pg * lm);
    } else if (status === "draft" || status === "hidden") {
      // Tour với status draft/hidden
      const filter = { "guides.guideId": guideId, status };
      const [tours, cnt] = await Promise.all([
        Tour.find(filter)
          .populate("category_id", "name")
          .populate("guides.guideId", "name avatar_url")
          .populate("locations.locationId", "name slug")
          .populate("itinerary.locationId", "name")
          .select("+edit_allowed_until +last_approved_edit_request")
          .sort({ createdAt: -1 })
          .skip((pg - 1) * lm)
          .limit(lm)
          .lean(),
        Tour.countDocuments(filter),
      ]);
      items = tours.map((t) => ({ ...t, type: "tour", status: t.status }));
      total = cnt;
    }

    // Tính thêm stats cho mỗi tour (bookings count, revenue, rating)
    const tourIds = items.filter((i) => i.type === "tour").map((t) => t._id);
    if (tourIds.length > 0) {
      const statsAgg = await Booking.aggregate([
        {
          $match: {
            tour_id: { $in: tourIds },
            status: { $in: ["paid", "completed"] },
          },
        },
        {
          $group: {
            _id: "$tour_id",
            booking_count: { $sum: 1 },
            total_revenue: {
              $sum: { $ifNull: ["$paid_amount", "$total_price", 0] },
            },
          },
        },
      ]);

      const statsMap = new Map(statsAgg.map((s) => [String(s._id), s]));

      items = items.map((item) => {
        if (item.type === "tour") {
          const stats = statsMap.get(String(item._id)) || {
            booking_count: 0,
            total_revenue: 0,
          };

          // Kiểm tra quyền chỉnh sửa (có edit_allowed_until và còn hiệu lực)
          const canEdit = item.edit_allowed_until && new Date(item.edit_allowed_until) > new Date();

          return {
            ...item,
            booking_count: stats.booking_count,
            total_revenue: stats.total_revenue,
            average_rating: item.average_rating || 0,
            // Thông tin quyền chỉnh sửa
            canEdit: canEdit || item.displayStatus === "pending",
            edit_allowed_until: item.edit_allowed_until || null,
          };
        }
        return item;
      });
    }

    return res.json({ items, total, page: pg, pageSize: lm });
  } catch (err) {
    console.error("getGuideTours error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
}

/**
 * DELETE /api/guides/me/tours/:id
 * Xóa tour/tour-request của guide
 */
export async function deleteGuideTour(req, res) {
  try {
    const guideId = req.user._id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Thử tìm trong TourRequest trước (chỉ pending mới xóa được)
    const request = await TourRequest.findOne({ _id: id, created_by: guideId });
    if (request) {
      if (request.status !== "pending") {
        return res
          .status(403)
          .json({ message: "Chỉ có thể xóa yêu cầu đang chờ duyệt" });
      }
      await TourRequest.deleteOne({ _id: id });
      return res.json({ message: "Đã xóa yêu cầu tạo tour" });
    }

    // Tìm trong Tour (chỉ xóa nếu guide là owner và tour chưa có booking)
    const tour = await Tour.findOne({ _id: id, "guides.guideId": guideId });
    if (!tour) {
      return res.status(404).json({ message: "Không tìm thấy tour" });
    }

    // Check nếu tour đã có booking
    const hasBooking = await Booking.exists({ tour_id: id });
    if (hasBooking) {
      return res
        .status(403)
        .json({ message: "Không thể xóa tour đã có booking" });
    }

    await Tour.deleteOne({ _id: id });
    return res.json({ message: "Đã xóa tour thành công" });
  } catch (err) {
    console.error("deleteGuideTour error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
}

/**
 * GET /api/guides/me/weekly-stats
 * Tính hiệu quả tuần này của HDV
 * - Tỷ lệ phản hồi: (approved + rejected) / total requests trong tuần
 * - Tỷ lệ hoàn thành: completed tours / total confirmed tours trong tuần
 */
export async function getGuideWeeklyStats(req, res) {
  try {
    const guideId = req.user._id;

    // Tính ngày đầu tuần (Thứ 2) và cuối tuần (Chủ nhật)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = CN, 1 = T2, ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // 1. Tính tỷ lệ phản hồi
    // Tổng yêu cầu nhận được trong tuần
    const totalRequests = await Booking.countDocuments({
      intended_guide_id: guideId,
      createdAt: { $gte: startOfWeek, $lt: endOfWeek },
    });

    // Yêu cầu đã xử lý (confirmed, rejected, completed, paid)
    const processedRequests = await Booking.countDocuments({
      intended_guide_id: guideId,
      createdAt: { $gte: startOfWeek, $lt: endOfWeek },
      status: { $in: ["confirmed", "rejected", "completed", "paid"] },
    });

    const responseRate =
      totalRequests > 0
        ? Math.round((processedRequests / totalRequests) * 100)
        : 100;

    // 2. Tính tỷ lệ hoàn thành
    // Tours đã confirmed trong tuần (sẽ diễn ra)
    const confirmedTours = await Booking.countDocuments({
      intended_guide_id: guideId,
      status: { $in: ["confirmed", "completed", "paid"] },
      start_date: { $gte: startOfWeek, $lt: endOfWeek },
    });

    // Tours đã hoàn thành trong tuần
    const completedTours = await Booking.countDocuments({
      intended_guide_id: guideId,
      status: { $in: ["completed", "paid"] },
      start_date: { $gte: startOfWeek, $lt: endOfWeek },
    });

    const completionRate =
      confirmedTours > 0
        ? Math.round((completedTours / confirmedTours) * 100)
        : 100;

    return res.json({
      weekStart: startOfWeek.toISOString(),
      weekEnd: endOfWeek.toISOString(),
      response: {
        processed: processedRequests,
        total: totalRequests,
        rate: responseRate,
      },
      completion: {
        completed: completedTours,
        total: confirmedTours,
        rate: completionRate,
      },
    });
  } catch (err) {
    console.error("getGuideWeeklyStats error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
}

/**
 * GET /api/guides/me/tours/:id
 * Lấy chi tiết tour của guide với thông tin quyền chỉnh sửa
 */
export async function getGuideTourDetail(req, res) {
  try {
    const guideId = req.user._id;
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Thử tìm trong TourRequest trước (pending/rejected)
    const request = await TourRequest.findOne({ _id: id, created_by: guideId })
      .populate("categories", "name")
      .populate("guides.guideId", "name avatar_url")
      .populate("locations.locationId", "name slug")
      .populate("itinerary.locationId", "name")
      .lean();

    if (request) {
      return res.json({
        ...request,
        type: "request",
        canEdit: request.status === "pending", // Chỉ edit được khi đang pending
        edit_allowed_until: null,
      });
    }

    // Tìm trong Tour
    const tour = await Tour.findOne({ _id: id, "guides.guideId": guideId })
      .populate("category_id", "name")
      .populate("guides.guideId", "name avatar_url")
      .populate("locations.locationId", "name slug")
      .populate("itinerary.locationId", "name")
      .select("+edit_allowed_until +last_approved_edit_request")
      .lean();

    if (!tour) {
      return res.status(404).json({ message: "Không tìm thấy tour" });
    }

    // Kiểm tra quyền chỉnh sửa
    const isPending = tour.approval?.status === "pending";
    const hasEditPermission = tour.edit_allowed_until && new Date(tour.edit_allowed_until) > new Date();
    const canEdit = isPending || hasEditPermission;

    return res.json({
      ...tour,
      type: "tour",
      canEdit,
      edit_allowed_until: tour.edit_allowed_until || null,
    });
  } catch (err) {
    console.error("getGuideTourDetail error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
}
