import mongoose from "mongoose";
const { Decimal128, ObjectId } = mongoose.Schema.Types;

const TransactionSchema = new mongoose.Schema(
    {
        bookingId: {
            type: ObjectId,
            ref: "Booking",
            // bookingId required for booking/refund/payout types, but NOT required for withdraw
            required: function () {
                // If transaction_type is 'withdraw' then bookingId is optional
                // Otherwise require bookingId (adjust list if you want other exceptions)
                return !this.transaction_type || (this.transaction_type !== "withdraw");
            },
            default: null
        },
        userId: { type: ObjectId, ref: "User", required: true },     // actor
        payeeUserId: { type: ObjectId, ref: "User" },                // for payout
        amount: { type: Decimal128, required: true },
        commission_fee: { type: Decimal128, default: mongoose.Types.Decimal128.fromString("0") },
        net_amount: { type: Decimal128, required: true },
        transaction_type: { type: String, enum: ["charge", "refund", "payout", "withdraw"], required: true },
        status: { type: String, enum: ["pending", "confirmed", "failed"], default: "pending" },
        payment_gateway: { type: String, enum: ["momo", "vnpay", "manual"], default: "momo" },
        transaction_code: { type: String, default: null },
        note: String,
        confirmed_by: { type: ObjectId, ref: "User" },
        confirmed_at: Date,
    },
    { timestamps: true }
);

TransactionSchema.index({ bookingId: 1, transaction_type: 1 });

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema, "transactions");