// server/scripts/seedTouristDashboard.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

// Import models
const User = mongoose.model(
  "User",
  new mongoose.Schema({}, { strict: false }),
  "users"
);
const Tour = mongoose.model(
  "Tour",
  new mongoose.Schema({}, { strict: false }),
  "tours"
);
const Booking = mongoose.model(
  "Booking",
  new mongoose.Schema({}, { strict: false }),
  "bookings"
);
const Notification = mongoose.model(
  "Notification",
  new mongoose.Schema({}, { strict: false }),
  "notifications"
);

async function seedTouristDashboard() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Đã kết nối với MongoDB");

    // 1. Find a tourist user
    let tourist = await User.findOne({ email: "tourist@example.com" });
    if (!tourist) {
      console.log("❌ Không tìm thấy user tourist. Vui lòng tạo user trước.");
      process.exit(1);
    }
    console.log(`📋 Found tourist: ${tourist.name} (${tourist._id})`);

    // 2. Find some tours
    const tours = await Tour.find().limit(5);
    if (tours.length === 0) {
      console.log("❌ Không tìm thấy tour nào. Vui lòng seed tours trước.");
      process.exit(1);
    }
    console.log(`📋 Found ${tours.length} tours`);

    // 3. Find some guides
    const guides = await User.find({ role: "guide" }).limit(5);
    console.log(`📋 Found ${guides.length} guides`);

    // 4. Delete existing bookings and notifications for this tourist
    await Booking.deleteMany({ customer_id: tourist._id });
    await Notification.deleteMany({ userId: tourist._id });
    console.log("🗑️  Đã xóa bookings và notifications cũ");

    // 5. Create sample bookings
    const bookingsData = [
      {
        customer_id: tourist._id,
        tour_id: tours[0]._id,
        intended_guide_id: guides[0]?._id || tours[0].guide_id,
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        start_time: "08:00",
        participants: [
          {
            full_name: tourist.name,
            age_provided: 30,
            is_primary_contact: true,
            count_slot: true,
            price_applied: 900000,
          },
          {
            full_name: "Người đi cùng",
            age_provided: 28,
            count_slot: true,
            price_applied: 900000,
          },
        ],
        total_price: 1800000,
        status: "confirmed",
        payment_status: "paid",
        contact: {
          full_name: tourist.name,
          phone: tourist.phone_number || "0905123456",
          email: tourist.email,
        },
      },
      {
        customer_id: tourist._id,
        tour_id: tours[1]._id,
        intended_guide_id: guides[1]?._id || tours[1].guide_id,
        start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        start_time: "14:00",
        participants: [
          {
            full_name: tourist.name,
            age_provided: 30,
            is_primary_contact: true,
            count_slot: true,
            price_applied: 500000,
          },
        ],
        total_price: 500000,
        status: "confirmed",
        payment_status: "paid",
        contact: {
          full_name: tourist.name,
          phone: tourist.phone_number || "0905123456",
          email: tourist.email,
        },
      },
      {
        customer_id: tourist._id,
        tour_id: tours[2]._id,
        intended_guide_id: guides[2]?._id || tours[2].guide_id,
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        start_time: "09:00",
        participants: [
          {
            full_name: tourist.name,
            age_provided: 30,
            is_primary_contact: true,
            count_slot: true,
            price_applied: 600000,
          },
          {
            full_name: "Người đi cùng",
            age_provided: 28,
            count_slot: true,
            price_applied: 600000,
          },
        ],
        total_price: 1200000,
        status: "completed",
        payment_status: "paid",
        contact: {
          full_name: tourist.name,
          phone: tourist.phone_number || "0905123456",
          email: tourist.email,
        },
      },
      {
        customer_id: tourist._id,
        tour_id: tours[3]._id,
        intended_guide_id: guides[3]?._id || tours[3].guide_id,
        start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        start_time: "19:00",
        participants: [
          {
            full_name: tourist.name,
            age_provided: 30,
            is_primary_contact: true,
            count_slot: true,
            price_applied: 300000,
          },
        ],
        total_price: 300000,
        status: "canceled",
        payment_status: "refunded",
        contact: {
          full_name: tourist.name,
          phone: tourist.phone_number || "0905123456",
          email: tourist.email,
        },
      },
      {
        customer_id: tourist._id,
        tour_id: tours[4]._id || tours[0]._id,
        intended_guide_id:
          guides[4]?._id || guides[0]?._id || tours[0].guide_id,
        start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        start_time: "10:00",
        participants: [
          {
            full_name: tourist.name,
            age_provided: 30,
            is_primary_contact: true,
            count_slot: true,
            price_applied: 700000,
          },
          {
            full_name: "Người đi cùng 1",
            age_provided: 28,
            count_slot: true,
            price_applied: 700000,
          },
          {
            full_name: "Người đi cùng 2",
            age_provided: 25,
            count_slot: true,
            price_applied: 700000,
          },
        ],
        total_price: 2100000,
        status: "completed",
        payment_status: "paid",
        contact: {
          full_name: tourist.name,
          phone: tourist.phone_number || "0905123456",
          email: tourist.email,
        },
      },
      {
        customer_id: tourist._id,
        tour_id: tours[0]._id,
        intended_guide_id: guides[0]?._id || tours[0].guide_id,
        start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        start_time: "15:00",
        participants: [
          {
            full_name: tourist.name,
            age_provided: 30,
            is_primary_contact: true,
            count_slot: true,
            price_applied: 900000,
          },
        ],
        total_price: 900000,
        status: "pending",
        payment_status: "unpaid",
        contact: {
          full_name: tourist.name,
          phone: tourist.phone_number || "0905123456",
          email: tourist.email,
        },
      },
    ];

    const createdBookings = await Booking.insertMany(bookingsData);
    console.log(`✅ Đã tạo ${createdBookings.length} bookings`);

    // 6. Create sample notifications
    const notificationsData = [
      {
        recipientId: tourist._id,
        type: "booking_confirmed",
        content: `Đặt tour thành công! Hướng dẫn viên đã chấp nhận yêu cầu đặt tour '${tours[0].name}'. Vui lòng thanh toán để giữ chỗ.`,
        url: `/dashboard/tourist/history`,
        is_read: false,
        audience: "user",
        createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      },
      {
        recipientId: tourist._id,
        type: "payment_success",
        content: `Thanh toán thành công! Bạn đã thanh toán ${(1800000).toLocaleString()}đ cho tour '${
          tours[0].name
        }'. Vé điện tử đã được gửi qua email.`,
        url: `/dashboard/tourist/history`,
        is_read: false,
        audience: "user",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        recipientId: tourist._id,
        type: "reminder",
        content: `Nhắc nhở lịch trình: Ngày mai bạn có chuyến tham quan '${tours[1].name}' lúc 14:00. Hãy chuẩn bị sẵn sàng nhé!`,
        url: `/dashboard/tourist`,
        is_read: true,
        audience: "user",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        recipientId: tourist._id,
        type: "booking_confirmed",
        content: `Tour sắp khởi hành: Tour '${tours[1].name}' của bạn sẽ bắt đầu trong 24 giờ. Vui lòng kiểm tra thông tin và đến đúng giờ.`,
        url: `/dashboard/tourist/history`,
        is_read: false,
        audience: "user",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        recipientId: tourist._id,
        type: "system",
        content:
          "Chào mừng bạn mới! Cảm ơn bạn đã tham gia Vi Vu Cố Đô. Hãy cập nhật hồ sơ để có trải nghiệm tốt nhất.",
        url: `/dashboard/tourist/profile`,
        is_read: true,
        audience: "user",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        recipientId: tourist._id,
        type: "booking_cancelled",
        content: `Đã hoàn tiền: Booking cho tour '${tours[3].name}' đã được hoàn tiền. Số tiền 300.000đ sẽ được chuyển về tài khoản của bạn trong 3-5 ngày làm việc.`,
        url: `/dashboard/tourist/invoices`,
        is_read: true,
        audience: "user",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      },
    ];

    const createdNotifications = await Notification.insertMany(
      notificationsData
    );
    console.log(`✅ Đã tạo ${createdNotifications.length} notifications`);

    // 7. Summary
    console.log("\n📊 SUMMARY:");
    console.log(`   Tourist: ${tourist.name}`);
    console.log(`   Bookings: ${createdBookings.length}`);
    console.log(
      `     - Confirmed: ${
        bookingsData.filter((b) => b.status === "confirmed").length
      }`
    );
    console.log(
      `     - Pending: ${
        bookingsData.filter((b) => b.status === "pending").length
      }`
    );
    console.log(
      `     - Completed: ${
        bookingsData.filter((b) => b.status === "completed").length
      }`
    );
    console.log(
      `     - Cancelled: ${
        bookingsData.filter((b) => b.status === "cancelled").length
      }`
    );
    console.log(`   Notifications: ${createdNotifications.length}`);
    console.log(
      `     - Unread: ${notificationsData.filter((n) => !n.is_read).length}`
    );
    console.log(
      `     - Read: ${notificationsData.filter((n) => n.is_read).length}`
    );

    console.log("\n✅ Seed dữ liệu tourist dashboard thành công!");
    console.log(
      "\n💡 Bây giờ bạn có thể đăng nhập với user tourist để xem dashboard"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

seedTouristDashboard();
