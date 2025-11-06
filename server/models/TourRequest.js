import mongoose from "mongoose";
const { Decimal128, ObjectId } = mongoose.Schema.Types;

const TourRequestLocationSchema = new mongoose.Schema(
    { locationId: { type: ObjectId, ref: "Location", required: true }, order: { type: Number, default: 0 } },
    { _id: false }
);

const TourRequestGuideSchema = new mongoose.Schema(
    { guideId: { type: ObjectId, ref: "User", required: true }, isMain: { type: Boolean, default: false } },
    { _id: false }
);

const TourRequestSchema = new mongoose.Schema(
    {
        // Cơ bản
        name: { type: String, required: true, trim: true },
        description: String,
        duration: { type: Number, default: 1 },
        price: { type: Decimal128, required: true },
        max_guests: { type: Number, default: 0 },

        // Danh mục
        category_id: { type: ObjectId, ref: "TourCategory" },
        categories: [{ type: ObjectId, ref: "TourCategory" }],

        // Media + hành trình
        cover_image_url: { type: String, default: null },
        gallery: [{ type: String }],
        itinerary: [{ day: Number, title: String, details: String }],

        featured: { type: Boolean, default: false },
        free_under_age: { type: Number, default: 11 },

        // Quan hệ
        guides: [TourRequestGuideSchema],
        locations: { type: [TourRequestLocationSchema], required: true },

        // Ngày linh hoạt + giờ cố định
        allow_custom_date: { type: Boolean, default: true, index: true },
        fixed_departure_time: { type: String, default: "08:00" }, // "HH:mm"
        min_days_before_start: { type: Number, default: 0 },
        max_days_advance: { type: Number, default: 180 },
        closed_weekdays: [{ type: Number, min: 0, max: 6, default: [] }],
        blackout_dates: [{ type: Date, default: [] }],
        per_date_capacity: { type: Number, default: null }, // null => dùng max_guests

        // Quy trình phê duyệt
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
        reason_rejected: { type: String, default: null },
        notes: { type: String, default: null },

        // truy vết
        created_by: { type: ObjectId, ref: "User", required: true, index: true },
        reviewed_by: { type: ObjectId, ref: "User", default: null },
        reviewed_at: { type: Date, default: null },

        // optional: điều hướng notify
        notify_url: { type: String, default: null },
    },
    { timestamps: true, collection: "tour_requests" }
);

export default mongoose.model("TourRequest", TourRequestSchema);
