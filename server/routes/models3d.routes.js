// server/routes/models3d.routes.js
import express from "express";
import ThreeDModel from "../models/ThreeDModel.js";

const router = express.Router();

/**
 * GET /api/models3d
 * Query params:
 *  - limit: number of models to return (default: 10)
 *  - locationId: filter by location
 */
router.get("/", async (req, res) => {
  try {
    const { limit = 10, locationId } = req.query;
    const filter = {};

    if (locationId) {
      filter.locationId = locationId;
    }

    const models = await ThreeDModel.find(filter)
      .populate("locationId", "name slug address images")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(models);
  } catch (err) {
    console.error("GET /api/models3d error:", err);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi lấy danh sách 3D models." });
  }
});

/**
 * GET /api/models3d/:id
 * Get single 3D model by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const model = await ThreeDModel.findById(id).populate(
      "locationId",
      "name slug address images"
    );

    if (!model) {
      return res.status(404).json({ message: "Không tìm thấy 3D model." });
    }

    res.json(model);
  } catch (err) {
    console.error("GET /api/models3d/:id error:", err);
    res.status(500).json({ message: "Lỗi máy chủ khi lấy 3D model." });
  }
});

export default router;
