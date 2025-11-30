// server/scripts/deleteAndRecreateTourist.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

const User = mongoose.model(
  "User",
  new mongoose.Schema({}, { strict: false }),
  "users"
);

const Booking = mongoose.model(
  "Booking",
  new mongoose.Schema({}, { strict: false }),
  "bookings"
);

const Notification = mongoose.model(
  "Notification",
  new mongoose.Schema({}, { strict: false }),
  "notifications"
);

async function deleteAndRecreate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Đã kết nối với MongoDB");

    // Delete old tourist user and related data
    const oldTourist = await User.findOne({ email: "tourist@example.com" });

    if (oldTourist) {
      await Booking.deleteMany({ userId: oldTourist._id });
      await Notification.deleteMany({ userId: oldTourist._id });
      await User.deleteOne({ _id: oldTourist._id });
      console.log("🗑️  Đã xóa user tourist cũ và dữ liệu liên quan");
    }

    console.log("\n✅ Hoàn tất! Bây giờ chạy:");
    console.log("   node server/scripts/createTouristUser.js");
    console.log("   node server/scripts/seedTouristDashboard.js");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

deleteAndRecreate();
