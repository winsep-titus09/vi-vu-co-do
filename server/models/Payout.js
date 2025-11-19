import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const PayoutSchema = new mongoose.Schema({
    tourId: { type: ObjectId, ref: "Tour", required: true },
    tourDate: { type: Date, required: true }, // occurrence date (normalized to midnight)
    guideId: { type: ObjectId, ref: "User", required: true },
    baseAmount: { type: Number, required: true, default: 0 }, // total revenue for occurrence
    percentage: { type: Number, required: true, default: 0.1 },
    payoutAmount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "VND" },
    relatedBookingIds: [{ type: ObjectId, ref: "Booking" }],
    status: { type: String, enum: ["pending", "processing", "paid", "failed"], default: "pending" },
    reference: { type: String, required: true, unique: true },
    createdBy: { type: ObjectId, ref: "User" },
    paidBy: { type: ObjectId, ref: "User" },
    paidAt: Date,
    failedReason: String
}, { timestamps: true });

// Compound index for lookups (unique kept false to allow manual adjustments; can set { unique:true } if desired)
PayoutSchema.index({ tourId: 1, tourDate: 1, guideId: 1 });

export default mongoose.model("Payout", PayoutSchema);