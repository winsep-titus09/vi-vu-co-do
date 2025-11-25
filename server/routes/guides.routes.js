// Thay đổi: thêm import và route GET /bookings (đặt trong file routes/guides.routes.js)

import express from "express";
import { auth } from "../middleware/auth.js";
import { authorize } from "../middleware/auth.js";
import { applyGuide, getMyGuideApplication } from "../controllers/guideApplication.controller.js";
import { getMyGuideProfile, updateMyGuideProfile, uploadGuideVideo, getPublicGuideProfile, listFeaturedGuides, listTopRatedGuides } from "../controllers/guideProfile.controller.js";
import { getGuideBookings } from "../controllers/bookings.controller.js";
import { guideDashboard } from "../controllers/guides.dashboard.controller.js";

const router = express.Router();

router.post("/apply", auth, authorize("tourist"), applyGuide);
router.get("/apply/me", auth, getMyGuideApplication);

router.get("/profile/me", auth, authorize("guide"), getMyGuideProfile);
router.put("/profile/me", auth, authorize("guide"), uploadGuideVideo, updateMyGuideProfile);

// Guide-specific endpoints
router.get("/bookings", auth, authorize("guide"), getGuideBookings);

router.get("/featured", listFeaturedGuides);
router.get("/top-rated", listTopRatedGuides);
router.get("/profile/:guideId", getPublicGuideProfile);

router.get("/me/dashboard", auth, guideDashboard);

export default router;