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
    password: { type: String, required: true }, // hashed (random for OAuth)
    googleId: { type: String, unique: true, sparse: true },
    auth_provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
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
    // User preferences
    preferences: {
      notifications: {
        booking: { type: Boolean, default: true },
        promo: { type: Boolean, default: false },
        system: { type: Boolean, default: true },
      },
      display: {
        quality_3d: {
          type: String,
          enum: ["auto", "low", "high"],
          default: "auto",
        },
        currency: { type: String, enum: ["vnd", "usd"], default: "vnd" },
      },
    },
    // Account deletion request
    delete_request: {
      status: {
        type: String,
        enum: ["none", "pending", "approved", "rejected"],
        default: "none",
      },
      reason: { type: String, default: "" },
      requested_at: { type: Date },
      reviewed_at: { type: Date },
      reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      admin_notes: { type: String, default: "" },
    },
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
