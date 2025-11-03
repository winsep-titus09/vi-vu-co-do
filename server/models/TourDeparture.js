import mongoose from "mongoose";
const TourDepartureSchema = new mongoose.Schema(
    {
        tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
        depart_date: { type: Date, required: true },
        capacity: { type: Number, default: 0 },
        seats_sold: { type: Number, default: 0 },
        status: { type: String, enum: ["open", "closed", "canceled"], default: "open" },
    },
    { timestamps: true }
);
TourDepartureSchema.index({ tourId: 1, depart_date: 1 }, { unique: true });
export default mongoose.model("TourDeparture", TourDepartureSchema, "tour_departures");
