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