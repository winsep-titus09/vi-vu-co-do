import express from "express";
import { auth } from "../middleware/auth.js";
import { authorize } from "../middleware/auth.js";
import { applyGuide, getMyGuideApplication } from "../controllers/guideApplication.controller.js";
import { getMyGuideProfile, updateMyGuideProfile, uploadGuideVideo, getPublicGuideProfile } from "../controllers/guideProfile.controller.js";

const router = express.Router();

router.post("/apply", auth, authorize("tourist"), applyGuide);
router.get("/apply/me", auth, getMyGuideApplication);

router.get("/profile/me", auth, authorize("guide"), getMyGuideProfile);
router.put("/profile/me", auth, authorize("guide"), uploadGuideVideo, updateMyGuideProfile);

router.get("/profile/:guideId", getPublicGuideProfile);

export default router;