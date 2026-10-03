import { Request, Response } from "express";

import {
    generateWhatsAppLink,
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

        const result = await generateWhatsAppLink(
            requestId,
            donorId
        );

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "REQUEST_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message: "Blood request not found",
            });
        }

        if (
            error instanceof Error &&
            error.message === "DONOR_NOT_FOUND"
        ) {
            return res.status(404).json({
                success: false,
                message: "Donor not found",
            });
        }

        if (
            error instanceof Error &&
            error.message === "DONOR_PHONE_NOT_FOUND"
        ) {
            return res.status(400).json({
                success: false,
                message: "Donor does not have a phone or WhatsApp number",
            });
        }

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate WhatsApp link",
        });
    }
}