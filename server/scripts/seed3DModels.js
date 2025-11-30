// server/scripts/seed3DModels.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import ThreeDModel from "../models/ThreeDModel.js";
import Location from "../models/Location.js";

await connectDB();

async function seed3DModels() {
  try {
    console.log("🗑️  Clearing existing 3D models...");
    await ThreeDModel.deleteMany({});

    console.log("📋 Finding locations...");
    const locations = await Location.find().limit(10);

    if (locations.length === 0) {
      console.log("⚠️  No locations found. Please seed locations first.");
      process.exit(0);
    }

    const models = [
      {
        name: "Ngọ Môn - Cổng chính Đại Nội",
        description:
          "Mô hình 3D chi tiết của Ngọ Môn, cổng chính vào Đại Nội Huế với kiến trúc nguy nga tráng lệ. Khám phá từng chi tiết kiến trúc cung đình thời Nguyễn.",
        file_url:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/models/ngomon.glb",
        file_type: "glb",
        thumbnail_url:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/ngomon_3d_placeholder.jpg",
        hotspots: [
          { x: 0, y: 2, z: 0, label: "Lầu Ngũ Phụng" },
          { x: -3, y: 0, z: 2, label: "Cửa Tả Dực Môn" },
          { x: 3, y: 0, z: 2, label: "Cửa Hữu Dực Môn" },
        ],
        locationId: locations[0]._id,
      },
      {
        name: "Điện Thái Hòa - Điện chính triều",
        description:
          "Mô hình 3D Điện Thái Hòa, nơi diễn ra các nghi lễ trọng đại của triều đình. Xoay 360 độ để chiêm ngưỡng kiến trúc độc đáo.",
        file_url:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/models/thaihoa.glb",
        file_type: "glb",
        thumbnail_url:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/thaihoa_3d.jpg",
        hotspots: [
          { x: 0, y: 3, z: 0, label: "Mái điện chính" },
          { x: -2, y: 0.5, z: 3, label: "Sân Đại Triều" },
        ],
        locationId: locations[0]._id,
      },
      {
        name: "Lăng Khải Định",
        description:
          "Mô hình 3D toàn cảnh Lăng Khải Định với kiến trúc Đông Tây kết hợp độc đáo. Phóng to để xem từng chi tiết trang trí tinh xảo.",
        file_url:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/models/lang-khai-dinh.glb",
        file_type: "glb",
        thumbnail_url:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/langkhaidinh_3d.jpg",
        hotspots: [
          { x: 0, y: 5, z: 0, label: "Thiên Định Điện" },
          { x: -4, y: 0, z: 6, label: "Bảo Đỉnh" },
        ],
        locationId: locations[1]?._id || locations[0]._id,
      },
      {
        name: "Chùa Thiên Mụ",
        description:
          "Mô hình 3D tháp Phước Duyên - biểu tượng của Chùa Thiên Mụ. Khám phá kiến trúc Phật giáo Việt Nam cổ kính.",
        file_url:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/models/thienmu.glb",
        file_type: "glb",
        thumbnail_url:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/thienmu_3d.jpg",
        hotspots: [
          { x: 0, y: 8, z: 0, label: "Tầng 7 - Đỉnh tháp" },
          { x: 0, y: 0, z: 4, label: "Chuông đồng" },
        ],
        locationId: locations[2]?._id || locations[0]._id,
      },
      {
        name: "Lăng Tự Đức - Toàn cảnh",
        description:
          "Mô hình 3D panorama 360° toàn cảnh Lăng Tự Đức, lăng mộ hoành tráng nhất của các vị vua Nguyễn.",
        file_url:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/models/lang-tu-duc-pano.jpg",
        file_type: "panorama",
        thumbnail_url:
          "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/disan/langtuduc_pano.jpg",
        hotspots: [
          { x: 0, y: 0, z: -5, label: "Hòa Khiêm Điện" },
          { x: 3, y: 0, z: 0, label: "Hồ Lưu Khiêm" },
        ],
        locationId: locations[3]?._id || locations[0]._id,
      },
    ];

    console.log("✅ Creating 3D models...");
    const created = await ThreeDModel.insertMany(models);

    console.log(`\n✅ Created ${created.length} 3D models:`);
    created.forEach((model) => {
      console.log(`  - ${model.name} (${model.file_type})`);
      console.log(
        `    Location: ${
          locations.find((l) => l._id.equals(model.locationId))?.name || "N/A"
        }`
      );
    });

    console.log("\n✅ Seed 3D models complete!");
  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed3DModels();
