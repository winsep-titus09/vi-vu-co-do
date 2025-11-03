// models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        // theo CSDL gốc
        recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }, // với user
        type: { type: String, required: true },        // "guide_application:new", ...
        channel: { type: String, default: "in_app" },
        content: { type: String, required: true },
        url: { type: String },
        is_read: { type: Boolean, default: false, index: true },

        // bổ sung tối thiểu cho nghiệp vụ admin-duyệt
        audience: { type: String, enum: ["admin", "user"], default: "user", index: true },
        meta: { type: Object },
    },
    { timestamps: true, collection: "notifications" }
);

export default mongoose.model("Notification", NotificationSchema);
