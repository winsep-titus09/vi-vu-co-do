// server/models/GuideDate. js
import mongoose from "mongoose";

const GuideBusyDateSchema = new mongoose.Schema(
    {
        guide_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        date: {
            type: Date,
            required: true,
        },
        reason: {
            type: String,
            default: null,
            trim: true,
            maxlength: 500,
        },
        // Có thể đánh dấu bận cả ngày hoặc khoảng thời gian cụ thể
        is_full_day: {
            type: Boolean,
            default: true,
        },
        start_time: {
            type: String, // "08:00"
            default: null,
        },
        end_time: {
            type: String, // "18:00"
            default: null,
        },
    },
    { timestamps: true, collection: "guide_busy_dates" }
);

// Index compound để đảm bảo không trùng ngày cho cùng 1 HDV
GuideBusyDateSchema.index({ guide_id: 1, date: 1 }, { unique: true });

// Index để query nhanh theo ngày
GuideBusyDateSchema.index({ date: 1 });

export default mongoose.model("GuideBusyDate", GuideBusyDateSchema);