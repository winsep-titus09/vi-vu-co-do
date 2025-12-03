import User from "../models/User.js";
import bcrypt from "bcrypt";
import { updateProfileSchema } from "../utils/validator.js";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../services/uploader.js";
import BlacklistedToken from "../models/BlacklistedToken.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import { v2 as cloudinary } from "cloudinary";

// controllers/users.controller.js
export const getProfile = async (req, res) => {
  try {
    const user = req.user; // từ middleware auth
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const userId = user._id;

    // Thực hiện đồng thời các truy vấn để hiệu năng tốt hơn
    const now = new Date();

    const [
      totalBookings,
      completedBookings,
      upcomingBookings,
      // reviewsCount via aggregation (lookup booking -> match customer_id)
      reviewsAgg,
      pendingReviewsAgg,
    ] = await Promise.all([
      Booking.countDocuments({ customer_id: userId }),
      Booking.countDocuments({ customer_id: userId, status: "completed" }),
      Booking.countDocuments({
        customer_id: userId,
        start_date: { $gt: now },
        status: { $nin: ["canceled", "rejected", "completed"] },
      }),
      // reviewsCount: join reviews -> bookings -> filter customer_id
      Review.aggregate([
        {
          $lookup: {
            from: "bookings",
            localField: "bookingId",
            foreignField: "_id",
            as: "booking",
          },
        },
        { $unwind: "$booking" },
        { $match: { "booking.customer_id": userId } },
        { $count: "count" },
      ]),
      // pendingReviewsCount: bookings completed but no review
      Booking.aggregate([
        { $match: { customer_id: userId, status: "completed" } },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "bookingId",
            as: "review",
          },
        },
        { $match: { "review.0": { $exists: false } } },
        { $count: "count" },
      ]),
    ]);

    const reviewsCount =
      reviewsAgg && reviewsAgg[0] && reviewsAgg[0].count
        ? reviewsAgg[0].count
        : 0;
    const pendingReviewsCount =
      pendingReviewsAgg && pendingReviewsAgg[0] && pendingReviewsAgg[0].count
        ? pendingReviewsAgg[0].count
        : 0;

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone_number,
      avatar_url: user.avatar_url,
      role: user.role_id?.name,
      status: user.status,
      createdAt: user.createdAt,
      stats: {
        totalBookings: Number(totalBookings || 0),
        completedBookings: Number(completedBookings || 0),
        upcomingBookings: Number(upcomingBookings || 0),
        reviewsCount: Number(reviewsCount || 0),
        pendingReviewsCount: Number(pendingReviewsCount || 0),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join("; ");
      return res.status(400).json({ message: msg });
    }

    const { name, phone_number, avatar_url } = parsed.data;
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(name && { name }),
          ...(phone_number && { phone_number }),
          ...(avatar_url && { avatar_url }),
        },
      },
      { new: true }
    ).populate("role_id");

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    res.json({
      message: "Cập nhật hồ sơ thành công",
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        phone_number: updated.phone_number,
        avatar_url: updated.avatar_url,
        role: updated.role_id?.name,
        status: updated.status,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

/** PUT /api/users/me/avatar (Form-Data) - field: avatar */
export const updateProfileWithAvatar = async (req, res) => {
  try {
    const user = req.user; // đã populate role
    if (!req.file)
      return res.status(400).json({ message: "Thiếu file ảnh 'avatar'." });

    // (tùy chọn) xóa ảnh cũ nếu bạn lưu public_id trong user
    // Ví dụ: bạn có thể lưu public_id trong user.avatar_public_id
    // await deleteFromCloudinary(user.avatar_public_id);

    // upload ảnh mới
    const result = await uploadBufferToCloudinary(req.file.buffer, "avatars", {
      // transformation ví dụ: resize về 400x400, crop center
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "faces" },
      ],
    });

    const updated = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          avatar_url:
            result.secure_url /*, avatar_public_id: result.public_id */,
        },
      },
      { new: true }
    ).populate("role_id");

    res.json({
      message: "Cập nhật avatar thành công",
      user: {
        id: updated._id,
        name: updated.name,
        email: updated.email,
        phone_number: updated.phone_number,
        avatar_url: updated.avatar_url,
        role: updated.role_id?.name,
        status: updated.status,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Upload avatar thất bại", error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới." });
    }

    if (new_password.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải dài ít nhất 6 ký tự." });
    }

    // Lấy user hiện tại
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    // So sánh mật khẩu cũ
    const match = await bcrypt.compare(current_password, user.password);
    if (!match)
      return res.status(401).json({ message: "Mật khẩu cũ không đúng." });

    // Hash mật khẩu mới
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
    const hashed = await bcrypt.hash(new_password, saltRounds);

    // Cập nhật mật khẩu
    user.password = hashed;
    await user.save();

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    await BlacklistedToken.create({
      token,
      expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res.json({
      message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
    });
  } catch (err) {
    console.error("changePassword error:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

/**
 * GET /api/users/me/preferences
 * Lấy preferences của user hiện tại
 */
export const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("preferences");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    // Trả về preferences với default values nếu chưa có
    const defaultPreferences = {
      notifications: {
        booking: true,
        promo: false,
        system: true,
      },
      display: {
        quality_3d: "auto",
        currency: "vnd",
      },
    };

    res.json({
      preferences: user.preferences || defaultPreferences,
    });
  } catch (err) {
    console.error("getPreferences error:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

/**
 * PUT /api/users/me/preferences
 * Cập nhật preferences của user
 * Body: { notifications?: {...}, display?: {...} }
 */
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notifications, display } = req.body;

    // Validate input
    if (notifications) {
      if (
        typeof notifications.booking !== "undefined" &&
        typeof notifications.booking !== "boolean"
      ) {
        return res
          .status(400)
          .json({ message: "notifications.booking phải là boolean" });
      }
      if (
        typeof notifications.promo !== "undefined" &&
        typeof notifications.promo !== "boolean"
      ) {
        return res
          .status(400)
          .json({ message: "notifications.promo phải là boolean" });
      }
      if (
        typeof notifications.system !== "undefined" &&
        typeof notifications.system !== "boolean"
      ) {
        return res
          .status(400)
          .json({ message: "notifications.system phải là boolean" });
      }
    }

    if (display) {
      if (
        display.quality_3d &&
        !["auto", "low", "high"].includes(display.quality_3d)
      ) {
        return res.status(400).json({
          message: "display.quality_3d phải là 'auto', 'low' hoặc 'high'",
        });
      }
      if (display.currency && !["vnd", "usd"].includes(display.currency)) {
        return res
          .status(400)
          .json({ message: "display.currency phải là 'vnd' hoặc 'usd'" });
      }
    }

    // Build update object
    const updateObj = {};
    if (notifications) {
      if (typeof notifications.booking === "boolean") {
        updateObj["preferences.notifications.booking"] = notifications.booking;
      }
      if (typeof notifications.promo === "boolean") {
        updateObj["preferences.notifications.promo"] = notifications.promo;
      }
      if (typeof notifications.system === "boolean") {
        updateObj["preferences.notifications.system"] = notifications.system;
      }
    }
    if (display) {
      if (display.quality_3d) {
        updateObj["preferences.display.quality_3d"] = display.quality_3d;
      }
      if (display.currency) {
        updateObj["preferences.display.currency"] = display.currency;
      }
    }

    if (Object.keys(updateObj).length === 0) {
      return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: updateObj },
      { new: true }
    ).select("preferences");

    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    res.json({
      message: "Cập nhật cài đặt thành công",
      preferences: updated.preferences,
    });
  } catch (err) {
    console.error("updatePreferences error:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

/**
 * POST /api/users/me/delete-request
 * User yêu cầu xóa tài khoản
 * Body: { reason?: string }
 */
export const requestDeleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reason } = req.body;

    const user = await User.findById(userId).populate("role_id", "name");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    // Admin không được tự xóa
    if (user.role_id?.name === "admin") {
      return res
        .status(400)
        .json({ message: "Admin không thể yêu cầu xóa tài khoản." });
    }

    // Check if already has pending request
    if (user.delete_request?.status === "pending") {
      return res
        .status(400)
        .json({ message: "Bạn đã có yêu cầu xóa tài khoản đang chờ duyệt." });
    }

    // Update delete request
    user.delete_request = {
      status: "pending",
      reason: reason || "",
      requested_at: new Date(),
      reviewed_at: null,
      reviewed_by: null,
      admin_notes: "",
    };
    await user.save();

    res.json({
      message:
        "Yêu cầu xóa tài khoản đã được gửi. Admin sẽ xem xét và phản hồi.",
      delete_request: user.delete_request,
    });
  } catch (err) {
    console.error("requestDeleteAccount error:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

/**
 * DELETE /api/users/me/delete-request
 * User hủy yêu cầu xóa tài khoản
 */
export const cancelDeleteRequest = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    if (user.delete_request?.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Không có yêu cầu xóa nào đang chờ duyệt." });
    }

    user.delete_request = {
      status: "none",
      reason: "",
      requested_at: null,
      reviewed_at: null,
      reviewed_by: null,
      admin_notes: "",
    };
    await user.save();

    res.json({ message: "Đã hủy yêu cầu xóa tài khoản." });
  } catch (err) {
    console.error("cancelDeleteRequest error:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

/**
 * GET /api/users/me/delete-request
 * Lấy trạng thái yêu cầu xóa tài khoản
 */
export const getDeleteRequestStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("delete_request");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    res.json({
      delete_request: user.delete_request || { status: "none" },
    });
  } catch (err) {
    console.error("getDeleteRequestStatus error:", err.message);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};
