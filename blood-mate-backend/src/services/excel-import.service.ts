import * as XLSX from "xlsx";
import prisma from "../config/database.js";
import { normalizeBloodGroup } from "../utils/blood-group.util.js";

export interface ImportResult {
    totalRows: number;
    imported: number;
    skipped: number;
    errors: {
        row: number;
        message: string;
    }[];
}

export async function importStudentsFromExcel(
    filePath: string
): Promise<ImportResult> {
    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
        throw new Error("Excel file does not contain a worksheet");
    }

    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        worksheet,
        {
            defval: null,
        }
    );

    const result: ImportResult = {
        totalRows: rows.length,
        imported: 0,
        skipped: 0,
        errors: [],
    };

    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const excelRow = index + 2;

        try {
            /*
             * TEMPORARY column mapping.
             *
             * We will replace these after inspecting
             * your actual Excel file.
             */

            const name = String(row["Name"] ?? "").trim();

            if (!name) {
                result.skipped++;

                result.errors.push({
                    row: excelRow,
                    message: "Name is missing",
                });

                continue;
            }

            const bloodGroup = normalizeBloodGroup(
                row["Blood Group"]
            );

            const studentId = row["Register Number"]
                ? String(row["Register Number"]).trim()
                : null;

            const phone = row["Phone"]
                ? String(row["Phone"]).trim()
                : null;

            const email = row["Email"]
                ? String(row["Email"]).trim()
                : null;

            const department = row["Department"]
                ? String(row["Department"]).trim()
                : null;

            const batch = row["Batch"]
                ? String(row["Batch"]).trim()
                : null;

            if (studentId) {
                const existingStudent = await prisma.student.findUnique({
                    where: {
                        studentId,
                    },
                });

                if (existingStudent) {
                    result.skipped++;

                    result.errors.push({
                        row: excelRow,
                        message: `Student already exists: ${studentId}`,
                    });

                    continue;
                }
            }

            await prisma.student.create({
                data: {
                    studentId,
                    name,
                    phone,
                    email,
                    department,
                    batch,
                    bloodGroup,
                    isDonor: bloodGroup !== null,
                    donorStatus:
                        bloodGroup !== null
                            ? "AVAILABLE"
                            : "INACTIVE",
                },
            });

            result.imported++;
        } catch (error) {
            result.skipped++;

            result.errors.push({
                row: excelRow,
                message:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            });
        }
    }

    return result;
}