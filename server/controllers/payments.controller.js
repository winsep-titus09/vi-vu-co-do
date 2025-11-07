// server/controllers/payments.controller.js
import Booking from "../models/Booking.js";
import Transaction from "../models/Transaction.js";
import Tour from "../models/Tour.js";
import { createMoMoPayment, verifyMoMoIPN } from "../services/payments/momo.js";
import { notifyAdmins, notifyUser } from "../services/notify.js";

// Helper: build requestType từ method client gửi
function resolveRequestType(method) {
    const envDefault = process.env.MOMO_REQUEST_TYPE || "captureWallet";
    const m = (method || "").toLowerCase(); // "wallet" | "atm" | "credit"
    if (m === "wallet") return "captureWallet";
    if (m === "atm") return "payWithATM";
    if (m === "credit") return "payWithCredit";
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
        const amount = Number(booking.total_price);
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
        console.error(e);
        return res.status(500).json({ message: "Lỗi tạo checkout MoMo", error: e.message });
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

        await Transaction.create({
            bookingId: booking._id,
            userId: booking.customer_id,
            amount: booking.total_price,
            commission_fee: 0,
            net_amount: booking.total_price,
            transaction_type: "charge",
            status: success ? "confirmed" : "failed",
            payment_gateway: "momo",
            transaction_code: txnCode,
            note: `MoMo resultCode ${resultCode}`,
        });

        if (success) {
            booking.status = "paid";
            if (booking.payment_session) booking.payment_session.status = "paid";
            await booking.save();

            // Lấy tên tour để đưa vào content
            let tourName = `#${booking._id}`;
            try {
                const tourDoc = await Tour.findById(booking.tour_id).lean();
                if (tourDoc?.name) tourName = tourDoc.name;
            } catch {
                // bỏ qua nếu không lấy được tên tour
            }

            // Notify user
            await notifyUser({
                userId: booking.customer_id,
                type: "booking:paid",
                content: `Thanh toán đơn đặt tour "${tourName}" thành công.`,
                url: `/booking/${booking._id}`,
                meta: { bookingId: booking._id, tourId: booking.tour_id, tourName },
            }).catch(() => { });

            // Notify admin (KHI ĐÃ THANH TOÁN THÀNH CÔNG)
            await notifyAdmins({
                type: "booking:paid",
                content: `Đơn #${booking._id} đã được thanh toán.`,
                url: `/admin/bookings/${booking._id}`,
                meta: { bookingId: booking._id, tourId: booking.tour_id, tourName },
            }).catch(() => { });

            // (tuỳ chọn) Notify guide
            if (booking.intended_guide_id) {
                await notifyUser({
                    userId: booking.intended_guide_id,
                    type: "booking:paid",
                    content: `Đơn của khách đã thanh toán: "${tourName}".`,
                    url: `/guide/bookings/${booking._id}`,
                    meta: { bookingId: booking._id, tourId: booking.tour_id, tourName },
                }).catch(() => { });
            }
        } else {
            if (booking.payment_session) booking.payment_session.status = "failed";
            await booking.save();
        }

        return res.status(200).json({ resultCode: 0, message: "OK" });
    } catch (e) {
        console.error(e);
        return res.status(200).json({ resultCode: 99, message: "Server error" });
    }
};

// Return URL (redirect về FE hiển thị kết quả)
export const returnHandler = async (req, res) => {
    try {
        const qs = new URLSearchParams(req.query).toString();
        return res.redirect(`/payment/result?${qs}`);
    } catch (e) {
        return res.status(500).send("Error");
    }
};
