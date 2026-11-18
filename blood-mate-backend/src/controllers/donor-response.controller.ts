import type { Response } from "express";
import { z } from "zod";
import { ResponseStatus } from "../generated/prisma/client.js";
import { createDonorResponse } from "../services/donor-response.service.js";
import { RequestError } from "../utils/request-error.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

const responseInput = z.object({
    requestId: z.string().min(1).max(100),
    donorId: z.string().min(1).max(100),
    status: z.enum(ResponseStatus),
    donatedUnits: z.number().int().min(0).max(100).optional(),
});

export async function respondToBloodRequest(req: AuthenticatedRequest, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    const parsed = responseInput.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid donor response", issues: parsed.error.issues });
    }
    try {
        const data = await createDonorResponse({ ...parsed.data, recordedBy: req.user.userId });
        return res.json({ success: true, data });
    } catch (error) {
        if (error instanceof RequestError) {
            return res.status(error.status).json({ success: false, message: error.message });
        }
        console.error("Donor response failed", error instanceof Error ? error.name : "");
        return res.status(500).json({ success: false, message: "Failed to record donor response" });
    }
}
