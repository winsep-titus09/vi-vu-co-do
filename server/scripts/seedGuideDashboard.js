// server/scripts/seedGuideDashboard.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Tour from "../models/Tour.js";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import Role from "../models/Role.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/viet_travel";

async function seedGuideDashboard() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 0. Get guide role_id
    let guideRole = await Role.findOne({ name: "guide" });
    if (!guideRole) {
      guideRole = await Role.create({
        name: "guide",
        description: "Hướng dẫn viên",
      });
      console.log("✅ Created guide role");
    }

    // 1. Find or create guide user
    let guide = await User.findOne({ email: "guide@example.com" });
    if (!guide) {
      const hashedPassword = await bcrypt.hash("123456", 10);
      guide = await User.create({
        name: "Minh Hương",
        email: "guide@example.com",
        password: hashedPassword,
        role: "guide",
        role_id: guideRole._id,
        phone_number: "0905123456",
        avatar_url: "https://i.pravatar.cc/150?img=25",
        is_verified: true,
      });
      console.log("✅ Created guide user:", guide.email);
    } else {
      console.log("ℹ️ Guide user already exists:", guide.email);
    }

    // 2. Find tours and assign guide
    const tours = await Tour.find().limit(5);
    if (tours.length === 0) {
      console.log("⚠️ No tours found. Please seed tours first.");
      return;
    }

    // Assign guide to tours
    for (const tour of tours) {
      const hasGuide = tour.guides?.some(
        (g) => String(g.guideId) === String(guide._id)
      );
      if (!hasGuide) {
        tour.guides = tour.guides || [];
        tour.guides.push({
          guideId: guide._id,
          percentage: 0.15, // 15% commission
          role: "primary",
        });
        await tour.save();
      }
    }
    console.log(`✅ Assigned guide to ${tours.length} tours`);

    // 3. Find tourists (check both role and role_id)
    const touristRole = await Role.findOne({ name: "tourist" });
    const tourists = await User.find({
      $or: [{ role: "tourist" }, { role_id: touristRole?._id }],
    }).limit(3);

    if (tourists.length === 0) {
      console.log("⚠️ No tourists found. Please seed tourist data first.");
      return;
    }

    // Delete existing bookings for this guide
    await Booking.deleteMany({ intended_guide_id: guide._id });
    await Notification.deleteMany({ recipientId: guide._id });
    console.log("✅ Cleaned up old guide bookings and notifications");

    // 4. Create booking requests (waiting_guide status)
    const bookingRequests = [];

    // Booking request 1 - Pending
    const newBooking1 = await Booking.create({
      tour_id: tours[0]._id,
      customer_id: tourists[0]._id,
      intended_guide_id: guide._id,
      start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      start_time: "08:00",
      end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      participants: [
        { name: "Nguyễn Văn A", age: 35, count_slot: true },
        { name: "Nguyễn Thị B", age: 32, count_slot: true },
        { name: "Nguyễn C", age: 8, count_slot: true },
        { name: "Nguyễn D", age: 5, count_slot: true },
      ],
      total_price: 3600000,
      status: "waiting_guide",
      guide_decision: {
        status: "pending",
      },
      payment_method: "momo",
      special_requests: "Có trẻ em nhỏ",
    });
    bookingRequests.push(newBooking1);
    console.log("✅ Created booking request 1");

    // Booking request 2 - Pending
    if (tourists.length > 1 && tours.length > 1) {
      const newBooking2 = await Booking.create({
        tour_id: tours[1]._id,
        customer_id: tourists[1]._id,
        intended_guide_id: guide._id,
        start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        start_time: "14:00",
        end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        participants: [
          { name: "Sarah Jenkins", age: 28, count_slot: true },
          { name: "John Smith", age: 30, count_slot: true },
        ],
        total_price: 1000000,
        status: "waiting_guide",
        guide_decision: {
          status: "pending",
        },
        payment_method: "visa",
      });
      bookingRequests.push(newBooking2);
      console.log("✅ Created booking request 2");
    }

    // Booking request 3 - Pending
    if (tourists.length > 2 && tours.length > 2) {
      const newBooking3 = await Booking.create({
        tour_id: tours[2]._id,
        customer_id: tourists[2]._id,
        intended_guide_id: guide._id,
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        start_time: "09:00",
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        participants: [{ name: "Trần Văn E", age: 45, count_slot: true }],
        total_price: 800000,
        status: "waiting_guide",
        guide_decision: {
          status: "pending",
        },
        payment_method: "momo",
      });
      bookingRequests.push(newBooking3);
      console.log("✅ Created booking request 3");
    }

    // 5. Create upcoming confirmed bookings
    const confirmedBookings = [];

    // Confirmed booking 1 - Tomorrow
    if (tours.length > 3 && tourists.length > 0) {
      const newConfirmed1 = await Booking.create({
        tour_id: tours[3]._id,
        customer_id: tourists[0]._id,
        intended_guide_id: guide._id,
        start_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        start_time: "08:00",
        end_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        participants: [
          { name: "Lê Văn F", age: 35, count_slot: true },
          { name: "Lê Thị G", age: 30, count_slot: true },
        ],
        total_price: 1500000,
        paid_amount: 1500000,
        status: "paid",
        guide_decision: {
          status: "accepted",
          decided_at: new Date(),
          decided_by: guide._id,
        },
        payment_method: "momo",
        payment_status: "paid",
      });
      confirmedBookings.push(newConfirmed1);
      console.log("✅ Created confirmed booking 1 (Tomorrow)");
    }

    // Confirmed booking 2 - In 3 days
    if (tours.length > 4 && tourists.length > 1) {
      const newConfirmed2 = await Booking.create({
        tour_id: tours[4]._id,
        customer_id: tourists[1]._id,
        intended_guide_id: guide._id,
        start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        start_time: "14:00",
        end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        participants: [
          { name: "Phạm H", age: 28, count_slot: true },
          { name: "Phạm I", age: 25, count_slot: true },
          { name: "Phạm J", age: 22, count_slot: true },
          { name: "Phạm K", age: 20, count_slot: true },
          { name: "Phạm L", age: 18, count_slot: true },
          { name: "Phạm M", age: 16, count_slot: true },
        ],
        total_price: 4200000,
        paid_amount: 4200000,
        status: "paid",
        guide_decision: {
          status: "accepted",
          decided_at: new Date(),
          decided_by: guide._id,
        },
        payment_method: "visa",
        payment_status: "paid",
      });
      confirmedBookings.push(newConfirmed2);
      console.log("✅ Created confirmed booking 2 (3 days)");
    }

    // 6. Create notifications for guide
    const notifications = [];

    for (const booking of bookingRequests) {
      const tour = await Tour.findById(booking.tour_id);
      const tourist = await User.findById(booking.customer_id);

      const notif = await Notification.create({
        recipientId: guide._id,
        type: "booking_request",
        content: `${tourist?.name || "Khách hàng"} yêu cầu đặt tour "${
          tour?.name || "Tour"
        }" cho ${booking.participants.length} khách`,
        url: `/dashboard/guide/requests`,
        is_read: false,
        audience: "user",
        meta: {
          bookingId: booking._id,
          tourId: booking.tour_id,
          customerId: booking.customer_id,
        },
      });
      notifications.push(notif);
    }
    console.log(`✅ Created ${notifications.length} notifications for guide`);

    // 7. Summary
    console.log("\n📊 SUMMARY:");
    console.log("=".repeat(50));
    console.log(`Guide: ${guide.name} (${guide.email})`);
    console.log(`Tours assigned: ${tours.length}`);
    console.log(`Booking requests (pending): ${bookingRequests.length}`);
    console.log(`Confirmed bookings (upcoming): ${confirmedBookings.length}`);
    console.log(`Notifications: ${notifications.length}`);
    console.log("=".repeat(50));
    console.log("\n✅ Guide dashboard seeded successfully!");
    console.log("\n🔐 Login credentials:");
    console.log("Email: guide@example.com");
    console.log("Password: 123456");
  } catch (error) {
    console.error("❌ Error seeding guide dashboard:", error);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

seedGuideDashboard();
