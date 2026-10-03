import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { respondToBloodRequest } from "../controllers/donor-response.controller.js";

const router = Router();

router.post("/", authenticate, respondToBloodRequest);

export default router;