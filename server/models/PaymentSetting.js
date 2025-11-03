import mongoose from "mongoose";
const PaymentSettingSchema = new mongoose.Schema(
    {
        gateway: { type: String, enum: ["momo", "vnpay"], required: true, unique: true },
        config: { type: mongoose.Schema.Types.Mixed, required: true }, // partnerCode, accessKey, secretKey, endpoint...
        is_active: { type: Boolean, default: true },
    },
    { timestamps: true }
);
export default mongoose.model("PaymentSetting", PaymentSettingSchema, "payment_settings");
