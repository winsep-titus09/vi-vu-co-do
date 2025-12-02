import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },

    // Cho phép gửi từng phần theo flow
    tour_rating: { type: Number, min: 1, max: 5 }, // không required để tạo trước phần tour/guide độc lập
    guide_rating: { type: Number, min: 1, max: 5 },

    tour_comment: { type: String, default: null },
    guide_comment: { type: String, default: null },

    // Phản hồi của HDV
    guide_reply: { type: String, default: null },
    guide_reply_at: { type: Date, default: null },

    // Đánh dấu thời điểm hoàn tất từng phần (phục vụ analytics/nhắc nhở)
    tour_rated_at: { type: Date, default: null },
    guide_rated_at: { type: Date, default: null },

    // Status for admin moderation
    status: {
      type: String,
      enum: ["published", "hidden", "reported"],
      default: "published",
    },

    // Report reason (if reported)
    report_reason: { type: String, default: null },
    reported_at: { type: Date, default: null },
    reported_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true, collection: "reviews" }
);

export default mongoose.model("Review", ReviewSchema, "reviews");
