import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const PayoutRequestSchema = new mongoose.Schema({
    guide: { type: ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true }, // VNĐ
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date, default: null },
    processedBy: { type: ObjectId, ref: "User", default: null },
    adminNote: { type: String, default: null },
    externalTransactionId: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model("PayoutRequest", PayoutRequestSchema);