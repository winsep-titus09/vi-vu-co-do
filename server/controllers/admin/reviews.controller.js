// server/controllers/admin/reviews.controller.js
import mongoose from "mongoose";
import Review from "../../models/Review.js";
import Booking from "../../models/Booking.js";
import Tour from "../../models/Tour.js";
import User from "../../models/User.js";

/**
 * GET /api/admin/reviews
 * List all reviews with pagination and filters
 */
export const listReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      minRating,
      maxRating,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};

    // Filter by status
    if (status && status !== "all") {
      filter.status = status;
    }

    // Filter by rating range
    if (minRating) {
      filter.$or = [
        { tour_rating: { $gte: parseInt(minRating) } },
        { guide_rating: { $gte: parseInt(minRating) } },
      ];
    }
    if (maxRating) {
      const ratingFilter = { $lte: parseInt(maxRating) };
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          {
            $or: [
              { tour_rating: ratingFilter },
              { guide_rating: ratingFilter },
            ],
          },
        ];
        delete filter.$or;
      } else {
        filter.$or = [
          { tour_rating: ratingFilter },
          { guide_rating: ratingFilter },
        ];
      }
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Fetch reviews with booking info
    const reviews = await Review.find(filter)
      .populate({
        path: "bookingId",
        select: "customer_id tour_id start_date end_date",
        populate: [
          { path: "customer_id", select: "name email avatar" },
          { path: "tour_id", select: "name slug cover_image" },
        ],
      })
      .populate("reported_by", "name email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Search filter (post-query because of nested populate)
    let filteredReviews = reviews;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredReviews = reviews.filter((r) => {
        const userName = r.bookingId?.customer_id?.name?.toLowerCase() || "";
        const tourName = r.bookingId?.tour_id?.name?.toLowerCase() || "";
        const tourComment = r.tour_comment?.toLowerCase() || "";
        const guideComment = r.guide_comment?.toLowerCase() || "";
        return (
          userName.includes(searchLower) ||
          tourName.includes(searchLower) ||
          tourComment.includes(searchLower) ||
          guideComment.includes(searchLower)
        );
      });
    }

    // Transform reviews
    const transformedReviews = filteredReviews.map((r) => ({
      _id: r._id,
      user: r.bookingId?.customer_id || null,
      tour: r.bookingId?.tour_id || null,
      tour_rating: r.tour_rating,
      guide_rating: r.guide_rating,
      tour_comment: r.tour_comment,
      guide_comment: r.guide_comment,
      guide_reply: r.guide_reply,
      guide_reply_at: r.guide_reply_at,
      status: r.status || "published",
      report_reason: r.report_reason,
      reported_at: r.reported_at,
      reported_by: r.reported_by,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    const total = await Review.countDocuments(filter);

    res.json({
      reviews: transformedReviews,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error("listReviews error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * GET /api/admin/reviews/stats
 * Get review statistics
 */
export const getReviewStats = async (req, res) => {
  try {
    const [totalCount, publishedCount, hiddenCount, reportedCount] =
      await Promise.all([
        Review.countDocuments(),
        Review.countDocuments({ status: "published" }),
        Review.countDocuments({ status: "hidden" }),
        Review.countDocuments({ status: "reported" }),
      ]);

    // Average ratings
    const ratingStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          avgTourRating: { $avg: "$tour_rating" },
          avgGuideRating: { $avg: "$guide_rating" },
          totalTourReviews: {
            $sum: { $cond: [{ $gt: ["$tour_rating", 0] }, 1, 0] },
          },
          totalGuideReviews: {
            $sum: { $cond: [{ $gt: ["$guide_rating", 0] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      total: totalCount,
      published: publishedCount,
      hidden: hiddenCount,
      reported: reportedCount,
      avgTourRating: ratingStats[0]?.avgTourRating?.toFixed(1) || 0,
      avgGuideRating: ratingStats[0]?.avgGuideRating?.toFixed(1) || 0,
      totalTourReviews: ratingStats[0]?.totalTourReviews || 0,
      totalGuideReviews: ratingStats[0]?.totalGuideReviews || 0,
    });
  } catch (err) {
    console.error("getReviewStats error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * PUT /api/admin/reviews/:id/status
 * Update review status (publish, hide, report)
 */
export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, report_reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    if (!["published", "hidden", "reported"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá." });
    }

    review.status = status;

    // If marking as reported, add reason
    if (status === "reported") {
      review.report_reason = report_reason || null;
      review.reported_at = new Date();
      review.reported_by = req.user._id;
    } else {
      // Clear report info if publishing or hiding
      review.report_reason = null;
      review.reported_at = null;
      review.reported_by = null;
    }

    await review.save();

    res.json({
      message:
        status === "published"
          ? "Đã duyệt đánh giá."
          : status === "hidden"
          ? "Đã ẩn đánh giá."
          : "Đã đánh dấu báo cáo.",
      review,
    });
  } catch (err) {
    console.error("updateReviewStatus error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * DELETE /api/admin/reviews/:id
 * Permanently delete a review
 */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá." });
    }

    await review.deleteOne();

    res.json({ message: "Đã xóa đánh giá vĩnh viễn." });
  } catch (err) {
    console.error("deleteReview error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};
