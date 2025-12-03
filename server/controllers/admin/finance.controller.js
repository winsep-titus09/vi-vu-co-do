/**
 * server/controllers/admin/finance.controller.js
 *
 * Admin finance controller: transactions, stats, revenue
 */
import mongoose from "mongoose";
import Transaction from "../../models/Transaction.js";
import Booking from "../../models/Booking.js";
import Payout from "../../models/Payout.js";
import PayoutRequest from "../../models/PayoutRequest.js";
import User from "../../models/User.js";

// ============================================================================
// FINANCE STATS
// ============================================================================
/**
 * Get finance statistics
 * GET /api/admin/finance/stats
 * Query: period (thisMonth | lastMonth | thisWeek | all)
 */
export const getFinanceStats = async (req, res) => {
  try {
    const { period = "thisMonth" } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "thisWeek":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case "all":
        startDate = new Date(0);
        endDate = new Date();
        break;
      case "thisMonth":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        break;
    }

    // Calculate previous period for comparison
    const periodDuration = endDate - startDate;
    const prevStartDate = new Date(startDate - periodDuration);
    const prevEndDate = new Date(startDate - 1);

    // Revenue from paid bookings
    const [currentRevenue, previousRevenue] = await Promise.all([
      Booking.aggregate([
        {
          $match: {
            status: { $in: ["paid", "completed"] },
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $toDouble: "$total_price" } },
            count: { $sum: 1 },
          },
        },
      ]),
      Booking.aggregate([
        {
          $match: {
            status: { $in: ["paid", "completed"] },
            createdAt: { $gte: prevStartDate, $lte: prevEndDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $toDouble: "$total_price" } },
          },
        },
      ]),
    ]);

    const totalRevenue = currentRevenue[0]?.total || 0;
    const prevTotalRevenue = previousRevenue[0]?.total || 0;
    const revenueChange =
      prevTotalRevenue > 0
        ? Math.round(
            ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
          )
        : 0;

    // Pending payouts
    const pendingPayouts = await Payout.aggregate([
      { $match: { status: "pending" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$netAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate platform commission (15%)
    const platformCommission = Math.round(totalRevenue * 0.15);

    res.json({
      totalRevenue,
      revenueChange,
      pendingPayoutAmount: pendingPayouts[0]?.total || 0,
      pendingPayoutCount: pendingPayouts[0]?.count || 0,
      platformCommission,
      bookingCount: currentRevenue[0]?.count || 0,
      period,
    });
  } catch (error) {
    console.error("getFinanceStats error:", error);
    res.status(500).json({ message: "Lỗi khi lấy thống kê tài chính." });
  }
};

// ============================================================================
// TRANSACTIONS LIST
// ============================================================================
/**
 * Get transactions list
 * GET /api/admin/finance/transactions
 * Query: page, limit, status, type, search, from, to
 */
export const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, search, from, to } = req.query;

    const filter = {};

    // Filter by status
    if (status && status !== "all") {
      filter.status = status;
    }

    // Filter by type
    if (type && type !== "all") {
      filter.transaction_type = type;
    }

    // Filter by date range
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    // Search by transaction code or user
    if (search) {
      filter.$or = [{ transaction_code: { $regex: search, $options: "i" } }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("userId", "name email")
        .populate("bookingId", "contact tour_id")
        .populate({
          path: "bookingId",
          populate: { path: "tour_id", select: "title" },
        }),
      Transaction.countDocuments(filter),
    ]);

    // Transform transactions for frontend
    const transformedTransactions = transactions.map((tx) => ({
      _id: tx._id,
      id:
        tx.transaction_code ||
        `TRX-${tx._id.toString().slice(-6).toUpperCase()}`,
      user: tx.userId?.name || tx.bookingId?.contact?.full_name || "N/A",
      userEmail: tx.userId?.email || tx.bookingId?.contact?.email || "",
      tour: tx.bookingId?.tour_id?.title || "N/A",
      amount: Number(tx.amount?.toString() || 0),
      netAmount: Number(tx.net_amount?.toString() || 0),
      commission: Number(tx.commission_fee?.toString() || 0),
      method: tx.payment_gateway || "manual",
      type: tx.transaction_type,
      status: tx.status,
      date: tx.createdAt,
      note: tx.note,
    }));

    res.json({
      transactions: transformedTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("getTransactions error:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách giao dịch." });
  }
};

// ============================================================================
// PAYOUTS LIST (for Finance page)
// ============================================================================
/**
 * Get payouts for finance page
 * GET /api/admin/finance/payouts
 * Query: page, limit, status
 */
export const getFinancePayouts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payouts, total] = await Promise.all([
      Payout.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("guideId", "name email balance")
        .populate({
          path: "guideId",
          populate: {
            path: "role_id",
            model: "Role",
            select: "name",
          },
        }),
      Payout.countDocuments(filter),
    ]);

    // Get guide profiles for bank info
    const guideIds = payouts.map((p) => p.guideId?._id).filter(Boolean);
    const GuideProfile = mongoose.model("GuideProfile");
    const profiles = await GuideProfile.find({
      user_id: { $in: guideIds },
    }).select("user_id bank_info");
    const profileMap = new Map(profiles.map((p) => [p.user_id.toString(), p]));

    // Transform payouts for frontend
    const transformedPayouts = payouts.map((po) => {
      const profile = profileMap.get(po.guideId?._id?.toString());
      const bankInfo = profile?.bank_info;

      return {
        _id: po._id,
        id: po.reference || `PO-${po._id.toString().slice(-4).toUpperCase()}`,
        guide: po.guideId?.name || "N/A",
        guideId: po.guideId?._id,
        guideEmail: po.guideId?.email,
        totalSales: po.grossAmount || 0,
        commission: po.platformFee || 0,
        commissionRate: "15%",
        netAmount: po.netAmount || 0,
        status: po.status,
        bank: bankInfo
          ? `${bankInfo.bank_name || ""} **** ${
              bankInfo.account_number?.slice(-4) || ""
            }`
          : "Chưa cập nhật",
        bankFull: bankInfo,
        createdAt: po.createdAt,
        paidAt: po.paidAt,
      };
    });

    res.json({
      payouts: transformedPayouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("getFinancePayouts error:", error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách thanh toán." });
  }
};

// ============================================================================
// CONFIRM PAYOUT (Mark as Paid)
// ============================================================================
/**
 * Confirm payout - mark as paid
 * PATCH /api/admin/finance/payouts/:id/confirm
 */
export const confirmPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId, note } = req.body;

    const payout = await Payout.findById(id).populate("guideId", "name email");

    if (!payout) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy yêu cầu thanh toán." });
    }

    if (payout.status === "paid") {
      return res
        .status(400)
        .json({ message: "Yêu cầu này đã được thanh toán." });
    }

    // Update payout status
    payout.status = "paid";
    payout.paidAt = new Date();
    payout.paidBy = req.user._id;
    payout.externalTransactionId = transactionId || null;
    payout.adminNote = note || null;
    await payout.save();

    // Create transaction record
    const netAmountValue = payout.netAmount || 0;
    const platformFeeValue = payout.platformFee || 0;

    await Transaction.create({
      userId: req.user._id,
      payeeUserId: payout.guideId._id,
      amount: mongoose.Types.Decimal128.fromString(String(netAmountValue)),
      commission_fee: mongoose.Types.Decimal128.fromString(
        String(platformFeeValue)
      ),
      net_amount: mongoose.Types.Decimal128.fromString(String(netAmountValue)),
      transaction_type: "withdraw",
      status: "confirmed",
      payment_gateway: "manual",
      transaction_code: transactionId || `PAYOUT-${payout._id}`,
      note: note || `Thanh toán cho HDV ${payout.guideId?.name || "N/A"}`,
      confirmed_by: req.user._id,
      confirmed_at: new Date(),
    });

    res.json({
      message: "Đã xác nhận thanh toán thành công!",
      payout: {
        _id: payout._id,
        status: payout.status,
        paidAt: payout.paidAt,
      },
    });
  } catch (error) {
    console.error("confirmPayout error:", error);
    res.status(500).json({ message: "Lỗi khi xác nhận thanh toán." });
  }
};
