import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
console.log("[ENV RAW] SMTP_HOST=", JSON.stringify(process.env.SMTP_HOST));

export function createTransporter() {
    // LOG DEBUG
    console.log("[DEBUG SMTP ENV]", {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_SECURE: process.env.SMTP_SECURE,
        SMTP_USER: process.env.SMTP_USER,
        HAS_PASS: !!process.env.SMTP_PASS
    });

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error("[ERROR] Thiếu biến môi trường SMTP_* (HOST/USER/PASS).");
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        logger: true,
        debug: true,
    });

    return transporter;
}