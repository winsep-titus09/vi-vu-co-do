// server/services/payments/momo.js
import crypto from "crypto";
import fetch from "node-fetch";
import { getGatewayConfig } from "./config.js";

/**
 * Tạo phiên thanh toán MoMo
 */
export async function createMoMoPayment({
    amount,
    orderId,
    orderInfo,
    returnUrl,
    notifyUrl,
    requestType,
    extraData,
    timeoutMs = 15000,
}) {
    // Đọc cấu hình động từ DB (fallback ENV bên trong helper)
    const cfg = await getGatewayConfig("momo");
    const endpoint = cfg.endpoint;
    const partnerCode = cfg.partnerCode;
    const accessKey = cfg.accessKey;
    const secretKey = cfg.secretKey;
    // Mặc định dùng payWithCC (thanh toán bằng thẻ) thay vì captureWallet (QR)
    const requestTypeEnv = cfg.requestType || "payWithCC";
    requestType = requestType || requestTypeEnv;

    const requestId = `${partnerCode}-${Date.now()}`;
    extraData = extraData ?? "";
    const normalizedAmount = String(Number(amount || 0));

    // determine final return / notify URLs: prefer explicit params, then DB config, then ENV
    const finalReturnUrl = returnUrl || cfg.returnUrl || process.env.PAYMENT_RETURN_URL || "";
    const finalNotifyUrl = notifyUrl || cfg.ipnUrl || cfg.ipnURL || process.env.PAYMENT_IPN_URL || "";

    const body = {
        partnerCode,
        requestId,
        amount: normalizedAmount,
        orderId,
        orderInfo,
        redirectUrl: finalReturnUrl,
        ipnUrl: finalNotifyUrl,
        requestType,
        extraData,
        lang: "vi",
    };

    // Ký theo tài liệu create v2 (đúng thứ tự)
    const rawSig =
        `accessKey=${accessKey}` +
        `&amount=${body.amount}` +
        `&extraData=${body.extraData}` +
        `&ipnUrl=${body.ipnUrl}` +
        `&orderId=${body.orderId}` +
        `&orderInfo=${body.orderInfo}` +
        `&partnerCode=${partnerCode}` +
        `&redirectUrl=${body.redirectUrl}` +
        `&requestId=${requestId}` +
        `&requestType=${requestType}`;

    body.signature = crypto.createHmac("sha256", secretKey).update(rawSig).digest("hex");

    // Log chẩn đoán (DEV)
    console.log("[MoMo] endpoint =", endpoint);
    console.log("[MoMo] ipnUrl  =", finalNotifyUrl);
    console.log("[MoMo] return  =", finalReturnUrl);
    console.log("[MoMo] orderId  =", orderId);
    console.log("[MoMo] requestType =", requestType);

    // Gọi MoMo và guard non-JSON
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let res;
    try {
        res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "User-Agent": "ViVuCoDo-Server/1.0 (+node-fetch)",
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
    } catch (err) {
        if (err.name === "AbortError") {
            throw new Error(`MoMo request timeout after ${timeoutMs}ms`);
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }

    const text = await res.text();
    const ct = (res.headers.get("content-type") || "").toLowerCase();

    console.log("[MoMo] HTTP", res.status, res.statusText, "CT:", ct);
    if (res.headers.get("location")) console.log("[MoMo] Redirect Location:", res.headers.get("location"));

    if (!res.ok) throw new Error(`MoMo HTTP ${res.status} ${res.statusText}. Body: ${text.slice(0, 300)}`);
    if (!ct.includes("application/json"))
        throw new Error(`MoMo non-JSON response: content-type=${ct}. Snippet: ${text.slice(0, 300)}`);

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error(`MoMo JSON parse failed: ${e.message}. Raw: ${text.slice(0, 300)}`);
    }

    if (!data.payUrl) throw new Error(`MoMo create failed: ${JSON.stringify(data).slice(0, 500)}`);

    return {
        payUrl: data.payUrl,
        transaction_code: orderId, // bạn đang dùng orderId làm mã phiên
        raw: data,
    };
}

/**
 * Xác thực chữ ký IPN MoMo (v2)
 * KHÔNG sort alphabet; nối theo thứ tự field cố định & chỉ nối field có trong payload.
 */
export function verifyMoMoIPN(body) {
    const secretKey = process.env.MOMO_SECRET_KEY; // vẫn giữ fallback ENV cho IPN
    const accessKey = process.env.MOMO_ACCESS_KEY; // dùng để bổ sung accessKey nếu payload thiếu

    // MoMo v2 order of fields for signature
    const ORDER = [
        "accessKey",
        "amount",
        "extraData",
        "message",
        "orderId",
        "orderInfo",
        "orderType",
        "partnerCode",
        "payType",
        "requestId",
        "responseTime",
        "resultCode",
        "transId",
    ];

    // Dùng payload gốc nhưng BỔ SUNG accessKey nếu thiếu
    const src = { ...body };
    if (!("accessKey" in src) && accessKey) {
        src.accessKey = accessKey;
    }

    // Ghép chuỗi ký theo thứ tự, chỉ bỏ qua field khi null/undefined
    const parts = [];
    for (const k of ORDER) {
        if (src[k] !== undefined && src[k] !== null) {
            parts.push(`${k}=${src[k]}`);
        }
    }
    const raw = parts.join("&");

    const expect = crypto.createHmac("sha256", secretKey).update(raw).digest("hex");

    // DEBUG
    console.log("[MoMo IPN] raw =", raw);
    console.log("[MoMo IPN] expect =", expect);
    console.log("[MoMo IPN] got   =", body.signature);

    return expect === String(body.signature || "").trim();
}