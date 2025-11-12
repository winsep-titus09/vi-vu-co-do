// server/services/payments/config.js
import PaymentSetting from "../../models/PaymentSetting.js";

const CACHE_TTL_MS = 60 * 1000; // 60s
const cache = new Map(); // key: gateway -> { data, ts }

/**
 * Fallback đọc từ ENV để không gián đoạn khi DB chưa có cấu hình
 */
function envToConfig(gateway) {
    if (gateway === "momo") {
        const endpoint = process.env.MOMO_ENDPOINT;
        const partnerCode = process.env.MOMO_PARTNER_CODE;
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretKey = process.env.MOMO_SECRET_KEY;
        const requestType = process.env.MOMO_REQUEST_TYPE || "captureWallet";
        if (endpoint && partnerCode && accessKey && secretKey) {
            return { endpoint, partnerCode, accessKey, secretKey, requestType };
        }
    }
    // VNPay có thể bổ sung sau
    return null;
}

/**
 * Đọc config cổng thanh toán từ DB (ưu tiên is_active: true), có cache, fallback ENV
 */
export async function getGatewayConfig(gateway) {
    const now = Date.now();
    const cached = cache.get(gateway);
    if (cached && now - cached.ts < CACHE_TTL_MS) return cached.data;

    const doc = await PaymentSetting.findOne({ gateway, is_active: true }).lean();
    let data = null;

    if (doc?.config) {
        data = { ...doc.config };
    } else {
        data = envToConfig(gateway);
    }

    if (!data) {
        throw new Error(
            `Payment config for gateway="${gateway}" not found (DB inactive and ENV missing)`
        );
    }

    cache.set(gateway, { data, ts: now });
    return data;
}

/**
 * Xóa cache cho 1 gateway khi admin cập nhật cấu hình
 */
export function invalidateGatewayConfig(gateway) {
    cache.delete(gateway);
}