// server/controllers/tourEditRequests.controller.js
import mongoose from "mongoose";
import TourEditRequest from "../models/TourEditRequest.js";
import Tour from "../models/Tour.js";
import { notifyAdmins, notifyUser } from "../services/notify.js";

/**
 * POST /api/tour-edit-requests
 * Guide gửi yêu cầu chỉnh sửa tour
 */
export const createEditRequest = async (req, res) => {
  try {
    const { tour_id, request_type, description, changes } = req.body;
    const guideId = req.user._id;

    // Validate tour_id
    if (!tour_id || !mongoose.isValidObjectId(tour_id)) {
      return res.status(400).json({ message: "ID tour không hợp lệ." });
    }

    // Check tour exists and belongs to guide
    const tour = await Tour.findById(tour_id);
    if (!tour) {
      return res.status(404).json({ message: "Không tìm thấy tour." });
    }

    // Check if guide owns this tour
    const isOwner =
      tour.created_by?.toString() === guideId.toString() ||
      tour.guide_id?.toString() === guideId.toString() ||
      tour.guides?.some((g) => g.guideId?.toString() === guideId.toString());

    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chỉnh sửa tour này." });
    }

    // Check for existing pending request
    const existingRequest = await TourEditRequest.findOne({
      tour_id,
      guide_id: guideId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Bạn đã có yêu cầu chỉnh sửa đang chờ xử lý cho tour này.",
        existingRequest,
      });
    }

    // Create new request
    const editRequest = new TourEditRequest({
      tour_id,
      guide_id: guideId,
      request_type: request_type || "edit",
      description,
      changes: changes || {},
    });

    await editRequest.save();

    // Notify admins
    try {
      await notifyAdmins({
        type: "tour_edit_request",
        title: "Yêu cầu chỉnh sửa Tour mới",
        message: `HDV ${req.user.name} yêu cầu ${
          request_type === "delete" ? "xóa" : "chỉnh sửa"
        } tour "${tour.name}"`,
        data: { requestId: editRequest._id, tourId: tour_id },
      });
    } catch (notifyErr) {
      console.error("Notify error:", notifyErr);
    }

    res.status(201).json({
      message: "Đã gửi yêu cầu chỉnh sửa. Admin sẽ xem xét và phản hồi.",
      request: editRequest,
    });
  } catch (err) {
    console.error("createEditRequest error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * GET /api/tour-edit-requests/my
 * Guide xem danh sách yêu cầu của mình
 */
export const getMyEditRequests = async (req, res) => {
  try {
    const guideId = req.user._id;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { guide_id: guideId };
    if (status && status !== "all") {
      filter.status = status;
    }

    const pg = Math.max(Number(page) || 1, 1);
    const lm = Math.min(Math.max(Number(limit) || 20, 1), 50);

    const [requests, total] = await Promise.all([
      TourEditRequest.find(filter)
        .populate("tour_id", "name slug cover_image_url")
        .populate("reviewed_by", "name")
        .sort({ createdAt: -1 })
        .skip((pg - 1) * lm)
        .limit(lm)
        .lean(),
      TourEditRequest.countDocuments(filter),
    ]);

    res.json({ requests, total, page: pg, pageSize: lm });
  } catch (err) {
    console.error("getMyEditRequests error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * GET /api/tour-edit-requests/:id
 * Xem chi tiết yêu cầu
 */
export const getEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    const request = await TourEditRequest.findById(id)
      .populate("tour_id", "name slug cover_image_url price duration")
      .populate("guide_id", "name email avatar_url")
      .populate("reviewed_by", "name")
      .lean();

    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu." });
    }

    // Check permission: admin or owner
    const isAdmin = req.user.role_id?.name === "admin";
    const isOwner = request.guide_id._id.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: "Không có quyền xem yêu cầu này." });
    }

    res.json(request);
  } catch (err) {
    console.error("getEditRequest error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * DELETE /api/tour-edit-requests/:id
 * Guide hủy yêu cầu (chỉ khi pending)
 */
export const cancelEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    const request = await TourEditRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu." });
    }

    // Check owner
    if (request.guide_id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Không có quyền hủy yêu cầu này." });
    }

    // Only allow cancel pending requests
    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể hủy yêu cầu đang chờ xử lý." });
    }

    await TourEditRequest.findByIdAndDelete(id);
    res.json({ message: "Đã hủy yêu cầu." });
  } catch (err) {
    console.error("cancelEditRequest error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// ==================== ADMIN FUNCTIONS ====================

/**
 * GET /api/admin/tour-edit-requests
 * Admin xem danh sách tất cả yêu cầu
 */
export const listAllEditRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const pg = Math.max(Number(page) || 1, 1);
    const lm = Math.min(Math.max(Number(limit) || 20, 1), 50);

    const [requests, total, pendingCount] = await Promise.all([
      TourEditRequest.find(filter)
        .populate("tour_id", "name slug cover_image_url")
        .populate("guide_id", "name email avatar_url")
        .populate("reviewed_by", "name")
        .sort({ createdAt: -1 })
        .skip((pg - 1) * lm)
        .limit(lm)
        .lean(),
      TourEditRequest.countDocuments(filter),
      TourEditRequest.countDocuments({ status: "pending" }),
    ]);

    res.json({ requests, total, page: pg, pageSize: lm, pendingCount });
  } catch (err) {
    console.error("listAllEditRequests error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * PATCH /api/admin/tour-edit-requests/:id/approve
 * Admin duyệt yêu cầu
 */
export const approveEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { apply_changes, edit_days = 7 } = req.body; // edit_days: số ngày cho phép HDV chỉnh sửa

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    const request = await TourEditRequest.findById(id).populate("tour_id");
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Yêu cầu này đã được xử lý." });
    }

    // If delete request, delete the tour
    if (request.request_type === "delete") {
      await Tour.findByIdAndDelete(request.tour_id._id);
    }
    // If edit request
    else if (request.request_type === "edit") {
      const tour = await Tour.findById(request.tour_id._id);
      if (tour) {
        // Nếu có apply_changes và có changes data, áp dụng trực tiếp
        if (apply_changes && request.changes) {
          const allowedFields = [
            "name",
            "description",
            "price",
            "duration",
            "duration_unit",
            "max_guests",
            "cover_image_url",
            "gallery",
            "highlights",
            "includes",
            "excludes",
            "itinerary",
          ];

          for (const field of allowedFields) {
            if (request.changes[field] !== undefined) {
              tour[field] = request.changes[field];
            }
          }
        }
        
        // Luôn set edit_allowed_until để cho phép HDV chỉnh sửa thêm
        const daysToAllow = Math.min(Math.max(Number(edit_days) || 7, 1), 30); // 1-30 ngày
        tour.edit_allowed_until = new Date(Date.now() + daysToAllow * 24 * 60 * 60 * 1000);
        tour.last_approved_edit_request = request._id;
        
        await tour.save();
      }
    }

    // Update request status
    request.status = "approved";
    request.reviewed_by = req.user._id;
    request.reviewed_at = new Date();
    await request.save();

    // Notify guide
    try {
      const editDeadline = request.request_type === "edit" 
        ? new Date(Date.now() + (Number(edit_days) || 7) * 24 * 60 * 60 * 1000)
        : null;
      
      await notifyUser({
        userId: request.guide_id,
        type: "tour_edit_request:approved",
        content: `Yêu cầu ${
          request.request_type === "delete" ? "xóa" : "chỉnh sửa"
        } tour "${request.tour_id.name}" đã được duyệt.${
          request.request_type === "edit" 
            ? ` Bạn có thể chỉnh sửa tour trong ${edit_days || 7} ngày.` 
            : ""
        }`,
        url: request.request_type === "edit" 
          ? `/dashboard/guide/edit-tour/${request.tour_id._id}`
          : `/dashboard/guide/my-tours`,
        meta: { 
          requestId: request._id,
          tourId: request.tour_id._id,
          requestType: request.request_type,
          editDeadline: editDeadline?.toISOString(),
        },
      });
    } catch (notifyErr) {
      console.error("Notify error:", notifyErr);
    }

    res.json({ 
      message: request.request_type === "edit" 
        ? `Đã duyệt yêu cầu. HDV có thể chỉnh sửa tour trong ${edit_days || 7} ngày.`
        : "Đã duyệt yêu cầu xóa tour.", 
      request 
    });
  } catch (err) {
    console.error("approveEditRequest error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * PATCH /api/admin/tour-edit-requests/:id/reject
 * Admin từ chối yêu cầu
 */
export const rejectEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    const request = await TourEditRequest.findById(id).populate(
      "tour_id",
      "name"
    );
    if (!request) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Yêu cầu này đã được xử lý." });
    }

    request.status = "rejected";
    request.reviewed_by = req.user._id;
    request.reviewed_at = new Date();
    request.admin_notes = notes || null;
    await request.save();

    // Notify guide
    try {
      await notifyUser(request.guide_id, {
        type: "tour_edit_request_rejected",
        title: "Yêu cầu bị từ chối",
        message: `Yêu cầu ${
          request.request_type === "delete" ? "xóa" : "chỉnh sửa"
        } tour "${request.tour_id.name}" đã bị từ chối.${
          notes ? ` Lý do: ${notes}` : ""
        }`,
        data: { requestId: request._id },
      });
    } catch (notifyErr) {
      console.error("Notify error:", notifyErr);
    }

    res.json({ message: "Đã từ chối yêu cầu.", request });
  } catch (err) {
    console.error("rejectEditRequest error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};
