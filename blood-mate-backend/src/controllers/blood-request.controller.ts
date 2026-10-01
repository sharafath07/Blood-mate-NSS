import { Request, Response } from "express";
import { BloodGroup } from "../generated/prisma/client.js";
import { createBloodRequest } from "../services/blood-request.service.js";

export async function createRequest(req: Request, res: Response) {
    try {
        const {
            patientName,
            bystanderName,
            bystanderPhone,
            hospital,
            location,
            bloodGroup,
            units,
            requiredAt,
            requesterId,
        } = req.body;

        if (
            !patientName ||
            !bystanderName ||
            !bystanderPhone ||
            !bloodGroup ||
            !requesterId
        ) {
            res.status(400).json({
                success: false,
                message:
                    "patientName, bystanderName, bystanderPhone, bloodGroup and requesterId are required",
            });
            return;
        }

        if (!Object.values(BloodGroup).includes(bloodGroup)) {
            res.status(400).json({
                success: false,
                message: "Invalid blood group",
            });
            return;
        }

        const request = await createBloodRequest({
            patientName,
            bystanderName,
            bystanderPhone,
            hospital,
            location,
            bloodGroup,
            units,
            requiredAt: requiredAt ? new Date(requiredAt) : undefined,
            requesterId,
        });

        res.status(201).json({
            success: true,
            message: "Blood request created successfully",
            data: request,
        });
    } catch (error) {
        console.error("Blood request creation error:", error);

        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to create blood request",
        });
    }
}