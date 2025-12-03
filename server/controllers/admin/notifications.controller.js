/**
 * server/controllers/admin/notifications.controller.js
 *
 * Admin notifications controller: broadcast, history, stats
 */
import Notification from "../../models/Notification.js";
import User from "../../models/User.js";
import Role from "../../models/Role.js";
import { sendTemplateEmail } from "../../services/email.service.js";

// Helper: Get role IDs by names
async function getRoleIds(roleNames) {
  const roles = await Role.find({ name: { $in: roleNames } }).select("_id");
  return roles.map((r) => r._id);
}

// ============================================================================
// BROADCAST NOTIFICATION
// ============================================================================
/**
 * Send broadcast notification to users
 * POST /api/admin/notifications/broadcast
 * Body: { title, message, audience: 'all'|'tourist'|'guide', channels: { inApp, email } }
 */
export const broadcastNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      audience = "all",
      channels = { inApp: true, email: false },
    } = req.body;

    if (!title || !message) {
      return res
        .status(400)
        .json({ message: "Tiêu đề và nội dung là bắt buộc." });
    }

    // Build user filter based on audience
    // Note: User model uses role_id (ObjectId), not role (string)
    const userFilter = { status: { $ne: "banned" } };

    let targetRoles = [];
    if (audience === "tourist") {
      targetRoles = ["tourist"];
    } else if (audience === "guide") {
      targetRoles = ["guide"];
    } else {
      // all users (tourist + guide, exclude admin)
      targetRoles = ["tourist", "guide"];
    }

    const roleIds = await getRoleIds(targetRoles);
    userFilter.role_id = { $in: roleIds };

    const users = await User.find(userFilter).select("_id email name");

    if (users.length === 0) {
      return res
        .status(400)
        .json({ message: "Không tìm thấy người dùng nào để gửi." });
    }

    let inAppCount = 0;
    let emailCount = 0;

    // ========== OPTIMIZED: Bulk insert in-app notifications ==========
    if (channels.inApp) {
      const notificationDocs = users.map((user) => ({
        recipientId: user._id,
        type: "broadcast",
        channel: "in_app",
        content: `${title}: ${message}`,
        url: "/notifications",
        audience: "user",
        meta: { title, message, broadcastBy: req.user._id },
        is_read: false,
      }));

      // Bulk insert all notifications at once
      await Notification.insertMany(notificationDocs, { ordered: false });
      inAppCount = users.length;

      // Socket emit is handled by client polling or real-time subscription
    }

    // ========== OPTIMIZED: Parallel email sending (batch of 10) ==========
    if (channels.email) {
      const usersWithEmail = users.filter((u) => u.email);
      const BATCH_SIZE = 10;

      for (let i = 0; i < usersWithEmail.length; i += BATCH_SIZE) {
        const batch = usersWithEmail.slice(i, i + BATCH_SIZE);
        const emailPromises = batch.map((user) =>
          sendTemplateEmail({
            to: user.email,
            subject: title,
            templateKey: "broadcastNotification",
            data: {
              name: user.name || "Người dùng",
              title,
              message,
              supportEmail:
                process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || "",
            },
          }).catch((err) => {
            console.error(`Email to ${user.email} failed:`, err.message);
            return null;
          })
        );

        const results = await Promise.all(emailPromises);
        emailCount += results.filter((r) => r !== null).length;
      }
    }

    // Save broadcast record to notification history
    await Notification.create({
      audience: "admin",
      type: "broadcast:sent",
      content: `Đã gửi broadcast "${title}" đến ${users.length} người dùng`,
      meta: {
        title,
        message,
        targetAudience: audience,
        channels,
        recipientCount: users.length,
        inAppSent: inAppCount,
        emailSent: emailCount,
        sentBy: req.user._id,
      },
      is_read: false,
    });

    res.json({
      message: "Đã gửi thông báo broadcast thành công!",
      stats: {
        totalRecipients: users.length,
        inAppSent: inAppCount,
        emailSent: emailCount,
      },
    });
  } catch (error) {
    console.error("broadcastNotification error:", error);
    res.status(500).json({ message: "Lỗi khi gửi thông báo broadcast." });
  }
};

// ============================================================================
// NOTIFICATION HISTORY
// ============================================================================
/**
 * Get notification history (sent broadcasts)
 * GET /api/admin/notifications/history
 */
export const getNotificationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, audience, channel, from, to } = req.query;

    const filter = {
      type: { $in: ["broadcast:sent", "broadcast"] },
    };

    // Filter by target audience (stored in meta.targetAudience)
    if (audience && audience !== "all") {
      filter["meta.targetAudience"] = audience;
    }

    // Filter by channel
    if (channel === "inApp") {
      filter["meta.channels.inApp"] = true;
    } else if (channel === "email") {
      filter["meta.channels.email"] = true;
    }

    // Filter by date range
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [history, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("meta.sentBy", "full_name"),
      Notification.countDocuments(filter),
    ]);

    res.json({
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("getNotificationHistory error:", error);
    res.status(500).json({ message: "Lỗi khi lấy lịch sử thông báo." });
  }
};

// ============================================================================
// NOTIFICATION STATS
// ============================================================================
/**
 * Get notification statistics
 * GET /api/admin/notifications/stats
 */
export const getNotificationStats = async (req, res) => {
  try {
    // Get role IDs first
    const [touristRoleIds, guideRoleIds] = await Promise.all([
      getRoleIds(["tourist"]),
      getRoleIds(["guide"]),
    ]);

    // Get user counts for audience display
    const [touristCount, guideCount, broadcastCount, lastBroadcast] =
      await Promise.all([
        User.countDocuments({
          role_id: { $in: touristRoleIds },
          status: { $ne: "banned" },
        }),
        User.countDocuments({
          role_id: { $in: guideRoleIds },
          status: { $ne: "banned" },
        }),
        Notification.countDocuments({
          type: { $in: ["broadcast:sent", "broadcast"] },
        }),
        Notification.findOne({ type: { $in: ["broadcast:sent", "broadcast"] } })
          .sort({ createdAt: -1 })
          .select("createdAt meta.title"),
      ]);

    res.json({
      audienceCounts: {
        all: touristCount + guideCount,
        tourist: touristCount,
        guide: guideCount,
      },
      broadcastStats: {
        totalSent: broadcastCount,
        lastSentAt: lastBroadcast?.createdAt || null,
        lastTitle: lastBroadcast?.meta?.title || null,
      },
    });
  } catch (error) {
    console.error("getNotificationStats error:", error);
    res.status(500).json({ message: "Lỗi khi lấy thống kê thông báo." });
  }
};

// ============================================================================
// ADMIN NOTIFICATIONS (already exists, moved to controller)
// ============================================================================
/**
 * Get admin notifications
 * GET /api/admin/notifications
 */
export const getAdminNotifications = async (req, res) => {
  try {
    const { is_read, page = 1, limit = 50 } = req.query;
    const filter = { audience: "admin" };

    if (is_read === "true") filter.is_read = true;
    if (is_read === "false") filter.is_read = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [docs, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ audience: "admin", is_read: false }),
    ]);

    res.json({
      notifications: docs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("getAdminNotifications error:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông báo." });
  }
};

/**
 * Mark admin notification as read
 * PATCH /api/admin/notifications/:id/read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const doc = await Notification.findOneAndUpdate(
      { _id: req.params.id, audience: "admin" },
      { $set: { is_read: true } },
      { new: true }
    );
    if (!doc) {
      return res.status(404).json({ message: "Không tìm thấy thông báo." });
    }
    res.json({ message: "Đã đánh dấu đã đọc.", notification: doc });
  } catch (error) {
    console.error("markNotificationAsRead error:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật thông báo." });
  }
};

/**
 * Mark all admin notifications as read
 * PATCH /api/admin/notifications/read-all
 */
export const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { audience: "admin", is_read: false },
      { $set: { is_read: true } }
    );
    res.json({
      message: "Đã đánh dấu tất cả đã đọc.",
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật thông báo." });
  }
};
