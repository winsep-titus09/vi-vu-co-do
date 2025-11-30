// server/controllers/reviews.controller.js
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import LocationReview from "../models/LocationReview.js";
import User from "../models/User.js";
import { notifyUser } from "../services/notify.js";
import {
  createTourReviewSchema,
  createGuideReviewSchema,
} from "../utils/validator.js";

// Kiểm tra quyền + điều kiện thời gian
async function ensureCanReview(req, bookingId) {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return { status: 400, json: { message: "bookingId không hợp lệ." } };
  }
  const booking = await Booking.findById(bookingId).lean();
  if (!booking)
    return { status: 404, json: { message: "Không tìm thấy booking." } };

  if (String(booking.customer_id) !== String(req.user?._id)) {
    return {
      status: 403,
      json: { message: "Bạn không có quyền đánh giá booking này." },
    };
  }

  if (!booking.end_date) {
    return { status: 400, json: { message: "Booking chưa có ngày kết thúc." } };
  }
  const now = new Date();
  if (now < new Date(booking.end_date)) {
    return {
      status: 400,
      json: { message: "Chỉ được đánh giá sau khi tour đã kết thúc." },
    };
  }

  return { booking };
}

// B1: Đánh giá Tour
export const createTourReview = async (req, res) => {
  try {
    const parsed = createTourReviewSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const msg = parsed.error?.issues?.[0]?.message || "Dữ liệu không hợp lệ.";
      return res
        .status(400)
        .json({ message: msg, errors: parsed.error.issues });
    }
    const { bookingId, tour_rating, tour_comment } = parsed.data;

    const check = await ensureCanReview(req, bookingId);
    if (check.status) return res.status(check.status).json(check.json);
    const { booking } = check;

    const existed = await Review.findOne({ bookingId }).lean();
    if (existed?.tour_rating) {
      return res
        .status(409)
        .json({ message: "Bạn đã đánh giá Tour cho booking này rồi." });
    }

    const review = await Review.findOneAndUpdate(
      { bookingId },
      {
        $set: {
          tour_rating,
          tour_comment: tour_comment ?? null,
          tour_rated_at: new Date(),
        },
        $setOnInsert: {
          guide_comment: null,
          guide_rating: undefined,
          guide_rated_at: null,
        },
      },
      { new: true, upsert: true }
    );

    // Nhắc bước 2: đánh giá HDV
    try {
      await notifyUser({
        userId: booking.customer_id,
        type: "review:prompt:guide",
        content: "Bạn đã đánh giá tour. Hãy tiếp tục đánh giá hướng dẫn viên.",
        url: `/booking/${booking._id}/review/guide`,
        meta: {
          bookingId: booking._id,
          tourId: booking.tour_id,
          guideId: booking.intended_guide_id,
        },
      });
    } catch {
      /* ignore */
    }

    return res
      .status(201)
      .json({ message: "Đã ghi nhận đánh giá Tour.", review });
  } catch (err) {
    console.error("createTourReview error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// B2: Đánh giá HDV
export const createGuideReview = async (req, res) => {
  try {
    const parsed = createGuideReviewSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const msg = parsed.error?.issues?.[0]?.message || "Dữ liệu không hợp lệ.";
      return res
        .status(400)
        .json({ message: msg, errors: parsed.error.issues });
    }
    const { bookingId, guide_rating, guide_comment } = parsed.data;

    const check = await ensureCanReview(req, bookingId);
    if (check.status) return res.status(check.status).json(check.json);

    const existed = await Review.findOne({ bookingId }).lean();
    if (existed?.guide_rating) {
      return res
        .status(409)
        .json({ message: "Bạn đã đánh giá HDV cho booking này rồi." });
    }

    const review = await Review.findOneAndUpdate(
      { bookingId },
      {
        $set: {
          guide_rating,
          guide_comment: guide_comment ?? null,
          guide_rated_at: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    return res
      .status(201)
      .json({ message: "Đã ghi nhận đánh giá HDV.", review });
  } catch (err) {
    console.error("createGuideReview error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Xem review theo booking (chủ booking)
export const getReviewForBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Kiểm tra quyền xem: bắt buộc booking tồn tại và thuộc user
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "bookingId không hợp lệ." });
    }
    const booking = await Booking.findById(bookingId).lean();
    if (!booking)
      return res.status(404).json({ message: "Không tìm thấy booking." });
    if (String(booking.customer_id) !== String(req.user?._id)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xem review của booking này." });
    }

    const review = await Review.findOne({ bookingId }).lean();
    if (!review)
      return res
        .status(404)
        .json({ message: "Chưa có đánh giá cho booking này." });
    return res.json({ review });
  } catch (err) {
    console.error("getReviewForBooking error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Stats trung bình cho Tour
export const getTourRatingStats = async (req, res) => {
  try {
    const { tourId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({ message: "tourId không hợp lệ." });
    }

    const [stats] = await Booking.aggregate([
      { $match: { tour_id: new mongoose.Types.ObjectId(tourId) } },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "bookingId",
          as: "rev",
        },
      },
      { $unwind: "$rev" },
      { $match: { "rev.tour_rating": { $type: "number" } } },
      {
        $group: {
          _id: "$tour_id",
          avg_tour_rating: { $avg: "$rev.tour_rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.json({
      tourId,
      avg_tour_rating: stats?.avg_tour_rating ?? null,
      count: stats?.count ?? 0,
    });
  } catch (err) {
    console.error("getTourRatingStats error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Stats trung bình cho HDV
export const getGuideRatingStats = async (req, res) => {
  try {
    const { guideId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(guideId)) {
      return res.status(400).json({ message: "guideId không hợp lệ." });
    }

    const [stats] = await Booking.aggregate([
      { $match: { intended_guide_id: new mongoose.Types.ObjectId(guideId) } },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "bookingId",
          as: "rev",
        },
      },
      { $unwind: "$rev" },
      { $match: { "rev.guide_rating": { $type: "number" } } },
      {
        $group: {
          _id: "$intended_guide_id",
          avg_guide_rating: { $avg: "$rev.guide_rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.json({
      guideId,
      avg_guide_rating: stats?.avg_guide_rating ?? null,
      count: stats?.count ?? 0,
    });
  } catch (err) {
    console.error("getGuideRatingStats error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// PUBLIC: Listing reviews theo Tour (phân trang)
export const listTourReviewsPublic = async (req, res) => {
  try {
    const { tourId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({ message: "tourId không hợp lệ." });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      50
    );
    const sort = (req.query.sort || "newest").toString();

    const now = new Date();
    const matchBooking = {
      tour_id: new mongoose.Types.ObjectId(tourId),
      end_date: { $lte: now },
      status: { $in: ["paid", "completed"] },
    };

    const sortStage =
      sort === "highest"
        ? { rating: -1, createdAt: -1 }
        : sort === "lowest"
        ? { rating: 1, createdAt: -1 }
        : { createdAt: -1 };

    const [result] = await Booking.aggregate([
      { $match: matchBooking },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "bookingId",
          as: "rev",
        },
      },
      { $unwind: "$rev" },
      { $match: { "rev.tour_rating": { $type: "number" } } },
      {
        $lookup: {
          from: "users",
          localField: "customer_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          rating: "$rev.tour_rating",
          comment: "$rev.tour_comment",
          createdAt: "$rev.createdAt",
          reviewer: { name: "$user.name", avatar_url: "$user.avatar_url" },
        },
      },
      {
        $facet: {
          items: [
            { $sort: sortStage },
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          meta: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                avg_rating: { $avg: "$rating" },
              },
            },
          ],
        },
      },
    ]);

    const items = result?.items || [];
    const meta = result?.meta?.[0] || { count: 0, avg_rating: null };

    return res.json({
      items,
      page,
      limit,
      total: meta.count || 0,
      avg_rating: meta.avg_rating ?? null,
    });
  } catch (err) {
    console.error("listTourReviewsPublic error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// PUBLIC: Listing reviews theo HDV (phân trang)
export const listGuideReviewsPublic = async (req, res) => {
  try {
    const { guideId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(guideId)) {
      return res.status(400).json({ message: "guideId không hợp lệ." });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      50
    );
    const sort = (req.query.sort || "newest").toString();

    const now = new Date();
    const matchBooking = {
      intended_guide_id: new mongoose.Types.ObjectId(guideId),
      end_date: { $lte: now },
      status: { $in: ["paid", "completed"] },
    };

    const sortStage =
      sort === "highest"
        ? { rating: -1, createdAt: -1 }
        : sort === "lowest"
        ? { rating: 1, createdAt: -1 }
        : { createdAt: -1 };

    const [result] = await Booking.aggregate([
      { $match: matchBooking },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "bookingId",
          as: "rev",
        },
      },
      { $unwind: "$rev" },
      { $match: { "rev.guide_rating": { $type: "number" } } },
      {
        $lookup: {
          from: "users",
          localField: "customer_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          rating: "$rev.guide_rating",
          comment: "$rev.guide_comment",
          createdAt: "$rev.createdAt",
          reviewer: { name: "$user.name", avatar_url: "$user.avatar_url" },
        },
      },
      {
        $facet: {
          items: [
            { $sort: sortStage },
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          meta: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                avg_rating: { $avg: "$rating" },
              },
            },
          ],
        },
      },
    ]);

    const items = result?.items || [];
    const meta = result?.meta?.[0] || { count: 0, avg_rating: null };

    return res.json({
      items,
      page,
      limit,
      total: meta.count || 0,
      avg_rating: meta.avg_rating ?? null,
    });
  } catch (err) {
    console.error("listGuideReviewsPublic error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// ========================================
// LOCATION REVIEWS
// ========================================

/** POST /api/reviews/locations/:locationId - Create location review */
export const createLocationReview = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { rating, comment, visit_date } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Chưa đăng nhập." });
    }

    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      return res.status(400).json({ message: "Location ID không hợp lệ." });
    }

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating phải từ 1-5 sao." });
    }

    if (comment && comment.length > 1000) {
      return res
        .status(400)
        .json({ message: "Comment không được vượt quá 1000 ký tự." });
    }

    // Check if location exists
    const Location = mongoose.model("Location");
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ message: "Không tìm thấy địa điểm." });
    }

    // Check if user already reviewed this location
    const existingReview = await LocationReview.findOne({
      location_id: locationId,
      user_id: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        message:
          "Bạn đã đánh giá địa điểm này rồi. Vui lòng cập nhật đánh giá cũ.",
      });
    }

    // Create review
    const review = await LocationReview.create({
      location_id: locationId,
      user_id: userId,
      rating,
      comment: comment || "",
      visit_date: visit_date || null,
      status: "approved",
    });

    // Populate user info
    await review.populate("user_id", "name avatar_url");

    return res.status(201).json({
      message: "Đánh giá thành công!",
      review,
    });
  } catch (err) {
    console.error("createLocationReview error:", err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Bạn đã đánh giá địa điểm này rồi." });
    }
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/** GET /api/reviews/locations/:locationId - List location reviews */
export const listLocationReviews = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      return res.status(400).json({ message: "Location ID không hợp lệ." });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const sortStage =
      sort === "createdAt" ? { createdAt: 1 } : { createdAt: -1 };

    const result = await LocationReview.aggregate([
      {
        $match: {
          location_id: new mongoose.Types.ObjectId(locationId),
          status: "approved",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          rating: 1,
          comment: 1,
          visit_date: 1,
          helpful_count: 1,
          createdAt: 1,
          reviewer: {
            _id: "$user._id",
            name: "$user.name",
            avatar_url: "$user.avatar_url",
          },
        },
      },
      {
        $facet: {
          items: [
            { $sort: sortStage },
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
          ],
          meta: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                avg_rating: { $avg: "$rating" },
              },
            },
          ],
        },
      },
    ]);

    const items = result[0]?.items || [];
    const meta = result[0]?.meta?.[0] || { count: 0, avg_rating: null };

    return res.json({
      items,
      page: pageNum,
      limit: limitNum,
      total: meta.count || 0,
      avg_rating: meta.avg_rating
        ? Math.round(meta.avg_rating * 10) / 10
        : null,
    });
  } catch (err) {
    console.error("listLocationReviews error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/** GET /api/reviews/locations/:locationId/stats - Get location rating stats */
export const getLocationRatingStats = async (req, res) => {
  try {
    const { locationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(locationId)) {
      return res.status(400).json({ message: "Location ID không hợp lệ." });
    }

    const stats = await LocationReview.aggregate([
      {
        $match: {
          location_id: new mongoose.Types.ObjectId(locationId),
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          average: { $avg: "$rating" },
          five_star: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          four_star: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          three_star: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          two_star: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          one_star: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        },
      },
    ]);

    if (stats.length === 0) {
      return res.json({
        total: 0,
        average: 0,
        distribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      });
    }

    const data = stats[0];
    return res.json({
      total: data.total,
      average: Math.round(data.average * 10) / 10,
      distribution: {
        5: data.five_star,
        4: data.four_star,
        3: data.three_star,
        2: data.two_star,
        1: data.one_star,
      },
    });
  } catch (err) {
    console.error("getLocationRatingStats error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};
