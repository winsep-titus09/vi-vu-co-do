import mongoose from "mongoose";
import slugify from "slugify";
const LocationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, unique: true, index: true },
        description: String,
        address: String,
        coords: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], required: true }, // [lng, lat]
        },
        images: [{ type: String }],
        video_url: { type: String, default: null },
        category_id: { type: mongoose.Schema.Types.ObjectId, ref: "LocationCategory" },
    },
    { timestamps: true }
);

// ✅ Tự động tạo slug trước khi lưu
LocationSchema.pre("save", function (next) {
    if (this.isModified("name") || !this.slug) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

LocationSchema.index({ coords: "2dsphere" });
export default mongoose.model("Location", LocationSchema, "locations");
