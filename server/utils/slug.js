// utils/slug.js
import slugify from "slugify";

// Đảm bảo mapping 'đ/Đ' => 'd/D' giống cách đang dùng trong tours.controller.js
let extended = false;
function ensureExtend() {
    if (!extended) {
        slugify.extend({ "đ": "d", "Đ": "D" });
        extended = true;
    }
}

/**
 * Chuyển chuỗi về slug (lowercase, strict, locale vi)
 */
export function toSlug(text) {
    ensureExtend();
    return slugify(String(text || ""), { lower: true, strict: true, locale: "vi" });
}

/**
 * Sinh slug duy nhất dựa trên name/base cho một Model (thêm hậu tố -2, -3... nếu trùng)
 */
export async function makeUniqueSlug(Model, nameOrBase) {
    const base = toSlug(nameOrBase);
    let slug = base, i = 2;
    // Lặp đến khi không còn xung đột
    // eslint-disable-next-line no-await-in-loop
    while (await Model.exists({ slug })) slug = `${base}-${i++}`;
    return slug;
}

/**
 * Đảm bảo slug là duy nhất cho Model với baseSlug đã cho (phục vụ khi cập nhật với excludeId)
 * @param {import('mongoose').Model} Model
 * @param {string} baseSlug đầu vào đã/hoặc chưa slugify
 * @param {string|import('mongoose').Types.ObjectId} [excludeId] _id cần bỏ qua (khi update)
 * @returns {Promise<string>}
 */
export async function ensureUniqueSlug(Model, baseSlug, excludeId) {
    const base = toSlug(baseSlug || "item");
    let slug = base, i = 2;
    // eslint-disable-next-line no-await-in-loop
    while (await Model.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
        slug = `${base}-${i++}`;
    }
    return slug;
}