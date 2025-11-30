/**
 * server/services/notify.js
 *
 * Notification service: create Notification documents (in-app), emit via socket.io if available,
 * and send optional email templates (via email.service.sendTemplateEmail) for admin and user audiences.
 *
 * This file is the project's notify implementation with added handling for:
 * - admin email when a guide creates a payout request ("payout:requested" -> templateKey "adminPayoutRequest")
 * - user email when a payout is rejected ("payout:rejected" -> templateKey "payoutRejected")
 *
 * Keep this file in sync with templates under server/templates/email/.
 */

import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendTemplateEmail } from "./email.service.js";

let ioRef = null;
export const setIO = (io) => { ioRef = io; };

/**
 * Flatten object (one-level dotted keys)
 * e.g. { a: { b: 1 }, c: 2 } -> { "a.b":1, a_b:1, a: {b:1}, c:2 }
 * We flatten nested meta to top-level keys as well as keep nested object for backward compat.
 */
function flattenForTemplate(obj = {}, prefix = "", out = {}) {
    for (const key of Object.keys(obj || {})) {
        const val = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (val && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
            flattenForTemplate(val, newKey, out);
        } else {
            out[newKey] = val;
            // also expose simple underscore version for templates that used underscores
            out[newKey.replace(/\./g, "_")] = val;
        }
    }
    return out;
}

// Helper: build email data from provided meta + explicit fields
function buildTemplateData(extra = {}, meta = {}) {
    const flatMeta = flattenForTemplate(meta);
    // merge extra (explicit) with flatten meta; extra overrides meta keys
    return { ...flatMeta, ...extra };
}

// send admin email list (ADMIN_EMAILS)
async function sendAdminEmail({ subject, templateKey, data }) {
    const list = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    if (!list.length) return;
    await Promise.all(
        list.map(email =>
            sendTemplateEmail({ to: email, subject, templateKey, data })
                .catch(err => console.error("Admin email error:", err && err.message ? err.message : err))
        )
    );
}

/**
 * maybeSendEmail: map event -> email template + data
 * audience: "admin" or "user"
 *
 * - For audience === 'admin': we send emails to ADMIN_EMAILS (if configured) mapped by type.
 * - For audience === 'user': we lookup user by recipientId and send template emails if user.email exists.
 *
 * The function is best-effort: failures to send email are logged but do not throw.
 */
async function maybeSendEmail({ audience, recipientId, type, content, url, meta = {} }) {
    try {
        // ADMIN audience
        if (audience === "admin") {
            // Guide application new
            if (type === "guide_application:new") {
                const data = buildTemplateData({
                    applicantName: meta?.applicantName || "",
                    applicantEmail: meta?.applicantEmail || "",
                    adminUrl: meta?.adminUrl || `${process.env.APP_BASE_URL}/admin/guide-applications${meta?.applicationId ? "/" + meta.applicationId : ""}`,
                    supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || ""
                }, meta);
                await sendAdminEmail({ subject: "Yêu cầu làm HDV mới", templateKey: "adminNewGuideApplication", data });
            }

            // Booking paid (admin)
            if (type === "booking:paid") {
                const data = buildTemplateData({
                    tourName: meta?.tourName || "",
                    bookingCode: meta?.bookingCode || meta?.bookingId || "",
                    customerName: meta?.customerName || "",
                    customerEmail: meta?.customerEmail || ""
                }, meta);
                await sendAdminEmail({ subject: "Booking thanh toán thành công", templateKey: "adminPaymentSuccess", data });
            }

            // Refund requested/pending (admin)
            if (type === "refund:requested" || type === "refund:pending") {
                const data = buildTemplateData({
                    bookingId: meta?.bookingId || "",
                    bookingCode: meta?.bookingCode || "",
                    amount: meta?.amount || "",
                    customerName: meta?.customerName || "",
                    customerEmail: meta?.customerEmail || "",
                    transactionId: meta?.transactionId || "",
                    message: meta?.message || meta?.note || "",
                    adminUrl: meta?.adminUrl || `${process.env.APP_BASE_URL}/admin/refunds${meta?.transactionId ? "/" + meta.transactionId : ""}`,
                    supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || ""
                }, meta);
                await sendAdminEmail({ subject: "Yêu cầu hoàn tiền mới", templateKey: "adminRefundRequested", data });
            }

            if (type === "refund:confirmed") {
                const data = buildTemplateData({
                    bookingId: meta?.bookingId || "",
                    transactionId: meta?.transactionId || "",
                    amount: meta?.amount || "",
                    confirmedBy: meta?.confirmedBy || ""
                }, meta);
                await sendAdminEmail({ subject: "Hoàn tiền đã được xác nhận", templateKey: "adminRefundConfirmed", data });
            }

            if (type === "refund:rejected") {
                const data = buildTemplateData({
                    bookingId: meta?.bookingId || "",
                    transactionId: meta?.transactionId || "",
                    reason: meta?.reason || "",
                    rejectedBy: meta?.rejectedBy || ""
                }, meta);
                await sendAdminEmail({ subject: "Yêu cầu hoàn tiền đã bị từ chối", templateKey: "adminRefundRejected", data });
            }

            // Payout notifications for admins (paid)
            if (type === "payout:paid_admin" || type === "payout:paid") {
                const data = buildTemplateData({
                    payoutId: meta?.payoutId || "",
                    guideName: meta?.guideName || "",
                    amount: meta?.amount || "",
                    tourId: meta?.tourId || "",
                    tourDate: meta?.tourDate || "",
                    adminUrl: meta?.adminUrl || `${process.env.APP_BASE_URL}/admin/payouts/${meta?.payoutId || ""}`,
                }, meta);
                await sendAdminEmail({ subject: "Payout đã được trả", templateKey: "adminPayoutPaid", data });
            }

            // NEW: admin notification when guide creates a payout request
            if (type === "payout:requested" || type === "payout:request") {
                const data = buildTemplateData({
                    payoutRequestId: meta?.payoutRequestId || meta?.payoutId || "",
                    guideName: meta?.guideName || meta?.guide || "",
                    guideEmail: meta?.guideEmail || "",
                    amount: meta?.amount || "",
                    adminUrl: meta?.adminUrl || `${process.env.APP_BASE_URL}/admin/payouts/${meta?.payoutRequestId || ""}`,
                    supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || ""
                }, meta);
                await sendAdminEmail({ subject: "Yêu cầu rút tiền mới", templateKey: "adminPayoutRequest", data });
            }

            // Other admin cases remain possible — add mapping as needed.

            return;
        }

        // USER / GUIDE audience
        if (!recipientId) return;
        const user = await User.findById(recipientId);
        if (!user?.email) return;
        const to = user.email;

        // Build baseMeta with helpful defaults + flattened meta
        const baseMeta = buildTemplateData({
            bookingId: meta?.bookingId || "",
            bookingCode: meta?.bookingCode || "",
            amount: meta?.amount || "",
            message: meta?.message || meta?.note || "",
            requestedAt: meta?.requestedAt || meta?.requested_at || (meta?.createdAt ? new Date(meta.createdAt).toLocaleString() : ""),
            bookingUrl: meta?.bookingUrl || `${process.env.APP_BASE_URL}/booking/${meta?.bookingId || ""}`,
            supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || "",
            transactionId: meta?.transactionId || meta?.txnId || "",
            transactionCode: meta?.transaction_code || meta?.transactionCode || "",
            confirmedAt: meta?.confirmedAt || new Date().toLocaleString(),
            userName: user.name || "Bạn",
            customerName: user.name || ""
        }, meta);

        switch (type) {
            // Guide application emails
            case "guide_application:approved":
                await sendTemplateEmail({
                    to,
                    subject: "Hồ sơ HDV đã được duyệt",
                    templateKey: "guideApplicationApproved",
                    data: baseMeta
                });
                break;
            case "guide_application:rejected":
                await sendTemplateEmail({
                    to,
                    subject: "Hồ sơ HDV bị từ chối",
                    templateKey: "guideApplicationRejected",
                    data: baseMeta
                });
                break;

            // Booking-related emails to users/guides
            case "booking:request":
                await sendTemplateEmail({
                    to,
                    subject: "Có booking mới chờ duyệt",
                    templateKey: "bookingCreatedAwaitingGuide",
                    data: baseMeta
                });
                break;
            case "booking:approved":
                await sendTemplateEmail({
                    to,
                    subject: "Yêu cầu thanh toán booking",
                    templateKey: "bookingPaymentRequired",
                    data: baseMeta
                });
                break;
            case "booking:rejected":
                await sendTemplateEmail({
                    to,
                    subject: "Yêu cầu đặt tour bị từ chối",
                    templateKey: "bookingRejected",
                    data: baseMeta
                });
                break;
            case "booking:paid":
                await sendTemplateEmail({
                    to,
                    subject: "Thanh toán tour thành công",
                    templateKey: "bookingPaymentSuccess",
                    data: baseMeta
                });
                break;
            case "booking:refund_requested":
            case "booking:refund_requested:confirm":
                await sendTemplateEmail({
                    to,
                    subject: "Yêu cầu hoàn tiền đã được gửi",
                    templateKey: "bookingRefundRequested",
                    data: baseMeta
                });
                break;
            case "booking:refunded":
                await sendTemplateEmail({
                    to,
                    subject: "Hoàn tiền đã được thực hiện",
                    templateKey: "bookingRefunded",
                    data: baseMeta
                });
                break;
            case "booking:refund_rejected":
                await sendTemplateEmail({
                    to,
                    subject: "Yêu cầu hoàn tiền bị từ chối",
                    templateKey: "bookingRefundRejected",
                    data: baseMeta
                });
                break;

            // Payout emails for guides
            case "payout:created":
                await sendTemplateEmail({
                    to,
                    subject: "Yêu cầu thanh toán đã được tạo",
                    templateKey: "payoutCreated",
                    data: baseMeta
                });
                break;

            case "payout:paid":
                await sendTemplateEmail({
                    to,
                    subject: "Payout đã được thực hiện",
                    templateKey: "payoutPaid",
                    data: baseMeta
                });
                break;

            // NEW: payout rejected -> notify guide
            case "payout:rejected":
                await sendTemplateEmail({
                    to,
                    subject: "Yêu cầu rút tiền đã bị từ chối",
                    templateKey: "payoutRejected",
                    data: baseMeta
                });
                break;

            // Article notifications (guide)
            case "article:approved":
                await sendTemplateEmail({
                    to,
                    subject: "Bài viết của bạn đã được duyệt",
                    templateKey: "articleApproved",
                    data: baseMeta
                });
                break;
            case "article:rejected":
                await sendTemplateEmail({
                    to,
                    subject: "Bài viết của bạn đã bị từ chối",
                    templateKey: "articleRejected",
                    data: baseMeta
                });
                break;
            case "article:deleted":
                await sendTemplateEmail({
                    to,
                    subject: "Bài viết của bạn đã bị xóa",
                    templateKey: "articleDeleted",
                    data: baseMeta
                });
                break;

            default:
                // no mapping for other types — safe to ignore
                break;
        }
    } catch (err) {
        console.error("maybeSendEmail error:", err && err.message ? err.message : err);
    }
}

/**
 * notifyAdmins: create admin Notification doc, emit via socket.io to admins,
 * and attempt to send admin emails via maybeSendEmail (audience admin).
 */
export const notifyAdmins = async ({ type, content, url, meta = {} }) => {
    const doc = await Notification.create({
        audience: "admin",
        type,
        content,
        url,
        is_read: false,
        meta,
    });

    if (ioRef) {
        ioRef.to("admins").emit("admin:notification:new", {
            id: doc._id, type, content, url, meta, createdAt: doc.createdAt
        });
    }

    // call maybeSendEmail with audience admin (best-effort)
    await maybeSendEmail({ audience: "admin", recipientId: null, type, content, url, meta }).catch(() => { });
    return doc;
};

/**
 * notifyUser: create user Notification doc, emit via socket.io to user,
 * and attempt to send user email via maybeSendEmail (audience user).
 */
export const notifyUser = async ({ userId, type, content, url, meta = {} }) => {
    if (!userId) throw new Error("Thiếu userId để gửi thông báo.");
    const doc = await Notification.create({
        audience: "user",
        recipientId: userId,
        type,
        content,
        url,
        meta,
        is_read: false,
    });

    if (ioRef) {
        ioRef.to(userId.toString()).emit("user:notification:new", {
            id: doc._id, type, content, url, meta, createdAt: doc.createdAt
        });
    }

    // call maybeSendEmail for user with meta (best-effort)
    await maybeSendEmail({ audience: "user", recipientId: userId, type, content, url, meta }).catch(() => { });
    return doc;
};