import { Router } from "express";
import {
    getDonors,
    getDonor,
    changeDonorStatus,
} from "../controllers/donor.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getDonors);
router.get("/:id", authenticate, getDonor);
router.patch("/:id/status", authenticate, changeDonorStatus);

export default router;