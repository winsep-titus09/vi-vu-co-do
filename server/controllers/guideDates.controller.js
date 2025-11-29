// server/controllers/guideDates. controller.js
import mongoose from "mongoose";
import GuideBusyDate from "../models/GuideDate.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";

/**
 * GET /api/guides/busy-dates
 * Lấy danh sách ngày bận của HDV hiện tại
 */
export const getMyBusyDates = async (req, res) => {
    try {
        const guideId = req.user._id;
        const { from, to, page = 1, limit = 100 } = req.query;

        const filter = { guide_id: guideId };

        // Filter theo khoảng thời gian nếu có
        if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = new Date(from);
            if (to) filter.date.$lte = new Date(to);
        }

        const pg = Math.max(Number(page) || 1, 1);
        const lm = Math.min(Math.max(Number(limit) || 100, 1), 365);

        const [items, total] = await Promise.all([
            GuideBusyDate.find(filter)
                .sort({ date: 1 })
                .skip((pg - 1) * lm)
                .limit(lm)
                .lean(),
            GuideBusyDate.countDocuments(filter),
        ]);

        return res.json({ ok: true, items, total, page: pg, limit: lm });
    } catch (err) {
        console.error("getMyBusyDates error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách ngày bận." });
    }
};

/**
 * POST /api/guides/busy-dates
 * HDV đánh dấu ngày bận (có thể gửi 1 ngày hoặc mảng ngày)
 */
export const addBusyDates = async (req, res) => {
    try {
        const guideId = req.user._id;
        const { dates, date, reason, is_full_day = true, start_time, end_time } = req.body;

        // Hỗ trợ cả array dates và single date
        let dateList = [];
        if (Array.isArray(dates)) {
            dateList = dates;
        } else if (date) {
            dateList = [date];
        }

        if (!dateList.length) {
            return res.status(400).json({ message: "Vui lòng cung cấp ngày cần đánh dấu bận." });
        }

        const results = { added: [], skipped: [], errors: [] };

        for (const d of dateList) {
            try {
                const dateObj = new Date(d);
                if (isNaN(dateObj.getTime())) {
                    results.errors.push({ date: d, reason: "Ngày không hợp lệ" });
                    continue;
                }

                // Chuẩn hóa về 00:00:00
                dateObj.setHours(0, 0, 0, 0);

                // Kiểm tra xem ngày này có booking đã được duyệt không
                const existingBooking = await Booking.findOne({
                    intended_guide_id: guideId,
                    "guide_decision.status": "accepted",
                    status: { $in: ["awaiting_payment", "paid", "completed"] },
                    $or: [
                        { start_date: { $lte: dateObj }, end_date: { $gte: dateObj } },
                        {
                            start_date: {
                                $gte: dateObj,
                                $lt: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000),
                            },
                        },
                    ],
                });

                if (existingBooking) {
                    results.skipped.push({
                        date: d,
                        reason: "Đã có booking đã được xác nhận vào ngày này.",
                    });
                    continue;
                }

                // Tạo hoặc update busy date
                await GuideBusyDate.findOneAndUpdate(
                    { guide_id: guideId, date: dateObj },
                    {
                        guide_id: guideId,
                        date: dateObj,
                        reason: reason || null,
                        is_full_day,
                        start_time: is_full_day ? null : start_time,
                        end_time: is_full_day ? null : end_time,
                    },
                    { upsert: true, new: true }
                );

                results.added.push(d);
            } catch (err) {
                if (err.code === 11000) {
                    results.skipped.push({ date: d, reason: "Ngày đã được đánh dấu bận." });
                } else {
                    results.errors.push({ date: d, reason: err.message });
                }
            }
        }

        return res.json({
            ok: true,
            message: `Đã đánh dấu ${results.added.length} ngày bận. `,
            results,
        });
    } catch (err) {
        console.error("addBusyDates error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ khi đánh dấu ngày bận." });
    }
};

/**
 * DELETE /api/guides/busy-dates
 * Xóa ngày bận (hỗ trợ xóa nhiều ngày)
 */
export const removeBusyDates = async (req, res) => {
    try {
        const guideId = req.user._id;
        const { dates, date, id } = req.body;

        // Hỗ trợ xóa theo id, date, hoặc array dates
        if (id) {
            const deleted = await GuideBusyDate.findOneAndDelete({
                _id: id,
                guide_id: guideId,
            });
            if (!deleted) {
                return res.status(404).json({ message: "Không tìm thấy ngày bận." });
            }
            return res.json({ ok: true, message: "Đã xóa ngày bận.", deleted });
        }

        let dateList = [];
        if (Array.isArray(dates)) {
            dateList = dates;
        } else if (date) {
            dateList = [date];
        }

        if (!dateList.length) {
            return res.status(400).json({ message: "Vui lòng cung cấp ngày cần xóa." });
        }

        const normalizedDates = dateList.map((d) => {
            const dateObj = new Date(d);
            dateObj.setHours(0, 0, 0, 0);
            return dateObj;
        });

        const result = await GuideBusyDate.deleteMany({
            guide_id: guideId,
            date: { $in: normalizedDates },
        });

        return res.json({
            ok: true,
            message: `Đã xóa ${result.deletedCount} ngày bận.`,
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        console.error("removeBusyDates error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ khi xóa ngày bận." });
    }
};

/**
 * GET /api/guides/:guideId/busy-dates (Public)
 * Lấy ngày bận của 1 HDV cụ thể (dùng để FE hiển thị)
 */
export const getGuideBusyDates = async (req, res) => {
    try {
        const { guideId } = req.params;
        const { from, to } = req.query;

        if (!mongoose.Types.ObjectId.isValid(guideId)) {
            return res.status(400).json({ message: "guideId không hợp lệ." });
        }

        const filter = { guide_id: guideId };

        // Mặc định lấy từ hôm nay trở đi
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        filter.date = {};
        filter.date.$gte = from ? new Date(from) : now;
        if (to) filter.date.$lte = new Date(to);

        const items = await GuideBusyDate.find(filter)
            .select("date is_full_day start_time end_time")
            .sort({ date: 1 })
            .limit(365)
            .lean();

        // Chỉ trả về mảng ngày (không cần thông tin chi tiết như reason)
        const busyDates = items.map((i) => ({
            date: i.date,
            is_full_day: i.is_full_day,
            start_time: i.start_time,
            end_time: i.end_time,
        }));

        return res.json({ ok: true, busyDates });
    } catch (err) {
        console.error("getGuideBusyDates error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/**
 * GET /api/guides/available
 * Lấy danh sách HDV khả dụng cho 1 ngày cụ thể
 */
export const getAvailableGuides = async (req, res) => {
    try {
        const { date, tour_id } = req.query;

        if (!date) {
            return res.status(400).json({ message: "Vui lòng cung cấp ngày (date)." });
        }

        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            return res.status(400).json({ message: "Ngày không hợp lệ." });
        }
        targetDate.setHours(0, 0, 0, 0);

        // Lấy tất cả guideIds bị bận ngày này
        const busyGuideRecords = await GuideBusyDate.find({
            date: targetDate,
            is_full_day: true,
        }).select("guide_id");
        const busyGuideIds = busyGuideRecords.map((r) => r.guide_id.toString());

        // Lấy guideIds có booking đã accept vào ngày này
        const busyBookings = await Booking.find({
            "guide_decision.status": "accepted",
            status: { $in: ["awaiting_payment", "paid", "completed"] },
            $or: [
                { start_date: { $lte: targetDate }, end_date: { $gte: targetDate } },
                {
                    start_date: {
                        $gte: targetDate,
                        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
                    },
                },
            ],
        }).select("intended_guide_id");
        const bookingBusyIds = busyBookings
            .filter((b) => b.intended_guide_id)
            .map((b) => b.intended_guide_id.toString());

        const allBusyIds = [...new Set([...busyGuideIds, ...bookingBusyIds])];

        // Nếu có tour_id, lấy các guide gắn với tour đó
        let tourGuideIds = null;
        if (tour_id && mongoose.Types.ObjectId.isValid(tour_id)) {
            const tour = await Tour.findById(tour_id).select("guides guide_id").lean();
            if (tour) {
                tourGuideIds = [];
                if (tour.guide_id) tourGuideIds.push(tour.guide_id.toString());
                if (Array.isArray(tour.guides)) {
                    tour.guides.forEach((g) => {
                        if (g.guideId) tourGuideIds.push(g.guideId.toString());
                    });
                }
                tourGuideIds = [... new Set(tourGuideIds)];
            }
        }

        // Import User model để lấy thông tin guides
        const User = (await import("../models/User.js")).default;
        const GuideProfile = (await import("../models/GuideProfile.js")).default;

        // Lấy tất cả user có role guide
        let guideFilter = {};
        if (tourGuideIds && tourGuideIds.length) {
            // Chỉ lấy guides của tour đó và loại trừ những người bận
            guideFilter._id = {
                $in: tourGuideIds.map((id) => new mongoose.Types.ObjectId(id)),
                $nin: allBusyIds.map((id) => new mongoose.Types.ObjectId(id)),
            };
        } else {
            guideFilter._id = {
                $nin: allBusyIds.map((id) => new mongoose.Types.ObjectId(id)),
            };
        }

        const users = await User.find(guideFilter)
            .populate({ path: "role_id", match: { name: "guide" }, select: "name" })
            .select("name avatar_url role_id")
            .lean();

        // Lọc chỉ lấy users có role_id. name === 'guide'
        const guideUsers = users.filter((u) => u.role_id?.name === "guide");

        // Lấy thêm profile info
        const guideUserIds = guideUsers.map((g) => g._id);
        const profiles = await GuideProfile.find({
            user_id: { $in: guideUserIds },
            status: "approved",
        })
            .select("user_id introduction expertise is_featured")
            .lean();

        const profileMap = new Map(profiles.map((p) => [p.user_id.toString(), p]));

        const availableGuides = guideUsers.map((g) => {
            const profile = profileMap.get(g._id.toString()) || {};
            return {
                _id: g._id,
                name: g.name,
                avatar_url: g.avatar_url,
                introduction: profile.introduction || null,
                expertise: profile.expertise || null,
                is_featured: profile.is_featured || false,
            };
        });

        return res.json({
            ok: true,
            date: targetDate,
            availableGuides,
            totalBusyGuides: allBusyIds.length,
        });
    } catch (err) {
        console.error("getAvailableGuides error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/**
 * GET /api/guides/calendar
 * Lấy dữ liệu lịch của HDV (ngày bận + booking + tours)
 */
export const getGuideCalendar = async (req, res) => {
    try {
        const guideId = req.user._id;
        const { year, month } = req.query;

        // Mặc định lấy tháng hiện tại
        const now = new Date();
        const targetYear = Number(year) || now.getFullYear();
        const targetMonth = Number(month) || now.getMonth() + 1;

        const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
        const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

        // 1.  Lấy ngày bận
        const busyDates = await GuideBusyDate.find({
            guide_id: guideId,
            date: { $gte: startOfMonth, $lte: endOfMonth },
        })
            .select("date reason is_full_day")
            .lean();

        // 2. Lấy bookings đã accept/paid/completed trong tháng
        const bookings = await Booking.find({
            intended_guide_id: guideId,
            "guide_decision.status": "accepted",
            status: { $in: ["awaiting_payment", "paid", "completed"] },
            start_date: { $lte: endOfMonth },
            $or: [
                { end_date: { $gte: startOfMonth } },
                { end_date: null, start_date: { $gte: startOfMonth } },
            ],
        })
            .populate("tour_id", "name slug")
            .populate("customer_id", "name")
            .select("tour_id customer_id start_date end_date status total_price")
            .lean();

        // 3. Lấy tours mà HDV được gán (để hiển thị tours khả dụng)
        const tours = await Tour.find({
            $or: [
                { guide_id: guideId },
                { "guides.guideId": guideId },
            ],
            status: "active",
            "approval.status": "approved",
        })
            .select("name slug duration duration_hours blackout_dates closed_weekdays")
            .lean();

        // Tổ chức data theo ngày
        const calendarData = {};

        // Thêm busy dates
        busyDates.forEach((bd) => {
            const dateKey = bd.date.toISOString().split("T")[0];
            if (!calendarData[dateKey]) {
                calendarData[dateKey] = { isBusy: false, busyReason: null, bookings: [], tours: [] };
            }
            calendarData[dateKey].isBusy = true;
            calendarData[dateKey].busyReason = bd.reason;
        });

        // Thêm bookings
        bookings.forEach((b) => {
            const startDate = new Date(b.start_date);
            const endDate = b.end_date ? new Date(b.end_date) : startDate;

            // Duyệt qua từng ngày của booking
            let current = new Date(startDate);
            while (current <= endDate) {
                if (current >= startOfMonth && current <= endOfMonth) {
                    const dateKey = current.toISOString().split("T")[0];
                    if (!calendarData[dateKey]) {
                        calendarData[dateKey] = { isBusy: false, busyReason: null, bookings: [], tours: [] };
                    }
                    calendarData[dateKey].bookings.push({
                        _id: b._id,
                        tour_name: b.tour_id?.name || "Tour",
                        tour_slug: b.tour_id?.slug,
                        customer_name: b.customer_id?.name,
                        status: b.status,
                        total_price: b.total_price ? Number(b.total_price.toString()) : 0,
                    });
                }
                current.setDate(current.getDate() + 1);
            }
        });

        return res.json({
            ok: true,
            year: targetYear,
            month: targetMonth,
            calendar: calendarData,
            tours: tours.map((t) => ({
                _id: t._id,
                name: t.name,
                slug: t.slug,
                blackout_dates: t.blackout_dates,
                closed_weekdays: t.closed_weekdays,
            })),
        });
    } catch (err) {
        console.error("getGuideCalendar error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/**
 * GET /api/tours/:tourId/calendar
 * Lấy dữ liệu lịch cho 1 tour cụ thể (ngày nào có booking, ngày nào guide bận)
 */
export const getTourCalendar = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { year, month } = req.query;

        if (!mongoose.Types.ObjectId.isValid(tourId)) {
            return res.status(400).json({ message: "tourId không hợp lệ." });
        }

        const tour = await Tour.findById(tourId)
            .select("guides guide_id blackout_dates closed_weekdays max_guests")
            .lean();

        if (!tour) {
            return res.status(404).json({ message: "Không tìm thấy tour." });
        }

        // Lấy tất cả guide IDs của tour
        const guideIds = [];
        if (tour.guide_id) guideIds.push(tour.guide_id.toString());
        if (Array.isArray(tour.guides)) {
            tour.guides.forEach((g) => {
                if (g.guideId) guideIds.push(g.guideId.toString());
            });
        }
        const uniqueGuideIds = [...new Set(guideIds)];

        const now = new Date();
        const targetYear = Number(year) || now.getFullYear();
        const targetMonth = Number(month) || now.getMonth() + 1;

        const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
        const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

        // 1. Lấy ngày bận của tất cả guides
        const busyDates = await GuideBusyDate.find({
            guide_id: { $in: uniqueGuideIds.map((id) => new mongoose.Types.ObjectId(id)) },
            date: { $gte: startOfMonth, $lte: endOfMonth },
        })
            .select("guide_id date")
            .lean();

        // 2. Lấy bookings của tour này
        const bookings = await Booking.find({
            tour_id: tourId,
            status: { $nin: ["canceled", "rejected"] },
            start_date: { $lte: endOfMonth },
            $or: [
                { end_date: { $gte: startOfMonth } },
                { end_date: null, start_date: { $gte: startOfMonth } },
            ],
        })
            .select("start_date end_date status participants intended_guide_id")
            .lean();

        // Tổ chức data theo ngày
        const calendarData = {};

        // Thêm ngày guides bận (chỉ nếu TẤT CẢ guides đều bận)
        const busyDatesByDate = {};
        busyDates.forEach((bd) => {
            const dateKey = bd.date.toISOString().split("T")[0];
            if (!busyDatesByDate[dateKey]) busyDatesByDate[dateKey] = new Set();
            busyDatesByDate[dateKey].add(bd.guide_id.toString());
        });

        // Kiểm tra ngày nào tất cả guides đều bận
        for (const [dateKey, guideSet] of Object.entries(busyDatesByDate)) {
            const allBusy = uniqueGuideIds.every((gId) => guideSet.has(gId));
            if (allBusy) {
                if (!calendarData[dateKey]) {
                    calendarData[dateKey] = {
                        allGuidesBusy: false,
                        bookingCount: 0,
                        slotsUsed: 0,
                        isBlackout: false,
                    };
                }
                calendarData[dateKey].allGuidesBusy = true;
            }
        }

        // Thêm blackout dates từ tour
        if (Array.isArray(tour.blackout_dates)) {
            tour.blackout_dates.forEach((bd) => {
                const d = new Date(bd);
                if (d >= startOfMonth && d <= endOfMonth) {
                    const dateKey = d.toISOString().split("T")[0];
                    if (!calendarData[dateKey]) {
                        calendarData[dateKey] = {
                            allGuidesBusy: false,
                            bookingCount: 0,
                            slotsUsed: 0,
                            isBlackout: false,
                        };
                    }
                    calendarData[dateKey].isBlackout = true;
                }
            });
        }

        // Đếm bookings theo ngày
        bookings.forEach((b) => {
            const startDate = new Date(b.start_date);
            startDate.setHours(0, 0, 0, 0);
            const dateKey = startDate.toISOString().split("T")[0];

            if (!calendarData[dateKey]) {
                calendarData[dateKey] = {
                    allGuidesBusy: false,
                    bookingCount: 0,
                    slotsUsed: 0,
                    isBlackout: false,
                };
            }
            calendarData[dateKey].bookingCount += 1;
            calendarData[dateKey].slotsUsed += (b.participants || []).filter(
                (p) => p.count_slot
            ).length;
        });

        return res.json({
            ok: true,
            tourId,
            year: targetYear,
            month: targetMonth,
            maxGuests: tour.max_guests || 0,
            closedWeekdays: tour.closed_weekdays || [],
            calendar: calendarData,
        });
    } catch (err) {
        console.error("getTourCalendar error:", err);
        return res.status(500).json({ message: "Lỗi máy chủ." });
    }
};