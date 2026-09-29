import { Router } from "express";

import {
    createRequest,
} from "../controllers/blood-request.controller.js";

const router = Router();

router.post(
    "/",
    createRequest
);

export default router;