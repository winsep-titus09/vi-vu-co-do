// services/uploader.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// === Upload ảnh (đang có sẵn) ===
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_SIZE },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Chỉ hỗ trợ ảnh: jpg, png, webp, gif"));
        }
        cb(null, true);
    },
});

/**
 * Upload buffer lên Cloudinary bằng stream
 * @param {Buffer} buffer 
 * @param {string} folder 
 * @param {object} options 
 */
export const uploadBufferToCloudinary = (buffer, folder, options = {}) =>
    new Promise((resolve, reject) => {
        const cloudFolder = [process.env.CLOUDINARY_FOLDER, folder]
            .filter(Boolean)
            .join("/");

        const uploadOptions = {
            folder: cloudFolder,
            resource_type: "image",
            overwrite: true,
            ...options,
        };

        const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });

        streamifier.createReadStream(buffer).pipe(stream);
    });

/** Upload video */
export const uploadVideoBufferToCloudinary = (buffer, folder, options = {}) =>
    new Promise((resolve, reject) => {
        const cloudFolder = [process.env.CLOUDINARY_FOLDER, folder]
            .filter(Boolean)
            .join("/");

        const uploadOptions = {
            folder: cloudFolder,
            resource_type: "video", // 👈 khác biệt chính
            overwrite: true,
            ...options,
        };

        const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });

        streamifier.createReadStream(buffer).pipe(stream);
    });

/** Xóa file trên Cloudinary */
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (e) {
        console.warn("Cloudinary destroy error:", e.message);
    }
};

// === Upload file 3D (.glb/.gltf) ===
export const uploadRawBufferToCloudinary = (buffer, folder, options = {}) =>
    new Promise((resolve, reject) => {
        const cloudFolder = [process.env.CLOUDINARY_FOLDER, folder]
            .filter(Boolean)
            .join("/");

        const uploadOptions = {
            folder: cloudFolder,
            resource_type: "raw", // để Cloudinary nhận .glb/.gltf
            overwrite: true,
            use_filename: true,
            unique_filename: true,
            allowed_formats: ["glb", "gltf"],
            ...options,
        };

        const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });

        streamifier.createReadStream(buffer).pipe(stream);
    });

/**
 * Upload ảnh từ URL lên Cloudinary (không cần multipart)
 * @param {string} imageUrl
 * @param {string} folder
 * @param {object} options
 */
export const uploadFromUrlToCloudinary = (imageUrl, folder, options = {}) =>
    new Promise((resolve, reject) => {
        const cloudFolder = [process.env.CLOUDINARY_FOLDER, folder]
            .filter(Boolean)
            .join("/");

        cloudinary.uploader.upload(
            imageUrl,
            { folder: cloudFolder, resource_type: "image", overwrite: true, ...options },
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });