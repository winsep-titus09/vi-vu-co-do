// controllers/guideProfile.controller.js
import GuideProfile from "../models/GuideProfile.js";
import Review from "../models/Review.js";
import { uploadVideoBufferToCloudinary } from "../services/uploader.js";
import multer from "multer";
import mongoose from "mongoose";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export const uploadGuideVideo = upload.single("video");

/** Xem hồ sơ của chính mình */
export const getMyGuideProfile = async (req, res) => {
  try {
    const profile = await GuideProfile.findOne({ user_id: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Chưa có hồ sơ hướng dẫn viên." });
    }
    res.json(profile);
  } catch (err) {
    console.error("getMyGuideProfile error:", err);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy hồ sơ của bạn." });
  }
};

/** Cập nhật hồ sơ hướng dẫn viên */
export const updateMyGuideProfile = async (req, res) => {
  try {
    const body = req.body || {};
    const parseMaybeJson = (v) => {
      if (!v) return undefined;
      try {
        return JSON.parse(v);
      } catch {
        return v;
      }
    };

    const updateData = {
      ...(body.introduction && { introduction: body.introduction }),
      ...(body.experience && { experience: body.experience }),
      ...(body.languages && { languages: parseMaybeJson(body.languages) }),
      ...(body.bank_account && {
        bank_account: parseMaybeJson(body.bank_account),
      }),
      ...(body.certificates && {
        certificates: parseMaybeJson(body.certificates),
      }),
      ...(typeof body.expertise !== "undefined" && {
        expertise: (body.expertise || "").trim() || null,
      }),
    };

    // Nếu có file video
    if (req.file && req.file.buffer) {
      const uploaded = await uploadVideoBufferToCloudinary(
        req.file.buffer,
        "guides/videos"
      );
      updateData.bio_video_url = uploaded.secure_url;
    }

    const profile = await GuideProfile.findOneAndUpdate(
      { user_id: req.user._id },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({ message: "Cập nhật hồ sơ thành công.", data: profile });
  } catch (err) {
    console.error("updateMyGuideProfile error:", err);
    res.status(500).json({ message: "Lỗi máy chủ khi cập nhật hồ sơ." });
  }
};

/** Xem hồ sơ HDV công khai (ẩn thông tin nhạy cảm) */
export const getPublicGuideProfile = async (req, res) => {
  try {
    const { guideId } = req.params;

    // Kiểm tra ObjectId hợp lệ (nếu dùng Mongo ObjectId cho user_id)
    if (!mongoose.Types.ObjectId.isValid(guideId)) {
      return res.status(400).json({ message: "guideId không hợp lệ." });
    }

    // Loại trừ các trường nhạy cảm: bank_account, __v
    const profile = await GuideProfile.findOne({ user_id: guideId })
      .select("-bank_account -__v")
      .populate("user_id", "name avatar_url bio cover_image_url")
      .lean();

    if (!profile) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy hồ sơ hướng dẫn viên." });
    }

    return res.json(profile);
  } catch (err) {
    console.error("getPublicGuideProfile error:", err);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ khi lấy hồ sơ hướng dẫn viên." });
  }
};

export const listFeaturedGuides = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 3, 1), 50);
    const items = await GuideProfile.find({
      status: "approved",
      is_featured: true,
    })
      .select(
        "user_id introduction bio_video_url experience languages is_featured createdAt"
      )
      .populate("user_id", "name avatar_url")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({ items, limit });
  } catch (err) {
    console.error("listFeaturedGuides error:", err);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ khi lấy HDV tiêu biểu." });
  }
};

export const listTopRatedGuides = async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 5, 1),
      100
    );
    const minReviews = Math.max(parseInt(req.query.minReviews, 10) || 1, 0);

    const agg = [
      {
        $match: {
          $or: [
            { intended_guide_id: { $exists: true, $ne: null } },
            { guide_id: { $exists: true, $ne: null } },
            { guideId: { $exists: true, $ne: null } },
          ],
        },
      },
      {
        $addFields: {
          _guideId: {
            $ifNull: [
              "$intended_guide_id",
              { $ifNull: ["$guide_id", "$guideId"] },
            ],
          },
          _rating: { $ifNull: ["$guide_rating", { $ifNull: ["$rating", 0] }] },
        },
      },
      {
        $group: {
          _id: "$_guideId",
          avgRating: { $avg: "$_rating" },
          reviewCount: { $sum: 1 },
        },
      },
      { $match: { reviewCount: { $gte: minReviews } } },
      { $sort: { avgRating: -1, reviewCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "guideprofiles",
          localField: "_id",
          foreignField: "user_id",
          as: "profile",
        },
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          guideId: "$user._id",
          name: "$user.name",
          avatar_url: "$user.avatar_url",
          avgRating: { $round: ["$avgRating", 2] },
          reviewCount: 1,
          introduction: "$profile.introduction",
          is_featured: "$profile.is_featured",
          source: { $literal: "rated" },
        },
      },
    ];

    let rated = await Review.aggregate(agg);
    if (!Array.isArray(rated)) rated = [];
    const needed = Math.max(limit - rated.length, 0);

    if (needed > 0) {
      // exclude already present
      const excludeIds = rated.map((r) => String(r.guideId));
      // fetch fallback guides: approved and featured first, then recent
      const fallbackProfiles = await GuideProfile.find({
        status: "approved",
        user_id: { $nin: excludeIds.map((id) => mongoose.Types.ObjectId(id)) },
      })
        .select("user_id introduction is_featured createdAt")
        .sort({ is_featured: -1, createdAt: -1 })
        .limit(needed)
        .lean();

      // populate user info for these profiles
      const userIds = fallbackProfiles.map((p) => p.user_id);
      const users = await User.find({ _id: { $in: userIds } })
        .select("name avatar_url")
        .lean();
      const usersMap = new Map(users.map((u) => [String(u._id), u]));

      const fallbackItems = fallbackProfiles.map((p) => {
        const u = usersMap.get(String(p.user_id)) || {};
        return {
          guideId: p.user_id,
          name: u.name || null,
          avatar_url: u.avatar_url || null,
          avgRating: null,
          reviewCount: 0,
          introduction: p.introduction || "",
          is_featured: !!p.is_featured,
          source: "fallback",
        };
      });

      rated = rated.concat(fallbackItems);
    }

    return res.json({
      ok: true,
      items: rated.slice(0, limit),
      limit,
      minReviews,
    });
  } catch (err) {
    console.error("listTopRatedGuides error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Server error", error: err.message });
  }
};
