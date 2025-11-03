// models/GuideApplication.js
import mongoose from "mongoose";

// File dạng rút gọn, tương thích schema chung (url, name, public_id nếu có)
const FileSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        name: { type: String },
        public_id: { type: String }, // (bổ sung tối thiểu) nếu dùng Cloudinary
    },
    { _id: false }
);

const GuideApplicationSchema = new mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },

        // Hồ sơ cơ bản
        about: { type: String, trim: true },
        languages: [{ type: String, trim: true }],       // ví dụ ["vi","en"]
        experience_years: { type: Number, min: 0, default: 0 },

        // Tài liệu minh chứng
        id_cards: [FileSchema],                 // CCCD/Passport (ảnh 2 mặt)
        certificates: [FileSchema],             // chứng chỉ nghiệp vụ HDV
        language_certificates: [FileSchema],    // chứng chỉ ngôn ngữ (BỔ SUNG THEO YÊU CẦU)

        // Video giới thiệu (tùy chọn)
        intro_video: FileSchema,

        // Thông tin nhận tiền (phục vụ payout về sau)
        bank_info: {
            bank_name: { type: String, trim: true },
            account_name: { type: String, trim: true },
            account_number: { type: String, trim: true },
        },

        // Audit khi duyệt
        admin_notes: { type: String },
        reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewed_at: { type: Date },
    },
    { timestamps: true, collection: "guide_applications" }
);

export default mongoose.model("GuideApplication", GuideApplicationSchema);
