// scripts/seedGuideReviews.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import GuideProfile from "../models/GuideProfile.js";

dotenv.config();

async function seedGuideReviews() {
  try {
    await connectDB();

    // Get all guides and tourists
    const guides = await User.find({ role: "guide" }).lean();
    const tourists = await User.find({ role: "tourist" }).lean();

    if (!guides.length) {
      console.log("⚠️ No guides found. Please seed guides first.");
      process.exit(0);
    }

    if (!tourists.length) {
      console.log("⚠️ No tourists found. Creating sample tourists...");
      // Create sample tourists
      const sampleTourists = [
        {
          name: "Hoàng Nam",
          email: "hoangnam@example.com",
          password: "password123",
          role: "tourist",
        },
        {
          name: "Thanh Hà",
          email: "thanhha@example.com",
          password: "password123",
          role: "tourist",
        },
        {
          name: "Minh Tuấn",
          email: "minhtuan@example.com",
          password: "password123",
          role: "tourist",
        },
        {
          name: "Thu Hương",
          email: "thuhuong@example.com",
          password: "password123",
          role: "tourist",
        },
      ];
      await User.insertMany(sampleTourists);
      tourists.push(...(await User.find({ role: "tourist" }).lean()));
      console.log(`✅ Created ${sampleTourists.length} sample tourists`);
    }

    console.log(
      `📋 Found ${guides.length} guides and ${tourists.length} tourists`
    );

    // Clear existing guide reviews
    await Review.deleteMany({ review_type: "guide" });
    console.log("🗑️ Cleared existing guide reviews");

    const reviews = [];
    const reviewComments = [
      "Hướng dẫn viên rất nhiệt tình và am hiểu lịch sử. Cách kể chuyện lôi cuốn, không hề nhàm chán!",
      "Chuyến đi tuyệt vời nhờ có guide chuyên nghiệp. Rất đáng tiền và sẽ quay lại!",
      "Guide rất tận tâm, luôn quan tâm đến từng thành viên trong đoàn. Kiến thức sâu rộng về văn hóa địa phương.",
      "Một trải nghiệm tuyệt vời! Guide vui tính và am hiểu, khiến chuyến đi thêm ý nghĩa.",
      "Chuyên nghiệp, đúng giờ, kiến thức tốt. Rất hài lòng với dịch vụ.",
      "Guide rất nhiệt tình hướng dẫn và chụp ảnh đẹp cho cả đoàn. Sẽ giới thiệu cho bạn bè!",
      "Kinh nghiệm phong phú, giải thích rất dễ hiểu. Chuyến đi rất thú vị!",
      "Thái độ phục vụ tốt, luôn sẵn sàng hỗ trợ. Đáng tin cậy!",
    ];

    for (const guide of guides) {
      // Each guide gets 3-6 reviews
      const numReviews = Math.floor(Math.random() * 4) + 3; // 3-6 reviews

      for (let i = 0; i < numReviews; i++) {
        const randomTourist =
          tourists[Math.floor(Math.random() * tourists.length)];
        const rating = Math.random() > 0.2 ? 5 : Math.random() > 0.5 ? 4 : 3; // 80% are 5 stars

        const daysAgo = Math.floor(Math.random() * 90); // Reviews within last 90 days
        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() - daysAgo);

        reviews.push({
          user_id: randomTourist._id,
          review_type: "guide",
          guide_id: guide._id,
          rating,
          comment:
            reviewComments[Math.floor(Math.random() * reviewComments.length)],
          status: "approved",
          createdAt: reviewDate,
          updatedAt: reviewDate,
        });
      }
    }

    await Review.insertMany(reviews);
    console.log(
      `✅ Created ${reviews.length} reviews for ${guides.length} guides`
    );

    // Update guide profiles with rating and review count
    for (const guide of guides) {
      const guideReviews = reviews.filter(
        (r) => r.guide_id.toString() === guide._id.toString()
      );
      const avgRating =
        guideReviews.reduce((sum, r) => sum + r.rating, 0) /
        guideReviews.length;

      await GuideProfile.findOneAndUpdate(
        { user_id: guide._id },
        {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: guideReviews.length,
        }
      );
    }
    console.log("✅ Updated guide profiles with ratings and review counts");

    // Show sample reviews
    const samples = await Review.find({ review_type: "guide" })
      .populate("user_id", "name")
      .populate("guide_id", "name")
      .limit(5)
      .lean();

    console.log("\n⭐ Sample reviews:");
    samples.forEach((review) => {
      console.log(
        `  - ${review.user_id.name} → ${review.guide_id.name}: ${
          review.rating
        }⭐ "${review.comment.substring(0, 60)}..."`
      );
    });

    console.log("\n✅ Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding reviews:", error);
    process.exit(1);
  }
}

seedGuideReviews();
