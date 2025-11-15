import { createTransporter } from "../config/email.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const transporter = createTransporter();

// Đảm bảo đường dẫn tuyệt đối đúng dù chạy ở root hay thư mục server
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function renderTemplate(templateKey, data = {}) {
    const filePath = path.join(__dirname, "..", "templates", "email", `${templateKey}.html`);
    let html;
    try {
        html = fs.readFileSync(filePath, "utf-8");
    } catch (err) {
        console.error("[EMAIL] Không đọc được template:", templateKey, "path:", filePath, "error:", err.message);
        throw err;
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
    return sendEmailRaw({ to, subject, html });
}