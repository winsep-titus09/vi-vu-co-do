// controllers/guideProfile.controller.js
import GuideProfile from "../models/GuideProfile.js";
import { uploadVideoBufferToCloudinary } from "../services/uploader.js";
import multer from "multer";
import mongoose from "mongoose";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export const uploadGuideVideo = upload.single("video");

/** Xem hồ sơ của chính mình */
export const getMyGuideProfile = async (req, res) => {
    try {
        const profile = await GuideProfile.findOne({ user_id: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: "Chưa có hồ sơ hướng dẫn viên." });
        }
        res.json(profile);
    } catch (err) {
        console.error("getMyGuideProfile error:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy hồ sơ của bạn." });
    }
};

/** Cập nhật hồ sơ hướng dẫn viên */
export const updateMyGuideProfile = async (req, res) => {
    try {
        const body = req.body || {};
        const parseMaybeJson = (v) => {
            if (!v) return undefined;
            try {
                return JSON.parse(v);
            } catch {
                return v;
            }
        };

        const updateData = {
            ...(body.introduction && { introduction: body.introduction }),
            ...(body.experience && { experience: body.experience }),
            ...(body.languages && { languages: parseMaybeJson(body.languages) }),
            ...(body.bank_account && { bank_account: parseMaybeJson(body.bank_account) }),
            ...(body.certificates && { certificates: parseMaybeJson(body.certificates) }),
        };

        // Nếu có file video
        if (req.file && req.file.buffer) {
            const uploaded = await uploadVideoBufferToCloudinary(req.file.buffer, "guides/videos");
            updateData.bio_video_url = uploaded.secure_url;
        }

        const profile = await GuideProfile.findOneAndUpdate(
            { user_id: req.user._id },
            { $set: updateData },
            { new: true, upsert: true }
        );

        res.json({ message: "Cập nhật hồ sơ thành công.", data: profile });
    } catch (err) {
        console.error("updateMyGuideProfile error:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật hồ sơ." });
    }
};

/** Xem hồ sơ HDV công khai (ẩn thông tin nhạy cảm) */
export const getPublicGuideProfile = async (req, res) => {
    try {
        const { guideId } = req.params;

        // Kiểm tra ObjectId hợp lệ (nếu dùng Mongo ObjectId cho user_id)
        if (!mongoose.Types.ObjectId.isValid(guideId)) {
            return res.status(400).json({ message: "guideId không hợp lệ." });
        }

        // Loại trừ các trường nhạy cảm: bank_account, __v
        const profile = await GuideProfile.findOne({ user_id: guideId })
            .select("-bank_account -__v")
            .lean();

        if (!profile) {
            return res.status(404).json({ message: "Không tìm thấy hồ sơ hướng dẫn viên." });
        }

        return res.json(profile);
    } catch (err) {
        console.error("getPublicGuideProfile error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ khi lấy hồ sơ hướng dẫn viên." });
    }
};