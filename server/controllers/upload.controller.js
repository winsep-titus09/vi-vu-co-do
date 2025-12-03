// server/controllers/upload.controller.js
import { uploadBufferToCloudinary } from "../services/uploader.js";

/**
 * POST /api/upload/image
 * Upload single image to Cloudinary
 * Body: multipart/form-data with field "image"
 * Query: ?folder=tours (optional, default: "uploads")
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Không có file ảnh được gửi." });
    }

    const folder = req.query.folder || "uploads";

    const result = await uploadBufferToCloudinary(req.file.buffer, folder, {
      transformation: [
        { width: 1200, height: 800, crop: "limit" }, // Limit max dimensions
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    });

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (err) {
    console.error("Upload image error:", err);
    return res.status(500).json({
      message: "Lỗi upload ảnh.",
      error: err.message,
    });
  }
};

/**
 * POST /api/upload/images
 * Upload multiple images to Cloudinary
 * Body: multipart/form-data with field "images" (array)
 * Query: ?folder=tours (optional, default: "uploads")
 */
export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Không có file ảnh được gửi." });
    }

    const folder = req.query.folder || "uploads";
    const uploadPromises = req.files.map((file) =>
      uploadBufferToCloudinary(file.buffer, folder, {
        transformation: [
          { width: 1200, height: 800, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      })
    );

    const results = await Promise.all(uploadPromises);

    const uploadedImages = results.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    }));

    return res.status(200).json({
      success: true,
      images: uploadedImages,
      count: uploadedImages.length,
    });
  } catch (err) {
    console.error("Upload images error:", err);
    return res.status(500).json({
      message: "Lỗi upload ảnh.",
      error: err.message,
    });
  }
};
