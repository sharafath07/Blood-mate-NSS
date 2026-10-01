import { Router } from "express";
import { respondToBloodRequest } from "../controllers/donor-response.controller.js";

const router = Router();

router.post("/", respondToBloodRequest);

export default router;