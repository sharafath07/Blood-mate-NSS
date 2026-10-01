import { Request, Response } from "express"; import {
    createBloodRequest,
    getAllBloodRequests,
    getBloodRequestById,
    updateBloodRequestStatus,
    deleteBloodRequest,
} from "../services/blood-request.service.js";

import {
    BloodGroup,
    RequestStatus,
} from "../generated/prisma/client.js";


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

export async function getRequests(
    _req: Request,
    res: Response
) {
    try {
        const requests = await getAllBloodRequests();

        res.json({
            success: true,
            data: requests,
        });
    } catch (error) {
        console.error("Get blood requests error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch blood requests",
        });
    }
}

export async function getRequestById(
    req: Request,
    res: Response
) {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid request ID",
            });
            return;
        }

        const request = await getBloodRequestById(id);

        if (!request) {
            res.status(404).json({
                success: false,
                message: "Blood request not found",
            });
            return;
        }

        res.json({
            success: true,
            data: request,
        });
    } catch (error) {
        console.error("Get blood request error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch blood request",
        });
    }
}

export async function updateRequestStatus(
    req: Request,
    res: Response
) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (typeof id !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid request ID",
            });
            return;
        }

        if (!Object.values(RequestStatus).includes(status)) {
            res.status(400).json({
                success: false,
                message: "Invalid request status",
            });
            return;
        }

        const request = await updateBloodRequestStatus(id, status);

        res.json({
            success: true,
            message: "Blood request status updated",
            data: request,
        });
    } catch (error) {
        console.error("Update blood request error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update blood request",
        });
    }
}

export async function deleteRequest(
    req: Request,
    res: Response
) {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid request ID",
            });
            return;
        }

        await deleteBloodRequest(id);

        res.json({
            success: true,
            message: "Blood request deleted successfully",
        });
    } catch (error) {
        console.error("Delete blood request error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete blood request",
        });
    }
}