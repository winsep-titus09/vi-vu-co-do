import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, index: true, trim: true },
    summary: { type: String, trim: true },
    content_html: { type: String }, // sanitized HTML
    excerpt: { type: String },
    cover_image: { type: String },
    images: [{ type: String }],
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ArticleCategory",
    },

    // Author must exist for public posts (set when guide creates)
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },

    // For admin notifications/announcements
    type: {
      type: String,
      enum: ["system", "promotion", "policy", "article"],
      default: "article",
    },
    audience: {
      type: String,
      enum: ["all", "guide", "tourist"],
      default: "all",
    },

    // status and approval
    status: {
      type: String,
      enum: ["draft", "pending", "active", "inactive"],
      default: "pending",
    },
    approval: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      reviewed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      reviewed_at: { type: Date, default: null },
      notes: { type: String, default: null },
    },

    publishedAt: { type: Date, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Article", ArticleSchema);
