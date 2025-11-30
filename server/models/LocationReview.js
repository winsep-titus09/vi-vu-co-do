import mongoose from "mongoose";

const LocationReviewSchema = new mongoose.Schema(
  {
    location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    // Optional: Link to booking if user booked a tour to this location
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    // Helpful information (optional)
    visit_date: {
      type: Date,
      default: null,
    },
    helpful_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Status for moderation
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // Auto-approve for now
    },
  },
  {
    timestamps: true,
    collection: "location_reviews",
  }
);

// Compound index to prevent duplicate reviews from same user for same location
LocationReviewSchema.index({ location_id: 1, user_id: 1 }, { unique: true });

// Index for sorting by date
LocationReviewSchema.index({ createdAt: -1 });

// Index for status filtering
LocationReviewSchema.index({ location_id: 1, status: 1 });

// Hook to update location rating after review is saved
LocationReviewSchema.post("save", async function () {
  try {
    const Location = mongoose.model("Location");
    const locationId = this.location_id;

    // Calculate new average rating and count
    const stats = await mongoose.model("LocationReview").aggregate([
      { $match: { location_id: locationId, status: "approved" } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Location.findByIdAndUpdate(locationId, {
        average_rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal
        review_count: stats[0].count,
      });
    }
  } catch (error) {
    console.error("Error updating location rating:", error);
  }
});

// Hook to update location rating after review is deleted
LocationReviewSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  try {
    const Location = mongoose.model("Location");
    const locationId = doc.location_id;

    const stats = await mongoose.model("LocationReview").aggregate([
      { $match: { location_id: locationId, status: "approved" } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Location.findByIdAndUpdate(locationId, {
        average_rating: Math.round(stats[0].avgRating * 10) / 10,
        review_count: stats[0].count,
      });
    } else {
      // No reviews left, reset to 0
      await Location.findByIdAndUpdate(locationId, {
        average_rating: 0,
        review_count: 0,
      });
    }
  } catch (error) {
    console.error("Error updating location rating after delete:", error);
  }
});

export default mongoose.model(
  "LocationReview",
  LocationReviewSchema,
  "location_reviews"
);
