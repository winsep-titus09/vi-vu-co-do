// server/models/TourCategory.js
import mongoose from "mongoose";
import slugify from "slugify";

const TourCategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, unique: true },
        slug: { type: String, index: true, unique: true },
        description: { type: String, default: "" },
        icon: { type: String, default: null },            // optional: icon class/url
        cover_image_url: { type: String, default: null }, // optional: banner
        order: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true, collection: "tour_categories" }
);

TourCategorySchema.pre("save", function (next) {
    if (this.isModified("name") || !this.slug) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

export default mongoose.model("TourCategory", TourCategorySchema, "tour_categories");
