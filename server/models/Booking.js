import mongoose from "mongoose";
const { Decimal128, ObjectId } = mongoose.Schema.Types;

const ParticipantSchema = new mongoose.Schema(
    {
        full_name: String,
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

const BookingSchema = new mongoose.Schema(
    {
        tourId: { type: ObjectId, ref: "Tour", required: true },
        departureId: { type: ObjectId, ref: "TourDeparture", required: true },
        guideId: { type: ObjectId, ref: "User", required: true },
        touristId: { type: ObjectId, ref: "User", required: true },
        start_date: Date,
        end_date: Date,
        total_price: { type: Decimal128, required: true },
        status: {
            type: String,
            enum: ["awaiting_payment", "paid", "canceled", "completed"],
            default: "awaiting_payment",
        },
        participants: [ParticipantSchema],
    },
    { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema, "bookings");
