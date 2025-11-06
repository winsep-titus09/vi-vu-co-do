import express from "express";
import { auth } from "../middleware/auth.js";
import {
    submitTourRequest,
    listMyTourRequests,
    updateTourRequest,
    deleteTourRequest,
    getTourRequest
} from "../controllers/tourRequests.controller.js";

const router = express.Router();

router.post("/", auth, submitTourRequest);
router.get("/mine", auth, listMyTourRequests);
router.get("/:id", auth, getTourRequest);              // owner có thể xem
router.patch("/:id", auth, updateTourRequest);         // chỉ pending
router.delete("/:id", auth, deleteTourRequest);        // chỉ pending

export default router;
