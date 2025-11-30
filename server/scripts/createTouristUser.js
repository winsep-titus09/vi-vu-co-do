// server/scripts/createTouristUser.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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

const Role = mongoose.model(
  "Role",
  new mongoose.Schema({}, { strict: false }),
  "roles"
);

async function createTouristUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Đã kết nối với MongoDB");

    // Find or create tourist role
    let touristRole = await Role.findOne({ name: "tourist" });
    if (!touristRole) {
      touristRole = await Role.create({
        name: "tourist",
        description: "Tourist role",
      });
      console.log("✅ Đã tạo role tourist");
    }

    // Check if tourist user already exists
    let tourist = await User.findOne({ email: "tourist@example.com" });

    if (tourist) {
      console.log("✅ User tourist đã tồn tại:");
      console.log(`   Name: ${tourist.name}`);
      console.log(`   Email: ${tourist.email}`);
      console.log(`   ID: ${tourist._id}`);
      process.exit(0);
    }

    // Create new tourist user
    const hashedPassword = await bcrypt.hash("123456", 10);

    tourist = await User.create({
      name: "Hoàng Nam",
      email: "tourist@example.com",
      password: hashedPassword,
      role_id: touristRole._id,
      phone_number: "0905123456",
      avatar_url:
        "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/placeholders/hero_slide_4.jpg",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Đã tạo user tourist thành công:");
    console.log(`   Name: ${tourist.name}`);
    console.log(`   Email: ${tourist.email}`);
    console.log(`   Password: 123456`);
    console.log(`   ID: ${tourist._id}`);
    console.log("\n💡 Bạn có thể đăng nhập với:");
    console.log("   Email: tourist@example.com");
    console.log("   Password: 123456");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

createTouristUser();
