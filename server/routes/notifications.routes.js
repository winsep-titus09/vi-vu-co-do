// routes/notifications.routes.js
import express from "express";
import { auth } from "../middleware/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

/**
 * Lấy danh sách thông báo của chính user đang đăng nhập
 * GET /api/notifications?is_read=false
 */
router.get("/", auth, async (req, res) => {
    try {
        const { is_read } = req.query;
        const filter = {
            audience: "user",
            recipientId: req.user._id,
        };
        if (is_read === "false") filter.is_read = false;
        if (is_read === "true") filter.is_read = true;

        const notifications = await Notification.find(filter)
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(notifications);
    } catch (err) {
        console.error("get user notifications error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
});

/**
 * Đánh dấu 1 thông báo đã đọc
 * PATCH /api/notifications/:id/read
 */
router.patch("/:id/read", auth, async (req, res) => {
    try {
        const doc = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipientId: req.user._id },
            { $set: { is_read: true } },
            { new: true }
        );
        if (!doc)
            return res.status(404).json({ message: "Không tìm thấy thông báo." });
        res.json({ message: "Đã đánh dấu đã đọc.", notification: doc });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
});

export default router;
