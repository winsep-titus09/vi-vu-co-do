// Script to seed sample reviews for locations
import mongoose from "mongoose";
import LocationReview from "../models/LocationReview.js";
import Location from "../models/Location.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import "dotenv/config";

const sampleReviews = [
  {
    rating: 5,
    comment:
      "Địa điểm rất đẹp và ấn tượng! Kiến trúc cổ kính được bảo tồn rất tốt. Nhất định sẽ quay lại.",
  },
  {
    rating: 4,
    comment:
      "Nơi tham quan đáng giá. Cảnh quan đẹp, không gian yên tĩnh. Nên đi vào buổi sáng sớm để tránh đông người.",
  },
  {
    rating: 5,
    comment:
      "Tuyệt vời! Văn hóa và lịch sử phong phú. Hướng dẫn viên nhiệt tình. Rất khuyến khích mọi người ghé thăm.",
  },
  {
    rating: 3,
    comment:
      "Địa điểm đẹp nhưng hơi đông người. Giá vé hợp lý. Đáng để ghé thăm 1 lần.",
  },
  {
    rating: 5,
    comment:
      "Kiến trúc độc đáo, không gian rất thơ mộng. Chụp hình rất đẹp. Nhân viên thân thiện.",
  },
  {
    rating: 4,
    comment:
      "Địa điểm lịch sử quan trọng. Được giữ gìn tốt. Nên tìm hiểu trước khi đi để hiểu rõ hơn.",
  },
];

async function seedLocationReviews() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get all locations
    const locations = await Location.find({});
    console.log(`Found ${locations.length} locations`);

    // Get all users (tourists) - find by role_id
    const touristRole = await Role.findOne({ name: "tourist" });
    if (!touristRole) {
      console.log("❌ Tourist role not found.");
      process.exit(1);
    }

    const users = await User.find({ role_id: touristRole._id }).limit(10);
    if (users.length === 0) {
      console.log("⚠️  No users found. Please create some users first.");
      process.exit(0);
    }
    console.log(`Found ${users.length} users`);

    // Clear existing reviews
    await LocationReview.deleteMany({});
    console.log("✅ Cleared existing location reviews");

    let reviewsCreated = 0;

    // Create 3-6 reviews for each location
    for (const location of locations) {
      const numReviews = Math.floor(Math.random() * 4) + 3; // 3-6 reviews
      const shuffledReviews = [...sampleReviews].sort(
        () => 0.5 - Math.random()
      );
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random());

      for (let i = 0; i < numReviews && i < shuffledUsers.length; i++) {
        const reviewData = shuffledReviews[i % shuffledReviews.length];

        try {
          await LocationReview.create({
            location_id: location._id,
            user_id: shuffledUsers[i]._id,
            rating: reviewData.rating,
            comment: reviewData.comment,
            visit_date: new Date(
              Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
            ), // Random date within last 90 days
            status: "approved",
          });
          reviewsCreated++;
        } catch (err) {
          // Skip if duplicate (same user already reviewed this location)
          if (err.code !== 11000) {
            console.error(
              `Error creating review for ${location.name}:`,
              err.message
            );
          }
        }
      }

      console.log(`✅ Created reviews for: ${location.name}`);
    }

    console.log(`\n✅ Successfully created ${reviewsCreated} location reviews`);
    console.log("\n📊 Verifying location ratings update...");

    // Check if ratings were updated
    const updatedLocations = await Location.find({}).select(
      "name average_rating review_count"
    );
    updatedLocations.forEach((loc) => {
      console.log(
        `   ${loc.name}: ⭐ ${loc.average_rating.toFixed(1)} (${
          loc.review_count
        } reviews)`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding reviews:", error);
    process.exit(1);
  }
}

seedLocationReviews();
