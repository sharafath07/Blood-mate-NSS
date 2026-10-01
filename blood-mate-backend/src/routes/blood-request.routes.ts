import { Router } from "express";

import {
    createRequest,
    getRequests,
    getRequestById,
    updateRequestStatus,
    deleteRequest,
} from "../controllers/blood-request.controller.js";

const router = Router();

router.post("/", createRequest);

router.get("/", getRequests);

router.get("/:id", getRequestById);

router.patch("/:id/status", updateRequestStatus);

router.delete("/:id", deleteRequest);

export default router;