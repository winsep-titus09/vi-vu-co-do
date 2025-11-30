// server/controllers/admin/refunds.controller.js
import mongoose from "mongoose";
import Transaction from "../../models/Transaction.js";
import Booking from "../../models/Booking.js";
import User from "../../models/User.js";
import { notifyAdmins, notifyUser } from "../../services/notify.js";

const ObjectId = mongoose.Types.ObjectId;

function isAdmin(user) { return user?.role_id?.name === "admin" || user?.role === "admin"; }

/**
 * List refund requests (admin)
 */
export const listRefundRequests = async (req, res) => {
    try {
        const user = req.user;
        if (!isAdmin(user)) return res.status(403).json({ message: "Chỉ admin" });

        const { status = "pending", limit = 50, skip = 0 } = req.query;
        const q = { transaction_type: "refund" };
        if (status) q.status = status;

        const txns = await Transaction.find(q)
            .sort({ createdAt: -1 })
            .limit(Math.min(Number(limit) || 50, 1000))
            .skip(Number(skip) || 0)
            .populate("bookingId")
            .populate("userId", "email full_name");

        const total = await Transaction.countDocuments(q);
        return res.json({ total, count: txns.length, transactions: txns });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi lấy danh sách refund requests", error: e.message });
    }
};

/**
 * Get one refund request detail
 */
export const getRefundRequest = async (req, res) => {
    try {
        const user = req.user;
        if (!isAdmin(user)) return res.status(403).json({ message: "Chỉ admin" });

        const { txnId } = req.params;
        if (!ObjectId.isValid(txnId)) return res.status(400).json({ message: "txnId không hợp lệ" });

        const txn = await Transaction.findById(txnId).populate("bookingId").populate("userId", "email full_name");
        if (!txn) return res.status(404).json({ message: "Không tìm thấy transaction" });

        return res.json({ transaction: txn });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi lấy refund request", error: e.message });
    }
};

/**
 * Confirm refund (admin)
 */
export const confirmRefundRequest = async (req, res) => {
    try {
        const user = req.user;
        if (!isAdmin(user)) return res.status(403).json({ message: "Chỉ admin" });

        const { txnId } = req.params;
        const { transaction_code } = req.body || {};

        if (!ObjectId.isValid(txnId)) return res.status(400).json({ message: "txnId không hợp lệ" });

        const txn = await Transaction.findById(txnId);
        if (!txn) return res.status(404).json({ message: "Transaction không tồn tại" });
        if (txn.transaction_type !== "refund") return res.status(400).json({ message: "Transaction không phải refund" });
        if (txn.status === "confirmed") return res.status(400).json({ message: "Refund đã được xác nhận" });

        txn.status = "confirmed";
        txn.confirmed_by = user._id;
        txn.confirmed_at = new Date();
        if (transaction_code) txn.transaction_code = transaction_code;
        await txn.save();

        const booking = await Booking.findById(txn.bookingId);
        if (booking) {
            booking.status = "canceled";
            booking.canceled_at = new Date();
            booking.canceled_by = user._id;
            booking.refund_transaction_id = txn._id;
            await booking.save();
        }

        // Prepare meta for notifications/emails
        const customer = await User.findById(txn.userId).lean().catch(() => null);
        const bookingCode = booking ? String(booking._id) : (txn.bookingId ? String(txn.bookingId) : "");
        const adminUrl = `${process.env.APP_BASE_URL}/admin/refunds/${txn._id}`;
        const confirmedAt = txn.confirmed_at ? txn.confirmed_at.toLocaleString() : new Date().toLocaleString();

        const userMeta = {
            bookingId: txn.bookingId,
            bookingCode,
            amount: txn.amount ? txn.amount.toString() : "",
            transactionId: txn._id,
            transactionCode: txn.transaction_code || transaction_code || "",
            confirmedBy: user.name || user._id,
            confirmedAt,
            bookingUrl: `${process.env.APP_BASE_URL}/booking/${txn.bookingId || ""}`,
            supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || ""
        };

        await notifyUser({
            userId: txn.userId,
            type: "booking:refunded",
            content: `Hoàn tiền cho booking #${txn.bookingId} đã hoàn tất.`,
            url: `/booking/${txn.bookingId}`,
            meta: userMeta
        }).catch(() => { });

        await notifyAdmins({
            type: "refund:confirmed",
            content: `Refund confirmed for booking ${txn.bookingId} (txn ${txn._id}).`,
            meta: {
                bookingId: txn.bookingId,
                bookingCode,
                transactionId: txn._id,
                amount: txn.amount ? txn.amount.toString() : "",
                confirmedBy: user.name || user._id,
                confirmedAt,
                adminUrl
            }
        }).catch(() => { });

        return res.json({ message: "Refund confirmed", transaction: txn, booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi confirm refund", error: e.message });
    }
};

/**
 * Reject refund (admin)
 */
export const rejectRefundRequest = async (req, res) => {
    try {
        const user = req.user;
        if (!isAdmin(user)) return res.status(403).json({ message: "Chỉ admin" });

        const { txnId } = req.params;
        const { reason } = req.body || {};

        if (!ObjectId.isValid(txnId)) return res.status(400).json({ message: "txnId không hợp lệ" });

        const txn = await Transaction.findById(txnId);
        if (!txn) return res.status(404).json({ message: "Transaction không tồn tại" });
        if (txn.transaction_type !== "refund") return res.status(400).json({ message: "Transaction không phải refund" });
        if (txn.status === "confirmed") return res.status(400).json({ message: "Không thể từ chối refund đã được xác nhận" });
        if (txn.status === "failed") return res.status(400).json({ message: "Refund đã bị từ chối trước đó" });

        txn.status = "failed";
        txn.confirmed_by = user._id; // reuse field to store actor
        txn.confirmed_at = new Date();
        txn.note = `${txn.note || ""} | Rejected by admin: ${reason || ""}`;
        await txn.save();

        const booking = await Booking.findById(txn.bookingId);
        if (booking) {
            booking.cancel_requested = false;
            booking.cancel_requested_at = null;
            booking.cancel_requested_by = null;
            booking.cancel_requested_note = null;
            await booking.save();
        }

        const bookingCode = booking ? String(booking._id) : (txn.bookingId ? String(txn.bookingId) : "");
        const adminUrl = `${process.env.APP_BASE_URL}/admin/refunds/${txn._id}`;

        // notify user
        await notifyUser({
            userId: txn.userId,
            type: "booking:refund_rejected",
            content: `Yêu cầu hoàn tiền cho booking #${txn.bookingId} đã bị từ chối.${reason ? ` Lý do: ${reason}` : ""}`,
            url: `/booking/${txn.bookingId}`,
            meta: {
                bookingId: txn.bookingId,
                bookingCode,
                transactionId: txn._id,
                reason: reason || "",
                rejectedBy: user.name || user._id,
                adminUrl,
                supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || ""
            }
        }).catch(() => { });

        await notifyAdmins({
            type: "refund:rejected",
            content: `Refund for booking ${txn.bookingId} was rejected by admin ${user._id}.`,
            meta: { bookingId: txn.bookingId, bookingCode, transactionId: txn._id, reason, rejectedBy: user.name || user._id }
        }).catch(() => { });

        return res.json({ message: "Refund request rejected", transaction: txn, booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi reject refund", error: e.message });
    }
};