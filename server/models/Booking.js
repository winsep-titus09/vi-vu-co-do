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

        // Tổng khách phải trả (tính theo số người) - dùng để charge customer
        total_price: { type: Decimal128, required: true },

        // Giá cố định của tour (copy từ Tour.price khi tạo booking)
        // Dùng để tính payout cho HDV (không phụ thuộc số người)
        tour_price: { type: Decimal128, required: true, default: 0 },

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

        // MỐC HẠN
        // - Hạn HDV duyệt (set khi tạo booking nếu đang waiting_guide)
        // - Hạn khách thanh toán (set khi sang awaiting_payment)
        guide_approval_due_at: { type: Date, default: null, index: true },
        payment_due_at: { type: Date, default: null, index: true },

        participants: [ParticipantSchema],
        payment_session: PaymentSessionSchema,

        // MỚI: thông tin hủy / hoàn tiền
        canceled_at: { type: Date, default: null },
        canceled_by: { type: ObjectId, ref: "User", default: null },
        cancel_reason: { type: String, default: null },
        refund_transaction_id: { type: ObjectId, ref: "Transaction", default: null },

        // MỚI: request hủy (do khách gửi khi booking đã paid)
        cancel_requested: { type: Boolean, default: false },
        cancel_requested_at: { type: Date, default: null },
        cancel_requested_by: { type: ObjectId, ref: "User", default: null },
        cancel_requested_note: { type: String, default: null },

        // MỚI: liên kết tới payout occurrence (nếu đã attach)
        payoutId: { type: ObjectId, ref: "Payout", default: null },

        // MỚI: thông tin payout cho HDV sau khi booking completed
        platformFee: { type: Number, default: 0 },     // VNĐ, phí sàn (10%)
        guideEarning: { type: Number, default: 0 },    // VNĐ, sau khi trừ phí
        payoutProcessed: { type: Boolean, default: false }, // đã credit vào balance HDV chưa

    },
    { timestamps: true, collection: "bookings" }
);

BookingSchema.index({ customer_id: 1, createdAt: -1 });
BookingSchema.index({ intended_guide_id: 1, "guide_decision.status": 1 });
// Tối ưu quét cron
BookingSchema.index({ status: 1, payment_due_at: 1 });
BookingSchema.index({ status: 1, guide_approval_due_at: 1 });

export default mongoose.model("Booking", BookingSchema, "bookings");