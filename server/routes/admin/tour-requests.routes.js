import express from "express";
import { auth } from "../../middleware/auth.js";
import {
    listPendingTourRequests,
    getTourRequest,
    approveTourRequest,
    rejectTourRequest
} from "../../controllers/tourRequests.controller.js";

const router = express.Router();

router.get("/tour-requests", auth, listPendingTourRequests);
router.get("/tour-requests/:id", auth, getTourRequest);
router.patch("/tour-requests/:id/approve", auth, approveTourRequest);
router.patch("/tour-requests/:id/reject", auth, rejectTourRequest);

export default router;
