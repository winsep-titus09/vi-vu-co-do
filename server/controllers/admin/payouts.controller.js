import mongoose from "mongoose";
import crypto from "crypto";
import Booking from "../../models/Booking.js";
import Tour from "../../models/Tour.js";
import Payout from "../../models/Payout.js";
import User from "../../models/User.js";
import Transaction from "../../models/Transaction.js";
import { notifyUser, notifyAdmins } from "../../services/notify.js";

const ObjectId = mongoose.Types.ObjectId;

/* Helpers */
function toYMD(date) {
    // Trả về "YYYY-MM-DD" theo timezone Asia/Ho_Chi_Minh
    const d = new Date(date);
    return d.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
}

function debugLog(...args) {
    if (process.env.PAYOUT_DEBUG === "true") {
        console.log("[payout-debug]", ...args);
    }
}

/**
 * Compute total net revenue and booking ids for an occurrence (tourId, tourDate).
 */
export async function computeOccurrenceRevenue(tourId, tourDate) {
    if (!mongoose.isValidObjectId(tourId)) return { totalNet: 0, bookingIds: [] };
    const dateStr = toYMD(tourDate);
    debugLog("computeOccurrenceRevenue called", { tourId, tourDate, dateStr });

    const tourIdObj = new ObjectId(tourId);
    const tourMatch = { $or: [{ tour_id: tourIdObj }, { tourId: tourIdObj }, { tour: tourIdObj }] };
    const paidMatch = { $or: [{ status: "paid" }, { payment_status: "paid" }, { "payment_session.status": "paid" }, { "payment.status": "paid" }] };

    const basePipeline = [
        { $match: { $and: [tourMatch, paidMatch] } },
        {
            $addFields: {
                _paidAmount: {
                    $ifNull: [
                        "$paid_amount",
                        { $ifNull: ["$paidAmount", { $ifNull: ["$total_price", { $ifNull: ["$totalPrice", 0] }] }] }
                    ]
                },
                _tourDate: { $ifNull: ["$tour_date", { $ifNull: ["$tourDate", "$start_date"] }] }
            }
        },
        { $addFields: { _paidAmountDouble: { $toDouble: "$_paidAmount" } } }
    ];

    const byDatePipeline = [
        ...basePipeline,
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$_tourDate" } },
                revenue: { $sum: "$_paidAmountDouble" },
                bookingIds: { $push: "$_id" }
            }
        },
        { $sort: { "_id": 1 } }
    ];

    debugLog("byDatePipeline:", JSON.stringify(byDatePipeline, null, 2));
    const byDateRes = await Booking.aggregate(byDatePipeline);
    debugLog("byDateRes:", JSON.stringify(byDateRes, null, 2));

    const found = (byDateRes || []).find(d => d._id === dateStr);
    if (found && Number(found.revenue) > 0) {
        return { totalNet: Number(found.revenue), bookingIds: found.bookingIds || [] };
    }

    // FALLBACK A: sum total_price with refund subtraction
    const pipelineA = [
        {
            $match: {
                $and: [
                    tourMatch,
                    paidMatch,
                    {
                        $expr: {
                            $eq: [
                                { $dateToString: { format: "%Y-%m-%d", date: { $ifNull: ["$start_date", { $ifNull: ["$tour_date", "$tourDate"] }] } } },
                                dateStr
                            ]
                        }
                    }
                ]
            }
        },
        { $lookup: { from: "refunds", localField: "_id", foreignField: "booking_id", as: "refunds" } },
        { $addFields: { refundsTotal: { $sum: "$refunds.amount" }, paidAmountField: { $ifNull: ["$total_price", "$paid_amount", "$paidAmount", "$totalPrice", 0] } } },
        { $addFields: { paidAmountDouble: { $toDouble: "$paidAmountField" }, refundsTotalDouble: { $toDouble: { $ifNull: ["$refundsTotal", 0] } } } },
        { $addFields: { netPaid: { $subtract: ["$paidAmountDouble", "$refundsTotalDouble"] } } },
        { $group: { _id: null, totalNet: { $sum: "$netPaid" }, bookingIds: { $push: "$_id" } } }
    ];

    debugLog("pipelineA:", JSON.stringify(pipelineA, null, 2));
    const resA = await Booking.aggregate(pipelineA);
    debugLog("resA:", JSON.stringify(resA, null, 2));
    if (resA && resA.length > 0 && Number(resA[0].totalNet) > 0) {
        return { totalNet: Number(resA[0].totalNet || 0), bookingIds: resA[0].bookingIds || [] };
    }

    // FALLBACK B: participants.price_applied
    const pipelineB = [
        {
            $match: {
                $and: [
                    tourMatch,
                    paidMatch,
                    {
                        $expr: {
                            $eq: [
                                { $dateToString: { format: "%Y-%m-%d", date: { $ifNull: ["$start_date", { $ifNull: ["$tour_date", "$tourDate"] }] } } },
                                dateStr
                            ]
                        }
                    }
                ]
            }
        },
        { $unwind: "$participants" },
        { $match: { "participants.is_free": { $ne: true } } },
        { $addFields: { participantPriceDouble: { $toDouble: { $ifNull: ["$participants.price_applied", 0] } } } },
        { $group: { _id: null, totalNet: { $sum: "$participantPriceDouble" }, bookingIds: { $addToSet: "$_id" } } }
    ];

    debugLog("pipelineB:", JSON.stringify(pipelineB, null, 2));
    const resB = await Booking.aggregate(pipelineB);
    debugLog("resB:", JSON.stringify(resB, null, 2));
    if (resB && resB.length > 0 && Number(resB[0].totalNet) > 0) {
        return { totalNet: Number(resB[0].totalNet || 0), bookingIds: resB[0].bookingIds || [] };
    }

    debugLog("computeOccurrenceRevenue: totalNet 0 for", tourId, dateStr);
    return { totalNet: 0, bookingIds: [] };
}

/**
 * Get participating guides for an occurrence.
 */
export async function getParticipatingGuides(tourId, tourDate) {
    if (!mongoose.isValidObjectId(tourId)) return [];
    const dateStr = toYMD(tourDate);
    debugLog("getParticipatingGuides", { tourId, tourDate, dateStr });

    const tourIdObj = new ObjectId(tourId);
    const matchExpr = {
        $and: [
            { $or: [{ tour_id: tourIdObj }, { tourId: tourIdObj }, { tour: tourIdObj }] },
            { $expr: { $eq: [{ $dateToString: { format: "%Y-%m-%d", date: { $ifNull: ["$start_date", { $ifNull: ["$tour_date", "$tourDate"] }] } } }, dateStr] } }
        ]
    };

    const guidesFromBookings = await Booking.aggregate([
        { $match: matchExpr },
        { $group: { _id: "$intended_guide_id" } },
        { $match: { _id: { $ne: null } } }
    ]);

    debugLog("guidesFromBookings:", JSON.stringify(guidesFromBookings, null, 2));
    if (Array.isArray(guidesFromBookings) && guidesFromBookings.length > 0) {
        return guidesFromBookings.map(g => g._id).filter(Boolean);
    }

    const tour = await Tour.findById(tourId).select("guides duration");
    debugLog("tour.guides:", tour ? tour.guides : null);
    if (!tour) return [];
    const guideIds = (tour.guides || []).map(g => g.guideId || g).filter(Boolean);
    return guideIds;
}

/**
 * Core: create payouts for an occurrence (manual trigger).
 * - Idempotent with respect to paid payouts: skip if already paid.
 * - If an existing payout exists but status !== 'paid', behavior:
 *    - default: skip (keeps pending records)
 *    - if forceReplace === true: delete existing and recreate
 */
export async function createPayoutsForOccurrence({ tourId, tourDate, createdBy = null, percentage = 0.1, force = false, forceReplace = false }) {
    if (!mongoose.isValidObjectId(tourId)) throw new Error("Invalid tourId");
    const occDate = new Date(tourDate);
    occDate.setHours(0, 0, 0, 0);

    const { totalNet, bookingIds } = await computeOccurrenceRevenue(tourId, occDate);
    debugLog("createPayoutsForOccurrence computed revenue", { totalNet, bookingIds });

    if (!totalNet || totalNet <= 0) return { created: [], skipped: [], totalNet, message: "No revenue" };

    const tourDoc = await Tour.findById(tourId).select("duration");
    let endDate = new Date(occDate);
    const duration = (tourDoc && Number(tourDoc.duration)) ? Number(tourDoc.duration) : 1;
    endDate.setDate(endDate.getDate() + (duration - 1));

    // Allow overriding holdback days via env PAYOUT_HOLDBACK_DAYS (default 3)
    const holdbackDays = Number(process.env.PAYOUT_HOLDBACK_DAYS ?? 3);
    const eligibleDate = new Date(endDate);
    eligibleDate.setDate(eligibleDate.getDate() + holdbackDays);

    const now = new Date();

    // Allow skipping holdback entirely via env PAYOUT_SKIP_HOLDBACK=true
    const skipHoldback = String(process.env.PAYOUT_SKIP_HOLDBACK || "").toLowerCase() === "true";

    if (now < eligibleDate && !force && !skipHoldback) {
        return { created: [], skipped: [], totalNet, message: `Occurrence not eligible for payout until ${eligibleDate.toISOString().slice(0, 10)}` };
    }

    const guideIds = await getParticipatingGuides(tourId, occDate);
    if (!Array.isArray(guideIds) || guideIds.length === 0) return { created: [], skipped: [], totalNet, message: "No guides found" };

    const created = [], skipped = [];
    for (const guideId of guideIds) {
        if (!mongoose.isValidObjectId(guideId)) {
            skipped.push({ guideId, reason: "invalid guide id" });
            continue;
        }

        let exists = await Payout.findOne({ tourId: tourId, tourDate: occDate, guideId: guideId });
        if (exists) {
            // Nếu đã paid thì skip luôn
            if (String(exists.status) === "paid") {
                skipped.push({ guideId, reason: "already paid", existingId: exists._id });
                continue;
            }

            // Nếu tồn tại nhưng chưa paid -> cập nhật thay vì skip
            try {
                const payoutAmount = Math.round(totalNet * percentage);
                const update = {
                    $set: {
                        baseAmount: totalNet,
                        percentage,
                        payoutAmount,
                        relatedBookingIds: bookingIds,
                        // giữ status (pending/failed) như hiện tại hoặc reset thành pending
                        status: exists.status || "pending",
                        updatedAt: new Date()
                    }
                };
                await Payout.updateOne({ _id: exists._id }, update);
                // trả về existing id như created (hoặc bạn có thể đưa vào list createdUpdated)
                created.push(await Payout.findById(exists._id));
                continue;
            } catch (upErr) {
                console.error("createPayoutsForOccurrence: failed to update existing payout:", upErr);
                skipped.push({ guideId, existingId: exists._id, reason: "failed to update existing", error: upErr.message });
                continue;
            }
        }

        // create payout
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
 * POST /api/admin/payouts/manual
 * Body: { tourId, tourDate, guideId?, force?, forceReplace? }
 */
export async function createManualPayout(req, res) {
    try {
        const { tourId, tourDate, guideId, force = false, forceReplace = false } = req.body;
        debugLog("createManualPayout body:", req.body);

        if (!tourId || !tourDate) return res.status(400).json({ ok: false, message: "tourId and tourDate required" });
        if (!mongoose.isValidObjectId(tourId)) return res.status(400).json({ ok: false, message: "Invalid tourId" });

        const createdBy = req.user ? req.user._id : null;

        if (guideId) {
            if (!mongoose.isValidObjectId(guideId)) return res.status(400).json({ ok: false, message: "Invalid guideId" });
            const result = await createPayoutsForOccurrence({ tourId, tourDate, createdBy, percentage: 0.1, force, forceReplace });
            const createdForGuide = (result.created || []).filter(p => String(p.guideId) === String(guideId));
            if (createdForGuide.length === 0) {
                const existing = await Payout.findOne({ tourId, tourDate: new Date(new Date(tourDate).setHours(0, 0, 0, 0)), guideId });
                if (existing) return res.status(409).json({ ok: false, message: "Payout already exists", payout: existing });
                return res.status(400).json({ ok: false, message: result.message || "No payout created", detail: result });
            }
            return res.status(201).json({ ok: true, created: createdForGuide, totalNet: result.totalNet });
        }

        const result = await createPayoutsForOccurrence({ tourId, tourDate, createdBy, percentage: 0.1, force, forceReplace });
        if ((result.created || []).length === 0) {
            return res.status(400).json({ ok: false, message: result.message || "No payouts created", detail: result });
        }
        return res.status(201).json({ ok: true, created: result.created, skipped: result.skipped, totalNet: result.totalNet });
    } catch (err) {
        console.error("createManualPayout error:", err);
        if (err.code === 11000) {
            return res.status(409).json({ ok: false, message: "Duplicate payout (unique constraint)" });
        }
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
}

/**
 * PATCH /api/admin/payouts/:id/mark-paid
 * Body: { txId? }
 * Note: this implementation attempts to create Transaction ledger and will revert payout.status to pending if ledger creation fails.
 */
export async function markPayoutPaid(req, res) {
    try {
        const { id } = req.params;
        const { txId } = req.body;
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ ok: false, message: "Invalid payout id" });

        const payout = await Payout.findById(id);
        if (!payout) return res.status(404).json({ ok: false, message: "Payout not found" });
        if (payout.status === "paid") return res.status(400).json({ ok: false, message: "Payout already paid" });

        // Mark payout as paid
        payout.status = "paid";
        payout.paidAt = new Date();
        payout.paidBy = req.user ? req.user._id : null;
        if (txId) payout.txId = txId;
        await payout.save();

        // --- Create a Transaction record for the payout (ledger) ---
        let bookingForTx = null;
        if (Array.isArray(payout.relatedBookingIds) && payout.relatedBookingIds.length > 0) {
            bookingForTx = payout.relatedBookingIds[0];
        }

        // Ensure we have acting admin user to record ledger
        const actingUserId = req.user ? req.user._id : null;
        try {
            if (!actingUserId) {
                // Revert payout
                payout.status = "pending";
                payout.paidAt = null;
                payout.paidBy = null;
                await payout.save().catch(() => { });
                return res.status(403).json({ ok: false, message: "Missing authenticated admin user to create ledger transaction." });
            }

            // Use Decimal128 strings to be safe
            const amountStr = String(payout.payoutAmount ?? 0);
            const netStr = amountStr;
            const commStr = "0";

            const tx = await Transaction.create({
                bookingId: bookingForTx || null,
                userId: actingUserId,
                payeeUserId: payout.guideId,
                amount: mongoose.Types.Decimal128.fromString(amountStr),
                commission_fee: mongoose.Types.Decimal128.fromString(commStr),
                net_amount: mongoose.Types.Decimal128.fromString(netStr),
                transaction_type: "payout",
                status: "confirmed",
                payment_gateway: "manual",
                transaction_code: txId || `payout-${payout.reference || payout._id}`,
                note: `Payout for guide ${String(payout.guideId)} for tour ${String(payout.tourId)} on ${toYMD(payout.tourDate)}`
            });

            // attach transaction id to payout for reference
            payout.transactionId = tx._id;
            await payout.save();
        } catch (txErr) {
            console.error("markPayoutPaid: failed to create Transaction:", txErr);
            // revert payout.status so admin knows ledger creation failed
            payout.status = "pending";
            payout.paidAt = null;
            payout.paidBy = null;
            await payout.save().catch(() => { });
            return res.status(500).json({ ok: false, message: "Failed to create ledger transaction. payout reverted to pending.", error: txErr.message });
        }

        // --- Notify the guide ---
        try {
            const guide = await User.findById(payout.guideId).lean().catch(() => null);
            const tourDoc = await Tour.findById(payout.tourId).lean().catch(() => null);
            const tourName = tourDoc?.title || tourDoc?.name || `#${payout.tourId}`;

            await notifyUser({
                userId: payout.guideId,
                type: "payout:paid",
                content: `Yêu cầu thanh toán cho tour "${tourName}" ngày ${toYMD(payout.tourDate)} đã được trả: ${payout.payoutAmount}.`,
                url: `/guide/payouts/${payout._id}`,
                meta: {
                    payoutId: payout._id,
                    tourId: payout.tourId,
                    tourDate: toYMD(payout.tourDate),
                    amount: payout.payoutAmount,
                    transactionId: payout.transactionId || null,
                    paidBy: req.user ? (req.user.name || req.user._id) : null,
                    paidAt: payout.paidAt ? payout.paidAt.toISOString() : null,
                },
            }).catch((e) => {
                console.error("notifyUser payout:paid error:", e);
            });
        } catch (notifyErr) {
            console.error("markPayoutPaid: notify guide error:", notifyErr);
        }

        // --- Notify admins as well (optional) ---
        try {
            await notifyAdmins({
                type: "payout:paid_admin",
                content: `Payout ${String(payout._id)} paid for guide ${String(payout.guideId)}: ${payout.payoutAmount}.`,
                meta: {
                    payoutId: payout._id,
                    tourId: payout.tourId,
                    tourDate: toYMD(payout.tourDate),
                    amount: payout.payoutAmount,
                    paidBy: req.user ? (req.user.name || req.user._id) : null,
                    paidAt: payout.paidAt ? payout.paidAt.toISOString() : null,
                }
            }).catch(() => { });
        } catch (e) {
            console.error("markPayoutPaid: notifyAdmins error:", e);
        }

        return res.json({ ok: true, payout });
    } catch (err) {
        console.error("markPayoutPaid error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
}

/**
 * GET /api/admin/payouts
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

/**
 * GET /api/admin/payouts/preview
 */
export async function previewPayout(req, res) {
    try {
        const { tourId, tourDate } = req.query;
        if (!tourId || !tourDate) return res.status(400).json({ ok: false, message: "tourId & tourDate required" });

        const { totalNet, bookingIds } = await computeOccurrenceRevenue(tourId, tourDate);
        const guides = await getParticipatingGuides(tourId, tourDate);

        return res.json({ ok: true, tourId, tourDate, totalNet, bookingIds, guides });
    } catch (err) {
        console.error("previewPayout error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
}