import User from "../models/User.js";
import bcrypt from "bcrypt";
import { updateProfileSchema } from "../utils/validator.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../services/uploader.js";
import BlacklistedToken from "../models/BlacklistedToken.js";
import { v2 as cloudinary } from "cloudinary";

// controllers/users.controller.js
export const getProfile = async (req, res) => {
    try {
        const user = req.user; // từ middleware auth
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            avatar_url: user.avatar_url,
            role: user.role_id?.name,
            status: user.status,
            createdAt: user.createdAt,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            const msg = parsed.error.issues.map(i => i.message).join("; ");
            return res.status(400).json({ message: msg });
        }

        const { name, phone_number, avatar_url } = parsed.data;
        const updated = await User.findByIdAndUpdate(
            userId,
            { $set: { ...(name && { name }), ...(phone_number && { phone_number }), ...(avatar_url && { avatar_url }) } },
            { new: true }
        ).populate("role_id");

        if (!updated) return res.status(404).json({ message: "Không tìm thấy người dùng." });

        res.json({
            message: "Cập nhật hồ sơ thành công",
            user: {
                id: updated._id,
                name: updated.name,
                email: updated.email,
                phone_number: updated.phone_number,
                avatar_url: updated.avatar_url,
                role: updated.role_id?.name,
                status: updated.status,
                updatedAt: updated.updatedAt
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

/** PUT /api/users/me/avatar (Form-Data) - field: avatar */
export const updateProfileWithAvatar = async (req, res) => {
    try {
        const user = req.user; // đã populate role
        if (!req.file) return res.status(400).json({ message: "Thiếu file ảnh 'avatar'." });

        // (tùy chọn) xóa ảnh cũ nếu bạn lưu public_id trong user
        // Ví dụ: bạn có thể lưu public_id trong user.avatar_public_id
        // await deleteFromCloudinary(user.avatar_public_id);

        // upload ảnh mới
        const result = await uploadBufferToCloudinary(req.file.buffer, "avatars", {
            // transformation ví dụ: resize về 400x400, crop center
            transformation: [{ width: 400, height: 400, crop: "fill", gravity: "faces" }]
        });

        const updated = await User.findByIdAndUpdate(
            user._id,
            { $set: { avatar_url: result.secure_url /*, avatar_public_id: result.public_id */ } },
            { new: true }
        ).populate("role_id");

        res.json({
            message: "Cập nhật avatar thành công",
            user: {
                id: updated._id,
                name: updated.name,
                email: updated.email,
                phone_number: updated.phone_number,
                avatar_url: updated.avatar_url,
                role: updated.role_id?.name,
                status: updated.status,
                updatedAt: updated.updatedAt
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Upload avatar thất bại", error: err.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const userId = req.user._id;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ mật khẩu cũ và mới." });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu mới phải dài ít nhất 6 ký tự." });
        }

        // Lấy user hiện tại
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng." });

        // So sánh mật khẩu cũ
        const match = await bcrypt.compare(current_password, user.password);
        if (!match) return res.status(401).json({ message: "Mật khẩu cũ không đúng." });

        // Hash mật khẩu mới
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
        const hashed = await bcrypt.hash(new_password, saltRounds);

        // Cập nhật mật khẩu
        user.password = hashed;
        await user.save();

        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        await BlacklistedToken.create({ token, expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

        return res.json({ message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." });
    } catch (err) {
        console.error("changePassword error:", err.message);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};