import "dotenv/config.js";
import { createTransporter } from "../config/email.js";

(async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log("✅ Gmail SMTP ready");
    } catch (e) {
        console.error("❌ Gmail SMTP error:", e.message);
        process.exit(1);
    }
})();