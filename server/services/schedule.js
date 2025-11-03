import cron from "node-cron";
import BlacklistedToken from "../models/BlacklistedToken.js";

// chạy mỗi ngày lúc 00:00
cron.schedule("0 0 * * *", async () => {
    const now = new Date();
    const result = await BlacklistedToken.deleteMany({ expiredAt: { $lte: now } });
    console.log(`🧹 Dọn dẹp ${result.deletedCount} token hết hạn.`);
});
