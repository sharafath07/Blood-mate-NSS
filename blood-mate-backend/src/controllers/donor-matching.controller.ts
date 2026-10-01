import { Request, Response } from "express";
import { BloodGroup } from "../generated/prisma/client.js";
import prisma from "../config/database.js";
import { findDonorsByBloodGroup } from "../services/donor-matching.service.js";

export async function getMatchedDonors(
    req: Request,
    res: Response
) {
    try {
        const { requestId } = req.params;

        if (typeof requestId !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid request ID",
            });
            return;
        }

        const request = await prisma.bloodRequest.findUnique({
            where: {
                id: requestId,
            },
            select: {
                id: true,
                bloodGroup: true,
                units: true,
                status: true,
            },
        });

        if (!request) {
            res.status(404).json({
                success: false,
                message: "Blood request not found",
            });
            return;
        }

        const donors = await findDonorsByBloodGroup(
            request.bloodGroup as BloodGroup
        );

        res.json({
            success: true,
            data: {
                request,
                donors,
                totalDonors: donors.length,
            },
        });
    } catch (error) {
        console.error("Donor matching error:", error);

        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to find matching donors",
        });
    }
}