// server/controllers/categories.controller.js
import TourCategory from "../models/TourCategory.js";

/**
 * GET /api/tours/categories
 * Get all active tour categories
 */
export const listCategories = async (req, res) => {
  try {
    const categories = await TourCategory.find({ status: "active" })
      .select("name slug description icon cover_image_url order")
      .sort({ order: 1, name: 1 })
      .lean();

    return res.json({ categories });
  } catch (err) {
    console.error("listCategories error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * GET /api/tours/categories/:slug
 * Get single category by slug
 */
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await TourCategory.findOne({ slug, status: "active" })
      .select("name slug description icon cover_image_url")
      .lean();

    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục." });
    }

    return res.json(category);
  } catch (err) {
    console.error("getCategoryBySlug error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};
