import { Request, Response } from "express";

import { getDashboardStats } from "../services/dashboard.service.js";

export async function getStats(
    _req: Request,
    res: Response
) {
    try {
        const stats = await getDashboardStats();

        return res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error("API operation failed:", error instanceof Error ? error.name : "UnknownError");

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
        });
    }
}