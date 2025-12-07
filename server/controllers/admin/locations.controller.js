import mongoose from "mongoose";
import Location from "../../models/Location.js";
import LocationCategory from "../../models/LocationCategory.js";
import ThreeDModel from "../../models/ThreeDModel.js";
import {
    createLocationSchema,
    updateLocationSchema,
    createThreeDModelSchema,
    updateThreeDModelSchema,
} from "../../utils/validator.js";
import {
    uploadBufferToCloudinary,
    uploadVideoBufferToCloudinary,
    uploadRawBufferToCloudinary,
    deleteFromCloudinary,
} from "../../services/uploader.js";
import { compressToUnder } from "../../services/imageCompressor.js"; // ✅ helper mới

/** Tạo Location (ảnh/video/3D là tùy chọn) */
export const createLocation = async (req, res) => {
    try {
        const normalizeBody = {
            ...req.body,
            coords: req.body.coords
                ? (typeof req.body.coords === "string"
                    ? JSON.parse(req.body.coords)
                    : req.body.coords)
                : undefined,
            highlights: req.body.highlights
                ? (typeof req.body.highlights === "string"
                    ? JSON.parse(req.body.highlights)
                    : req.body.highlights)
                : undefined,
        };
        // parse body
        const parsed = createLocationSchema.safeParse(normalizeBody);
        if (!parsed.success) {
            const msg = parsed.error.issues.map(i => i.message).join("; ");
            return res.status(400).json({ message: msg });
        }
        const data = parsed.data;

        // check category
        const cat = await LocationCategory.findById(data.category_id);
        if (!cat) return res.status(400).json({ message: "Danh mục không tồn tại." });

        // upload images (field: images[])
        const imageUrls = [];
        if (req.files?.images?.length) {
            for (const f of req.files.images) {
                const up = await uploadBufferToCloudinary(f.buffer, "locations/images");
                imageUrls.push(up.secure_url);
            }
        }

        // upload video (field: video)
        let videoUrl = null;
        if (req.files?.video?.[0]) {
            const v = req.files.video[0];
            const upv = await uploadVideoBufferToCloudinary(v.buffer, "locations/videos");
            videoUrl = upv.secure_url;
        }

        // create location
        const loc = await Location.create({
            name: data.name,
            description: data.description,
            address: data.address,
            coords: {
                type: "Point",
                coordinates: data.coords.coordinates,
            },
            images: imageUrls,
            video_url: videoUrl,
            category_id: data.category_id,
            opening_hours: data.opening_hours,
            ticket_price: data.ticket_price,
            ticket_price_currency: data.ticket_price_currency,
            best_visit_time: data.best_visit_time,
            highlights: data.highlights,
        });

        // Optional: create one 3D panorama together (supports both model3d and panorama fields)
        let createdModel = null;
        const panoramaFile = req.files?.model3d?.[0] || req.files?.panorama?.[0];
        if (panoramaFile) {
            const rawMeta = req.body?.threeD || {};
            const normalizeMeta = {
                name: Array.isArray(rawMeta.name) ? rawMeta.name[0] : rawMeta.name,
                description: Array.isArray(rawMeta.description)
                    ? rawMeta.description[0]
                    : rawMeta.description,
            };
            const meta = createThreeDModelSchema.safeParse(normalizeMeta);

            let buf = panoramaFile.buffer;

            // ✅ nén nếu >10MB
            if (buf.length > 10 * 1024 * 1024) buf = await compressToUnder(buf);

            const up3d = await uploadBufferToCloudinary(
                buf,
                "models3d/panorama",
                { allowed_formats: ["jpg", "jpeg", "png"] }
            );

            createdModel = await ThreeDModel.create({
                name: meta.success && meta.data.name ? meta.data.name : `${loc.name} 360°`,
                description: meta.success ? meta.data.description : undefined,
                file_url: up3d.secure_url,
                file_type: "panorama",
                locationId: loc._id,
            });
        }

        return res
            .status(201)
            .json({ message: "Tạo địa điểm thành công", location: loc, threeD: createdModel });
    } catch (err) {
        console.error("createLocation error:", err);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** Cập nhật Location */
export const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const normalizeBody = {
            ...req.body,
            coords: req.body.coords
                ? (typeof req.body.coords === "string"
                    ? JSON.parse(req.body.coords)
                    : req.body.coords)
                : undefined,
            highlights: req.body.highlights
                ? (typeof req.body.highlights === "string"
                    ? JSON.parse(req.body.highlights)
                    : req.body.highlights)
                : undefined,
        };

        const parsed = updateLocationSchema.safeParse(normalizeBody);
        if (!parsed.success) {
            const msg = parsed.error.issues.map(i => i.message).join("; ");
            return res.status(400).json({ message: msg });
        }
        const data = parsed.data;

        const loc = await Location.findById(id);
        if (!loc) return res.status(404).json({ message: "Không tìm thấy địa điểm." });

        if (data.category_id) {
            const cat = await LocationCategory.findById(data.category_id);
            if (!cat) return res.status(400).json({ message: "Danh mục không tồn tại." });
            loc.category_id = data.category_id;
        }
        if (data.name !== undefined) loc.name = data.name;
        if (data.description !== undefined) loc.description = data.description;
        if (data.address !== undefined) loc.address = data.address;
        if (data.coords?.coordinates) {
            loc.coords = { type: "Point", coordinates: data.coords.coordinates };
        }
        if (data.opening_hours !== undefined) loc.opening_hours = data.opening_hours;
        if (data.ticket_price !== undefined) loc.ticket_price = data.ticket_price;
        if (data.ticket_price_currency !== undefined) loc.ticket_price_currency = data.ticket_price_currency;
        if (data.best_visit_time !== undefined) loc.best_visit_time = data.best_visit_time;
        if (data.highlights !== undefined) loc.highlights = data.highlights;

        // append new images
        if (req.files?.images?.length) {
            for (const f of req.files.images) {
                const up = await uploadBufferToCloudinary(f.buffer, "locations/images");
                loc.images.push(up.secure_url);
            }
        }

        // replace video (optional)
        if (req.files?.video?.[0]) {
            const v = req.files.video[0];
            const upv = await uploadVideoBufferToCloudinary(v.buffer, "locations/videos");
            loc.video_url = upv.secure_url;
        }

        // upload new panorama (optional)
        if (req.files?.panorama?.[0]) {
            const panoramaFile = req.files.panorama[0];
            let buf = panoramaFile.buffer;
            if (buf.length > 10 * 1024 * 1024) buf = await compressToUnder(buf);

            const upPano = await uploadBufferToCloudinary(
                buf,
                "models3d/panorama",
                { allowed_formats: ["jpg", "jpeg", "png"] }
            );

            // Create or update panorama model for this location
            const existingPanorama = await ThreeDModel.findOne({
                locationId: loc._id,
                file_type: "panorama"
            });

            if (existingPanorama) {
                existingPanorama.file_url = upPano.secure_url;
                await existingPanorama.save();
            } else {
                await ThreeDModel.create({
                    name: `${loc.name} 360°`,
                    file_url: upPano.secure_url,
                    file_type: "panorama",
                    locationId: loc._id,
                });
            }
        }

        await loc.save();
        res.json({ message: "Cập nhật địa điểm thành công", location: loc });
    } catch (err) {
        console.error("updateLocation error:", err);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** Xóa Location + model 3D liên kết */
export const deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const loc = await Location.findById(id);
        if (!loc) return res.status(404).json({ message: "Không tìm thấy địa điểm." });

        await ThreeDModel.deleteMany({ locationId: id });
        await loc.deleteOne();
        res.json({ message: "Đã xóa địa điểm." });
    } catch (err) {
        console.error("deleteLocation error:", err);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** Tạo/Upload ảnh panorama 3D cho Location */
export const createThreeDForLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const loc = await Location.findById(id);
        if (!loc) return res.status(404).json({ message: "Không tìm thấy địa điểm." });
        if (!req.files?.model3d?.[0])
            return res.status(400).json({ message: "Thiếu file 'model3d'." });

        const rawMeta = req.body || {};
        const normalizeMeta = {
            name: Array.isArray(rawMeta.name) ? rawMeta.name[0] : rawMeta.name,
            description: Array.isArray(rawMeta.description)
                ? rawMeta.description[0]
                : rawMeta.description,
        };
        const meta = createThreeDModelSchema.safeParse(normalizeMeta);

        const mfile = req.files.model3d[0];
        let buf = mfile.buffer;
        if (buf.length > 10 * 1024 * 1024) buf = await compressToUnder(buf);

        const up = await uploadBufferToCloudinary(
            buf,
            "locations/panorama",
            { allowed_formats: ["jpg", "jpeg", "png"] }
        );

        const doc = await ThreeDModel.create({
            name: meta.data?.name || `${loc.name} 360°`,
            description: meta.data?.description,
            file_url: up.secure_url,
            file_type: "panorama",
            locationId: loc._id,
        });

        res.status(201).json({ message: "Đã thêm model 3D", threeD: doc });
    } catch (err) {
        console.error("createThreeDForLocation error:", err);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** Cập nhật model 3D (ảnh panorama) */
export const updateThreeDForLocation = async (req, res) => {
    try {
        const { id, modelId } = req.params;
        const loc = await Location.findById(id);
        if (!loc) return res.status(404).json({ message: "Không tìm thấy địa điểm." });

        const parsed = updateThreeDModelSchema.safeParse(req.body || {});
        if (!parsed.success) {
            const msg = parsed.error.issues.map(i => i.message).join("; ");
            return res.status(400).json({ message: msg });
        }

        const update = { ...parsed.data };

        // nếu có thay file mới
        if (req.files?.model3d?.[0]) {
            const mfile = req.files.model3d[0];
            let buf = mfile.buffer;
            if (buf.length > 10 * 1024 * 1024) buf = await compressToUnder(buf);

            const up = await uploadBufferToCloudinary(
                buf,
                "locations/panorama",
                { allowed_formats: ["jpg", "jpeg", "png"] }
            );
            update.file_url = up.secure_url;
            update.file_type = "panorama";
        }

        const doc = await ThreeDModel.findOneAndUpdate(
            { _id: modelId, locationId: id },
            { $set: update },
            { new: true }
        );
        if (!doc) return res.status(404).json({ message: "Không tìm thấy model 3D." });

        res.json({ message: "Đã cập nhật model 3D", threeD: doc });
    } catch (err) {
        console.error("updateThreeDForLocation error:", err);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};

/** Xóa model 3D */
export const deleteThreeDForLocation = async (req, res) => {
    try {
        const { id, modelId } = req.params;
        const doc = await ThreeDModel.findOneAndDelete({ _id: modelId, locationId: id });
        if (!doc) return res.status(404).json({ message: "Không tìm thấy model 3D." });
        res.json({ message: "Đã xóa model 3D." });
    } catch (err) {
        console.error("deleteThreeDForLocation error:", err);
        res.status(500).json({ message: "Lỗi máy chủ." });
    }
};
