// server/controllers/admin/paymentSettings.controller.js (bản sửa lỗi conflict)
import PaymentSetting from "../../models/PaymentSetting.js";
import { invalidateGatewayConfig } from "../../services/payments/config.js";

// Ẩn/mask secret
function maskConfig(config = {}) {
    const clone = { ...config };
    const mask = (v) =>
        typeof v === "string" && v.length > 6 ? `${v.slice(0, 3)}***${v.slice(-3)}` : "****";
    for (const k of ["secretKey", "accessKey", "vnp_HashSecret"]) {
        if (clone[k]) clone[k] = mask(clone[k]);
    }
    if (clone.vnp_TmnCode) clone.vnp_TmnCode = mask(clone.vnp_TmnCode);
    return clone;
}

export async function listPaymentSettings(req, res) {
    try {
        const docs = await PaymentSetting.find().lean();
        return res.json(
            docs.map((d) => ({
                _id: d._id,
                gateway: d.gateway,
                is_active: d.is_active,
                config_masked: maskConfig(d.config || {}),
                createdAt: d.createdAt,
                updatedAt: d.updatedAt,
            }))
        );
    } catch (e) {
        console.error("listPaymentSettings error:", e);
        return res.status(500).json({ message: "Lỗi máy chủ" });
    }
}

/**
 * PATCH /api/admin/payment-settings/:gateway
 * body: { is_active?: boolean, config?: object }
 */
export async function upsertPaymentSettingByGateway(req, res) {
    try {
        const { gateway } = req.params;
        const { is_active, config } = req.body || {};

        if (!["momo", "vnpay"].includes(gateway)) {
            return res.status(400).json({ message: "Gateway không hợp lệ" });
        }
        if (config && typeof config !== "object") {
            return res.status(400).json({ message: "config phải là object" });
        }

        // Build update doc
        const setDoc = {};
        if (typeof is_active === "boolean") setDoc.is_active = is_active;
        if (config) setDoc.config = config;

        // Nếu là upsert mới hoàn toàn thì thêm các giá trị mặc định
        // Lưu ý: KHÔNG đưa is_active vào $setOnInsert nếu đã có trong setDoc
        const setOnInsert = { gateway };
        if (!("is_active" in setDoc)) {
            setOnInsert.is_active = true;
        }
        if (!("config" in setDoc)) {
            setOnInsert.config = {};
        }

        const updateQuery = {
            $set: setDoc,
            $setOnInsert: setOnInsert,
        };

        // Xoá key rỗng để tránh conflict rìa
        if (Object.keys(setDoc).length === 0) delete updateQuery.$set;

        const doc = await PaymentSetting.findOneAndUpdate(
            { gateway },
            updateQuery,
            { new: true, upsert: true, runValidators: false }
        ).lean();

        invalidateGatewayConfig(gateway);

        return res.json({
            _id: doc._id,
            gateway: doc.gateway,
            is_active: doc.is_active,
            config_masked: maskConfig(doc.config || {}),
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    } catch (e) {
        console.error("upsertPaymentSettingByGateway error:", e);
        // Trả message rõ hơn
        return res.status(500).json({ message: "Lỗi máy chủ", error: e.message });
    }
}