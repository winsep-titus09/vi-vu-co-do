import express from "express";
import { auth } from "../../middleware/auth.js";
import { authorize } from "../../middleware/auth.js";
import {
    adminListGuideApplications,
    adminGetGuideApplication,
    adminReviewGuideApplication
} from "../../controllers/guideApplication.controller.js";

const router = express.Router();

router.get("/", auth, authorize("admin"), adminListGuideApplications);
router.get("/:id", auth, authorize("admin"), adminGetGuideApplication);
router.patch("/:id/status", auth, authorize("admin"), adminReviewGuideApplication);

export default router;