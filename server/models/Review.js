import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
    {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },

        // Cho phép gửi từng phần theo flow
        tour_rating: { type: Number, min: 1, max: 5 },   // không required để tạo trước phần tour/guide độc lập
        guide_rating: { type: Number, min: 1, max: 5 },

        tour_comment: { type: String, default: null },
        guide_comment: { type: String, default: null },

        // Đánh dấu thời điểm hoàn tất từng phần (phục vụ analytics/nhắc nhở)
        tour_rated_at: { type: Date, default: null },
        guide_rated_at: { type: Date, default: null },
    },
    { timestamps: true, collection: "reviews" }
);

export default mongoose.model("Review", ReviewSchema, "reviews");