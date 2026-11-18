import { Request, Response } from "express";
import { RequestError } from "../utils/request-error.js";

import {
    generateWhatsAppLink,
    getWhatsAppContact,
} from "../services/whatsapp.service.js";

export async function generateWhatsApp(
    req: Request,
    res: Response
) {
    try {
        const { requestId, donorId } = req.params;

        if (
            typeof requestId !== "string" ||
            typeof donorId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid request or donor ID",
            });
        }

        if (req.query.format === "contact") {
            const { donor } = await getWhatsAppContact(requestId, donorId);
            return res.json({ success: true, data: { phone: donor.phone } });
        }

        const result = await generateWhatsAppLink(requestId, donorId);

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof RequestError) {
            return res.status(error.status).json({ success: false, message: error.message });
        }

        console.error("API operation failed:", error instanceof Error ? error.name : "UnknownError");

        return res.status(500).json({
            success: false,
            message: "Failed to generate WhatsApp link",
        });
    }
}
