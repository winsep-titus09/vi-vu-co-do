import mongoose from "mongoose";
import slugify from "slugify";

const HighlightSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    duration: { type: String, trim: true }, // "15 phút", "30 phút"
    tip: { type: String, trim: true }, // Mẹo tham quan
    image_url: { type: String },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

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
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LocationCategory",
    },

    // Phase 1: Core Data fields
    opening_hours: { type: String, trim: true }, // "07:00 - 17:30" hoặc JSON string
    ticket_price: { type: mongoose.Schema.Types.Decimal128, default: 0 },
    ticket_price_currency: {
      type: String,
      enum: ["VND", "USD"],
      default: "VND",
    },
    best_visit_time: { type: String, trim: true }, // "Sáng sớm / Hoàng hôn"

    // Highlights/Visiting route
    highlights: [HighlightSchema],

    // Rating aggregation (will be updated by reviews)
    average_rating: { type: Number, default: 0, min: 0, max: 5 },
    review_count: { type: Number, default: 0, min: 0 },
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
LocationSchema.index({ category_id: 1 }); // For filtering by category
LocationSchema.index({ average_rating: -1 }); // For sorting by rating

export default mongoose.model("Location", LocationSchema, "locations");
