// server/controllers/admin/models3d.controller.js
import mongoose from "mongoose";
import ThreeDModel from "../../models/ThreeDModel.js";
import Location from "../../models/Location.js";
import {
  uploadBufferToCloudinary,
  uploadRawBufferToCloudinary,
} from "../../services/uploader.js";
import { compressToUnder } from "../../services/imageCompressor.js";

/**
 * GET /api/admin/models3d
 * List all 3D models with pagination and filters
 */
export const listModels3D = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, locationId, file_type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (locationId) {
      filter.locationId = locationId;
    }
    if (file_type) {
      filter.file_type = file_type;
    }
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const [models, total] = await Promise.all([
      ThreeDModel.find(filter)
        .populate("locationId", "name slug address images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ThreeDModel.countDocuments(filter),
    ]);

    res.json({
      models,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error("listModels3D error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * POST /api/admin/models3d
 * Create new 3D model
 */
export const createModel3D = async (req, res) => {
  try {
    const { name, description, locationId, file_type = "panorama" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Tên mô hình là bắt buộc." });
    }

    if (!req.files?.model3d?.[0]) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn file mô hình 3D." });
    }

    // Validate location if provided
    if (locationId) {
      const location = await Location.findById(locationId);
      if (!location) {
        return res.status(400).json({ message: "Địa điểm không tồn tại." });
      }
    }

    // Upload 3D model file
    const modelFile = req.files.model3d[0];
    const originalName = modelFile.originalname.toLowerCase();
    let fileUrl, fileType;

    if (originalName.endsWith(".glb") || originalName.endsWith(".gltf")) {
      // Upload as raw file for GLB/GLTF
      const ext = originalName.split(".").pop();
      const uploaded = await uploadRawBufferToCloudinary(
        modelFile.buffer,
        "models3d/files",
        { allowed_formats: [ext] }
      );
      fileUrl = uploaded.secure_url;
      fileType = originalName.endsWith(".glb") ? "glb" : "gltf";
    } else {
      // Assume panorama image
      let buf = modelFile.buffer;
      if (buf.length > 10 * 1024 * 1024) {
        buf = await compressToUnder(buf);
      }
      const uploaded = await uploadBufferToCloudinary(
        buf,
        "models3d/panorama",
        {
          allowed_formats: ["jpg", "jpeg", "png"],
        }
      );
      fileUrl = uploaded.secure_url;
      fileType = "panorama";
    }

    // Upload thumbnail if provided
    let thumbnailUrl = null;
    if (req.files?.thumbnail?.[0]) {
      const thumbFile = req.files.thumbnail[0];
      let thumbBuf = thumbFile.buffer;
      if (thumbBuf.length > 5 * 1024 * 1024) {
        thumbBuf = await compressToUnder(thumbBuf, 5 * 1024 * 1024);
      }
      const thumbUploaded = await uploadBufferToCloudinary(
        thumbBuf,
        "models3d/thumbnails"
      );
      thumbnailUrl = thumbUploaded.secure_url;
    }

    const newModel = await ThreeDModel.create({
      name: name.trim(),
      description: description?.trim() || undefined,
      file_url: fileUrl,
      file_type: file_type || fileType,
      thumbnail_url: thumbnailUrl,
      locationId: locationId || undefined,
    });

    // Populate location for response
    const populatedModel = await ThreeDModel.findById(newModel._id).populate(
      "locationId",
      "name slug address images"
    );

    res.status(201).json({
      message: "Tạo mô hình 3D thành công",
      model: populatedModel,
    });
  } catch (err) {
    console.error("createModel3D error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * PUT /api/admin/models3d/:id
 * Update existing 3D model
 */
export const updateModel3D = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, locationId, file_type } = req.body;

    const model = await ThreeDModel.findById(id);
    if (!model) {
      return res.status(404).json({ message: "Không tìm thấy mô hình 3D." });
    }

    // Validate location if provided
    if (locationId) {
      const location = await Location.findById(locationId);
      if (!location) {
        return res.status(400).json({ message: "Địa điểm không tồn tại." });
      }
      model.locationId = locationId;
    } else if (locationId === null || locationId === "") {
      model.locationId = undefined;
    }

    // Update basic fields
    if (name !== undefined) model.name = name.trim();
    if (description !== undefined)
      model.description = description?.trim() || undefined;
    if (file_type !== undefined) model.file_type = file_type;

    // Upload new model file if provided
    if (req.files?.model3d?.[0]) {
      const modelFile = req.files.model3d[0];
      const originalName = modelFile.originalname.toLowerCase();

      if (originalName.endsWith(".glb") || originalName.endsWith(".gltf")) {
        const ext = originalName.split(".").pop();
        const uploaded = await uploadRawBufferToCloudinary(
          modelFile.buffer,
          "models3d/files",
          { allowed_formats: [ext] }
        );
        model.file_url = uploaded.secure_url;
        model.file_type = originalName.endsWith(".glb") ? "glb" : "gltf";
      } else {
        let buf = modelFile.buffer;
        if (buf.length > 10 * 1024 * 1024) {
          buf = await compressToUnder(buf);
        }
        const uploaded = await uploadBufferToCloudinary(
          buf,
          "models3d/panorama",
          {
            allowed_formats: ["jpg", "jpeg", "png"],
          }
        );
        model.file_url = uploaded.secure_url;
        model.file_type = "panorama";
      }
    }

    // Upload new thumbnail if provided
    if (req.files?.thumbnail?.[0]) {
      const thumbFile = req.files.thumbnail[0];
      let thumbBuf = thumbFile.buffer;
      if (thumbBuf.length > 5 * 1024 * 1024) {
        thumbBuf = await compressToUnder(thumbBuf, 5 * 1024 * 1024);
      }
      const thumbUploaded = await uploadBufferToCloudinary(
        thumbBuf,
        "models3d/thumbnails"
      );
      model.thumbnail_url = thumbUploaded.secure_url;
    }

    await model.save();

    // Populate location for response
    const populatedModel = await ThreeDModel.findById(model._id).populate(
      "locationId",
      "name slug address images"
    );

    res.json({
      message: "Cập nhật mô hình 3D thành công",
      model: populatedModel,
    });
  } catch (err) {
    console.error("updateModel3D error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

/**
 * DELETE /api/admin/models3d/:id
 * Delete 3D model
 */
export const deleteModel3D = async (req, res) => {
  try {
    const { id } = req.params;

    const model = await ThreeDModel.findById(id);
    if (!model) {
      return res.status(404).json({ message: "Không tìm thấy mô hình 3D." });
    }

    await model.deleteOne();

    res.json({ message: "Đã xóa mô hình 3D." });
  } catch (err) {
    console.error("deleteModel3D error:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};
