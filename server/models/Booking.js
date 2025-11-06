// server/models/Booking.js
import mongoose from "mongoose";
const { Decimal128, ObjectId } = mongoose.Schema.Types;

const ParticipantSchema = new mongoose.Schema(
    {
        full_name: { type: String, trim: true },
        age_provided: Number,
        age_at_departure: Number,
        is_free: { type: Boolean, default: false },
        count_slot: { type: Boolean, default: true },
        price_applied: { type: Decimal128, default: 0 },
        seat_index: Number,
        is_primary_contact: { type: Boolean, default: false },
    },
    { _id: false }
);

const PaymentSessionSchema = new mongoose.Schema(
    {
        gateway: { type: String, enum: ["momo", "vnpay"], required: true },
        pay_url: { type: String, required: true },
        transaction_code: { type: String },
        status: { type: String, enum: ["pending", "paid", "failed", "expired"], default: "pending" },
        created_at: { type: Date, default: Date.now },
        expires_at: { type: Date },
        raw: mongoose.Schema.Types.Mixed,
    },
    { _id: false }
);

const GuideDecisionSchema = new mongoose.Schema(
    {
        status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
        decided_at: Date,
        decided_by: { type: ObjectId, ref: "User" },
        note: String,
    },
    { _id: false }
);

const BookingSchema = new mongoose.Schema(
    {
        customer_id: { type: ObjectId, ref: "User", required: true },
        tour_id: { type: ObjectId, ref: "Tour", required: true },

        // HDV sẽ duyệt (lấy từ FE hoặc tour.guide_id)
        intended_guide_id: { type: ObjectId, ref: "User" },

        contact: {
            full_name: String,
            email: String,
            phone: String,
            note: String,
        },

        start_date: Date,
        end_date: Date,

        total_price: { type: Decimal128, required: true },
        currency: { type: String, default: "VND" },

        // Trạng thái theo yêu cầu:
        // waiting_guide -> awaiting_payment -> paid
        // hoặc rejected / canceled / completed
        status: {
            type: String,
            enum: ["waiting_guide", "awaiting_payment", "paid", "canceled", "rejected", "completed"],
            default: "waiting_guide",
            index: true,
        },

        guide_decision: { type: GuideDecisionSchema, default: () => ({}) },

        participants: [ParticipantSchema],
        payment_session: PaymentSessionSchema,
    },
    { timestamps: true, collection: "bookings" }
);

BookingSchema.index({ customer_id: 1, createdAt: -1 });
BookingSchema.index({ intended_guide_id: 1, "guide_decision.status": 1 });

export default mongoose.model("Booking", BookingSchema, "bookings");
