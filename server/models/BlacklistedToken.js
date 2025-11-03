import mongoose from "mongoose";

const BlacklistedTokenSchema = new mongoose.Schema(
    {
        token: { type: String, required: true, unique: true },
        expiredAt: { type: Date, required: true },
    },
    { timestamps: true }
);

export default mongoose.model("BlacklistedToken", BlacklistedTokenSchema, "blacklisted_tokens");
