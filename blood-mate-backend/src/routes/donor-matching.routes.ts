import { Router } from "express";
import { getMatchedDonors } from "../controllers/donor-matching.controller.js";

const router = Router();

router.get("/:requestId", getMatchedDonors);

export default router;