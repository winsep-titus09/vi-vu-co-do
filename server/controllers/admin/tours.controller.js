// server/controllers/admin/tours.controller.js
import mongoose from "mongoose";
import Tour from "../../models/Tour.js";

/** GET /api/admin/tours?status=pending&page=1&limit=10&search=keyword */
export const listAdminTours = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};

    // Filter by approval status
    if (status && status !== "all") {
      if (status === "active") {
        filter["approval.status"] = "approved";
        filter.is_active = true;
      } else if (status === "hidden") {
        filter.$or = [{ "approval.status": "rejected" }, { is_active: false }];
      } else {
        filter["approval.status"] = status;
      }
    }

    // Search by name
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const pg = Math.max(Number(page) || 1, 1);
    const lm = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const [items, total] = await Promise.all([
      Tour.find(filter)
        .populate("created_by", "name avatar_url")
        .populate("category_id", "name slug")
        .populate("categories", "name slug")
        .populate("guides.guideId", "name avatar_url")
        .populate("locations.locationId", "name")
        .sort({ createdAt: -1 })
        .skip((pg - 1) * lm)
        .limit(lm)
        .lean(),
      Tour.countDocuments(filter),
    ]);

    // Count by status for tabs
    const [pendingCount, activeCount, hiddenCount] = await Promise.all([
      Tour.countDocuments({ "approval.status": "pending" }),
      Tour.countDocuments({ "approval.status": "approved", is_active: true }),
      Tour.countDocuments({
        $or: [{ "approval.status": "rejected" }, { is_active: false }],
      }),
    ]);

    return res.json({
      items,
      total,
      page: pg,
      pageSize: lm,
      counts: {
        all: pendingCount + activeCount + hiddenCount,
        pending: pendingCount,
        active: activeCount,
        hidden: hiddenCount,
      },
    });
  } catch (err) {
    console.error("listAdminTours error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

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
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "ID không hợp lệ." });

    const tour = await Tour.findById(id);
    if (!tour) return res.status(404).json({ message: "Không tìm thấy tour." });

    // Set approval status to approved
    tour.approval = {
      status: "approved",
      reviewed_by: req.user._id,
      reviewed_at: new Date(),
      notes: null,
    };
    // Ensure tour is active when approved
    tour.status = "active";
    tour.is_active = true;

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
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "ID không hợp lệ." });

    const tour = await Tour.findById(id);
    if (!tour) return res.status(404).json({ message: "Không tìm thấy tour." });

    tour.approval = {
      status: "rejected",
      reviewed_by: req.user._id,
      reviewed_at: new Date(),
      notes: notes || null,
    };
    await tour.save();

    res.json({ message: "Đã từ chối tour.", tour });
  } catch (err) {
    console.error("rejectTour error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/** PATCH /api/admin/tours/:id/toggle-visibility - Ẩn/Hiện tour */
export const toggleTourVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "ID không hợp lệ." });

    const tour = await Tour.findById(id);
    if (!tour) return res.status(404).json({ message: "Không tìm thấy tour." });

    // Toggle is_active status
    tour.is_active = !tour.is_active;
    await tour.save();

    const statusText = tour.is_active ? "hiển thị" : "ẩn";
    res.json({
      message: `Tour đã được ${statusText}.`,
      tour,
      is_active: tour.is_active,
    });
  } catch (err) {
    console.error("toggleTourVisibility error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/** DELETE /api/admin/tours/:id - Xóa tour vĩnh viễn */
export const deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "ID không hợp lệ." });

    const tour = await Tour.findById(id);
    if (!tour) return res.status(404).json({ message: "Không tìm thấy tour." });

    // Check if tour has any bookings
    const Booking = mongoose.model("Booking");
    const bookingCount = await Booking.countDocuments({ tour_id: id });

    if (bookingCount > 0) {
      return res.status(400).json({
        message: `Không thể xóa tour đã có ${bookingCount} lượt đặt. Hãy ẩn tour thay vì xóa.`,
        hasBookings: true,
        bookingCount,
      });
    }

    await Tour.findByIdAndDelete(id);
    res.json({ message: "Đã xóa tour thành công." });
  } catch (err) {
    console.error("deleteTour error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};
