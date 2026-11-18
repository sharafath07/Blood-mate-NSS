import type { Request, Response } from "express";
import { unlink } from "node:fs/promises";
import { importStudentsFromExcel, previewExcelFile, validateStudentsExcel } from "../services/excel-import.service.js";
import { RequestError } from "../utils/request-error.js";

function workbookAction(processWorkbook: (path: string) => unknown | Promise<unknown>) {
    return async (req: Request, res: Response) => {
        const file = req.file;
        if (!file) return res.status(400).json({ success: false, message: "Excel file is required" });

        try {
            const data = await processWorkbook(file.path);
            return res.json({ success: true, data });
        } catch (error) {
            if (error instanceof RequestError) {
                return res.status(error.status).json({ success: false, message: error.message });
            }
            console.error("Excel operation failed", error instanceof Error ? error.name : "UnknownError");
            return res.status(500).json({ success: false, message: "Unable to process the workbook" });
        } finally {
            await unlink(file.path).catch(() => undefined);
        }
    };
}

export const previewStudentsExcel = workbookAction(previewExcelFile);
export const validateStudents = workbookAction(validateStudentsExcel);
export const importStudents = workbookAction(importStudentsFromExcel);
