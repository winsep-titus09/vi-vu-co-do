// scripts/seedGuideTransactions.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Booking from "../models/Booking.js";
import Transaction from "../models/Transaction.js";

dotenv.config();

async function seedGuideTransactions() {
  try {
    await connectDB();

    // Get guide role
    const guideRole = await Role.findOne({ name: "guide" }).lean();
    if (!guideRole) {
      console.log("⚠️ Guide role not found.");
      process.exit(0);
    }

    // Lấy test guide
    const testGuide = await User.findOne({ email: "guide@example.com" }).lean();
    if (!testGuide) {
      console.log(
        "⚠️ Test guide (guide@example.com) not found. Run seedGuideDashboard.js first."
      );
      process.exit(0);
    }

    console.log(`📋 Found test guide: ${testGuide.name} (${testGuide.email})`);

    // Lấy completed bookings của guide
    const completedBookings = await Booking.find({
      intended_guide_id: testGuide._id,
      status: { $in: ["completed", "paid"] },
    }).lean();

    console.log(`📋 Found ${completedBookings.length} completed/paid bookings`);

    // Xóa transactions cũ của guide
    await Transaction.deleteMany({ payeeUserId: testGuide._id });
    console.log("🗑️ Deleted old transactions");

    // Tạo transactions từ bookings
    const transactions = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    for (const booking of completedBookings) {
      const amount =
        booking.paid_amount ||
        booking.paidAmount ||
        booking.total_price ||
        500000;
      const commissionRate = 0.15; // 15% commission
      const commission = Math.round(amount * commissionRate);
      const netAmount = amount - commission;

      const trans = await Transaction.create({
        bookingId: booking._id,
        userId: booking.customer_id,
        payeeUserId: testGuide._id,
        amount: mongoose.Types.Decimal128.fromString(String(amount)),
        commission_fee: mongoose.Types.Decimal128.fromString(
          String(commission)
        ),
        net_amount: mongoose.Types.Decimal128.fromString(String(netAmount)),
        transaction_type: "payout",
        status: "confirmed",
        payment_gateway: "momo",
        transaction_code: `PAY-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        note: `Thanh toán cho tour booking ${booking._id}`,
        confirmed_at: booking.updatedAt || new Date(),
        createdAt: booking.createdAt,
        processedAt: booking.updatedAt || new Date(),
      });
      transactions.push(trans);
    }

    // Tạo thêm transactions cho các tháng trong năm hiện tại
    // Sử dụng bookingId từ bookings đã có hoặc tạo dummy booking
    const monthlyAmounts = [
      1500000, 2200000, 1800000, 3100000, 2700000, 3500000, 4200000, 3800000,
      2900000, 3300000, 2500000, 0,
    ];

    // Lấy thêm bookings từ database để có bookingId
    const allBookings = await Booking.find({
      intended_guide_id: testGuide._id,
    }).lean();

    for (let month = 0; month < currentMonth; month++) {
      const amount = monthlyAmounts[month];
      if (amount <= 0) continue;

      const commission = Math.round(amount * 0.15);
      const netAmount = amount - commission;

      // Tạo random date trong tháng
      const transDate = new Date(
        currentYear,
        month,
        Math.floor(Math.random() * 25) + 1
      );

      // Sử dụng bookingId từ booking có sẵn (cycle through)
      const bookingIndex = month % Math.max(allBookings.length, 1);
      const bookingId =
        allBookings[bookingIndex]?._id || completedBookings[0]?._id;

      if (!bookingId) {
        console.log(`⚠️ Skipping month ${month + 1} - no booking available`);
        continue;
      }

      const trans = await Transaction.create({
        bookingId: bookingId,
        userId: testGuide._id,
        payeeUserId: testGuide._id,
        amount: mongoose.Types.Decimal128.fromString(String(amount)),
        commission_fee: mongoose.Types.Decimal128.fromString(
          String(commission)
        ),
        net_amount: mongoose.Types.Decimal128.fromString(String(netAmount)),
        transaction_type: "payout",
        status: "confirmed",
        payment_gateway: "manual",
        transaction_code: `PAY-HIST-${currentYear}${String(month + 1).padStart(
          2,
          "0"
        )}-${Math.random().toString(36).substr(2, 6)}`,
        note: `Thu nhập tháng ${month + 1}/${currentYear}`,
        confirmed_at: transDate,
        createdAt: transDate,
        processedAt: transDate,
      });
      transactions.push(trans);
    }

    // Thêm transaction cho tháng hiện tại
    const currentMonthAmount = 1850000;
    const commission = Math.round(currentMonthAmount * 0.15);
    const netAmount = currentMonthAmount - commission;
    const currentBookingId = allBookings[0]?._id || completedBookings[0]?._id;

    if (currentBookingId) {
      await Transaction.create({
        bookingId: currentBookingId,
        userId: testGuide._id,
        payeeUserId: testGuide._id,
        amount: mongoose.Types.Decimal128.fromString(
          String(currentMonthAmount)
        ),
        commission_fee: mongoose.Types.Decimal128.fromString(
          String(commission)
        ),
        net_amount: mongoose.Types.Decimal128.fromString(String(netAmount)),
        transaction_type: "payout",
        status: "confirmed",
        payment_gateway: "manual",
        transaction_code: `PAY-${currentYear}${String(
          currentMonth + 1
        ).padStart(2, "0")}-CURRENT`,
        note: `Thu nhập tháng ${currentMonth + 1}/${currentYear}`,
        confirmed_at: now,
        createdAt: now,
        processedAt: now,
      });
    }

    console.log(
      `\n✅ Created ${transactions.length + 1} transactions for guide`
    );

    // Verify
    const verify = await Transaction.aggregate([
      { $match: { payeeUserId: testGuide._id } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: { $toDouble: "$net_amount" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("\n📊 Monthly earnings summary:");
    verify.forEach((m) => {
      console.log(
        `  Tháng ${m._id}: ${m.total.toLocaleString("vi-VN")}đ (${
          m.count
        } giao dịch)`
      );
    });

    const totalYear = verify.reduce((sum, m) => sum + m.total, 0);
    console.log(
      `\n💰 Tổng thu nhập năm ${currentYear}: ${totalYear.toLocaleString(
        "vi-VN"
      )}đ`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedGuideTransactions();
