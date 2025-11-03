import mongoose from "mongoose";
const LocationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
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
LocationSchema.index({ coords: "2dsphere" });
export default mongoose.model("Location", LocationSchema, "locations");
