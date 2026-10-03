import { Router } from "express";

import {
    getDonors,
    getDonor,
    changeDonorStatus,
} from "../controllers/donor.controller.js";

const router = Router();

router.get("/", getDonors);
router.get("/:id", getDonor);
router.patch("/:id/status", changeDonorStatus);

export default router;