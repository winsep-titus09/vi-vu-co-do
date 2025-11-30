import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";
import BlacklistedToken from "../models/BlacklistedToken.js";

export const register = async (req, res) => {
    try {
        let { name, email, password, phone_number, role = "tourist" } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin." });

        // chuẩn hóa role (tránh lỗi chữ hoa, khoảng trắng)
        role = String(role).trim().toLowerCase();

        // kiểm tra email trùng
        const existing = await User.findOne({ email });
        if (existing)
            return res.status(400).json({ message: "Email đã được sử dụng." });

        // tìm roleId
        let roleDoc = await Role.findOne({ name: role });

        // hash password
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
        const hashed = await bcrypt.hash(password, saltRounds);

        // tạo user mới
        const newUser = await User.create({
            name,
            email,
            password: hashed,
            phone_number,
            role_id: roleDoc._id,
        });

        // tạo token
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.status(201).json({
            message: "Đăng ký thành công",
            user: {
                id: newUser._id,
                name,
                email,
                phone_number,
                role,
            },
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu." });

        const user = await User.findOne({ email }).populate("role_id");
        if (!user)
            return res.status(401).json({ message: "Sai email hoặc mật khẩu." });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ message: "Sai email hoặc mật khẩu." });

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role_id.name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
        );

        res.json({
            message: "Đăng nhập thành công",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                role: user.role_id.name,
            },
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

export const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) return res.status(400).json({ message: "Không có token." });

        const decoded = jwt.decode(token);
        if (!decoded) return res.status(400).json({ message: "Token không hợp lệ." });

        // Lưu token vào blacklist cho đến khi nó hết hạn
        await BlacklistedToken.create({
            token,
            expiredAt: new Date(decoded.exp * 1000),
        });

        res.json({ message: "Đăng xuất thành công. Token đã bị vô hiệu hoá." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi khi đăng xuất", error: err.message });
    }
};