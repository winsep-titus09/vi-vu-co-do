// server/controllers/admin/users.controller.js
import mongoose from "mongoose";
import User from "../../models/User.js";
import Role from "../../models/Role.js";
import GuideProfile from "../../models/GuideProfile.js";

/**
 * GET /api/admin/users
 * List all users with pagination and filters
 */
export const listUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role, // tourist, guide, admin
      status, // active, inactive, banned
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};

    // Filter by status
    if (status && status !== "all") {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get role IDs for filtering
    let roleFilter = null;
    if (role && role !== "all") {
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        roleFilter = roleDoc._id;
      }
    }

    if (roleFilter) {
      filter.role_id = roleFilter;
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    // Fetch users
    const users = await User.find(filter)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate("role_id", "name")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await User.countDocuments(filter);

    // Format response
    const formattedUsers = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar_url,
      phone: user.phone_number,
      role: user.role_id?.name || "tourist",
      status: user.status,
      balance: user.balance || 0,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.json({
      users: formattedUsers,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error("listUsers error:", err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

/**
 * GET /api/admin/users/stats
 * Get user statistics
 */
export const getUserStats = async (req, res) => {
  try {
    // Get role IDs
    const roles = await Role.find({}).lean();
    const roleMap = {};
    roles.forEach((r) => {
      roleMap[r.name] = r._id;
    });

    const [totalUsers, activeUsers, bannedUsers, tourists, guides] =
      await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ status: "active" }),
        User.countDocuments({ status: "banned" }),
        User.countDocuments({ role_id: roleMap.tourist }),
        User.countDocuments({ role_id: roleMap.guide }),
      ]);

    res.json({
      total: totalUsers,
      active: activeUsers,
      banned: bannedUsers,
      tourists,
      guides,
    });
  } catch (err) {
    console.error("getUserStats error:", err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

/**
 * GET /api/admin/users/:id
 * Get user by ID with details
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const user = await User.findById(id)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate("role_id", "name")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Get guide profile if user is guide
    let guideProfile = null;
    if (user.role_id?.name === "guide") {
      guideProfile = await GuideProfile.findOne({ user_id: id }).lean();
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar_url,
        phone: user.phone_number,
        role: user.role_id?.name || "tourist",
        status: user.status,
        balance: user.balance || 0,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      guideProfile,
    });
  } catch (err) {
    console.error("getUserById error:", err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

/**
 * PUT /api/admin/users/:id/status
 * Update user status (active/banned)
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    if (!["active", "inactive", "banned"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    // Prevent admin from banning themselves
    if (req.user._id.toString() === id) {
      return res
        .status(400)
        .json({ message: "Không thể thay đổi trạng thái của chính mình" });
    }

    const user = await User.findById(id).populate("role_id", "name");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Prevent banning other admins
    if (user.role_id?.name === "admin" && status === "banned") {
      return res
        .status(400)
        .json({ message: "Không thể khóa tài khoản admin" });
    }

    user.status = status;
    await user.save();

    res.json({
      message:
        status === "banned"
          ? "Đã khóa tài khoản người dùng"
          : "Đã mở khóa tài khoản người dùng",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("updateUserStatus error:", err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete user permanently
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res
        .status(400)
        .json({ message: "Không thể xóa tài khoản của chính mình" });
    }

    const user = await User.findById(id).populate("role_id", "name");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Prevent deleting other admins
    if (user.role_id?.name === "admin") {
      return res.status(400).json({ message: "Không thể xóa tài khoản admin" });
    }

    // Use findOneAndDelete to trigger middleware
    await User.findOneAndDelete({ _id: id });

    res.json({ message: "Đã xóa người dùng thành công" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};
