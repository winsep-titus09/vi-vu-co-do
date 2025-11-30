import mongoose from "mongoose";
import GuideProfile from "./GuideProfile.js";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true }, // hashed
    avatar_url: { type: String, default: null },
    phone_number: { type: String, trim: true },
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    // Số dư HDV (VNĐ)
    balance: { type: Number, default: 0 },
    // Reset password fields
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

UserSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;
  try {
    await GuideProfile.deleteOne({ user_id: doc._id });
    console.log(`🗑️ Đã xóa GuideProfile của user ${doc._id}`);
  } catch (err) {
    console.error("❌ Lỗi khi xóa GuideProfile:", err.message);
  }
});
export default mongoose.model("User", UserSchema, "users");
