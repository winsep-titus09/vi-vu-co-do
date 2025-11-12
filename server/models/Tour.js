// server/models/Tour.js
import mongoose from "mongoose";
const { Decimal128, ObjectId } = mongoose.Schema.Types;

const ItineraryItemSchema = new mongoose.Schema(
    {
        day: { type: Number, required: true },   // 1..duration
        title: { type: String, trim: true },
        details: { type: String, trim: true },
    },
    { _id: false }
);

const GuideRefSchema = new mongoose.Schema(
    {
        guideId: { type: ObjectId, ref: "User", required: true },
        isPrimary: { type: Boolean, default: false },
    },
    { _id: false }
);

const LocationRefSchema = new mongoose.Schema(
    {
        locationId: { type: ObjectId, ref: "Location", required: true },
        order: { type: Number, default: 0 },
    },
    { _id: false }
);

const ApprovalSchema = new mongoose.Schema(
    {
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        by: { type: ObjectId, ref: "User", default: null },
        at: { type: Date, default: null },
        reason: { type: String, default: null },
    },
    { _id: false }
);

const FileSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        name: { type: String, default: null },
        public_id: { type: String, default: null },
    },
    { _id: false }
);

const TourLocationSchema = new mongoose.Schema(
    { locationId: { type: ObjectId, ref: "Location", required: true }, order: Number },
    { _id: false }
);

const TourSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, unique: true, index: true },
        description: String,
        duration: { type: Number, default: 1 },
        price: { type: Decimal128, required: true },
        max_guests: { type: Number, default: 0 },

        // tương thích cũ
        category_id: { type: ObjectId, ref: "TourCategory" },

        // mới: hỗ trợ nhiều danh mục (nếu bạn dùng)
        categories: [{ type: ObjectId, ref: "TourCategory" }],

        cover_image_url: { type: String, default: null },
        gallery: [{ type: String }],
        itinerary: [{ day: Number, title: String, details: String }],

        featured: { type: Boolean, default: false },
        status: { type: String, enum: ["active", "inactive"], default: "inactive" },
        free_under_age: { type: Number, default: 11 },

        // guides & locations
        guides: [{ guideId: { type: ObjectId, ref: "User" }, isMain: { type: Boolean, default: false } }],
        locations: [TourLocationSchema],

        // ---- NGÀY LINH HOẠCH + GIỜ CỐ ĐỊNH ----
        allow_custom_date: { type: Boolean, default: true, index: true },
        fixed_departure_time: { type: String, default: "08:00" }, // "HH:mm"
        min_days_before_start: { type: Number, default: 0 },
        max_days_advance: { type: Number, default: 180 },
        closed_weekdays: [{ type: Number, min: 0, max: 6, default: [] }], // 0=CN..6=T7
        blackout_dates: [{ type: Date, default: [] }],
        per_date_capacity: { type: Number, default: null }, // nếu null dùng max_guests
    },
    { timestamps: true, collection: "tours" }
);

// Gợi ý index
TourSchema.index({ name: "text", description: "text" }, { name: "idx_tours_text" });
TourSchema.index({ category_id: 1, status: 1 }, { name: "idx_tours_category_status" });

// Tối ưu cho lọc nâng cao
TourSchema.index({ price: 1 }, { name: "idx_tours_price" });
TourSchema.index({ "guides.guideId": 1 }, { name: "idx_tours_guides" });
TourSchema.index({ allow_custom_date: 1 }, { name: "idx_tours_allow_custom_date" });

export default mongoose.model("Tour", TourSchema);