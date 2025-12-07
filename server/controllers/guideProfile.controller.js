// controllers/guideProfile.controller.js
import GuideProfile from "../models/GuideProfile.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import { uploadVideoBufferToCloudinary } from "../services/uploader.js";
import multer from "multer";
import mongoose from "mongoose";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// Middleware: chỉ parse multipart nếu có file
export const uploadGuideVideo = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    return upload.single("video")(req, res, next);
  }
  // Nếu không phải multipart, bỏ qua multer
  next();
};

/** Xem hồ sơ của chính mình */
export const getMyGuideProfile = async (req, res) => {
  try {
    // Lấy thông tin user
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user." });
    }

    // Lấy hoặc tạo guide profile
    let profile = await GuideProfile.findOne({ user_id: req.user._id });

    if (!profile) {
      profile = await GuideProfile.create({
        user_id: req.user._id,
        introduction: "",
        cover_image_url: "",
        experience: "",
        languages: ["Tiếng Việt"],
        bank_account: {
          bank_name: "",
          account_number: "",
          account_holder: "",
        },
        certificates: [],
        expertise: "",
      });
    }

    // Kết hợp thông tin user và guide profile
    const combinedProfile = {
      _id: profile._id,
      user_id: profile.user_id,
      // Từ User model
      name: user.name,
      email: user.email,
      phone: user.phone_number || "",
      avatar_url: user.avatar_url || "",
      cover_image_url: profile.cover_image_url || "",
      balance: user.balance || 0,
      // Từ GuideProfile model
      introduction: profile.introduction || "",
      bio_video_url: profile.bio_video_url || "",
      experience: profile.experience || "",
      languages: profile.languages || [],
      expertise: profile.expertise || "",
      certificates: profile.certificates || [],
      is_featured: profile.is_featured,
      status: profile.status,
      // Bank account (flatten for easier frontend use)
      bank_name: profile.bank_account?.bank_name || "",
      bank_account_number: profile.bank_account?.account_number || "",
      bank_account_name: profile.bank_account?.account_holder || "",
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };

    res.json(combinedProfile);
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

    // Cập nhật User model (name, phone, avatar)
    const userUpdateData = {};
    if (body.name !== undefined) userUpdateData.name = body.name;
    if (body.phone !== undefined) userUpdateData.phone_number = body.phone;
    if (body.avatar_url !== undefined)
      userUpdateData.avatar_url = body.avatar_url;

    if (Object.keys(userUpdateData).length > 0) {
      await User.findByIdAndUpdate(req.user._id, { $set: userUpdateData });
    }

    // Cập nhật GuideProfile model
    const profileUpdateData = {};

    if (body.introduction !== undefined)
      profileUpdateData.introduction = body.introduction;
    if (body.experience !== undefined)
      profileUpdateData.experience = body.experience;
    if (body.cover_image_url !== undefined)
      profileUpdateData.cover_image_url = body.cover_image_url;
    if (body.bio_video_url !== undefined)
      profileUpdateData.bio_video_url = body.bio_video_url;
    if (body.languages !== undefined)
      profileUpdateData.languages = parseMaybeJson(body.languages);
    if (body.expertise !== undefined) {
      profileUpdateData.expertise = (body.expertise || "").trim() || null;
    }
    if (body.certificates !== undefined) {
      profileUpdateData.certificates = parseMaybeJson(body.certificates);
    }

    // Bank account - có thể gửi riêng lẻ hoặc object
    if (body.bank_name || body.bank_account_number || body.bank_account_name) {
      // Lấy profile hiện tại để merge
      const currentProfile = await GuideProfile.findOne({
        user_id: req.user._id,
      });
      profileUpdateData.bank_account = {
        bank_name:
          body.bank_name || currentProfile?.bank_account?.bank_name || "",
        account_number:
          body.bank_account_number ||
          currentProfile?.bank_account?.account_number ||
          "",
        account_holder:
          body.bank_account_name ||
          currentProfile?.bank_account?.account_holder ||
          "",
      };
    } else if (body.bank_account) {
      profileUpdateData.bank_account = parseMaybeJson(body.bank_account);
    }

    // Nếu có file video
    if (req.file && req.file.buffer) {
      const uploaded = await uploadVideoBufferToCloudinary(
        req.file.buffer,
        "guides/videos"
      );
      profileUpdateData.bio_video_url = uploaded.secure_url;
    }

    const profile = await GuideProfile.findOneAndUpdate(
      { user_id: req.user._id },
      { $set: profileUpdateData },
      { new: true, upsert: true }
    );

    // Lấy user mới nhất
    const user = await User.findById(req.user._id).select("-password");

    // Trả về combined profile
    const combinedProfile = {
      _id: profile._id,
      user_id: profile.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone_number || "",
      avatar_url: user.avatar_url || "",
      cover_image_url: profile.cover_image_url || "",
      balance: user.balance || 0,
      introduction: profile.introduction || "",
      bio_video_url: profile.bio_video_url || "",
      experience: profile.experience || "",
      languages: profile.languages || [],
      expertise: profile.expertise || "",
      certificates: profile.certificates || [],
      is_featured: profile.is_featured,
      status: profile.status,
      bank_name: profile.bank_account?.bank_name || "",
      bank_account_number: profile.bank_account?.account_number || "",
      bank_account_name: profile.bank_account?.account_holder || "",
    };

    res.json({ message: "Cập nhật hồ sơ thành công.", data: combinedProfile });
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
      .populate("user_id", "name avatar_url bio cover_image_url email phone_number")
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

    // Cho phép FE lấy tất cả HDV đã duyệt; nếu muốn chỉ lấy nổi bật truyền featuredOnly=true
    const featuredOnly = String(req.query.featuredOnly || "false") === "true";

    const filter = { status: "approved" };
    if (featuredOnly) {
      filter.is_featured = true;
    }

    const items = await GuideProfile.find(filter)
      .select(
        "user_id introduction bio_video_url experience languages is_featured createdAt"
      )
      .populate("user_id", "name avatar_url")
      .sort({ is_featured: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({ items, limit, featuredOnly });
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
