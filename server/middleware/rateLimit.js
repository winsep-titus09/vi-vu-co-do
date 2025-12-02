// server/middleware/rateLimit.js
import "dotenv/config";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import MongoStore from "rate-limit-mongo";

/** Dùng MongoStore nếu có MONGO_URI, nếu không sẽ fallback MemoryStore */
const store = process.env.MONGO_URI
  ? new MongoStore({
      uri: process.env.MONGO_URI,
      collectionName: "rateLimits",
      expireTimeMs: 15 * 60 * 1000,
    })
  : undefined;

/** 1) Global: thoáng cho toàn bộ /api */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Tăng từ 400 lên 1000
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
  skip: (req) => req.method === "OPTIONS" || req.path === "/api/payments/ipn",
  store,
  keyGenerator: ipKeyGenerator(), // helper chuẩn cho IPv6
});

/** 2) Auth: riêng cho đăng nhập/đăng ký/refresh
 *  - Nới giới hạn đăng nhập: 100 lần / phút / IP (development)
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, // Development: 100 lần/phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many login attempts. Try again later.",
  },
  store,
  keyGenerator: ipKeyGenerator(),
});

/** 3) (Tuỳ chọn) Account-limiter cho người đã đăng nhập
 *  - Ví dụ hạn chế đổi password, đổi email…
 */
export const accountLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // Tăng từ 30 lên 60
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, message: "Too many requests. Please slow down." },
  store,
  keyGenerator: ipKeyGenerator(),
});
