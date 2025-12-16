import { createTransporter } from "../config/email.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const transporter = createTransporter();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * - conditional block: {{#if key}} ... {{/if}} (hỗ trợ dotted keys)
 * - placeholder: {{ key }} hoặc {{ a.b.c }}
 * - nếu key không tồn tại -> thay bằng empty string
 * - thêm defaults: appName, appBaseUrl, supportEmail, logoUrl, year
 *
 * Template files expected at: server/templates/email/<templateKey>.html
 */
function renderTemplate(templateKey, data = {}) {
    const filePath = path.join(__dirname, "..", "templates", "email", `${templateKey}.html`);
    let html;
    try {
        html = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
        console.error("[EMAIL] Không đọc được template:", templateKey, "path:", filePath, "error:", err.message);
        html = `<p><strong>Template '${templateKey}' lỗi hoặc không tồn tại.</strong></p>
            <pre>${Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n")}</pre>`;
    }

    const defaults = {
        appName: process.env.APP_NAME || "Vi Vu Co Do",
        appBaseUrl: process.env.APP_BASE_URL || "",
        supportEmail: process.env.APP_SUPPORT_EMAIL || process.env.EMAIL_FROM || "",
        logoUrl: process.env.APP_LOGO_URL || "",
        year: new Date().getFullYear(),
    };
    const newData = { ...defaults, ...data };

    // 1) Conditional blocks: {{#if key}} ... {{/if}} (supports dotted keys)
    const condRe = /{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g;
    html = html.replace(condRe, (match, key, inner) => {
        const val = getValueByPath(newData, key);
        if (val !== undefined && val !== null && String(val).trim() !== "") {
            return inner;
        }
        return "";
    });

    // 2) Replace placeholders: {{ key }} or {{ a.b.c }}
    html = html.replace(/{{\s*([\w.]+)\s*}}/g, (match, key) => {
        const v = getValueByPath(newData, key);
        return v === undefined || v === null ? "" : String(v);
    });

    // 3) Remove leftover placeholders defensively
    html = html.replace(/{{\s*[\w.]+\s*}}/g, "");

    // Debug render in non-production
    if (process.env.NODE_ENV !== "production") {
        console.log(`[EMAIL] Rendered template: ${templateKey} (preview)`);
        console.log(html.slice(0, 1200));
    }

    return html;
}

export async function sendEmailRaw({ to, subject, html }) {
    if (!to) throw new Error("Missing recipient email");
    const from = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.APP_SUPPORT_EMAIL;
    if (!from) {
        throw new Error("Missing EMAIL_FROM/SMTP_USER for sender address");
    }

    try {
        const result = await transporter.sendMail({
            from,
            to,
            subject,
            html,
        });
        console.log("[EMAIL] Sent", { to, subject, messageId: result?.messageId });
        return result;
    } catch (err) {
        console.error("[EMAIL] sendMail error", err?.message || err);
        throw err;
    }
}

export async function sendTemplateEmail({ to, subject, templateKey, data }) {
    const html = renderTemplate(templateKey, data);
    console.log("[EMAIL] sendTemplateEmail", { to, subject, templateKey });
    return sendEmailRaw({ to, subject, html });
}

/**
 * Gửi email mật khẩu mới
 * @param {string} to - Email người nhận
 * @param {string} userName - Tên người dùng
 * @param {string} newPassword - Mật khẩu mới
 */
export const sendNewPasswordEmail = async (to, userName, newPassword) => {
    try {
        // Đọc template
        const templatePath = path.join(__dirname, '../templates/email/forgot-password.html');
        let emailTemplate = fs.readFileSync(templatePath, 'utf8');

        // Thay thế placeholders
        emailTemplate = emailTemplate.replace('{{userName}}', userName);
        emailTemplate = emailTemplate.replace('{{newPassword}}', newPassword);

        const mailOptions = {
            from: `"Vi Vu Cố Đô" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: '🔐 Mật khẩu mới - Vi Vu Cố Đô',
            html: emailTemplate
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', result.messageId);
        return { success: true, messageId: result.messageId };

    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};