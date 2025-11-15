import { createTransporter } from "../config/email.js";
import fs from "fs";
import path from "path";

const transporter = createTransporter();

function renderTemplate(templateKey, data = {}) {
    const filePath = path.join(process.cwd(), "server", "templates", "email", `${templateKey}.html`);
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