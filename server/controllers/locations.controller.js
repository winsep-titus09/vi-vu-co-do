// server/controllers/locations.controller.js
import mongoose from "mongoose";
import Location from "../models/Location.js";
import LocationCategory from "../models/LocationCategory.js";
import ThreeDModel from "../models/ThreeDModel.js";

/** GET /api/locations
 *  Query:
 *   - q: tìm theo tên
 *   - category_id: lọc theo danh mục
 */
export const listLocations = async (req, res) => {
  try {
    const { q, category_id } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: "i" };
    if (category_id) filter.category_id = category_id;

    const docs = await Location.find(filter)
      .populate("category_id", "name")
      .sort({ createdAt: -1 });

    res.json(docs);
  } catch (err) {
    console.error("listLocations error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/** GET /api/locations/:id  — kèm model 3D (nếu có) */
export const getLocation = async (req, res) => {
  try {
    const { id } = req.params;
    // rào thêm cho chắc (dù đã dispatch ở routes)
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const loc = await Location.findById(id).populate("category_id", "name");
    if (!loc)
      return res.status(404).json({ message: "Không tìm thấy địa điểm." });

    const models = await ThreeDModel.find({ locationId: loc._id }).sort({
      createdAt: -1,
    });
    return res.json({ ...loc.toObject(), threeDModels: models });
  } catch (err) {
    console.error("getLocation error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/** GET /api/locations/:slug  — (dispatch từ routes) */
export const getLocationBySlug = async (req, res) => {
  try {
    const { slug } = req.params; // ✅ chỉ dùng slug, không đụng đến id ở đây

    const loc = await Location.findOne({ slug }).populate(
      "category_id",
      "name"
    );
    if (!loc)
      return res.status(404).json({ message: "Không tìm thấy địa điểm." });

    const models = await ThreeDModel.find({ locationId: loc._id }).sort({
      createdAt: -1,
    });
    return res.json({ ...loc.toObject(), threeDModels: models });
  } catch (err) {
    console.error("getLocationBySlug error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/** GET /api/locations/categories - List all location categories */
export const listLocationCategories = async (req, res) => {
  try {
    const categories = await LocationCategory.find({}).sort({ name: 1 });

    return res.json(categories);
  } catch (err) {
    console.error("listLocationCategories error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ." });
  }
};
