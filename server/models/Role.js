import mongoose from "mongoose";
const RoleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true }, // 'admin' | 'guide' | 'tourist'
    },
    { timestamps: true }
);
export default mongoose.model("Role", RoleSchema, "roles");
