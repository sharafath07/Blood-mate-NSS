import { Router } from "express";

import {
    generateWhatsApp,
} from "../controllers/whatsapp.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
    "/:requestId/:donorId",
    authenticate,
    generateWhatsApp
);

export default router;