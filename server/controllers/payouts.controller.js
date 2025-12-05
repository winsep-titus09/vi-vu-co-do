import mongoose from "mongoose";
import nodemailer from "nodemailer";
import PayoutRequest from "../models/PayoutRequest.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { notifyUser, notifyAdmins } from "../services/notify.js";

/**
 * Helper: send email using SMTP if configured.
 */
async function sendEmail({ to, subject, text, html }) {
    try {
        const host = process.env.SMTP_HOST;
        if (!host) return;

        const transporter = nodemailer.createTransport({
            host,
            port: Number(process.env.SMTP_PORT || 587),
            secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
            auth:
                process.env.SMTP_AUTH_USER && process.env.SMTP_AUTH_PASS
                    ? {
                        user: process.env.SMTP_AUTH_USER,
                        pass: process.env.SMTP_AUTH_PASS,
                    }
                    : undefined,
        });

        await transporter.sendMail({
            from: process.env.SMTP_FROM || `no-reply@${process.env.SMTP_HOST}`,
            to,
            subject,
            text,
            html,
        });
    } catch (err) {
        console.warn("sendEmail error:", err && err.message ? err.message : err);
    }
}

/**
 * Helper: resolve admin email addresses.
 */
async function getAdminEmails() {
    const envList = process.env.ADMIN_EMAILS;
    if (envList) {
        return envList.split(",").map(s => s.trim()).filter(Boolean);
    }
    try {
        const admins = await User.find({ role: "admin", email: { $exists: true, $ne: null } }).select("email").lean();
        return (admins || []).map(a => a.email).filter(Boolean);
    } catch (e) {
        console.warn("getAdminEmails error:", e);
        return [];
    }
}

/**
 * Guide: create a payout (withdraw) request.
 * POST /api/payouts
 */
export const createPayoutRequest = async (req, res) => {
    try {
        const guideId = req.user?._id;
        if (!guideId) return res.status(401).json({ ok: false, message: "Unauthorized" });

        const { amount } = req.body;
        const numericAmount = Number(amount || 0);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ ok: false, message: "Số tiền không hợp lệ" });
        }

        const guide = await User.findById(guideId).lean();
        if (!guide) return res.status(404).json({ ok: false, message: "Guide không tồn tại" });

        if (numericAmount > (guide.balance || 0)) {
            return res.status(400).json({ ok: false, message: "Số dư không đủ" });
        }

        const reqDoc = await PayoutRequest.create({
            guide: guideId,
            amount: numericAmount,
            status: "pending",
        });

        // In-app / system notifications to admins
        try {
            await notifyAdmins({
                type: "payout:requested",
                content: `Guide ${guide.name || guide._id} yêu cầu rút ${numericAmount.toLocaleString("vi-VN")}đ.`,
                url: "/dashboard/admin/finance?tab=withdrawals",
                meta: { payoutRequestId: reqDoc._id, guideId, guideName: guide.name, guideEmail: guide.email, amount: numericAmount }
            });
        } catch (e) {
            console.warn("notifyAdmins failed:", e);
        }

        // Email admins (best-effort)
        try {
            const adminEmails = await getAdminEmails();
            if (adminEmails.length > 0) {
                const subject = `Yêu cầu rút tiền từ guide ${guide.name || guide._id}`;
                const text = `Guide ${guide.name || guide._id} (id: ${String(guide._id)}) đã gửi yêu cầu rút ${numericAmount.toLocaleString("vi-VN")}đ.\n\nXem chi tiết: admin panel.`;
                const html = `<p>Guide <strong>${guide.name || guide._id}</strong> (id: ${String(guide._id)}) đã gửi yêu cầu rút <strong>${numericAmount.toLocaleString("vi-VN")}đ</strong>.</p><p>Request ID: ${reqDoc._id}</p>`;
                await sendEmail({ to: adminEmails.join(","), subject, text, html });
            }
        } catch (e) {
            console.warn("admin email send failed:", e);
        }

        return res.status(201).json({ ok: true, payoutRequest: reqDoc });
    } catch (err) {
        console.error("createPayoutRequest error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
};

/**
 * Guide: list own payout requests
 * GET /api/payouts
 */
export const getMyPayoutRequests = async (req, res) => {
    try {
        const guideId = req.user?._id;
        if (!guideId) return res.status(401).json({ ok: false, message: "Unauthorized" });

        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [items, total] = await Promise.all([
            PayoutRequest.find({ guide: guideId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            PayoutRequest.countDocuments({ guide: guideId })
        ]);

        return res.json({
            ok: true,
            items,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        console.error("getMyPayoutRequests error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
};

/**
 * Admin: list all payout requests
 * GET /api/payouts/admin/list
 */
export const adminListPayoutRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;
        const filter = {};

        if (status && status !== "all") {
            filter.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query = PayoutRequest.find(filter)
            .populate("guide", "name email avatar phone")
            .populate("processedBy", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const [items, total, pendingCount] = await Promise.all([
            query,
            PayoutRequest.countDocuments(filter),
            PayoutRequest.countDocuments({ status: "pending" })
        ]);

        // Filter by search if provided (search in guide name/email)
        let filteredItems = items;
        if (search) {
            const searchLower = search.toLowerCase();
            filteredItems = items.filter(item =>
                item.guide?.name?.toLowerCase().includes(searchLower) ||
                item.guide?.email?.toLowerCase().includes(searchLower)
            );
        }

        return res.json({
            ok: true,
            items: filteredItems,
            total,
            pendingCount,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (err) {
        console.error("adminListPayoutRequests error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
};

/**
 * Admin: approve payout request
 * POST /api/payouts/admin/:id/approve
 */
export const adminApprovePayoutRequest = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { id } = req.params;
        const { externalTxId, note } = req.body;
        const adminId = req.user?._id;

        const payoutReq = await PayoutRequest.findById(id).session(session);
        if (!payoutReq) {
            await session.abortTransaction();
            return res.status(404).json({ ok: false, message: "Không tìm thấy yêu cầu" });
        }
        if (payoutReq.status !== "pending") {
            await session.abortTransaction();
            return res.status(400).json({ ok: false, message: "Yêu cầu đã được xử lý" });
        }

        const guide = await User.findById(payoutReq.guide).session(session);
        if (!guide) {
            await session.abortTransaction();
            return res.status(404).json({ ok: false, message: "Guide không tồn tại" });
        }

        if (payoutReq.amount > (guide.balance || 0)) {
            await session.abortTransaction();
            return res.status(400).json({ ok: false, message: "Số dư guide không đủ" });
        }

        // Deduct balance
        guide.balance = (guide.balance || 0) - payoutReq.amount;
        await guide.save({ session });

        // Update payout request
        payoutReq.status = "approved";
        payoutReq.processedAt = new Date();
        payoutReq.processedBy = adminId;
        payoutReq.adminNote = note || null;
        payoutReq.externalTransactionId = externalTxId || null;
        await payoutReq.save({ session });

        // Create transaction record - theo đúng schema Transaction
        await Transaction.create([{
            userId: guide._id,
            payeeUserId: guide._id,
            bookingId: null, // null cho withdraw type
            amount: mongoose.Types.Decimal128.fromString(String(payoutReq.amount)),
            commission_fee: mongoose.Types.Decimal128.fromString("0"),
            net_amount: mongoose.Types.Decimal128.fromString(String(payoutReq.amount)),
            transaction_type: "withdraw",
            status: "confirmed",
            payment_gateway: "manual",
            transaction_code: externalTxId || `WD-${payoutReq._id}`,
            note: `Rút tiền - Yêu cầu #${payoutReq._id}`,
            confirmed_by: adminId,
            confirmed_at: new Date()
        }], { session });

        await session.commitTransaction();

        // Notify guide
        try {
            await notifyUser({
                userId: guide._id,
                type: "payout:approved",
                content: `Yêu cầu rút ${payoutReq.amount.toLocaleString("vi-VN")}đ đã được duyệt.`,
                meta: { payoutRequestId: payoutReq._id, amount: payoutReq.amount }
            });
        } catch (e) {
            console.warn("notifyUser failed:", e);
        }

        return res.json({ ok: true, message: "Đã duyệt yêu cầu rút tiền", payoutRequest: payoutReq });
    } catch (err) {
        await session.abortTransaction();
        console.error("adminApprovePayoutRequest error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    } finally {
        session.endSession();
    }
};

/**
 * Admin: reject payout request
 * POST /api/payouts/admin/:id/reject
 */
export const adminRejectPayoutRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user?._id;

        const payoutReq = await PayoutRequest.findById(id);
        if (!payoutReq) {
            return res.status(404).json({ ok: false, message: "Không tìm thấy yêu cầu" });
        }
        if (payoutReq.status !== "pending") {
            return res.status(400).json({ ok: false, message: "Yêu cầu đã được xử lý" });
        }

        payoutReq.status = "rejected";
        payoutReq.processedAt = new Date();
        payoutReq.processedBy = adminId;
        payoutReq.adminNote = reason || "Yêu cầu bị từ chối";
        await payoutReq.save();

        // Notify guide
        try {
            await notifyUser({
                userId: payoutReq.guide,
                type: "payout:rejected",
                content: `Yêu cầu rút ${payoutReq.amount.toLocaleString("vi-VN")}đ đã bị từ chối. Lý do: ${reason || "Không có lý do cụ thể"}`,
                meta: { payoutRequestId: payoutReq._id, amount: payoutReq.amount, reason }
            });
        } catch (e) {
            console.warn("notifyUser failed:", e);
        }

        return res.json({ ok: true, message: "Đã từ chối yêu cầu", payoutRequest: payoutReq });
    } catch (err) {
        console.error("adminRejectPayoutRequest error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
};