import mongoose from "mongoose";
import Booking from "../../models/Booking.js";
import Tour from "../../models/Tour.js";

const ObjectId = mongoose.Types.ObjectId;

/**
 * Robust aggregation: handle common field name variants.
 */

// helper để tạo match điều kiện tour id (nhiều tên field)
function buildTourIdMatch(tourIdObj) {
    return {
        $or: [
            { tour_id: tourIdObj },
            { tourId: tourIdObj },
            { tour: tourIdObj }
        ]
    };
}

// helper để tạo điều kiện payment paid (nhiều tên field)
function buildPaidMatch() {
    return {
        $or: [
            { payment_status: "paid" },
            { status: "paid" },
            { "payment.session.status": "paid" },
            { "payment.status": "paid" },
            { payment_state: "paid" }
        ]
    };
}

// compute field paidAmount với fallback nhiều tên
function paidAmountExpr() {
    return {
        $ifNull: [
            "$paid_amount",
            {
                $ifNull: [
                    "$paidAmount",
                    {
                        $ifNull: [
                            "$total_price",
                            {
                                $ifNull: [
                                    "$totalPrice",
                                    0
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    };
}

// compute field tourDate with fallback names
function tourDateExpr() {
    return {
        $ifNull: [
            "$tour_date",
            {
                $ifNull: [
                    "$tourDate",
                    {
                        $ifNull: [
                            "$start_date",
                            null
                        ]
                    }
                ]
            }
        ]
    };
}

export const listToursRevenue = async (req, res) => {
    try {
        const { startDate, endDate, limit = 50, page = 1 } = req.query;

        // base match for "paid" bookings
        const paidMatch = buildPaidMatch();

        // optional date filter: we will filter by computed tourDate
        const dateFilters = {};
        if (startDate) dateFilters.$gte = new Date(startDate);
        if (endDate) dateFilters.$lte = new Date(endDate);

        const pipeline = [
            { $match: paidMatch },
            // add computed fields
            {
                $addFields: {
                    _paidAmount: paidAmountExpr(),
                    _tourDate: tourDateExpr()
                }
            },
            // optional date filtering on computed _tourDate
            ...(startDate || endDate ? [{ $match: { _tourDate: dateFilters } }] : []),
            // group by tour id candidates: prefer tour_id, then tourId, then tour
            {
                $group: {
                    _id: {
                        $ifNull: ["$tour_id", { $ifNull: ["$tourId", "$tour"] }]
                    },
                    totalRevenue: { $sum: "$_paidAmount" },
                    bookingsCount: { $sum: 1 }
                }
            },
            // lookup tour meta
            {
                $lookup: {
                    from: "tours",
                    localField: "_id",
                    foreignField: "_id",
                    as: "tour"
                }
            },
            { $unwind: { path: "$tour", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    tourId: "$_id",
                    title: "$tour.title",
                    totalRevenue: 1,
                    bookingsCount: 1
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $skip: (Number(page) - 1) * Number(limit) },
            { $limit: Number(limit) }
        ];

        const results = await Booking.aggregate(pipeline);
        return res.json({ ok: true, data: results });
    } catch (err) {
        console.error("listToursRevenue error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
};

export const getTourRevenue = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { groupBy, startDate, endDate } = req.query;

        if (!mongoose.isValidObjectId(tourId)) {
            return res.status(400).json({ ok: false, message: "Invalid tourId" });
        }

        const tour = await Tour.findById(tourId).select("_id title");
        if (!tour) return res.status(404).json({ ok: false, message: "Tour not found" });

        // FIX: create ObjectId instance with 'new'
        const tourIdObj = new ObjectId(tourId);

        const tourMatch = buildTourIdMatch(tourIdObj);
        const paidMatch = buildPaidMatch();

        // pipeline base
        const basePipeline = [
            { $match: { $and: [tourMatch, paidMatch] } },
            {
                $addFields: {
                    _paidAmount: paidAmountExpr(),
                    _tourDate: tourDateExpr()
                }
            }
        ];

        // apply date range filters on computed _tourDate
        if (startDate || endDate) {
            const f = {};
            if (startDate) f.$gte = new Date(startDate);
            if (endDate) f.$lte = new Date(endDate);
            basePipeline.push({ $match: { _tourDate: f } });
        }

        // total
        const totalPipeline = [
            ...basePipeline,
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$_paidAmount" },
                    bookingsCount: { $sum: 1 }
                }
            }
        ];
        const totalRes = await Booking.aggregate(totalPipeline);
        const totalRevenue = (totalRes[0] && totalRes[0].totalRevenue) || 0;
        const bookingsCount = (totalRes[0] && totalRes[0].bookingsCount) || 0;

        let byDate = [];
        if (groupBy === "date") {
            const byDatePipeline = [
                ...basePipeline,
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$_tourDate" } },
                        revenue: { $sum: "$_paidAmount" },
                        bookingsCount: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ];
            byDate = await Booking.aggregate(byDatePipeline);
        }

        return res.json({
            ok: true,
            tour: { id: tour._id, title: tour.title },
            totalRevenue,
            bookingsCount,
            byDate
        });
    } catch (err) {
        console.error("getTourRevenue error:", err);
        return res.status(500).json({ ok: false, message: "Server error", error: err.message });
    }
};