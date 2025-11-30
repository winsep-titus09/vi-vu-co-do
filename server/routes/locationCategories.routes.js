// server/routes/locationCategories.routes.js
import express from "express";
import { listCategories, getCategory } from "../controllers/locationCategories.controller.js";

const router = express.Router();

// PUBLIC
router.get("/", listCategories);
router.get("/:id", getCategory);

export default router;
