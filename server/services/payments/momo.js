// server/services/payments/momo.js
import crypto from "crypto";
import fetch from "node-fetch";

export async function createMoMoPayment({ amount, orderId, orderInfo, returnUrl, notifyUrl, requestType, extraData }) {
    const endpoint = process.env.MOMO_ENDPOINT;
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const requestTypeEnv = process.env.MOMO_REQUEST_TYPE || "captureWallet";
    requestType = requestType || requestTypeEnv;

    const requestId = `${partnerCode}-${Date.now()}`;
    extraData = extraData ?? "";

    const body = {
        partnerCode,
        requestId,
        amount: String(amount),
        orderId,
        orderInfo,
        redirectUrl: returnUrl,
        ipnUrl: notifyUrl,
        requestType,
        extraData,
        lang: "vi",
    };

    const rawSig =
        `accessKey=${accessKey}&amount=${body.amount}&extraData=${body.extraData}` +
        `&ipnUrl=${body.ipnUrl}&orderId=${body.orderId}&orderInfo=${body.orderInfo}` +
        `&partnerCode=${partnerCode}&redirectUrl=${body.redirectUrl}` +
        `&requestId=${requestId}&requestType=${requestType}`;

    body.signature = crypto.createHmac("sha256", secretKey).update(rawSig).digest("hex");

    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!data.payUrl) {
        throw new Error(`MoMo create failed: ${JSON.stringify(data)}`);
    }
    return {
        payUrl: data.payUrl,
        transaction_code: orderId,
        raw: data,
    };
}

export function verifyMoMoIPN(body) {
    const { signature, ...rest } = body;
    const secretKey = process.env.MOMO_SECRET_KEY;

    const raw = Object.keys(rest)
        .sort()
        .map(k => `${k}=${rest[k]}`)
        .join("&");

    const expect = crypto.createHmac("sha256", secretKey).update(raw).digest("hex");
    return expect === signature;
}
