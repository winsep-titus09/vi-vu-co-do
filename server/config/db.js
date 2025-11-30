// config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
    const uri = process.env.MONGO_URI;

    mongoose.set("strictQuery", true);

    try {
        const conn = await mongoose.connect(uri, {
            dbName: "vi-vu-co-do",
        });
        console.log("✅ Đã kêt nối với mongo:", conn.connection.host, `db: ${conn.connection.name}`);
    } catch (err) {
        console.error("❌ Lỗi kết nối đến mongo:", err.message);
        process.exit(1);
    }
};
