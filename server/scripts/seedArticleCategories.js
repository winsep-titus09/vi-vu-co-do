// server/scripts/seedArticleCategories.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import ArticleCategory from "../models/ArticleCategory.js";

const categories = [
  { name: "Ẩm thực Huế", slug: "am-thuc-hue" },
  { name: "Văn hóa & Di sản", slug: "van-hoa-di-san" },
  { name: "Kinh nghiệm du lịch", slug: "kinh-nghiem-du-lich" },
  { name: "Nghệ thuật & Nhiếp ảnh", slug: "nghe-thuat-nhiep-anh" },
  { name: "Lịch sử triều Nguyễn", slug: "lich-su-trieu-nguyen" },
];

async function seedCategories() {
  try {
    await connectDB();
    console.log("🌱 Seeding article categories...");

    // Clear existing categories
    await ArticleCategory.deleteMany({});
    console.log("✅ Cleared existing categories");

    // Insert new categories
    const created = await ArticleCategory.insertMany(categories);
    console.log(`✅ Created ${created.length} categories:`);
    created.forEach((cat) => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });

    console.log("✅ Article categories seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
