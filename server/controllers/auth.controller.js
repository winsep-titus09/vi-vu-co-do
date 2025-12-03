import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Role from "../models/Role.js";
import BlacklistedToken from "../models/BlacklistedToken.js";
import { sendEmailRaw } from "../services/email.service.js";
import { generateRandomPassword } from "../utils/password.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createTransporter } from "../config/email.js";

// Thay thế __dirname cho ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const register = async (req, res) => {
  try {
    let {
      name,
      fullName,
      email,
      password,
      phone_number,
      role = "tourist",
    } = req.body;

    // Support both name and fullName from client
    const userName = name || fullName;

    if (!userName || !email || !password)
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });

    // chuẩn hóa role (tránh lỗi chữ hoa, khoảng trắng)
    role = String(role).trim().toLowerCase();

    // CHỈ CHO PHÉP ĐĂNG KÝ VỚI ROLE TOURIST
    // Để trở thành guide hoặc admin, user phải đăng ký tourist trước rồi apply
    if (role !== "tourist") {
      role = "tourist"; // Force to tourist, guide phải apply riêng
    }

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
      name: userName,
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
        name: userName,
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
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu." });

    const user = await User.findOne({ email }).populate("role_id");
    if (!user)
      return res.status(401).json({ message: "Sai email hoặc mật khẩu." });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: "Sai email hoặc mật khẩu." });

    // Get role name (handle both populated and non-populated role_id)
    const roleName = user.role_id?.name || user.role_id || "tourist";

    const token = jwt.sign(
      { id: user._id, email: user.email, role: roleName },
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
        role: roleName,
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
    if (!decoded)
      return res.status(400).json({ message: "Token không hợp lệ." });

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

/**
 * GET /api/auth/me
 * Get current user info
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("role_id")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role_id.name,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

/**
 * Quên mật khẩu - Tạo mật khẩu mới và gửi qua email
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Kiểm tra email có được cung cấp không
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập địa chỉ email",
      });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Địa chỉ email không hợp lệ",
      });
    }

    // Tìm user với email đã cung cấp
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Nếu không tìm thấy user với email này
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản với địa chỉ email này",
      });
    }

    // Tạo mật khẩu ngẫu nhiên mới
    const newPassword = generateRandomPassword(12);

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu mới cho user
    user.password = hashedPassword;
    await user.save();

    // Đọc template email
    const templatePath = path.join(
      __dirname,
      "../templates/email/forgot-password.html"
    );
    let emailTemplate = fs.readFileSync(templatePath, "utf8");

    // Thay thế các placeholder trong template
    emailTemplate = emailTemplate.replace(
      "{{userName}}",
      user.name || user.email
    );
    emailTemplate = emailTemplate.replace("{{newPassword}}", newPassword);

    // Tạo transporter và gửi email
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Vi Vu Cố Đô" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "🔐 Mật khẩu mới - Vi Vu Cố Đô",
      html: emailTemplate,
    });

    // Trả về response thành công
    res.status(200).json({
      success: true,
      message:
        "Mật khẩu mới đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.",
    });
  }
};

/**
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Vui lòng cung cấp token và mật khẩu mới.",
      });
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token không hợp lệ hoặc đã hết hạn.",
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
    const hashed = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      message: "Mật khẩu đã được đặt lại thành công.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};
