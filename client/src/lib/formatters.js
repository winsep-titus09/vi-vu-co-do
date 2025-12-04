// client/src/lib/formatters.js

/**
 * Helper to convert MongoDB Decimal128 to number
 * @param {any} val - Value to convert (can be Decimal128, string, or number)
 * @returns {number} Parsed number
 */
export const toNumber = (val) => {
  if (val?.$numberDecimal) return parseFloat(val.$numberDecimal);
  if (typeof val === "string") return parseFloat(val) || 0;
  return Number(val) || 0;
};

/**
 * Format date to Vietnamese locale
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format currency to VND
 * @param {number|object} amount - Amount to format (handles Decimal128)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  const num = toNumber(amount);
  if (!num) return "0đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

/**
 * Format price with simple format (e.g., "1.500.000đ")
 * @param {number|object} amount - Amount to format (handles Decimal128)
 * @returns {string} Formatted price string
 */
export const formatPrice = (amount) => {
  const num = toNumber(amount);
  if (!num) return "0đ";
  return num.toLocaleString("vi-VN") + "đ";
};

/**
 * Format number with thousand separators
 * @param {number|object} number - Number to format (handles Decimal128)
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  const num = toNumber(number);
  if (!num) return "0";
  return new Intl.NumberFormat("vi-VN").format(num);
};

/**
 * Format time ago (relative time)
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string in Vietnamese
 */
export const formatTimeAgo = (date) => {
  if (!date) return "";

  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  if (diffWeek < 4) return `${diffWeek} tuần trước`;
  if (diffMonth < 12) return `${diffMonth} tháng trước`;

  return past.toLocaleDateString("vi-VN");
};

/**
 * Format tour duration
 * Logic: ưu tiên duration_hours (giờ), fallback duration (ngày)
 * @param {object} tour - Tour object with duration_hours, duration, duration_unit
 * @returns {string} Formatted duration string
 */
export const formatTourDuration = (tour) => {
  if (!tour) return "N/A";
  
  // Ưu tiên duration_hours (đơn vị giờ)
  if (tour.duration_hours && tour.duration_hours > 0) {
    const hours = Number(tour.duration_hours);
    if (hours < 1) return `${Math.round(hours * 60)} phút`;
    if (hours % 1 === 0) return `${hours} giờ`;
    return `${hours.toFixed(1)} giờ`;
  }
  
  // Fallback: duration với duration_unit
  if (tour.duration && tour.duration > 0) {
    const unit = tour.duration_unit === "hours" ? "giờ" : "ngày";
    return `${tour.duration} ${unit}`;
  }
  
  return "N/A";
};
