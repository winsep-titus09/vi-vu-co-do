// server/models/TourEditRequest.js
import mongoose from "mongoose";

const TourEditRequestSchema = new mongoose.Schema(
  {
    tour_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    guide_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Loại yêu cầu: edit (chỉnh sửa), delete (xóa)
    request_type: {
      type: String,
      enum: ["edit", "delete"],
      default: "edit",
    },
    // Mô tả thay đổi muốn thực hiện
    description: {
      type: String,
      required: true,
    },
    // Dữ liệu thay đổi (optional - cho edit request)
    changes: {
      name: String,
      description: String,
      price: mongoose.Schema.Types.Decimal128,
      duration: Number,
      duration_unit: String,
      max_guests: Number,
      cover_image_url: String,
      gallery: [String],
      highlights: [String],
      includes: [String],
      excludes: [String],
      itinerary: [
        {
          day: Number,
          time: String,
          title: String,
          details: String,
        },
      ],
    },
    // Trạng thái xử lý
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Admin xử lý
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewed_at: {
      type: Date,
      default: null,
    },
    admin_notes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, collection: "tour_edit_requests" }
);

// Index cho tìm kiếm nhanh
TourEditRequestSchema.index({ tour_id: 1, status: 1 });
TourEditRequestSchema.index({ guide_id: 1, status: 1 });
TourEditRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("TourEditRequest", TourEditRequestSchema);
