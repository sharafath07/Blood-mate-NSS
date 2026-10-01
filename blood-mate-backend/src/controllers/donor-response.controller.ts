import { Request, Response } from "express";
import { ResponseStatus } from "../generated/prisma/client.js";
import { createDonorResponse } from "../services/donor-response.service.js";

export async function respondToBloodRequest(
    req: Request,
    res: Response
) {
    try {
        const { requestId, donorId, status } = req.body;

        if (!requestId || !donorId || !status) {
            res.status(400).json({
                success: false,
                message: "requestId, donorId and status are required",
            });
            return;
        }

        if (!Object.values(ResponseStatus).includes(status)) {
            res.status(400).json({
                success: false,
                message: "Invalid response status",
            });
            return;
        }

        if (
            status !== ResponseStatus.ACCEPTED &&
            status !== ResponseStatus.DECLINED
        ) {
            res.status(400).json({
                success: false,
                message: "Donor can only respond with ACCEPTED or DECLINED",
            });
            return;
        }

        const response = await createDonorResponse({
            requestId,
            donorId,
            status,
        });

        res.status(201).json({
            success: true,
            message: "Donor response recorded successfully",
            data: response,
        });
    } catch (error) {
        console.error("Donor response error:", error);

        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to record donor response",
        });
    }
}