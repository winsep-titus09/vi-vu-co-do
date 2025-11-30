// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";
import BlacklistedToken from "../models/BlacklistedToken.js";

/**
 * Middleware xác thực người dùng bằng JWT
 */
export const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer "))
            return res.status(401).json({ message: "Thiếu token xác thực." });

        const token = authHeader.split(" ")[1];

        // Kiểm tra token có bị thu hồi (blacklist) không
        const blacklisted = await BlacklistedToken.findOne({ token });
        if (blacklisted)
            return res.status(401).json({ message: "Token đã bị thu hồi, vui lòng đăng nhập lại." });

        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Tìm user và populate role
        const user = await User.findById(decoded.id).populate("role_id");
        if (!user)
            return res.status(404).json({ message: "Không tìm thấy người dùng." });

        req.user = user; // gắn thông tin user vào request
        next();
    } catch (err) {
        console.error("JWT error:", err.message);
        res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }
};

/**
 * Middleware phân quyền (role-based)
 * @param  {...string} allowedRoles - danh sách role được phép truy cập
 * Ví dụ: authorize("admin", "guide")
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const roleName = req.user?.role_id?.name;
            if (!roleName || !allowedRoles.includes(roleName)) {
                return res.status(403).json({
                    message: "Bạn không có quyền thực hiện hành động này.",
                });
            }
            next();
        } catch (err) {
            console.error("Authorize error:", err.message);
            res.status(500).json({ message: "Lỗi máy chủ khi kiểm tra quyền." });
        }
    };
};
