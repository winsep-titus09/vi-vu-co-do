import { createTransporter } from "../config/email.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const transporter = createTransporter();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    for (const [k, v] of Object.entries(data)) {
        const re = new RegExp(`{{\\s*${k}\\s*}}`, "g");
        html = html.replace(re, String(v ?? ""));
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