import mongoose from "mongoose";
import crypto from "crypto";
import Booking from "../../models/Booking.js";
import Tour from "../../models/Tour.js";
import Payout from "../../models/Payout.js";
import User from "../../models/User.js";

const ObjectId = mongoose.Types.ObjectId;

/**
 * Helper: normalize date to YYYY-MM-DD string
 */
function toYMD(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
}

/**
 * Compute total net revenue and booking ids for an occurrence (tourId, tourDate)
 * - Looks for common paid markers and supports refunds lookup if you have refunds collection.
 * - Adjust field names if your Booking schema uses different names.
 */
export async function computeOccurrenceRevenue(tourId, tourDate) {
    // expect tourDate as Date or 'YYYY-MM-DD' string
    const dateStr = toYMD(tourDate);

    const matchExpr = {
        $and: [
            {
                $or: [
                    { tour_id: new ObjectId(tourId) },
                    { tourId: new ObjectId(tourId) },
                    { tour: new ObjectId(tourId) }
                ]
            },
            {
                $or: [
                    { payment_status: "paid" },
                    { status: "paid" },
                    { "payment.session.status": "paid" },
                    { "payment.status": "paid" }
                ]
            },
            {
                $expr: {
                    $eq: [
                        { $dateToString: { format: "%Y-%m-%d", date: { $ifNull: ["$tour_date", { $ifNull: ["$tourDate", "$start_date"] }] } } },
                        dateStr
                    ]
                }
            }
        ]
    };

    const pipeline = [
        { $match: matchExpr },
        // optional: lookup refunds if exists (collection name 'refunds' with booking_id and amount)
        {
            $lookup: {
                from: "refunds",
                localField: "_id",
                foreignField: "booking_id",
                as: "refunds"
            }
        },
        {
            $addFields: {
                refundsTotal: { $sum: "$refunds.amount" },
                paidAmountField: { $ifNull: ["$paid_amount", "$paidAmount", "$total_price", "$totalPrice", 0] }
            }
        },
        {
            $addFields: {
                netPaid: { $subtract: ["$paidAmountField", { $ifNull: ["$refundsTotal", 0] }] }
            }
        },
        {
            $group: {
                _id: null,
                totalNet: { $sum: "$netPaid" },
                bookingIds: { $push: "$_id" }
            }
        }
    ];

    const res = await Booking.aggregate(pipeline);
    if (!res || res.length === 0) return { totalNet: 0, bookingIds: [] };
    const totalNet = res[0].totalNet || 0;
    const bookingIds = res[0].bookingIds || [];
    return { totalNet, bookingIds };
}

/**
 * Get participating guides for an occurrence:
 * - Try distinct intended_guide_id from bookings first.
 * - Fall back to tour.guides array.
 */
export async function getParticipatingGuides(tourId, tourDate) {
    const dateStr = toYMD(tourDate);

    const matchExpr = {
        $and: [
            {
                $or: [
                    { tour_id: new ObjectId(tourId) },
                    { tourId: new ObjectId(tourId) },
                    { tour: new ObjectId(tourId) }
                ]
            },
            {
                $expr: {
                    $eq: [
                        { $dateToString: { format: "%Y-%m-%d", date: { $ifNull: ["$tour_date", { $ifNull: ["$tourDate", "$start_date"] }] } } },
                        dateStr
                    ]
                }
            }
        ]
    };

    // attempt to collect distinct intended_guide_id from bookings
    const guidesFromBookings = await Booking.aggregate([
        { $match: matchExpr },
        { $group: { _id: "$intended_guide_id" } },
        { $match: { _id: { $ne: null } } }
    ]);

    if (Array.isArray(guidesFromBookings) && guidesFromBookings.length > 0) {
        return guidesFromBookings.map(g => g._id).filter(Boolean);
    }

    // fallback to tour.guides array
    const tour = await Tour.findById(tourId).select("guides duration");
    if (!tour) return [];
    const guideIds = (tour.guides || []).map(g => g.guideId || g).filter(Boolean);
    return guideIds;
}

/**
 * Core: create payouts for an occurrence (manual trigger).
 * - Does idempotency check: skip if payout exists for same tourId+tourDate+guideId.
 * - percentage default is 0.1 (10%)
 * - Returns created and skipped arrays with summary
 */
export async function createPayoutsForOccurrence({ tourId, tourDate, createdBy = null, percentage = 0.1, force = false }) {
    if (!mongoose.isValidObjectId(tourId)) throw new Error("Invalid tourId");
    const occDate = new Date(tourDate);
    occDate.setHours(0, 0, 0, 0);

    // compute revenue
    const { totalNet, bookingIds } = await computeOccurrenceRevenue(tourId, occDate);
    if (!totalNet || totalNet <= 0) return { created: [], skipped: [], totalNet, message: "No revenue" };

    // check occurrence end + 3 days rule (enforce here)
    const tourDoc = await Tour.findById(tourId).select("duration");
    let endDate = new Date(occDate);
    const duration = (tourDoc && Number(tourDoc.duration)) ? Number(tourDoc.duration) : 1;
    endDate.setDate(endDate.getDate() + (duration - 1));
    const eligibleDate = new Date(endDate);
    eligibleDate.setDate(eligibleDate.getDate() + 3);
    const now = new Date();

    if (now < eligibleDate && !force) {
        return { created: [], skipped: [], totalNet, message: `Occurrence not eligible for payout until ${eligibleDate.toISOString().slice(0, 10)}` };
    }

    // get guides
    const guideIds = await getParticipatingGuides(tourId, occDate);
    if (!Array.isArray(guideIds) || guideIds.length === 0) return { created: [], skipped: [], totalNet, message: "No guides found" };

    const created = [], skipped = [];

    for (const guideId of guideIds) {
        if (!mongoose.isValidObjectId(guideId)) {
            skipped.push({ guideId, reason: "invalid guide id" });
            continue;
        }

        // idempotency: check existing payout record (pending/paid/failed)
        const exists = await Payout.findOne({ tourId: tourId, tourDate: occDate, guideId: guideId });
        if (exists) {
            skipped.push({ guideId, existingId: exists._id });
            continue;
        }

        const payoutAmount = Math.round(totalNet * percentage);

        const payout = await Payout.create({
            tourId,
            tourDate: occDate,
            guideId,
            baseAmount: totalNet,
            percentage,
            payoutAmount,
            relatedBookingIds: bookingIds,
            status: "pending",
            reference: crypto.randomUUID(),
            createdBy
        });

        created.push(payout);
    }

    return { created, skipped, totalNet };
}

/**
 * Admin API: create manual payout for one occurrence or one guide
 * POST /api/admin/payouts/manual
 * Body: { tourId, tourDate, guideId? , force? }
 * - force: boolean override 3-day rule (only for super-admin if you want)
 */
export async function createManualPayout(req, res) {
    try {
        const { tourId, tourDate, guideId, force = false } = req.body;
        if (!tourId || !tourDate) return res.status(400).json({ ok: false, message: "tourId and tourDate required" });
        if (!mongoose.isValidObjectId(tourId)) return res.status(400).json({ ok: false, message: "Invalid tourId" });

        const createdBy = req.user ? req.user._id : null;

        if (guideId) {
            // create only for this guide
            if (!mongoose.isValidObjectId(guideId)) return res.status(400).json({ ok: false, message: "Invalid guideId" });
            const result = await createPayoutsForOccurrence({ tourId, tourDate, createdBy, percentage: 0.1, force });
            // filter created for guideId
            const createdForGuide = result.created.filter(p => p.guideId.toString() === guideId.toString());
            if (createdForGuide.length === 0) {
                // maybe skipped or not eligible
                const existing = await Payout.findOne({ tourId, tourDate: new Date(new Date(tourDate).setHours(0, 0, 0, 0)), guideId });
                if (existing) return res.status(409).json({ ok: false, message: "Payout already exists", payout: existing });
                return res.status(400).json({ ok: false, message: result.message || "No payout created", detail: result });
            }
            return res.status(201).json({ ok: true, created: createdForGuide, totalNet: result.totalNet });
        } else {
            const result = await createPayoutsForOccurrence({ tourId, tourDate, createdBy, percentage: 0.1, force });
            if ((result.created || []).length === 0) {
                // no created (maybe skipped for eligibility)
                return res.status(400).json({ ok: false, message: result.message || "No payouts created", detail: result });
            }
            return res.status(201).json({ ok: true, created: result.created, skipped: result.skipped, totalNet: result.totalNet });
        }
    } catch (err) {
        console.error("createManualPayout error:", err);
        // catch duplicate key errors (if unique index used)
        if (err.code === 11000) {
            return res.status(409).json({ ok: false, message: "Duplicate payout (unique constraint)" });
        }
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
}

/**
 * PATCH /api/admin/payouts/:id/mark-paid
 * Body: { txId? }
 */
export async function markPayoutPaid(req, res) {
    try {
        const { id } = req.params;
        const { txId } = req.body;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ ok: false, message: "Invalid payout id" });

        const payout = await Payout.findById(id);
        if (!payout) return res.status(404).json({ ok: false, message: "Payout not found" });
        if (payout.status === "paid") return res.status(400).json({ ok: false, message: "Payout already paid" });

        payout.status = "paid";
        payout.paidAt = new Date();
        payout.paidBy = req.user ? req.user._id : null;
        if (txId) payout.txId = txId;
        await payout.save();

        // OPTIONAL: update guide balance ledger if you track balance
        // await User.findByIdAndUpdate(payout.guideId, { $inc: { balance: payout.payoutAmount } });

        return res.json({ ok: true, payout });
    } catch (err) {
        console.error("markPayoutPaid error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
}

/**
 * GET /api/admin/payouts
 * Query: tourId, tourDate, guideId, status, page, limit
 */
export async function listPayouts(req, res) {
    try {
        const { tourId, tourDate, guideId, status, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (tourId && mongoose.isValidObjectId(tourId)) filter.tourId = tourId;
        if (guideId && mongoose.isValidObjectId(guideId)) filter.guideId = guideId;
        if (status) filter.status = status;
        if (tourDate) {
            const d = new Date(tourDate);
            d.setHours(0, 0, 0, 0);
            filter.tourDate = d;
        }

        const items = await Payout.find(filter)
            .populate("tourId", "title")
            .populate("guideId", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        return res.json({ ok: true, data: items });
    } catch (err) {
        console.error("listPayouts error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
}