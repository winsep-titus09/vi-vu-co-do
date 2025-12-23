// models/GuideProfile.js
import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema(
  { name: { type: String, required: true }, issuer: String, year: Number },
  { _id: false }
);

const BankSchema = new mongoose.Schema(
  { bank_name: String, account_number: String, account_holder: String },
  { _id: false }
);

const GuideProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    introduction: { type: String }, // mô tả giới thiệu
    cover_image_url: { type: String, default: null }, // ảnh cover cá nhân hóa
    bio_video_url: { type: String }, // video giới thiệu
    experience: { type: String }, // kinh nghiệm mô tả (có thể là số năm)
    experience_years: { type: Number, min: 0, default: 0 }, // số năm kinh nghiệm dạng số
    languages: [{ type: String }], // ["vi", "en"]
    bank_account: BankSchema, // tài khoản ngân hàng
    certificates: [CertificateSchema], // chứng chỉ nghề/ngôn ngữ
    expertise: { type: String, default: null, trim: true, maxlength: 200 }, //chuyên môn
    is_featured: { type: Boolean, default: false },
    status: { type: String, default: "approved" },
  },
  { timestamps: true, collection: "guide_profiles" }
);

export default mongoose.model("GuideProfile", GuideProfileSchema);
