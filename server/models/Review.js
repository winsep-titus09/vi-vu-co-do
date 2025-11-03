import mongoose from "mongoose";
const ReviewSchema = new mongoose.Schema(
    {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
        tour_rating: { type: Number, min: 1, max: 5, required: true },
        guide_rating: { type: Number, min: 1, max: 5, required: true },
        tour_comment: String,
        guide_comment: String,
    },
    { timestamps: true }
);
export default mongoose.model("Review", ReviewSchema, "reviews");
