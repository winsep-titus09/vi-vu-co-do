import mongoose from "mongoose";

const { Schema, model } = mongoose;

const articleCommentSchema = new Schema(
  {
    articleId: {
      type: Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // Parent comment for replies
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "ArticleComment",
      default: null,
    },
    // Status for moderation
    status: {
      type: String,
      enum: ["active", "hidden", "deleted"],
      default: "active",
    },
    // Likes count (optional feature)
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
articleCommentSchema.index({ articleId: 1, createdAt: -1 });
articleCommentSchema.index({ parentId: 1 });

// Virtual for replies count
articleCommentSchema.virtual("repliesCount", {
  ref: "ArticleComment",
  localField: "_id",
  foreignField: "parentId",
  count: true,
});

const ArticleComment = model("ArticleComment", articleCommentSchema);

export default ArticleComment;
