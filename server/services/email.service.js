import { createTransporter } from "../config/email.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const transporter = createTransporter();

// Lấy đúng đường dẫn thư mục hiện tại của file (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function renderTemplate(templateKey, data = {}) {
    // Luôn đúng: ../templates/email/<templateKey>.html tính từ file này
    const templatesDir = path.join(__dirname, "..", "templates", "email");
    const filePath = path.join(templatesDir, `${templateKey}.html`);

    let html = fs.readFileSync(filePath, "utf-8");
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