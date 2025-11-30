// scripts/seedGuideBusyDates.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import GuideBusyDate from "../models/GuideDate.js";

dotenv.config();

async function seedGuideBusyDates() {
  try {
    await connectDB();

    // Get all guides
    const guides = await User.find({ role: "guide" }).lean();
    if (!guides.length) {
      console.log("⚠️ No guides found. Please seed guides first.");
      process.exit(0);
    }

    console.log(`📋 Found ${guides.length} guides`);

    // Clear existing busy dates
    await GuideBusyDate.deleteMany({});
    console.log("🗑️ Cleared existing busy dates");

    const busyDates = [];
    const today = new Date();

    for (const guide of guides) {
      // Add 3-5 random busy dates in the next 30 days for each guide
      const numBusyDates = Math.floor(Math.random() * 3) + 3; // 3-5 dates
      const addedDates = new Set();

      for (let i = 0; i < numBusyDates; i++) {
        // Random day in next 30 days
        const randomDays = Math.floor(Math.random() * 30);
        const busyDate = new Date(today);
        busyDate.setDate(today.getDate() + randomDays);

        const dateStr = busyDate.toISOString().split("T")[0];

        // Skip if already added for this guide
        if (addedDates.has(dateStr)) continue;
        addedDates.add(dateStr);

        const reasons = [
          "Đã có lịch tour riêng",
          "Nghỉ phép",
          "Đã đặt trước",
          "Công việc cá nhân",
          null,
        ];

        busyDates.push({
          guide_id: guide._id,
          date: busyDate,
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          is_full_day: Math.random() > 0.3, // 70% full day
          start_time: Math.random() > 0.3 ? null : "08:00",
          end_time: Math.random() > 0.3 ? null : "17:00",
        });
      }
    }

    await GuideBusyDate.insertMany(busyDates);
    console.log(
      `✅ Created ${busyDates.length} busy dates for ${guides.length} guides`
    );

    // Show sample
    const samples = await GuideBusyDate.find()
      .populate("guide_id", "name")
      .limit(5)
      .lean();

    console.log("\n📅 Sample busy dates:");
    samples.forEach((bd) => {
      console.log(
        `  - ${bd.guide_id.name}: ${bd.date.toISOString().split("T")[0]} (${
          bd.reason || "No reason"
        })`
      );
    });

    console.log("\n✅ Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding busy dates:", error);
    process.exit(1);
  }
}

seedGuideBusyDates();
