import { createTransporter } from "../config/email.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const transporter = createTransporter();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getValueByPath(obj, path) {
    if (!path) return undefined;
    const parts = String(path).split(".");
    let cur = obj;
    for (const p of parts) {
        if (cur == null) return undefined;
        cur = cur[p];
    }
    return cur;
}

/**
 * renderTemplate hỗ trợ:
 * - conditional block: {{#if key}} ... {{/if}} (không support nested)
 * - placeholder replacement: {{ key }}
 * - nếu key không tồn tại -> thay bằng empty string
 * - thêm defaults cho appName, year, supportEmail, appBaseUrl, logoUrl từ env nếu caller không truyền
 */
function renderTemplate(templateKey, data = {}) {
    const filePath = path.join(__dirname, "..", "templates", "email", `${templateKey}.html`);
    let html;
    try {
        html = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
        console.error("[EMAIL] Không đọc được template:", templateKey, "path:", filePath, "error:", err.message);
        // Fallback gửi nội dung thuần để vẫn thử gửi mail (giúp debug)
        html = `<p><strong>Template '${templateKey}' lỗi hoặc không tồn tại.</strong></p>
            <pre>${Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n")}</pre>`;
    }

    // Thiết lập defaults chung từ ENV nếu caller không truyền
    const defaults = {
        appName: process.env.APP_NAME || "Vi Vu Co Do",
        appBaseUrl: process.env.APP_BASE_URL || "",
        supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || "",
        logoUrl: process.env.APP_LOGO_URL || "",
        year: new Date().getFullYear(),
    };
    // Không mutate tham số caller: merge vào newData
    const newData = { ...defaults, ...data };

    // 1) Xử lý conditional blocks: {{#if key}} ... {{/if}}
    // Lưu ý: không hỗ trợ nested blocks phức tạp. Nếu cần nested, có thể mở rộng sau.
    const condRe = /{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g;
    html = html.replace(condRe, (match, key, inner) => {
        const val = getValueByPath(newData, key);
        // Nếu truthy (non-empty string / number / boolean true / object) -> render inner (có thể chứa placeholder)
        if (val !== undefined && val !== null && String(val).trim() !== "") {
            return inner;
        }
        return ""; // remove block nếu falsy
    });

    // 2) Thay thế tất cả placeholder có trong data
    for (const [k, v] of Object.entries(newData)) {
        const re = new RegExp(`{{\\s*${escapeRegExp(k)}\\s*}}`, "g");
        html = html.replace(re, String(v ?? ""));
    }

    // 3) Loại bỏ các placeholder còn thừa (không có key tương ứng) để tránh hiển thị {{ key }}
    html = html.replace(/{{\s*[\w.]+\s*}}/g, "");

    return html;
}

export async function sendEmailRaw({ to, subject, html }) {
    if (!to) throw new Error("Missing recipient email");
    return transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html,
    });
}

export async function sendTemplateEmail({ to, subject, templateKey, data }) {
    const html = renderTemplate(templateKey, data);
    console.log("[EMAIL] sendTemplateEmail", { to, subject, templateKey });
    return sendEmailRaw({ to, subject, html });
}