import express from "express";
import { auth } from "../../middleware/auth.js";
import {
    listPendingTourRequests,
    getTourRequest,
    approveTourRequest,
    rejectTourRequest
} from "../../controllers/tourRequests.controller.js";

const router = express.Router();

// Support both:
//  - mounted base: /api/admin/tour-requests  -> then use routes like / (list), /:id/approve
//  - legacy / duplicated prefix: /api/admin/tour-requests/tour-requests -> keep compatibility

// LIST & GET (both / and /tour-requests)
router.get("/", auth, listPendingTourRequests);
router.get("/tour-requests", auth, listPendingTourRequests);

// Single request
router.get("/:id", auth, getTourRequest);
router.get("/tour-requests/:id", auth, getTourRequest);

// Approve / Reject (support both short and prefixed URLs)
router.patch("/:id/approve", auth, approveTourRequest);
router.patch("/tour-requests/:id/approve", auth, approveTourRequest);

router.patch("/:id/reject", auth, rejectTourRequest);
router.patch("/tour-requests/:id/reject", auth, rejectTourRequest);

export default router;