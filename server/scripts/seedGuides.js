// server/scripts/seedGuides.js
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import GuideProfile from "../models/GuideProfile.js";
import bcrypt from "bcryptjs";

const guides = [
  {
    name: "Minh Hương",
    email: "minhuong@vivucodo.com",
    phone: "0901234567",
    introduction: "Chuyên gia Lịch sử & Văn hóa",
    bio: "10 năm nghiên cứu về triều Nguyễn. Tôi sẽ kể cho bạn nghe những bí mật chưa từng được viết trong sách sử.",
    avatar_url:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/chandung/1.jpg",
    languages: ["vi", "en"],
    experience: "5 năm kinh nghiệm hướng dẫn du lịch lịch sử văn hóa",
    expertise: "Lịch sử triều Nguyễn, Di sản thế giới",
    is_featured: true,
  },
  {
    name: "Trần Văn Đức",
    email: "tranvanduc@vivucodo.com",
    phone: "0901234568",
    introduction: "Chuyên gia Ẩm thực",
    bio: "Sinh ra trong gia đình làm bún bò truyền thống. Hãy cùng tôi len lỏi vào những con hẻm nhỏ để nếm vị Huế chuẩn nhất.",
    avatar_url:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/chandung/2.jpg",
    languages: ["vi"],
    experience: "8 năm kinh nghiệm hướng dẫn ẩm thực",
    expertise: "Ẩm thực cung đình, Ẩm thực dân gian",
    is_featured: true,
  },
  {
    name: "Alex Nguyen",
    email: "alexnguyen@vivucodo.com",
    phone: "0901234569",
    introduction: "Nhiếp ảnh & Nghệ thuật",
    bio: "Đam mê những góc máy lạ của Cố Đô. Tôi sẽ giúp bạn có những bức ảnh 'để đời' tại Lăng Tự Đức và Đại Nội.",
    avatar_url:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/chandung/3.jpg",
    languages: ["en", "fr", "vi"],
    experience: "6 năm kinh nghiệm nhiếp ảnh du lịch",
    expertise: "Nhiếp ảnh nghệ thuật, Photography tour",
    is_featured: true,
  },
  {
    name: "Lê Thanh Bình",
    email: "lethanhbinh@vivucodo.com",
    phone: "0901234570",
    introduction: "Thiền & Tâm linh",
    bio: "Tìm về sự an yên tại các ngôi chùa cổ. Tôi sẽ hướng dẫn bạn các nghi thức thiền trà và nghe pháp thoại.",
    avatar_url:
      "https://pub-23c6fed798bd4dcf80dc1a3e7787c124.r2.dev/chandung/4.jpg",
    languages: ["vi", "en"],
    experience: "10 năm nghiên cứu Phật học",
    expertise: "Du lịch tâm linh, Thiền học",
    is_featured: true,
  },
];

async function seedGuides() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Get guide role
    const guideRole = await Role.findOne({ name: "guide" });
    if (!guideRole) {
      console.error("❌ Guide role not found. Please seed roles first.");
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash("guide123", 10);

    for (const guideData of guides) {
      // Check if user exists
      let user = await User.findOne({ email: guideData.email });

      if (!user) {
        // Create user
        user = await User.create({
          name: guideData.name,
          email: guideData.email,
          password: hashedPassword,
          phone: guideData.phone,
          avatar_url: guideData.avatar_url,
          bio: guideData.bio,
          role_id: guideRole._id,
          status: "active",
        });
        console.log(`✅ Created user: ${user.name}`);
      }

      // Check if guide profile exists
      let guideProfile = await GuideProfile.findOne({ user_id: user._id });

      if (!guideProfile) {
        // Create guide profile
        guideProfile = await GuideProfile.create({
          user_id: user._id,
          introduction: guideData.introduction,
          experience: guideData.experience,
          languages: guideData.languages,
          expertise: guideData.expertise,
          is_featured: guideData.is_featured,
          status: "approved",
        });
        console.log(`✅ Created guide profile for: ${user.name}`);
      } else {
        // Update existing profile to be featured
        guideProfile.is_featured = guideData.is_featured;
        guideProfile.introduction = guideData.introduction;
        guideProfile.experience = guideData.experience;
        guideProfile.languages = guideData.languages;
        guideProfile.expertise = guideData.expertise;
        await guideProfile.save();
        console.log(`✅ Updated guide profile for: ${user.name}`);
      }
    }

    console.log("\n✅ Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding guides:", error);
    process.exit(1);
  }
}

seedGuides();
