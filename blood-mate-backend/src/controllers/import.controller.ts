import type { Request, Response } from "express";
import { importStudentsFromExcel } from "../services/excel-import.service.js";

export async function importStudents(
    req: Request,
    res: Response
) {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: "Excel file is required",
            });

            return;
        }

        const result = await importStudentsFromExcel(
            req.file.path
        );

        res.status(200).json({
            success: true,
            message: "Student import completed",
            data: result,
        });
    } catch (error) {
        console.error("Excel import error:", error);

        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to import students",
        });
    }
}