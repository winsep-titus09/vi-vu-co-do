// seeds/seedRoles.js
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Role from "../models/Role.js";

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "vi-vu-co-do" });

        const roles = ["admin", "guide", "tourist"];
        for (const name of roles) {
            await Role.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
        }

        console.log("✅ Đã thêm roles:", roles);
        await mongoose.disconnect();
    } catch (err) {
        console.error("❌ Lỗi:", err.message);
    }
};

run();
