import mongoose from "mongoose";
import nodemailer from "nodemailer";
import PayoutRequest from "../models/PayoutRequest.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { notifyUser, notifyAdmins } from "../services/notify.js";

/**
 * Helper: send email using SMTP if configured.
 * - Reads SMTP settings from environment:
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE (true/false), SMTP_AUTH_USER, SMTP_AUTH_PASS
 * - If no SMTP config present, this function is a no-op.
 */
async function sendEmail({ to, subject, text, html }) {
    try {
        const host = process.env.SMTP_HOST;
        if (!host) return; // SMTP not configured, skip

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
        // email is best-effort — do not throw to avoid breaking main flow
        console.warn("sendEmail error:", err && err.message ? err.message : err);
    }
}

/**
 * Helper: resolve admin email addresses.
 * - First try env ADMIN_EMAILS (comma-separated)
 * - Otherwise query users with role 'admin'
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
 * - Notifies admins via notifyAdmins (in-app) and email (if SMTP configured).
 * POST /api/payouts/request
 * Body: { amount }
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
                content: `Guide ${guide.name || guide._id} yêu cầu rút ${numericAmount}.`,
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
                const text = `Guide ${guide.name || guide._id} (id: ${String(guide._id)}) đã gửi yêu cầu rút ${numericAmount}.\n\nXem chi tiết: admin panel.`;
                const html = `<p>Guide <strong>${guide.name || guide._id}</strong> (id: ${String(guide._id)}) đã gửi yêu cầu rút <strong>${numericAmount}</strong>.</p><p>Request ID: ${reqDoc._id}</p>`;
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
 * GET /api/payouts/my
 */
export const getMyPayoutRequests = async (req, res) => {
    try {
        const guideId = req.user?._id;
        if (!guideId) return res.status(401).json({ ok: false, message: "Unauthorized" });

        const list = await PayoutRequest.find({ guide: guideId }).sort({ createdAt: -1 });
        return res.json({ ok: true, list });
    } catch (err) {
        console.error("getMyPayoutRequests error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
};

/**
 * Admin: approve payout request
 * - Updates guide balance, marks request approved, creates Transaction ledger (withdraw)
 * - Sends in-app notify to guide and email (if configured)
 * PATCH/POST /api/payouts/admin/:id/approve
 * Body: { externalTxId? }
 */
export const adminApprovePayoutRequest = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const admin = req.user;
        if (!admin || !(admin.role === "admin" || admin?.role_id?.name === "admin")) {
            return res.status(403).json({ ok: false, message: "Chỉ admin" });
        }

        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ ok: false, message: "Invalid payout request id" });

        session.startTransaction();

        const payoutReq = await PayoutRequest.findById(id).session(session);
        if (!payoutReq) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ ok: false, message: "Payout request không tồn tại" });
        }
        if (payoutReq.status !== "pending") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ ok: false, message: "Payout request đã xử lý" });
        }

        const guide = await User.findById(payoutReq.guide).session(session);
        if (!guide) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ ok: false, message: "Guide không tồn tại" });
        }
        if ((guide.balance || 0) < payoutReq.amount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ ok: false, message: "Guide không đủ số dư" });
        }

        // decrement guide balance
        guide.balance = guide.balance - payoutReq.amount;
        await guide.save({ session });

        // mark payout request approved
        payoutReq.status = "approved";
        payoutReq.processedAt = new Date();
        payoutReq.processedBy = admin._id;
        if (req.body.externalTxId) payoutReq.externalTransactionId = req.body.externalTxId;
        await payoutReq.save({ session });

        // ledger transaction (withdraw) - create without bookingId
        try {
            const txPayload = {
                userId: admin._id,
                payeeUserId: payoutReq.guide,
                amount: mongoose.Types.Decimal128.fromString(String(payoutReq.amount)),
                commission_fee: mongoose.Types.Decimal128.fromString("0"),
                net_amount: mongoose.Types.Decimal128.fromString(String(payoutReq.amount)),
                transaction_type: "withdraw",
                status: "confirmed",
                payment_gateway: "manual",
                transaction_code: req.body.externalTxId || `withdraw-${payoutReq._id}`,
                note: `Payout withdrawal approved for guide ${String(payoutReq.guide)}`,
            };

            await Transaction.create([txPayload], { session });
        } catch (txErr) {
            console.warn("adminApprovePayoutRequest: failed to create Transaction:", txErr);
            // do not abort; the core business (balance change + approval) already completed
        }

        await session.commitTransaction();
        session.endSession();

        // notify guide in-app and by email
        try {
            // NOTE: use type 'payout:paid' so notify service will send payoutPaid template
            await notifyUser({
                userId: payoutReq.guide,
                type: "payout:paid",
                content: `Yêu cầu rút ${payoutReq.amount} của bạn đã được admin duyệt và thực hiện.`,
                url: `/guide/payouts/${payoutReq._id}`,
                meta: {
                    payoutId: payoutReq._id,
                    payoutRequestId: payoutReq._id,
                    amount: payoutReq.amount,
                    transactionCode: payoutReq.externalTransactionId || req.body.externalTxId || `withdraw-${payoutReq._id}`,
                    confirmedAt: payoutReq.processedAt || new Date(),
                },
            });
        } catch (e) {
            console.warn("notifyUser failed:", e);
        }

        // email admin (best-effort)
        try {
            const guideDoc = await User.findById(payoutReq.guide).lean();
            if (guideDoc && guideDoc.email) {
                const subject = `Yêu cầu rút ${payoutReq.amount} đã được duyệt`;
                const text = `Yêu cầu rút ${payoutReq.amount} của guide ${guideDoc.name || guideDoc._id} đã được duyệt.\n\nRequest ID: ${payoutReq._id}`;
                const html = `<p>Yêu cầu rút <strong>${payoutReq.amount}</strong> của <strong>${guideDoc.name || guideDoc._id}</strong> đã được duyệt.</p><p>Request ID: ${payoutReq._id}</p>`;
                await sendEmail({ to: process.env.ADMIN_EMAILS || "", subject, text, html });
            }
        } catch (e) {
            console.warn("guide email send failed:", e);
        }

        return res.json({ ok: true, payoutRequest: payoutReq });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("adminApprovePayoutRequest error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
};

/**
 * Admin: reject payout request
 * PATCH/POST /api/payouts/admin/:id/reject
 * Body: { note? }
 */
export const adminRejectPayoutRequest = async (req, res) => {
    try {
        const admin = req.user;
        if (!admin || !(admin.role === "admin" || admin?.role_id?.name === "admin")) {
            return res.status(403).json({ ok: false, message: "Chỉ admin" });
        }

        const { id } = req.params;
        const { note } = req.body || {};
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ ok: false, message: "Invalid payout request id" });

        const payoutReq = await PayoutRequest.findById(id);
        if (!payoutReq) return res.status(404).json({ ok: false, message: "Payout request không tồn tại" });
        if (payoutReq.status !== "pending") return res.status(400).json({ ok: false, message: "Payout request đã xử lý" });

        payoutReq.status = "rejected";
        payoutReq.processedAt = new Date();
        payoutReq.processedBy = admin._id;
        payoutReq.adminNote = note || null;
        await payoutReq.save();

        // in-app notify guide of rejection
        try {
            await notifyUser({
                userId: payoutReq.guide,
                type: "payout:rejected",
                content: `Yêu cầu rút ${payoutReq.amount} của bạn đã bị từ chối.`,
                url: `/guide/payouts/${payoutReq._id}`,
                meta: {
                    payoutRequestId: payoutReq._id,
                    amount: payoutReq.amount,
                    message: note || ""
                }
            });
        } catch (e) {
            console.warn("notifyUser reject failed:", e);
        }

        // optional email to guide on rejection
        try {
            const guideDoc = await User.findById(payoutReq.guide).lean();
            if (guideDoc && guideDoc.email) {
                const subject = `Yêu cầu rút ${payoutReq.amount} đã bị từ chối`;
                const text = `Yêu cầu rút ${payoutReq.amount} của bạn đã bị từ chối.\n\nRequest ID: ${payoutReq._id}\nNote: ${note || ""}`;
                const html = `<p>Yêu cầu rút <strong>${payoutReq.amount}</strong> của bạn đã bị từ chối.</p><p>Ghi chú: ${note || ""}</p><p>Request ID: ${payoutReq._id}</p>`;
                await sendEmail({ to: guideDoc.email, subject, text, html });
            }
        } catch (e) {
            console.warn("guide rejection email failed:", e);
        }

        return res.json({ ok: true, payoutRequest: payoutReq });
    } catch (err) {
        console.error("adminRejectPayoutRequest error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
};

export default {
    createPayoutRequest,
    getMyPayoutRequests,
    adminApprovePayoutRequest,
    adminRejectPayoutRequest,
};