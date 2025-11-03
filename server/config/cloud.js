// config/cloud.js
import { v2 as cloudinary } from "cloudinary";

export const initCloudinary = () => {
    // Kiểm tra có đủ 3 biến môi trường chưa
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        console.error("❌ Cloudinary config:", { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET });
        throw new Error("Missing CLOUDINARY_* in .env");
    }

    // Cấu hình Cloudinary
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
    });

    console.log("✅ Cloudinary initialized:", CLOUDINARY_CLOUD_NAME);
    return cloudinary;
};
