// server/helpers/date.helper.js
// Date/time helpers: parse input, add hours, format Y-M-D string.
// Use UTC internal Date objects; toDateOrNull accepts YYYY-MM-DD (legacy) or full ISO datetime.

export function toDateOrNull(input) {
    if (!input) return null;
    // YYYY-MM-DD (date-only) => preserve previous behavior: interpret as start of day in +07:00
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
        return new Date(`${input}T00:00:00+07:00`);
    }
    const t = Date.parse(input);
    if (!Number.isNaN(t)) return new Date(t);
    return null;
}

export function addHours(d, hours) {
    if (!d) return null;
    const x = new Date(d);
    x.setTime(x.getTime() + Math.round(Number(hours || 0) * 3600 * 1000));
    return x;
}

// Return "YYYY-MM-DD" in Asia/Ho_Chi_Minh (useful for grouping by local date)
export function toYMDLocal(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
}

// Normalize a Date to the start of day (UTC)
export function startOfDayUTC(date) {
    if (!date) return null;
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
}