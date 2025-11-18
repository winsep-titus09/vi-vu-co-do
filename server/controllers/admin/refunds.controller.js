// server/controllers/adminRefunds.controller.js
import mongoose from "mongoose";
import Transaction from "../../models/Transaction.js";
import Booking from "../../models/Booking.js";
import { notifyAdmins, notifyUser } from "../../services/notify.js";

const ObjectId = mongoose.Types.ObjectId;

function isAdmin(user) { return user?.role === "admin"; }

/**
 * List refund requests (admin)
 * Query params:
 *  - status (optional): pending|confirmed|failed  (default: pending)
 *  - limit, skip (optional)
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
 * - body: { transaction_code? }
 * - Sets transaction.status = "confirmed", confirmed_by, confirmed_at
 * - Updates booking.status = "canceled", sets refund_transaction_id
 * - Notifies customer
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

        // Mark transaction confirmed
        txn.status = "confirmed";
        txn.confirmed_by = user._id;
        txn.confirmed_at = new Date();
        if (transaction_code) txn.transaction_code = transaction_code;
        await txn.save();

        // Update booking: cancel and set refund_transaction_id
        const booking = await Booking.findById(txn.bookingId);
        if (booking) {
            booking.status = "canceled";
            booking.canceled_at = new Date();
            booking.canceled_by = user._id;
            booking.refund_transaction_id = txn._id;
            // If it was cancel_requested flag, we keep it; otherwise set cancel_reason if needed
            await booking.save();
        }

        // Notify customer
        await notifyUser({
            userId: txn.userId,
            type: "booking:refunded",
            content: `Hoàn tiền cho booking #${txn.bookingId} đã hoàn tất.`,
            url: `/booking/${txn.bookingId}`,
            meta: { bookingId: txn.bookingId, transactionId: txn._id }
        }).catch(() => { });

        // Optional: notify admins that refund was confirmed
        await notifyAdmins({
            type: "refund:confirmed",
            content: `Refund confirmed for booking ${txn.bookingId} (txn ${txn._id}).`,
            meta: { bookingId: txn.bookingId, transactionId: txn._id, confirmedBy: user._id }
        }).catch(() => { });

        return res.json({ message: "Refund confirmed", transaction: txn, booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi confirm refund", error: e.message });
    }
};

/**
 * Reject refund (admin)
 * - body: { reason? }
 * - Sets transaction.status = "failed" (or 'failed'), confirmed_by and confirmed_at to record actor/time
 * - Optionally clear booking.cancel_requested (so customer may try again or keep booking)
 * - Notify customer and admins
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

        // Update booking: clear cancel_requested flag so booking remains paid (or leave it depending on policy)
        const booking = await Booking.findById(txn.bookingId);
        if (booking) {
            booking.cancel_requested = false;
            booking.cancel_requested_at = null;
            booking.cancel_requested_by = null;
            booking.cancel_requested_note = null;
            // keep booking.status as-is (likely 'paid') so service remains booked
            await booking.save();
        }

        // Notify customer about rejection
        await notifyUser({
            userId: txn.userId,
            type: "booking:refund_rejected",
            content: `Yêu cầu hoàn tiền cho booking #${txn.bookingId} đã bị từ chối.${reason ? ` Lý do: ${reason}` : ""}`,
            url: `/booking/${txn.bookingId}`,
            meta: { bookingId: txn.bookingId, transactionId: txn._id, reason }
        }).catch(() => { });

        // Notify admins for audit
        await notifyAdmins({
            type: "refund:rejected",
            content: `Refund for booking ${txn.bookingId} was rejected by admin ${user._id}.`,
            meta: { bookingId: txn.bookingId, transactionId: txn._id, reason, rejectedBy: user._id }
        }).catch(() => { });

        return res.json({ message: "Refund request rejected", transaction: txn, booking });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Lỗi reject refund", error: e.message });
    }
};