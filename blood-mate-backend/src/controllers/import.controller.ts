import type { Request, Response } from "express";

import {
    previewExcelFile,
    validateStudentsExcel,
    importStudentsFromExcel,
} from "../services/excel-import.service.js";

export async function previewStudentsExcel(
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

        const preview =
            previewExcelFile(req.file.path);

        res.status(200).json({
            success: true,
            data: preview,
        });
    } catch (error) {
        console.error(
            "Excel preview error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to read Excel file",
        });
    }
}

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

        const result =
            await importStudentsFromExcel(
                req.file.path
            );

        res.status(200).json({
            success: true,
            message:
                "Student import completed",
            data: result,
        });
    } catch (error) {
        console.error(
            "Excel import error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to import students",
        });
    }
}

export async function validateStudents(
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

        const result =
            await validateStudentsExcel(
                req.file.path
            );

        res.status(200).json({
            success: true,
            message:
                "Excel validation completed",
            data: result,
        });
    } catch (error) {
        console.error(
            "Excel validation error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to validate Excel file",
        });
    }
}