// Script to add Phase 1 data to existing locations
import mongoose from "mongoose";
import Location from "../models/Location.js";
import "dotenv/config";

const sampleHighlights = [
  {
    name: "Đại Nội Huế",
    description: "Khám phá cung điện hoàng gia của triều đại Nguyễn",
    duration: "2 giờ",
    tip: "Nên thuê hướng dẫn viên để hiểu rõ lịch sử",
    order: 1,
  },
  {
    name: "Tử Cấm Thành",
    description: "Khu vực cấm địa của hoàng gia",
    duration: "1 giờ",
    tip: "Tránh đi vào giờ nắng gắt",
    order: 2,
  },
  {
    name: "Thế Miếu",
    description: "Nơi thờ phụng các vua triều Nguyễn",
    duration: "30 phút",
    tip: "Giữ yên lặng và tôn trọng",
    order: 3,
  },
];

async function seedLocationData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Update all locations with sample data
    const locations = await Location.find({});

    for (const loc of locations) {
      // Only update if fields are empty
      if (!loc.opening_hours) {
        loc.opening_hours = "07:00 - 17:30";
      }
      if (!loc.ticket_price || loc.ticket_price.toString() === "0") {
        // Random ticket price or free
        loc.ticket_price =
          Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 200000);
        loc.ticket_price_currency = "VND";
      }
      if (!loc.best_visit_time) {
        const times = [
          "Sáng sớm",
          "Hoàng hôn",
          "Cả ngày",
          "Buổi chiều",
          "Sáng sớm / Hoàng hôn",
        ];
        loc.best_visit_time = times[Math.floor(Math.random() * times.length)];
      }
      if (!loc.highlights || loc.highlights.length === 0) {
        // Add 2-3 random highlights
        const numHighlights = Math.floor(Math.random() * 2) + 2;
        loc.highlights = sampleHighlights.slice(0, numHighlights);
      }

      await loc.save();
      console.log(`✅ Updated: ${loc.name}`);
    }

    console.log(`\n✅ Successfully updated ${locations.length} locations`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seedLocationData();
