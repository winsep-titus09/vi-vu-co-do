// utils/validator.js
import { z } from "zod";

export const updateProfileSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    phone_number: z
        .string()
        .regex(/^[0-9+()\s.-]{8,20}$/, "Số điện thoại không hợp lệ")
        .optional(),
    avatar_url: z.string().url().optional()
});
