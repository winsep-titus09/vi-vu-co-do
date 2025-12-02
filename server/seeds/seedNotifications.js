// seeds/seedNotifications.js
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Role from "../models/Role.js";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "vi-vu-co-do" });

    // Tìm role guide
    const guideRole = await Role.findOne({ name: "guide" });
    if (!guideRole) {
      console.error(
        "❌ Không tìm thấy role 'guide'. Hãy chạy seedRoles.js trước."
      );
      await mongoose.disconnect();
      return;
    }

    // Tìm tất cả users có role guide
    const guides = await User.find({ role_id: guideRole._id });
    if (guides.length === 0) {
      console.error("❌ Không tìm thấy user nào với role 'guide'.");
      await mongoose.disconnect();
      return;
    }

    console.log(`✅ Tìm thấy ${guides.length} hướng dẫn viên.`);

    // Sample notifications data
    const notificationTypes = [
      {
        type: "booking",
        content:
          "Du khách Nguyễn Văn A đã đặt tour 'Bí mật Hoàng cung Huế'. Vui lòng xác nhận yêu cầu.",
        url: "/dashboard/guide/requests",
      },
      {
        type: "booking",
        content:
          "Bạn có yêu cầu đặt tour mới từ khách hàng Trần Thị B cho tour 'Thiền trà Chùa Từ Hiếu'.",
        url: "/dashboard/guide/requests",
      },
      {
        type: "payment",
        content:
          "Bạn nhận được 1.620.000đ từ tour 'Thiền trà tại Chùa Từ Hiếu'. Số dư ví đã được cập nhật.",
        url: "/dashboard/guide/earnings",
      },
      {
        type: "payment",
        content:
          "Thanh toán 2.500.000đ cho tour 'Hoàng thành Huế - Full day' đã được xác nhận.",
        url: "/dashboard/guide/earnings",
      },
      {
        type: "review",
        content:
          "Sarah Jenkins đã viết nhận xét 5 sao: 'Amazing experience! The guide was very knowledgeable.'",
        url: "/dashboard/guide/reviews",
      },
      {
        type: "review",
        content:
          "Bạn nhận được đánh giá mới 4 sao từ khách hàng Lê Minh C cho tour 'Lăng Tự Đức'.",
        url: "/dashboard/guide/reviews",
      },
      {
        type: "tour",
        content:
          "Tour 'Bí mật Hoàng cung' của bạn đã được duyệt và hiển thị trên hệ thống.",
        url: "/dashboard/guide/my-tours",
      },
      {
        type: "tour",
        content:
          "Đừng quên tour 'Khám phá Đại Nội Huế' sẽ bắt đầu vào 08:00 sáng mai.",
        url: "/dashboard/guide/schedule",
      },
      {
        type: "system",
        content:
          "Hệ thống sẽ bảo trì từ 02:00 - 04:00 AM ngày mai. Vui lòng lưu ý.",
        url: null,
      },
      {
        type: "system",
        content:
          "Cập nhật chính sách mới: Hướng dẫn viên cần xác nhận booking trong vòng 24 giờ.",
        url: null,
      },
    ];

    // Xóa notifications cũ của các guides (để test fresh)
    const guideIds = guides.map((g) => g._id);
    await Notification.deleteMany({
      recipientId: { $in: guideIds },
      audience: "user",
    });
    console.log("🗑️ Đã xóa notifications cũ của các guides.");

    // Tạo notifications cho mỗi guide
    const notifications = [];
    const now = new Date();

    for (const guide of guides) {
      // Mỗi guide nhận random 5-10 notifications
      const count = Math.floor(Math.random() * 6) + 5;
      const shuffled = [...notificationTypes]
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      shuffled.forEach((noti, idx) => {
        // Tạo thời gian giả - trải đều trong 7 ngày qua
        const createdAt = new Date(
          now.getTime() - idx * (Math.random() * 86400000 * 2)
        ); // Random 0-2 ngày mỗi bước

        notifications.push({
          recipientId: guide._id,
          type: noti.type,
          content: noti.content,
          url: noti.url,
          channel: "in_app",
          audience: "user",
          is_read: Math.random() > 0.6, // 40% chưa đọc
          createdAt,
          updatedAt: createdAt,
        });
      });
    }

    // Insert vào database
    const result = await Notification.insertMany(notifications);
    console.log(
      `✅ Đã tạo ${result.length} notifications cho ${guides.length} hướng dẫn viên.`
    );

    // Hiển thị thống kê
    const stats = await Notification.aggregate([
      { $match: { recipientId: { $in: guideIds } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);
    console.log("📊 Thống kê theo loại:", stats);

    await mongoose.disconnect();
    console.log("✅ Hoàn tất seed notifications!");
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
    await mongoose.disconnect();
  }
};

run();
