import mongoose from "mongoose";
import PayoutRequest from "../models/PayoutRequest.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { notifyUser, notifyAdmins } from "../services/notify.js";

export const createPayoutRequest = async (req, res) => {
    try {
        const guideId = req.user?._id;
        if (!guideId) return res.status(401).json({ message: "Unauthorized" });

        const { amount } = req.body;
        const numericAmount = Number(amount || 0);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) return res.status(400).json({ message: "Số tiền không hợp lệ" });

        const guide = await User.findById(guideId);
        if (!guide) return res.status(404).json({ message: "Guide không tồn tại" });

        if (numericAmount > (guide.balance || 0)) return res.status(400).json({ message: "Số dư không đủ" });

        const reqDoc = await PayoutRequest.create({
            guide: guideId,
            amount: numericAmount,
            status: "pending"
        });

        // notify admins optionally
        await notifyAdmins({
            type: "payout:requested",
            content: `Guide ${guide.name || guide._id} yêu cầu rút ${numericAmount}.`,
            meta: { payoutRequestId: reqDoc._id, guideId: guideId, amount: numericAmount }
        }).catch(() => { });

        return res.status(201).json({ ok: true, payoutRequest: reqDoc });
    } catch (err) {
        console.error("createPayoutRequest error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
};

export const getMyPayoutRequests = async (req, res) => {
    try {
        const guideId = req.user?._id;
        if (!guideId) return res.status(401).json({ message: "Unauthorized" });

        const list = await PayoutRequest.find({ guide: guideId }).sort({ createdAt: -1 });
        return res.json({ ok: true, list });
    } catch (err) {
        console.error("getMyPayoutRequests error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
};

export const adminApprovePayoutRequest = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const admin = req.user;
        if (!admin || !(admin.role === "admin" || admin?.role_id?.name === "admin")) {
            return res.status(403).json({ message: "Chỉ admin" });
        }

        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid payout request id" });

        session.startTransaction();

        const payoutReq = await PayoutRequest.findById(id).session(session);
        if (!payoutReq) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Payout request không tồn tại" });
        }
        if (payoutReq.status !== "pending") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Payout request đã xử lý" });
        }

        const guide = await User.findById(payoutReq.guide).session(session);
        if (!guide) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Guide không tồn tại" });
        }
        if ((guide.balance || 0) < payoutReq.amount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Guide không đủ số dư" });
        }

        // trừ balance
        guide.balance = guide.balance - payoutReq.amount;
        await guide.save({ session });

        // mark payout request
        payoutReq.status = "approved";
        payoutReq.processedAt = new Date();
        payoutReq.processedBy = admin._id;
        if (req.body.externalTxId) payoutReq.externalTransactionId = req.body.externalTxId;
        await payoutReq.save({ session });

        // ledger transaction (optional)
        try {
            await Transaction.create([{
                bookingId: null,
                userId: admin._id,
                payeeUserId: payoutReq.guide,
                amount: mongoose.Types.Decimal128.fromString(String(payoutReq.amount)),
                commission_fee: mongoose.Types.Decimal128.fromString("0"),
                net_amount: mongoose.Types.Decimal128.fromString(String(payoutReq.amount)),
                transaction_type: "payout:withdraw",
                status: "confirmed",
                payment_gateway: "manual",
                transaction_code: req.body.externalTxId || `withdraw-${payoutReq._id}`,
                note: `Payout withdrawal approved for guide ${String(payoutReq.guide)}`
            }], { session });
        } catch (txErr) {
            console.error("adminApprovePayoutRequest: failed to create Transaction:", txErr);
        }

        await session.commitTransaction();
        session.endSession();

        // notify guide
        await notifyUser({
            userId: payoutReq.guide,
            type: "payout:approved",
            content: `Yêu cầu rút ${payoutReq.amount} của bạn đã được admin duyệt.`,
            url: `/guide/payouts/${payoutReq._id}`,
            meta: { payoutRequestId: payoutReq._id, amount: payoutReq.amount, processedAt: payoutReq.processedAt }
        }).catch(() => { });

        return res.json({ ok: true, payoutRequest: payoutReq });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("adminApprovePayoutRequest error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
};

export const adminRejectPayoutRequest = async (req, res) => {
    try {
        const admin = req.user;
        if (!admin || !(admin.role === "admin" || admin?.role_id?.name === "admin")) {
            return res.status(403).json({ message: "Chỉ admin" });
        }
        const { id } = req.params;
        const { note } = req.body || {};
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid payout request id" });

        const payoutReq = await PayoutRequest.findById(id);
        if (!payoutReq) return res.status(404).json({ message: "Payout request không tồn tại" });
        if (payoutReq.status !== "pending") return res.status(400).json({ message: "Payout request đã xử lý" });

        payoutReq.status = "rejected";
        payoutReq.processedAt = new Date();
        payoutReq.processedBy = admin._id;
        payoutReq.adminNote = note || null;
        await payoutReq.save();

        await notifyUser({
            userId: payoutReq.guide,
            type: "payout:rejected",
            content: `Yêu cầu rút ${payoutReq.amount} của bạn đã bị từ chối.`,
            url: `/guide/payouts/${payoutReq._id}`,
            meta: { payoutRequestId: payoutReq._id, note: note || "" }
        }).catch(() => { });

        return res.json({ ok: true, payoutRequest: payoutReq });
    } catch (err) {
        console.error("adminRejectPayoutRequest error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
};