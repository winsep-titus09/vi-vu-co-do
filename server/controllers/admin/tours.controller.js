// server/controllers/admin/tours.controller.js
import mongoose from "mongoose";
import Tour from "../../models/Tour.js";

/** GET /api/admin/tours/pending */
export const listPendingTours = async (req, res) => {
    try {
        const items = await Tour.find({ "approval.status": "pending" })
            .populate("created_by", "name")
            .populate("category_id", "name")
            .populate("guides.guideId", "name")
            .sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error("listPendingTours error:", err);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** PATCH /api/admin/tours/:id/approve */
export const approveTour = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID không hợp lệ." });

        const tour = await Tour.findById(id);
        if (!tour) return res.status(404).json({ message: "Không tìm thấy tour." });

        tour.approval = { status: "approved", reviewed_by: req.user._id, reviewed_at: new Date(), notes: null };
        await tour.save();

        res.json({ message: "Đã duyệt tour.", tour });
    } catch (err) {
        console.error("approveTour error:", err);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** PATCH /api/admin/tours/:id/reject */
export const rejectTour = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "ID không hợp lệ." });

        const tour = await Tour.findById(id);
        if (!tour) return res.status(404).json({ message: "Không tìm thấy tour." });

        tour.approval = { status: "rejected", reviewed_by: req.user._id, reviewed_at: new Date(), notes: notes || null };
        await tour.save();

        res.json({ message: "Đã từ chối tour.", tour });
    } catch (err) {
        console.error("rejectTour error:", err);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};
