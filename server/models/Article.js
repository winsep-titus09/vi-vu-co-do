import mongoose from "mongoose";
const ArticleSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true }, // HTML
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ArticleCategory" },
        featured: { type: Boolean, default: false },
        status: { type: String, enum: ["draft", "published"], default: "published" },
        publishedAt: Date,
    },
    { timestamps: true }
);
export default mongoose.model("Article", ArticleSchema, "articles");
