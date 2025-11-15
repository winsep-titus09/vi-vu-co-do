// services/notify.js (mở rộng gửi email Gmail)
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendTemplateEmail } from "./email.service.js";

let ioRef = null;
export const setIO = (io) => { ioRef = io; };

// Gửi email tới danh sách admin (ADMIN_EMAILS trong .env, phân tách dấu phẩy)
async function sendAdminEmail({ subject, templateKey, data }) {
    const list = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    if (!list.length) return;
    await Promise.all(
        list.map(email =>
            sendTemplateEmail({ to: email, subject, templateKey, data })
                .catch(err => console.error("Admin email error:", err.message))
        )
    );
}

// Map sự kiện -> gửi email
async function maybeSendEmail({ audience, recipientId, type, content, url, meta }) {
    try {
        // ADMIN events
        if (audience === "admin") {
            if (type === "guide_application:new") {
                await sendAdminEmail({
                    subject: "Yêu cầu làm HDV mới",
                    templateKey: "adminNewGuideApplication",
                    data: {
                        applicantName: meta?.applicantName || "",
                        applicantEmail: meta?.applicantEmail || "",
                        adminUrl: meta?.adminUrl || `${process.env.APP_BASE_URL}/admin/guide-applications${meta?.applicationId ? "/" + meta.applicationId : ""}`
                    }
                });
            }
            if (type === "booking:paid") {
                await sendAdminEmail({
                    subject: "Booking thanh toán thành công",
                    templateKey: "adminPaymentSuccess",
                    data: {
                        tourName: meta?.tourName || "",
                        bookingCode: meta?.bookingCode || meta?.bookingId || "",
                        customerName: meta?.customerName || "",
                        customerEmail: meta?.customerEmail || ""
                    }
                });
            }
            return;
        }

        // USER/GUIDE events (đều là user trong hệ thống)
        if (!recipientId) return;
        const user = await User.findById(recipientId);
        if (!user?.email) return;

        const to = user.email;

        switch (type) {
            // GUIDE APPLICATION RESULTS (customer)
            case "guide_application:approved":
                await sendTemplateEmail({
                    to,
                    subject: "Hồ sơ HDV đã được duyệt",
                    templateKey: "guideApplicationApproved",
                    data: {
                        userName: user.name || "Bạn",
                        dashboardUrl: `${process.env.APP_BASE_URL}/guide/dashboard`
                    }
                });
                break;
            case "guide_application:rejected":
                await sendTemplateEmail({
                    to,
                    subject: "Hồ sơ HDV bị từ chối",
                    templateKey: "guideApplicationRejected",
                    data: {
                        userName: user.name || "Bạn",
                        reason: meta?.reason || meta?.admin_notes || "",
                        applyUrl: `${process.env.APP_BASE_URL}/guide/apply`
                    }
                });
                break;

            // BOOKING FLOW
            // Gửi cho GUIDE: có booking mới chờ duyệt
            case "booking:request":
                await sendTemplateEmail({
                    to,
                    subject: "Có booking mới chờ duyệt",
                    templateKey: "bookingCreatedAwaitingGuide",
                    data: {
                        guideName: user.name || "Bạn",
                        tourName: meta?.tourName || "",
                        bookingCode: meta?.bookingCode || meta?.bookingId || "",
                        guideBookingUrl: meta?.guideBookingUrl || `${process.env.APP_BASE_URL}/guide/bookings${meta?.bookingId ? "/" + meta.bookingId : ""}`
                    }
                });
                break;

            // Gửi cho CUSTOMER: HDV đã duyệt, mời thanh toán
            case "booking:approved":
                await sendTemplateEmail({
                    to,
                    subject: "Yêu cầu thanh toán booking",
                    templateKey: "bookingPaymentRequired",
                    data: {
                        userName: user.name || "Bạn",
                        tourName: meta?.tourName || "",
                        bookingCode: meta?.bookingCode || meta?.bookingId || "",
                        dueDate: meta?.dueDate || "",
                        paymentUrl: meta?.paymentUrl || url || `${process.env.APP_BASE_URL}/booking/${meta?.bookingId || ""}/pay`
                    }
                });
                break;

            // Gửi cho CUSTOMER: HDV từ chối
            case "booking:rejected":
                await sendTemplateEmail({
                    to,
                    subject: "Yêu cầu đặt tour bị từ chối",
                    templateKey: "bookingRejected",
                    data: {
                        userName: user.name || "Bạn",
                        tourName: meta?.tourName || "",
                        bookingCode: meta?.bookingCode || meta?.bookingId || "",
                    }
                });
                break;

            // Gửi cho CUSTOMER: thanh toán thành công
            case "booking:paid":
                await sendTemplateEmail({
                    to,
                    subject: "Thanh toán tour thành công",
                    templateKey: "bookingPaymentSuccess",
                    data: {
                        userName: user.name || "Bạn",
                        tourName: meta?.tourName || "",
                        startDate: meta?.startDate || "",
                        bookingCode: meta?.bookingCode || meta?.bookingId || "",
                        bookingUrl: meta?.bookingUrl || url || `${process.env.APP_BASE_URL}/booking/${meta?.bookingId || ""}`
                    }
                });
                break;

            // Gửi cho CUSTOMER: thanh toán thất bại
            case "booking:payment_failed":
                await sendTemplateEmail({
                    to,
                    subject: "Thanh toán thất bại",
                    templateKey: "bookingPaymentFailed",
                    data: {
                        userName: user.name || "Bạn",
                        tourName: meta?.tourName || ""
                    }
                });
                break;

            // Gửi cho GUIDE: khách đã thanh toán
            case "booking:paid_guide":
                await sendTemplateEmail({
                    to,
                    subject: "Khách đã thanh toán",
                    templateKey: "bookingPaidGuide",
                    data: {
                        guideName: user.name || "Bạn",
                        bookingCode: meta?.bookingCode || meta?.bookingId || "",
                        tourName: meta?.tourName || ""
                    }
                });
                break;

            // REVIEW REMINDER từ cron
            case "review:prompt:tour":
            case "tour:completed_review_reminder":
                await sendTemplateEmail({
                    to,
                    subject: "Nhắc đánh giá tour",
                    templateKey: "reviewReminder",
                    data: {
                        userName: user.name || "Bạn",
                        tourName: meta?.tourName || "",
                        reviewUrl: meta?.reviewUrl || url || `${process.env.APP_BASE_URL}/booking/${meta?.bookingId || ""}/review`
                    }
                });
                break;

            case "review:prompt:guide":
                await sendTemplateEmail({
                    to,
                    subject: "Nhắc đánh giá hướng dẫn viên",
                    templateKey: "reviewReminder",
                    data: {
                        userName: user.name || "Bạn",
                        tourName: meta?.tourName || "",
                        reviewUrl: meta?.reviewUrl || url || `${process.env.APP_BASE_URL}/booking/${meta?.bookingId || ""}/review/guide`
                    }
                });
                break;

            default:
                break;
        }
    } catch (err) {
        console.error("maybeSendEmail error:", err.message);
    }
}

// Thông báo ADMIN
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

    await maybeSendEmail({ audience: "admin", recipientId: null, type, content, url, meta });
    return doc;
};

// Thông báo USER/GUIDE
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

    await maybeSendEmail({ audience: "user", recipientId: userId, type, content, url, meta });
    return doc;
};