// controllers/guideProfile.controller.js
import GuideProfile from "../models/GuideProfile.js";
import { uploadVideoBufferToCloudinary } from "../services/uploader.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

export const uploadGuideVideo = upload.single("video");

/** Xem hồ sơ của chính mình */
export const getMyGuideProfile = async (req, res) => {
    const profile = await GuideProfile.findOne({ user_id: req.user._id });
    if (!profile)
        return res.status(404).json({ message: "Chưa có hồ sơ hướng dẫn viên." });
    res.json(profile);
};

/** Cập nhật hồ sơ hướng dẫn viên */
export const updateMyGuideProfile = async (req, res) => {
    try {
        const body = req.body || {};
        const parseMaybeJson = (v) => {
            if (!v) return undefined;
            try { return JSON.parse(v); } catch { return v; }
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
            const uploaded = await uploadVideoBufferToCloudinary(
                req.file.buffer,
                "guides/videos"
            );
            updateData.bio_video_url = uploaded.secure_url;
        }

        const profile = await GuideProfile.findOneAndUpdate(
            { user_id: req.user._id },
            { $set: updateData },
            { new: true, upsert: true }
        );

        res.json({ message: "Cập nhật hồ sơ HDV thành công", profile });
    } catch (err) {
        console.error("updateMyGuideProfile error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};
