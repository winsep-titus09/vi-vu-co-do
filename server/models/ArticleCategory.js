import mongoose from "mongoose";
const ArticleCategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        slug: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    },
    { timestamps: true }
);
export default mongoose.model("ArticleCategory", ArticleCategorySchema, "article_categories");