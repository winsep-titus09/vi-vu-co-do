// controllers/guideApplication.controller.js
import GuideApplication from "../models/GuideApplication.js";
import GuideProfile from "../models/GuideProfile.js";
import Role from "../models/Role.js";
import User from "../models/User.js";
import { notifyAdmins } from "../services/notify.js";
import { notifyUser } from "../services/notify.js";

/**
 * User gửi yêu cầu trở thành HDV (dùng JSON link ảnh/tài liệu)
 * POST /api/guides/apply
 * Body: {
 *   about, languages[], experience_years, id_cards[], certificates[], language_certificates[],
 *   intro_video: { url }, bank_info: { bank_name, account_number, account_name }
 * }
 */
export const applyGuide = async (req, res) => {
    try {
        const user = req.user;
        const roleName = user.role_id?.name;
        if (roleName === "guide" || roleName === "admin") {
            return res.status(400).json({ message: "Bạn đã là hướng dẫn viên hoặc admin." });
        }

        const exists = await GuideApplication.findOne({ user_id: user._id });
        if (exists && exists.status === "pending") {
            return res.status(400).json({ message: "Bạn đã gửi hồ sơ và đang chờ duyệt." });
        }

        const {
            about,
            languages = [],
            experience_years = 0,
            id_cards = [],
            certificates = [],
            language_certificates = [],
            intro_video,
            bank_info,
        } = req.body;

        const appDoc = await GuideApplication.findOneAndUpdate(
            { user_id: user._id },
            {
                $set: {
                    about,
                    languages,
                    experience_years,
                    id_cards,
                    certificates,
                    language_certificates,
                    intro_video,
                    bank_info,
                    status: "pending",
                    admin_notes: null,
                    reviewed_by: null,
                    reviewed_at: null,
                },
            },
            { upsert: true, new: true }
        );

        // Thông báo cho admin + meta đầy đủ để template email hiển thị tên & email
        await notifyAdmins({
            type: "guide_application:new",
            content: `${user.name} vừa gửi yêu cầu trở thành HDV.`,
            url: `/admin/guide-applications/${appDoc._id}`,
            meta: {
                applicationId: appDoc._id,
                applicantId: user._id,
                applicantName: user.name,
                applicantEmail: user.email,
                adminUrl: `${process.env.APP_BASE_URL || ""}/admin/guide-applications/${appDoc._id}`
            },
        });

        return res.status(201).json({
            message: "Gửi hồ sơ thành công. Vui lòng chờ admin xét duyệt.",
            application: appDoc,
        });
    } catch (err) {
        console.error("applyGuide error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

/**
 * User xem hồ sơ xin làm HDV của chính mình
 * GET /api/guides/apply/me
 */
export const getMyGuideApplication = async (req, res) => {
    try {
        const doc = await GuideApplication.findOne({ user_id: req.user._id });
        if (!doc) return res.json({ exists: false, status: null });
        res.json({ exists: true, status: doc.status, application: doc });
    } catch (err) {
        console.error("getMyGuideApplication error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

/**
 * Admin: danh sách yêu cầu (lọc theo status)
 * GET /api/admin/guide-applications?status=pending|approved|rejected
 */
export const adminListGuideApplications = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const docs = await GuideApplication.find(filter)
            .sort({ createdAt: -1 })
            .populate({
                path: "user_id",
                select: "name email phone_number role_id",
                populate: { path: "role_id" },
            });

        res.json(docs);
    } catch (err) {
        console.error("adminListGuideApplications error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

/**
 * Admin: chi tiết một yêu cầu
 * GET /api/admin/guide-applications/:id
 */
export const adminGetGuideApplication = async (req, res) => {
    try {
        const doc = await GuideApplication.findById(req.params.id)
            .populate({
                path: "user_id",
                select: "name email phone_number role_id",
                populate: { path: "role_id" },
            });
        if (!doc) return res.status(404).json({ message: "Không tìm thấy hồ sơ." });
        res.json(doc);
    } catch (err) {
        console.error("adminGetGuideApplication error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};

/**
 * Admin: duyệt / từ chối yêu cầu
 * PATCH /api/admin/guide-applications/:id/status
 * Body: { action: "approve" | "reject", admin_notes? }
 */
export const adminReviewGuideApplication = async (req, res) => {
    try {
        const admin = req.user;
        const { action, admin_notes } = req.body;

        const appDoc = await GuideApplication.findById(req.params.id);
        if (!appDoc) return res.status(404).json({ message: "Không tìm thấy hồ sơ." });
        if (appDoc.status !== "pending") {
            return res.status(400).json({ message: "Hồ sơ đã được xử lý trước đó." });
        }

        const userId = appDoc.user_id;

        if (action === "approve") {
            const guideRole = await Role.findOne({ name: "guide" });
            if (!guideRole) return res.status(500).json({ message: "Thiếu role 'guide'." });

            // 1) set role = guide
            await User.findByIdAndUpdate(appDoc.user_id, { role_id: guideRole._id });

            // 2) upsert GuideProfile từ application
            const experienceText =
                appDoc.experience_years > 0
                    ? `Kinh nghiệm ${appDoc.experience_years} năm.`
                    : "Chưa có kinh nghiệm.";

            const certificates = [
                ...(appDoc.certificates || []).map((c) => ({ name: c.name || "Chứng chỉ HDV" })),
                ...(appDoc.language_certificates || []).map((c) => ({ name: c.name || "Chứng chỉ ngôn ngữ" })),
            ];

            await GuideProfile.findOneAndUpdate(
                { user_id: appDoc.user_id },
                {
                    $set: {
                        introduction: appDoc.about,
                        bio_video_url: appDoc.intro_video?.url,
                        experience: experienceText,
                        languages: appDoc.languages || [],
                        bank_account: {
                            bank_name: appDoc.bank_info?.bank_name,
                            account_number: appDoc.bank_info?.account_number,
                            account_holder: appDoc.bank_info?.account_name,
                        },
                        certificates,
                        status: "approved",
                    },
                },
                { upsert: true, new: true }
            );

            // 3) cập nhật application
            appDoc.status = "approved";
            appDoc.admin_notes = admin_notes || "Đã phê duyệt.";
            appDoc.reviewed_by = admin._id;
            appDoc.reviewed_at = new Date();
            await appDoc.save();

            await notifyUser({
                userId,
                type: "guide_application:approved",
                content: "Yêu cầu trở thành hướng dẫn viên của bạn đã được phê duyệt!",
                url: "/guide/dashboard",
                meta: { applicationId: appDoc._id }
            });

            return res.json({ message: "Đã phê duyệt hồ sơ HDV và tạo GuideProfile.", application: appDoc });
        }

        if (action === "reject") {
            appDoc.status = "rejected";
            appDoc.admin_notes = admin_notes || "Hồ sơ chưa đạt yêu cầu.";
            appDoc.reviewed_by = admin._id;
            appDoc.reviewed_at = new Date();
            await appDoc.save();

            await notifyUser({
                userId,
                type: "guide_application:rejected",
                content: "Yêu cầu trở thành hướng dẫn viên của bạn đã bị từ chối.",
                url: "/guide/apply",
                meta: { applicationId: appDoc._id }
            });

            return res.json({ message: "Đã từ chối hồ sơ HDV.", application: appDoc });
        }

        res.status(400).json({ message: "Hành động không hợp lệ." });
    } catch (err) {
        console.error("adminReviewGuideApplication error:", err);
        res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
    }
};
