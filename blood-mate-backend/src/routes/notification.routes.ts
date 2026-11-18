import { Router } from "express";
import { z } from "zod";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { getContactHistory, recordContact } from "../services/notification.service.js";
import { RequestError } from "../utils/request-error.js";

const router = Router();
router.use(authenticate);
const contactInput = z.object({
    requestId: z.string().min(1).max(100),
    donorId: z.string().min(1).max(100),
    message: z.string().trim().min(1).max(1000),
});

router.get("/", async (req, res) => {
    const parsed = z.object({
        offset: z.coerce.number().int().min(0).max(1000000).default(0),
        limit: z.coerce.number().int().min(1).max(100).default(50),
    }).safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ success: false, message: "Invalid pagination" });
    try {
        return res.json({ success: true, data: await getContactHistory(parsed.data.offset, parsed.data.limit) });
    } catch (error) {
        console.error("Could not load contact history", error instanceof Error ? error.name : "");
        return res.status(500).json({ success: false, message: "Could not load contact history" });
    }
});

router.post("/", async (req: AuthenticatedRequest, res) => {
    const parsed = contactInput.safeParse(req.body);
    if (!req.user || !parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid contact record" });
    }
    try {
        const result = await recordContact({ ...parsed.data, recordedBy: req.user.userId });
        return res.status(201).json({ success: true, data: { id: result.id } });
    } catch (error) {
        if (error instanceof RequestError) {
            return res.status(error.status).json({ success: false, message: error.message });
        }
        console.error("Could not record contact", error instanceof Error ? error.name : "");
        return res.status(500).json({ success: false, message: "Could not record contact" });
    }
});

export default router;
