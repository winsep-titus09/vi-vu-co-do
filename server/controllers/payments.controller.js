// server/controllers/payments.controller.js
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Transaction from "../models/Transaction.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import { createMoMoPayment, verifyMoMoIPN } from "../services/payments/momo.js";
import { notifyAdmins, notifyUser } from "../services/notify.js";

// Helper: build requestType từ method client gửi
function resolveRequestType(method) {
    const envDefault = process.env.MOMO_REQUEST_TYPE || "payWithCC";
    const m = (method || "").toLowerCase(); // "wallet" | "atm" | "credit" | "card"
    if (m === "wallet") return "captureWallet";
    if (m === "atm") return "payWithATM";
    if (m === "credit" || m === "card") return "payWithCC"; // Thẻ quốc tế qua MoMo
    return envDefault;
}

// Helper: encode/decode extraData Base64 JSON
function encodeExtraData(obj) {
    try {
        return Buffer.from(JSON.stringify(obj), "utf8").toString("base64");
    } catch {
        return "";
    }
}
function tryDecodeExtraData(extraData) {
    try {
        if (!extraData) return null;
        const json = Buffer.from(extraData, "base64").toString("utf8");
        return JSON.parse(json);
    } catch {
        return null;
    }
}

// Tạo phiên MoMo (chỉ khi awaiting_payment)
export const createCheckout = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { booking_id, method } = req.body;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });
        if (!booking_id) return res.status(400).json({ message: "Thiếu booking_id" });

        const booking = await Booking.findById(booking_id);
        if (!booking) return res.status(404).json({ message: "Booking không tồn tại" });
        if (String(booking.customer_id) !== String(userId)) {
            return res.status(403).json({ message: "Bạn không sở hữu booking này" });
        }
        if (booking.status !== "awaiting_payment") {
            return res.status(400).json({ message: "Booking chưa được HDV duyệt để thanh toán" });
        }

        console.log("[CHECKOUT] IPN =", process.env.PAYMENT_IPN_URL);
        console.log("[CHECKOUT] RETURN =", process.env.PAYMENT_RETURN_URL);

        // 1) Nếu đã có phiên PENDING còn hạn -> trả về payUrl cũ
        const nowMs = Date.now();
        const pendingValid =
            booking.payment_session?.status === "pending" &&
            booking.payment_session?.expires_at &&
            new Date(booking.payment_session.expires_at).getTime() > nowMs;

        if (pendingValid) {
            return res.json({
                payUrl: booking.payment_session.pay_url,
                booking_id: booking._id,
                gateway: booking.payment_session.gateway,
                reused: true,
            });
        }

        // 2) Tạo orderId duy nhất (tránh MoMo resultCode 41)
        const amount = Number(booking.total_price || 0);
        const orderId = `${booking._id}-${Date.now()}`;
        const orderInfo = `Thanh toán booking ${orderId}`;
        const returnUrl = req.query.return || process.env.PAYMENT_RETURN_URL;
        const notifyUrl = req.query.ipn || process.env.PAYMENT_IPN_URL;

        // 3) Chọn phương thức thanh toán
        const requestType = resolveRequestType(method);

        // 4) Nhúng bookingId vào extraData (để IPN map ngược chính xác)
        const extraData = encodeExtraData({ bookingId: String(booking._id) });

        // 5) Tạo phiên MoMo
        const momo = await createMoMoPayment({
            amount,
            orderId,
            orderInfo,
            returnUrl,
            notifyUrl,
            requestType,
            extraData,
            timeoutMs: Number(process.env.MOMO_TIMEOUT_MS || 15000),
        });

        // 6) Lưu session
        booking.payment_session = {
            gateway: "momo",
            pay_url: momo.payUrl,
            transaction_code: momo.transaction_code, // = orderId duy nhất
            status: "pending",
            created_at: new Date(),
            expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 phút
            raw: momo.raw,
        };
        await booking.save();

        return res.json({ payUrl: momo.payUrl, booking_id: booking._id, gateway: "momo" });
    } catch (e) {
        console.error("[CHECKOUT ERROR]", e?.message || e);
        const isTimeout = String(e?.message || "").toLowerCase().includes("timeout");
        const status = isTimeout ? 504 : 500;
        return res.status(status).json({ message: "Lỗi tạo checkout MoMo", error: e.message, code: isTimeout ? "GATEWAY_TIMEOUT" : "CREATE_FAILED" });
    }
};

// IPN MoMo
export const ipnHandler = async (req, res) => {
    console.log("[MoMo IPN HIT]", new Date().toISOString());
    console.log("[MoMo IPN HEADERS]", req.headers);
    console.log("[MoMo IPN BODY]", req.body);

    try {
        const body = req.body || {};
        const ok = verifyMoMoIPN(body);
        if (!ok) return res.status(200).json({ resultCode: 97, message: "Invalid signature" });

        // Ưu tiên lấy bookingId từ extraData
        let bookingId = null;
        const parsedExtra = tryDecodeExtraData(body.extraData);
        if (parsedExtra?.bookingId) bookingId = parsedExtra.bookingId;

        // Fallback: tách từ orderId "<bookingId>-<ts>"
        if (!bookingId && body.orderId) {
            bookingId = String(body.orderId).split("-")[0];
        }

        const resultCode = Number(body.resultCode); // 0 = thành công
        const txnCode = body.orderId; // duy nhất cho mỗi phiên

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(200).json({ resultCode: 1, message: "Order not found" });

        // Idempotent: nếu đã có transaction cho txnCode này thì OK
        const exist = await Transaction.findOne({
            bookingId,
            transaction_code: txnCode,
            transaction_type: "charge",
        });
        if (exist) return res.status(200).json({ resultCode: 0, message: "OK" });

        const success = resultCode === 0;

        // --- Begin improved atomic flow: create Transaction + update Booking in one Mongo transaction ---
        const mongooseSession = await mongoose.startSession();
        await mongooseSession.startTransaction();
        try {
            // Compute commission (tour override -> env fallback)
            let commissionRate = 0;
            try {
                const tourDoc = await Tour.findById(booking.tour_id).lean().catch(() => null);
                if (tourDoc && typeof tourDoc.commission_percentage !== "undefined" && !Number.isNaN(Number(tourDoc.commission_percentage))) {
                    commissionRate = Number(tourDoc.commission_percentage);
                } else {
                    commissionRate = Number(process.env.COMMISSION_RATE ?? 0) || 0;
                }
            } catch (e) {
                commissionRate = Number(process.env.COMMISSION_RATE ?? 0) || 0;
            }

            const amountValue = Number(booking.total_price || 0);
            // keep two decimals for commission calculation; you can adjust the rounding strategy if needed
            const commissionValue = Math.round((amountValue * commissionRate) * 100) / 100;
            const netValue = Math.round((amountValue - commissionValue) * 100) / 100;

            // Create transaction (use Decimal128)
            const txDocs = await Transaction.create([{
                bookingId: booking._id,
                userId: booking.customer_id,
                payeeUserId: booking.intended_guide_id || null,
                amount: mongoose.Types.Decimal128.fromString(String(Number(amountValue.toFixed(2)))),
                commission_fee: mongoose.Types.Decimal128.fromString(String(Number(commissionValue.toFixed(2)))),
                net_amount: mongoose.Types.Decimal128.fromString(String(Number(netValue.toFixed(2)))),
                transaction_type: "charge",
                status: success ? "confirmed" : "failed",
                payment_gateway: "momo",
                transaction_code: txnCode,
                note: `MoMo resultCode ${resultCode}`,
            }], { session: mongooseSession });

            const tx = txDocs[0];

            // Update booking atomically (attach transactionId)
            if (success) {
                booking.status = "paid";
                booking.paidAt = booking.paidAt || new Date();
                booking.payment = booking.payment || {};
                booking.payment.transactionId = tx._id;
                if (booking.payment_session) booking.payment_session.status = "paid";
            } else {
                if (booking.payment_session) booking.payment_session.status = "failed";
            }

            await booking.save({ session: mongooseSession });

            await mongooseSession.commitTransaction();
            mongooseSession.endSession();

            // Enrich meta for notifications (outside transaction)
            let tourName = `#${booking._id}`;
            try {
                const tourDoc = await Tour.findById(booking.tour_id).lean();
                if (tourDoc?.name) tourName = tourDoc.name;
            } catch { /* ignore */ }

            let customerName = "";
            let customerEmail = "";
            let customerPhone = "";
            try {
                const u = await User.findById(booking.customer_id).lean();
                customerName = u?.name || "";
                customerEmail = u?.email || "";
                customerPhone = u?.phone_number || u?.phone || "";
            } catch { /* ignore */ }

            let guideName = "";
            try {
                const g = await User.findById(booking.intended_guide_id).lean();
                guideName = g?.name || "";
            } catch { /* ignore */ }

            const totalAmountNumber = Number(booking.total_price || 0);
            const totalAmountText = `${totalAmountNumber.toLocaleString("vi-VN")} đ`;
            const numberOfPeople = Array.isArray(booking.participants)
                ? booking.participants.filter(p => p?.count_slot !== false).length || booking.participants.length
                : undefined;
            const tourDate = booking.start_date
                ? new Date(booking.start_date).toLocaleDateString("vi-VN")
                : "";
            const bookingUrl = `${process.env.APP_BASE_URL}/booking/${booking._id}`;
            const bookingCode = String(booking._id);

            if (success) {
                // Notify user
                await notifyUser({
                    userId: booking.customer_id,
                    type: "booking:paid",
                    content: `Thanh toán đơn đặt tour "${tourName}" thành công.`,
                    url: `/booking/${booking._id}`,
                    meta: {
                        bookingId: booking._id,
                        bookingCode,
                        tourId: booking.tour_id,
                        tourName,
                        tourDate: booking.start_date ? new Date(booking.start_date).toLocaleDateString("vi-VN") : "",
                        startDate: booking.start_date ? new Date(booking.start_date).toLocaleDateString("vi-VN") : "",
                        amount: totalAmountText,
                        bookingUrl,
                        customerName,
                        customerEmail
                    },
                }).catch(() => { });

                // Notify admin
                await notifyAdmins({
                    type: "booking:paid",
                    content: `Đơn #${booking._id} đã được thanh toán.`,
                    url: `/admin/bookings/${booking._id}`,
                    meta: {
                        bookingId: booking._id,
                        tourId: booking.tour_id,
                        tourName,
                        bookingCode: booking._id,
                        customerName,
                        customerEmail,
                        guideName,
                        amount: totalAmountText,
                        paymentDate: new Date().toLocaleString("vi-VN"),
                        adminUrl: `${process.env.APP_BASE_URL}/admin/bookings/${booking._id}`,
                    },
                }).catch(() => { });

                // Notify guide (optional)
                if (booking.intended_guide_id) {
                    await notifyUser({
                        userId: booking.intended_guide_id,
                        type: "booking:paid_guide",
                        content: `Đơn của khách đã thanh toán: "${tourName}".`,
                        url: `/guide/bookings/${booking._id}`,
                        meta: {
                            bookingId: booking._id,
                            bookingCode: booking._id,
                            tourId: booking.tour_id,
                            tourName,
                            tourDate,
                            numberOfPeople,
                            totalAmount: totalAmountText,
                            customerName,
                            customerEmail,
                            customerPhone: customerPhone || booking?.contact?.phone || booking?.contact?.phone_number || "",
                            bookingUrl,
                            guideName,
                        },
                    }).catch(() => { });
                }
            } else {
                // Failed payment path already updated booking.payment_session.status above
                await notifyUser({
                    userId: booking.customer_id,
                    type: "booking:payment_failed",
                    content: `Thanh toán thất bại cho booking "${tourName}".`,
                    url: `/booking/${booking._id}/pay`,
                    meta: { bookingId: booking._id, tourId: booking.tour_id, tourName },
                }).catch(() => { });
            }

            return res.status(200).json({ resultCode: 0, message: "OK" });
        } catch (txErr) {
            // rollback
            await mongooseSession.abortTransaction().catch(() => { });
            mongooseSession.endSession();
            console.error("ipnHandler: tx/booking update failed:", txErr);
            await notifyAdmins({
                type: "payment:error",
                content: `IPN processing failed for booking ${bookingId}: ${txErr.message}`,
                meta: { bookingId, txnCode: txnCode ?? null }
            }).catch(() => { });
            return res.status(200).json({ resultCode: 99, message: "Server error" });
        }
        // --- End atomic flow ---
    } catch (e) {
        console.error(e);
        return res.status(200).json({ resultCode: 99, message: "Server error" });
    }
};

// Return URL (redirect về FE hiển thị kết quả)
export const returnHandler = async (req, res) => {
    try {
        // MoMo trả về nhiều query params (signature, raw payload).
        // Để không hiển thị các tham số này trên URL front-end, redirect thuần về route kết quả FE.
        // FE nên gọi API (ví dụ: GET /api/payments/status?bookingId=...) hoặc lấy trạng thái từ booking API.
        const clientBase = process.env.CLIENT_URL || (process.env.APP_BASE_URL || "");
        const target = `${clientBase.replace(/\/$/, "")}/payment/result`;
        console.log("[MoMo RETURN] raw query:", req.query);
        return res.redirect(target);
    } catch (e) {
        return res.status(500).send("Error");
    }
};