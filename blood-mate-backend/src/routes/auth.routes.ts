import { Router } from "express";
import { loginRateLimiter } from "../middleware/rate-limit.middleware.js";
import { login } from "../controllers/auth.controller.js";

const router = Router();

router.post(
    "/login",
    loginRateLimiter,
    login
);

export default router;