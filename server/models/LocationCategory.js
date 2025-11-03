import mongoose from "mongoose";
const LocationCategorySchema = new mongoose.Schema(
    { name: { type: String, required: true, unique: true, trim: true } },
    { timestamps: true }
);
export default mongoose.model("LocationCategory", LocationCategorySchema, "location_categories");
