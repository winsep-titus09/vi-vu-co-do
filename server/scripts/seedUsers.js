// Script to create sample users for testing
import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";
import "dotenv/config";

const sampleUsers = [
  { name: "Nguyễn Văn An", email: "an.nguyen@test.com", role: "tourist" },
  { name: "Trần Thị Bình", email: "binh.tran@test.com", role: "tourist" },
  { name: "Lê Hoàng Cường", email: "cuong.le@test.com", role: "tourist" },
  { name: "Phạm Thị Dung", email: "dung.pham@test.com", role: "tourist" },
  { name: "Hoàng Văn Em", email: "em.hoang@test.com", role: "tourist" },
  { name: "Vũ Thị Phương", email: "phuong.vu@test.com", role: "tourist" },
  { name: "Đỗ Văn Giang", email: "giang.do@test.com", role: "tourist" },
  { name: "Bùi Thị Hà", email: "ha.bui@test.com", role: "tourist" },
  { name: "Ngô Văn Hùng", email: "hung.ngo@test.com", role: "tourist" },
  { name: "Đinh Thị Lan", email: "lan.dinh@test.com", role: "tourist" },
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get tourist role
    const touristRole = await Role.findOne({ name: "tourist" });
    if (!touristRole) {
      console.error("❌ Tourist role not found. Please run role seeder first.");
      process.exit(1);
    }
    console.log(`✅ Found tourist role: ${touristRole._id}`);

    // Check existing users
    const existingUsers = await User.find({ role_id: touristRole._id });
    console.log(`Found ${existingUsers.length} existing tourist users`);

    if (existingUsers.length >= 10) {
      console.log("✅ Sufficient users already exist. No need to create more.");
      process.exit(0);
    }

    let usersCreated = 0;

    for (const userData of sampleUsers) {
      try {
        const existingUser = await User.findOne({ email: userData.email });
        if (!existingUser) {
          await User.create({
            ...userData,
            role_id: touristRole._id,
            password: "password123", // Will be hashed by model pre-save hook
            phone_number: `090${Math.floor(Math.random() * 10000000)
              .toString()
              .padStart(7, "0")}`,
            status: "active",
          });
          usersCreated++;
          console.log(`✅ Created user: ${userData.name}`);
        } else {
          console.log(`⏭️  User already exists: ${userData.email}`);
        }
      } catch (err) {
        console.error(`Error creating user ${userData.name}:`, err.message);
      }
    }

    console.log(`\n✅ Successfully created ${usersCreated} new users`);

    const totalUsers = await User.countDocuments({ role_id: touristRole._id });
    console.log(`📊 Total tourist users: ${totalUsers}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();
