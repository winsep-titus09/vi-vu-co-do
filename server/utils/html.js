// utilities for simple HTML processing used by articles controller

/**
 * Remove <img ...> tags from HTML and return plain text (no tags).
 * - Used to generate excerpt/preview from content_html.
 * - This is a simple implementation; keep sanitize-html for robust sanitization.
 */
export function stripImageTags(html = "") {
    if (!html) return "";
    // Remove <img ...> tags
    const noImgs = String(html).replace(/<img[\s\S]*?>/gi, "");
    // Remove any remaining HTML tags to produce plain-text excerpt
    const plain = noImgs.replace(/<\/?[^>]+(>|$)/g, "");
    // Collapse whitespace
    return plain.replace(/\s+/g, " ").trim();
}

/**
 * Truncate string to length with ellipsis.
 */
export function excerptText(text = "", limit = 300) {
    const s = String(text || "").trim();
    if (s.length <= limit) return s;
    return s.slice(0, limit).trim() + "...";
}

/**
 * Extract image URLs from content HTML (simple)
 * returns array of src values in order found.
 */
export function extractImageUrls(html = "") {
    const res = [];
    if (!html) return res;
    const re = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
    let m;
    while ((m = re.exec(html))) {
        res.push(m[1]);
    }
    return res;
}