import { Router } from "express";
import { UserRole } from "../generated/prisma/client.js";
import {
    createRequest,
    getRequests,
    getRequestById,
    updateRequestStatus,
    deleteRequest,
} from "../controllers/blood-request.controller.js";

import { authenticate, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, createRequest);
router.get("/", authenticate, getRequests);
router.get("/:id", authenticate, getRequestById);
router.patch("/:id/status", authenticate, updateRequestStatus);
router.delete(
    "/:id",
    authenticate,
    requireRole(UserRole.ADMIN),
    deleteRequest
);

export default router;