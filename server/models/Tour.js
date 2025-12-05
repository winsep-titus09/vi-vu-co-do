// server/models/Tour.js
import mongoose from "mongoose";
const { Decimal128, ObjectId } = mongoose.Schema.Types;

const ItineraryItemSchema = new mongoose.Schema(
  {
    day: { type: Number, default: 1 },
    order: { type: Number, default: 0 },
    time: { type: String, trim: true }, // e.g., "08:00", "09:30"
    title: { type: String, trim: true },
    details: { type: String, trim: true },
    locationId: { type: ObjectId, ref: "Location", default: null },
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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
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
  {
    locationId: { type: ObjectId, ref: "Location", required: true },
    order: Number,
  },
  { _id: false }
);

const TourSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, index: true },
    description: { type: String },
    price: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    max_guests: { type: Number, default: 0 },

    // Legacy: duration in days (kept for backward compatibility)
    duration: { type: Number },

    // New: duration in hours. If set (>0), backend uses this to compute end_date.
    duration_hours: { type: Number, default: null },

    // Optional: indicate unit; could be 'days' or 'hours'
    duration_unit: { type: String, enum: ["days", "hours"], default: "days" },

    // relations
    guides: [
      {
        guideId: { type: mongoose.Types.ObjectId, ref: "User" },
        isMain: { type: Boolean, default: false },
        percentage: { type: Number, default: 0.15 }, // mặc định 10% (0.1)
      },
    ],
    guide_id: { type: mongoose.Types.ObjectId, ref: "User" },
    cover_image_url: String,
    video_url: String, // Video giới thiệu tour (YouTube/Vimeo/direct URL) - hiển thị ở đầu trang
    guide_video_url: String, // Video giới thiệu hướng dẫn viên (hiển thị ở mục tiện ích)
    gallery: [{ type: String }],

    // Thông tin bổ sung cho tour
    highlights: [{ type: String }], // Điểm nổi bật
    includes: [{ type: String }], // Bao gồm
    excludes: [{ type: String }], // Không bao gồm
    amenities: [{ type: String }], // Tiện ích (Wi-Fi, nước uống, bảo hiểm...)
    rules: [{ type: String }], // Quy tắc tour

    itinerary: [ItineraryItemSchema],
    category_id: {
      type: mongoose.Types.ObjectId,
      ref: "TourCategory",
      default: null,
    },
    categories: [{ type: mongoose.Types.ObjectId, ref: "TourCategory" }],
    locations: [
      {
        locationId: { type: mongoose.Types.ObjectId, ref: "Location" },
        order: Number,
      },
    ],
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // approval & metadata
    approval: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      reviewed_by: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        default: null,
      },
      reviewed_at: { type: Date, default: null },
      notes: { type: String, default: null },
    },

    created_by: { type: mongoose.Types.ObjectId, ref: "User", default: null },
    created_by_role: { type: String, default: null },

    // date/time/booking configs
    allow_custom_date: { type: Boolean, default: true },
    fixed_departure_time: { type: String, default: "08:00" },
    min_days_before_start: { type: Number, default: 0 },
    max_days_advance: { type: Number, default: 180 },
    closed_weekdays: [{ type: Number, min: 0, max: 6, default: [] }],
    blackout_dates: [{ type: Date, default: [] }],
    per_date_capacity: { type: Number, default: null },

    // Cho phép HDV chỉnh sửa tour trong thời gian giới hạn (sau khi admin duyệt yêu cầu edit)
    edit_allowed_until: { type: Date, default: null },
    // Lưu ID của TourEditRequest đã được duyệt (để tracking)
    last_approved_edit_request: { type: mongoose.Types.ObjectId, ref: "TourEditRequest", default: null },
  },
  { timestamps: true, collection: "tours" }
);

// Gợi ý index
TourSchema.index(
  { name: "text", description: "text" },
  { name: "idx_tours_text" }
);
TourSchema.index(
  { category_id: 1, status: 1 },
  { name: "idx_tours_category_status" }
);

// Tối ưu cho lọc nâng cao
TourSchema.index({ price: 1 }, { name: "idx_tours_price" });
TourSchema.index({ "guides.guideId": 1 }, { name: "idx_tours_guides" });
TourSchema.index(
  { allow_custom_date: 1 },
  { name: "idx_tours_allow_custom_date" }
);
TourSchema.index(
  { "locations.locationId": 1 },
  { name: "idx_tours_locations" }
);

export default mongoose.model("Tour", TourSchema);
