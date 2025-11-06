// server/utils/validator.js
import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const updateProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    phone_number: z
        .string()
        .regex(/^[0-9+()\s.-]{8,20}$/, "Số điện thoại không hợp lệ")
        .optional(),
    avatar_url: z.string().url().optional()
});

// === Location Category ===
export const createLocationCategorySchema = z.object({
    name: z.string().min(2, "Tên danh mục tối thiểu 2 ký tự").max(100, "Tên danh mục tối đa 100 ký tự").trim(),
});

export const updateLocationCategorySchema = z.object({
    name: z.string().min(2).max(100).trim().optional(),
});

// ----- Location -----
export const createLocationSchema = z.object({
    name: z.string().min(2).max(200),
    description: z.string().optional(),
    address: z.string().optional(),
    coords: z.object({
        // FE gửi { type:"Point", coordinates:[lng,lat] } hoặc chỉ gửi coordinates
        type: z.literal("Point").optional(),
        coordinates: z.tuple([z.number(), z.number()]),
    }),
    category_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "category_id không hợp lệ"),
    // media upload xử lý qua file, các field dưới đây optional khi update
    video_url: z.string().url().nullable().optional(),
    images: z.array(z.string().url()).optional().default([]),
});

export const updateLocationSchema = createLocationSchema.partial();

// ----- ThreeD model (khi tạo mới kèm Location) -----
export const createThreeDModelSchema = z.object({
    name: z.string().min(2).max(200),
    description: z.string().optional(),
    // file 3D upload qua multipart => buffer; ở body mình chỉ validate meta optional
}).partial();

// Update 3D (meta)
export const updateThreeDModelSchema = z.object({
    name: z.string().min(2).max(200).optional(),
    description: z.string().optional(),
    // nếu muốn thay file 3D sẽ xử lý qua multipart/files
});

// Tour Category
export const createTourCategorySchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    icon: z.string().nullable().optional(),
    cover_image_url: z.string().url().nullable().optional(),
    order: z.number().int().min(0).optional(),
    status: z.enum(["active", "inactive"]).optional(),
});

export const updateTourCategorySchema = createTourCategorySchema.partial();

// ----- Tour -----
const oid = z.string().regex(/^[0-9a-fA-F]{24}$/);

// Lịch khởi hành gửi kèm khi tạo Tour
export const departureItemSchema = z.object({
    start_date: z.string().or(z.date()),       // ISO date string hoặc Date
    end_date: z.string().or(z.date()).optional(),
    depart_from: z.string().optional(),        // nơi khởi hành (tuỳ schema TourDeparture của bạn)
    seat_quota: z.number().int().nonnegative().optional(),
    price_override: z.number().nonnegative().optional(),
});

// Tạo tour
export const createTourSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    duration: z.number().int().positive().default(1),
    price: z.number().nonnegative(),
    max_guests: z.number().int().nonnegative().default(0),

    category_id: oid.optional().nullable(),
    categories: z.array(oid).min(1).optional(),

    cover_image_url: z.string().url().nullable().optional(),
    gallery: z.array(z.string().url()).optional(),

    itinerary: z.array(z.object({
        day: z.number().int().positive(),
        title: z.string().min(1),
        details: z.string().optional(),
    })).optional(),

    featured: z.boolean().optional(),
    status: z.enum(["active", "inactive"]).optional(),

    guides: z.array(z.object({
        guideId: oid,
        isMain: z.boolean().optional(),
    })).optional(),

    locations: z.array(z.object({
        locationId: oid,
        order: z.number().int().nonnegative().optional(),
    })).min(1, "Cần chọn ít nhất 1 địa điểm"),

    // ---- NGÀY LINH HOẠT + GIỜ CỐ ĐỊNH ----
    allow_custom_date: z.boolean().default(true),
    fixed_departure_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ không hợp lệ (HH:mm)").default("08:00"),
    min_days_before_start: z.number().int().nonnegative().default(0),
    max_days_advance: z.number().int().nonnegative().default(180),
    closed_weekdays: z.array(z.number().int().min(0).max(6)).optional(),
    blackout_dates: z.array(z.union([z.string(), z.date()])).optional(),
    per_date_capacity: z.number().int().nonnegative().nullable().optional(),
});

// Update (partial)
export const updateTourSchema = createTourSchema.partial();

export const tourRequestDepartureSchema = z.object({
    // chấp nhận alias, sẽ map ở controller
    depart_date: z.union([z.string(), z.date()]).optional(),
    start_date: z.union([z.string(), z.date()]).optional(),
    end_date: z.union([z.string(), z.date()]).optional(),
    depart_from: z.string().optional(),
    seat_quota: z.number().int().nonnegative().optional(),
    price_override: z.number().nonnegative().optional(),
});

export const createTourRequestSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    duration: z.number().int().positive().default(1),
    price: z.number().nonnegative(),
    max_guests: z.number().int().nonnegative().default(0),

    category_id: oid.optional().nullable(),
    categories: z.array(oid).min(1, "Cần chọn ít nhất 1 danh mục").optional(),

    cover_image_url: z.string().url().nullable().optional(),
    gallery: z.array(z.string().url()).optional(),
    itinerary: z.array(z.object({
        day: z.number().int().positive(),
        title: z.string().min(1),
        details: z.string().optional(),
    })).optional(),

    locations: z.array(z.object({
        locationId: oid,
        order: z.number().int().nonnegative().optional(),
    })).min(1, "Cần chọn ít nhất 1 địa điểm"),

    // NGÀY LINH HOẠT + GIỜ CỐ ĐỊNH
    allow_custom_date: z.boolean().default(true),
    fixed_departure_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).default("08:00"),
    min_days_before_start: z.number().int().nonnegative().default(0),
    max_days_advance: z.number().int().nonnegative().default(180),
    closed_weekdays: z.array(z.number().int().min(0).max(6)).optional(),
    blackout_dates: z.array(z.union([z.string(), z.date()])).optional(),
    per_date_capacity: z.number().int().nonnegative().nullable().optional(),
});

export const updateTourRequestSchema = createTourRequestSchema.partial();