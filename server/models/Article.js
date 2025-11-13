import mongoose from "mongoose";
const ArticleSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
        content: { type: String, required: true }, // text/HTML (server sẽ loại bỏ <img>)
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ArticleCategory" },
        featured: { type: Boolean, default: false },
        // Ảnh đại diện duy nhất
        feature_image_url: { type: String, default: null },
        feature_image_public_id: { type: String, default: null },
        status: { type: String, enum: ["draft", "published"], default: "published" },
        publishedAt: Date,
    },
    { timestamps: true }
);
export default mongoose.model("Article", ArticleSchema, "articles");