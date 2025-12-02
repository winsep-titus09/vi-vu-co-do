// scripts/seedGuideReviews.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";

dotenv.config();

async function seedGuideReviews() {
  try {
    await connectDB();

    // Get role IDs
    const guideRole = await Role.findOne({ name: "guide" }).lean();
    const touristRole = await Role.findOne({ name: "tourist" }).lean();

    if (!guideRole || !touristRole) {
      console.log("⚠️ Roles not found.");
      process.exit(0);
    }

    // Get guides and tourists using role_id
    // Ưu tiên guide đang test (guide@example.com)
    const testGuide = await User.findOne({ email: "guide@example.com" }).lean();
    const otherGuides = await User.find({
      role_id: guideRole._id,
      email: { $ne: "guide@example.com" },
    })
      .limit(2)
      .lean();

    const guides = testGuide ? [testGuide, ...otherGuides] : otherGuides;
    const tourists = await User.find({ role_id: touristRole._id })
      .limit(5)
      .lean();
    const tours = await Tour.find({ status: "active" }).limit(5).lean();

    if (!guides.length) {
      console.log("⚠️ No guides found.");
      process.exit(0);
    }

    if (!tourists.length) {
      console.log("⚠️ No tourists found.");
      process.exit(0);
    }

    if (!tours.length) {
      console.log("⚠️ No tours found.");
      process.exit(0);
    }

    console.log(
      `📋 Found ${guides.length} guides, ${tourists.length} tourists, ${tours.length} tours`
    );

    // Review comments
    const reviewComments = [
      "Hướng dẫn viên rất nhiệt tình và am hiểu lịch sử. Chuyến đi tuyệt vời!",
      "Anh/chị hướng dẫn rất chuyên nghiệp, giải thích chi tiết và thú vị.",
      "Tour rất hay, hướng dẫn viên thân thiện. Highly recommended!",
      "Great experience! The guide was very knowledgeable about Hue's history.",
      "Gia đình mình rất hài lòng. Các bé rất thích cách chị hướng dẫn kể chuyện.",
      "Tour ổn, hướng dẫn viên nhiệt tình.",
      "Perfect! Best tour guide ever. Will definitely book again!",
      "Rất đáng tiền, chụp ảnh siêu đẹp. Anh hướng dẫn còn chỉ góc chụp đẹp nữa.",
    ];

    const guideReplies = [
      "Cảm ơn bạn đã đánh giá! Rất vui vì bạn đã có trải nghiệm tuyệt vời. Hẹn gặp lại!",
      "Thank you so much! Hope to see you again in Hue!",
      "Cảm ơn góp ý của bạn. Mình sẽ cố gắng cải thiện!",
      null, // No reply
      null,
    ];

    let createdBookings = 0;
    let createdReviews = 0;

    for (const guide of guides) {
      console.log(`\n🔄 Creating reviews for guide: ${guide.name}`);

      // Create 3-5 reviews per guide
      const numReviews = Math.floor(Math.random() * 3) + 3;

      for (let i = 0; i < numReviews; i++) {
        const tourist = tourists[i % tourists.length];
        const tour = tours[i % tours.length];
        const rating = Math.random() > 0.3 ? 5 : Math.random() > 0.5 ? 4 : 3;

        // Create past date (1-8 weeks ago)
        const weeksAgo = Math.floor(Math.random() * 8) + 1;
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - weeksAgo * 7);

        // Create booking
        const booking = await Booking.create({
          customer_id: tourist._id,
          tour_id: tour._id,
          intended_guide_id: guide._id,
          status: "completed",
          start_date: pastDate,
          end_date: pastDate,
          total_price: tour.price || 500000,
          paid_amount: tour.price || 500000,
          paidAmount: tour.price || 500000,
          num_guests: Math.floor(Math.random() * 4) + 1,
          createdAt: pastDate,
          updatedAt: new Date(),
        });

        createdBookings++;

        // Create review
        const reviewData = {
          bookingId: booking._id,
          guide_rating: rating,
          guide_comment:
            reviewComments[Math.floor(Math.random() * reviewComments.length)],
          guide_rated_at: new Date(pastDate.getTime() + 24 * 60 * 60 * 1000),
          tour_rating: rating,
          tour_comment: "Tour tổ chức tốt.",
          tour_rated_at: new Date(pastDate.getTime() + 24 * 60 * 60 * 1000),
        };

        // Maybe add reply
        const reply =
          guideReplies[Math.floor(Math.random() * guideReplies.length)];
        if (reply) {
          reviewData.guide_reply = reply;
          reviewData.guide_reply_at = new Date(
            pastDate.getTime() + 48 * 60 * 60 * 1000
          );
        }

        await Review.create(reviewData);
        createdReviews++;

        console.log(
          `  ⭐ Created: ${rating} stars${reply ? " (with reply)" : ""}`
        );
      }
    }

    console.log(
      `\n✅ Done! Created ${createdBookings} bookings and ${createdReviews} reviews.`
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedGuideReviews();
