import nodemailer from "nodemailer";

export function createTransporter() {
    // Log toàn bộ biến SMTP_* tại thời điểm tạo transporter
    const snapshot = {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_SECURE: process.env.SMTP_SECURE,
        SMTP_USER: process.env.SMTP_USER,
        HAS_PASS: !!process.env.SMTP_PASS
    };
    console.log("[SMTP DEBUG] ENV SNAPSHOT =", snapshot);

    let host = (process.env.SMTP_HOST || "").trim();
    if (!host) {
        console.error("[SMTP ERROR] SMTP_HOST rỗng → fallback smtp.gmail.com");
        host = "smtp.gmail.com";
    }
    if (host === "localhost" || host === "127.0.0.1") {
        console.error("[SMTP ERROR] SMTP_HOST hiện là", host, "→ sai. Phải là smtp.gmail.com");
    }

    const port = Number(process.env.SMTP_PORT || 465);
    const secure = process.env.SMTP_SECURE === "true";

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("[SMTP ERROR] Thiếu SMTP_USER hoặc SMTP_PASS.");
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        logger: true,
        debug: true,
    });

    return transporter;
}