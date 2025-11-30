import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Role from "../models/Role.js";
import BlacklistedToken from "../models/BlacklistedToken.js";
import { sendEmailRaw } from "../services/email.service.js";

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
 * POST /api/auth/forgot-password
 * Body: { email }
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Vui lòng nhập email." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({
        message: "Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save reset token to user (expires in 1 hour)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

    // Send email
    try {
      const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

      const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Đặt lại mật khẩu</h2>
                    <p>Xin chào ${user.name},</p>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản Vi Vu Cố Đô.</p>
                    <p>Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #7C3AED; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">Đặt lại mật khẩu</a>
                    <p>Hoặc sao chép link sau vào trình duyệt:</p>
                    <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                    <p><strong>Link này sẽ hết hạn sau 1 giờ.</strong></p>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                    <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #999; font-size: 12px;">Vi Vu Cố Đô - Khám phá Huế</p>
                </div>
            `;

      await sendEmailRaw({
        to: user.email,
        subject: "Đặt lại mật khẩu - Vi Vu Cố Đô",
        html,
      });

      res.json({
        message: "Link đặt lại mật khẩu đã được gửi đến email của bạn.",
      });
    } catch (emailError) {
      // Remove reset token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      console.error("Email send error:", emailError);
      return res.status(500).json({
        message: "Không thể gửi email. Vui lòng thử lại sau.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
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
