import { Request, Response } from "express";
import { DonorStatus } from "../generated/prisma/client.js";

import {
    getAllDonors,
    getDonorById,
    updateDonorStatus,
} from "../services/donor.service.js";

export async function getDonors(
    _req: Request,
    res: Response
) {
    try {
        const donors = await getAllDonors();

        return res.json({
            success: true,
            data: donors,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch donors",
        });
    }
}

export async function getDonor(
    req: Request,
    res: Response
) {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid donor ID",
            });
        }

        const donor = await getDonorById(id);

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: "Donor not found",
            });
        }

        return res.json({
            success: true,
            data: donor,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch donor",
        });
    }
}

export async function changeDonorStatus(
    req: Request,
    res: Response
) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid donor ID",
            });
        }

        if (!Object.values(DonorStatus).includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid donor status",
            });
        }

        const donor = await getDonorById(id);

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: "Donor not found",
            });
        }

        const updatedDonor = await updateDonorStatus(
            id,
            status
        );

        return res.json({
            success: true,
            message: "Donor status updated successfully",
            data: updatedDonor,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update donor status",
        });
    }
}