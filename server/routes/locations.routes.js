// server/routes/locations.routes.js
import express from "express";
import mongoose from "mongoose";
import {
  listLocations,
  getLocation,
  getLocationBySlug,
  listLocationCategories,
} from "../controllers/locations.controller.js";

const router = express.Router();

// PUBLIC
router.get("/", listLocations);
router.get("/categories", listLocationCategories); // Must come before /:token
router.get("/:token", (req, res, next) => {
  const { token } = req.params;
  const isOid = mongoose.isValidObjectId(token);

  console.log("[locations] dispatch /:token =", token, "isOid =", isOid);

  if (isOid) {
    req.params.id = token; // chuyển tiếp cho controller lấy theo id
    console.log("[locations] -> getLocation (by id)");
    return getLocation(req, res, next);
  }

  req.params.slug = token; // chuyển tiếp cho controller lấy theo slug
  console.log("[locations] -> getLocationBySlug (by slug)");
  return getLocationBySlug(req, res, next);
});

export default router;
