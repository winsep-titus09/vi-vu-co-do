import express from "express";
import { auth } from "../../middleware/auth.js";
import { authorize } from "../../middleware/auth.js";
import Notification from "../../models/Notification.js";

const router = express.Router();

router.get("/", auth, authorize("admin"), async (req, res) => {
    const { is_read } = req.query;
    const filter = { audience: "admin" };
    if (is_read === "true") filter.is_read = true;
    if (is_read === "false") filter.is_read = false;
    const docs = await Notification.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(docs);
});

router.patch("/:id/read", auth, authorize("admin"), async (req, res) => {
    const doc = await Notification.findOneAndUpdate(
        { _id: req.params.id, audience: "admin" },
        { $set: { is_read: true } },
        { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Không tìm thấy thông báo." });
    res.json({ message: "Đã đánh dấu đã đọc.", notification: doc });
});

export default router;