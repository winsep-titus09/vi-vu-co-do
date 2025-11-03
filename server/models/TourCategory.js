import mongoose from "mongoose";
const TourCategorySchema = new mongoose.Schema(
    { name: { type: String, required: true, unique: true, trim: true } },
    { timestamps: true }
);
export default mongoose.model("TourCategory", TourCategorySchema, "tour_categories");
