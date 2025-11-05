// server/utils/validator.js
import { z } from "zod";

export const updateProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    phone_number: z
        .string()
        .regex(/^[0-9+()\s.-]{8,20}$/, "Số điện thoại không hợp lệ")
        .optional(),
    avatar_url: z.string().url().optional()
});

// === BỔ SUNG MỚI ===
export const createTourSchema = z.object({
    name: z.string().min(3).max(200),
    description: z.string().optional(),
    duration: z.number().int().positive().optional().default(1),
    price: z.union([z.number().positive(), z.string().regex(/^\d+(\.\d+)?$/)]),
    max_guests: z.number().int().nonnegative().optional().default(0),

    category_id: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    cover_image_url: z.string().url().nullable().optional(),
    gallery: z.array(z.string().url()).optional().default([]),

    itinerary: z.array(
        z.object({
            day: z.number().int().positive(),
            title: z.string().min(1),
            details: z.string().optional()
        })
    ).optional().default([]),

    featured: z.boolean().optional().default(false),
    status: z.enum(["active", "inactive"]).optional().default("active"),
    free_under_age: z.number().int().nonnegative().optional().default(11),

    // Khi admin tạo, có thể truyền sẵn danh sách HDV cho tour (optional)
    guides: z.array(
        z.object({
            guideId: z.string().regex(/^[0-9a-fA-F]{24}$/),
            isMain: z.boolean().optional().default(false)
        })
    ).optional().default([]),

    // locations optional
    locations: z.array(
        z.object({
            locationId: z.string().regex(/^[0-9a-fA-F]{24}$/),
            order: z.number().int().nonnegative().optional()
        })
    ).optional().default([])
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