// server/models/Tour.js
import mongoose from "mongoose";
const { Decimal128, ObjectId } = mongoose.Schema.Types;

const TourSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, unique: true, index: true },
        description: String,
        duration: { type: Number, default: 1 }, // days
        price: { type: Decimal128, required: true },
        max_guests: { type: Number, default: 0 },

        // legacy main guide (giữ nguyên để tương thích)
        guide_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        category_id: { type: mongoose.Schema.Types.ObjectId, ref: "TourCategory" },
        cover_image_url: { type: String, default: null },
        gallery: [{ type: String }],
        itinerary: [{ day: Number, title: String, details: String }],
        featured: { type: Boolean, default: false },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
        free_under_age: { type: Number, default: 11 },

        // === BỔ SUNG MỚI ===
        approval_status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true
        },
        created_by: { type: ObjectId, ref: "User", required: true },

        // đã có sẵn:
        guides: [{ guideId: { type: ObjectId, ref: "User" }, isMain: { type: Boolean, default: false } }],
        locations: [{ locationId: { type: ObjectId, ref: "Location" }, order: Number }],
        models3d: [{ type: ObjectId, ref: "ThreeDModel" }],
    },
    { timestamps: true }
);

// helper virtual: toNumber
TourSchema.virtual("priceNumber").get(function () {
    return this.price ? Number(this.price.toString()) : 0;
});

export default mongoose.model("Tour", TourSchema, "tours");
