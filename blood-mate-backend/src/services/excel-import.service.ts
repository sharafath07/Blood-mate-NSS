import { RequestError } from "../utils/request-error.js";
import * as XLSX from "xlsx";

import prisma from "../config/database.js";

import {
    normalizeBloodGroup,
} from "../utils/blood-group.util.js";

import {
    normalizeWeight,
} from "../utils/weight.util.js";

import {
    normalizeGender,
} from "../utils/gender.util.js";

import {
    normalizeDonationConsent,
} from "../utils/donor.util.js";

import {
    normalizePhone,
} from "../utils/phone.util.js";

import {
    BloodGroup,
    WeightCategory,
    Gender,
} from "../generated/prisma/client";

export interface ExcelPreview {
    sheetNames: string[];
    columns: string[];
    rowCount: number;
    rows: Record<string, unknown>[];
}

export interface ImportResult {
    totalRows: number;
    imported: number;
    skipped: number;
    errors: {
        row: number;
        message: string;
    }[];
}

export type ValidationStatus =
    | "VALID"
    | "INVALID"
    | "DUPLICATE_IN_FILE"
    | "ALREADY_IN_DATABASE";

export interface ValidationRow {
    row: number;
    status: ValidationStatus;

    data?: {
        name: string;
        department: string | null;
        age: number | null;
        bloodGroup: BloodGroup | null;
        phone: string | null;
        address: string | null;
        weightCategory: WeightCategory | null;
        gender: Gender | null;
        semester: number | null;
        willingToDonate: boolean;
        registeredAt: Date | null;
    };

    errors: string[];
}

export interface ValidationResult {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicateInFileRows: number;
    alreadyInDatabaseRows: number;
    readyToImport: number;
    rows: ValidationRow[];
}

function normalizeColumnName(
    value: string
): string {
    return value
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function normalizeExcelRow(
    row: Record<string, unknown>
): Record<string, unknown> {
    const normalizedRow: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(row)) {
        normalizedRow[
            normalizeColumnName(key)
        ] = value;
    }

    return normalizedRow;
}

function readExcel(filePath: string) {
    let workbook: XLSX.WorkBook;
    try {
        workbook = XLSX.readFile(filePath);
    } catch {
        throw new RequestError(400, "Unable to read the Excel workbook");
    }

    if (workbook.SheetNames.length === 0) {
        throw new RequestError(400,
            "Excel file contains no worksheets"
        );
    }

    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
        throw new RequestError(400,
            "Unable to find first worksheet"
        );
    }

    const worksheet =
        workbook.Sheets[sheetName];

    if (!worksheet) {
        throw new RequestError(400,
            "Unable to read worksheet"
        );
    }

    const rows =
        XLSX.utils.sheet_to_json<
            Record<string, unknown>
        >(worksheet, {
            defval: null,
        });

    if (!rows.length) throw new RequestError(400, "The first worksheet has no student rows");
    if (rows.length > 10000) throw new RequestError(413, "Workbook exceeds the 10,000 row limit");

    return {
        workbook,
        rows,
    };
}

export function previewExcelFile(
    filePath: string
): ExcelPreview {
    const { workbook, rows } =
        readExcel(filePath);

    const firstRow = rows[0];

    return {
        sheetNames: workbook.SheetNames,

        columns: firstRow
            ? Object.keys(firstRow)
            : [],

        rowCount: rows.length,

        rows: rows.slice(0, 5),
    };
}

function parseAge(
    value: unknown
): number | null {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    const age = Number(value);

    if (
        !Number.isInteger(age) ||
        age < 15 ||
        age > 100
    ) {
        return null;
    }

    return age;
}

function parseTimestamp(
    value: unknown
): Date | null {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    if (typeof value === "number") {
        const excelEpoch =
            new Date(Date.UTC(1899, 11, 30));

        const milliseconds =
            value * 24 * 60 * 60 * 1000;

        const date = new Date(
            excelEpoch.getTime() +
            milliseconds
        );

        return Number.isNaN(date.getTime())
            ? null
            : date;
    }

    const date = new Date(
        String(value)
    );

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

function parseStudentRow(
    row: Record<string, unknown>
) {
    const normalizedRow =
        normalizeExcelRow(row);

    const errors: string[] = [];

    const name = String(
        normalizedRow["full name"] ?? ""
    ).trim();

    if (!name) {
        errors.push("Full Name is missing");
    }

    const department =
        normalizedRow["department"]
            ? String(
                normalizedRow["department"]
            ).trim()
            : null;

    const age = parseAge(
        normalizedRow["age"]
    );

    const bloodGroup =
        normalizeBloodGroup(
            normalizedRow["blood group"]
        );

    if (!bloodGroup) {
        errors.push(
            "Invalid or missing blood group"
        );
    }

    const phone = normalizePhone(normalizedRow["contact number"]) ??
        normalizePhone(normalizedRow["whatsapp number"]);
    if (!phone || !/^\+?[0-9]{8,15}$/.test(phone)) {
        errors.push("A valid contact or WhatsApp number is required");
    }

    const address =
        normalizedRow["address"]
            ? String(
                normalizedRow["address"]
            ).trim()
            : null;

    const gender =
        normalizeGender(
            normalizedRow["gender"]
        );

    const weightCategory =
        normalizeWeight(
            normalizedRow["weight"]
        );

    const willingToDonate =
        normalizeDonationConsent(
            normalizedRow[
            "are you willing to donate blood"
            ]
        );

    const semesterValue = normalizedRow["semester"];
    const semester = semesterValue == null || semesterValue === ""
        ? null
        : Number(semesterValue);
    if (semester !== null && (!Number.isInteger(semester) || semester < 1 || semester > 12)) {
        errors.push("Semester must be an integer from 1 to 12");
    }

    const registeredAt =
        parseTimestamp(
            normalizedRow["timestamp"]
        );

    return {
        errors,

        data: {
            name,
            department,
            age,
            bloodGroup,
            phone,
            address,
            weightCategory,
            gender,
            semester,
            willingToDonate,
            registeredAt,
        },
    };
}

export async function importStudentsFromExcel(
    filePath: string
): Promise<ImportResult> {
    const validation =
        await validateStudentsExcel(filePath);

    const result: ImportResult = {
        totalRows: validation.totalRows,
        imported: 0,
        skipped: 0,
        errors: [],
    };

    /*
     * --------------------------------
     * GET ONLY VALID ROWS
     * --------------------------------
     */

    const validRows = validation.rows.filter(
        (row) =>
            row.status === "VALID" &&
            row.data
    );

    /*
     * --------------------------------
     * RECORD SKIPPED ROWS
     * --------------------------------
     */

    for (const row of validation.rows) {
        if (
            row.status !== "VALID" ||
            !row.data
        ) {
            result.skipped++;

            result.errors.push({
                row: row.row,
                message:
                    row.errors.length > 0
                        ? row.errors.join("; ")
                        : `Row skipped because its status is ${row.status}`,
            });
        }
    }

    /*
     * --------------------------------
     * NOTHING TO IMPORT
     * --------------------------------
     */

    if (validRows.length === 0) {
        return result;
    }

    /*
     * --------------------------------
     * DATABASE TRANSACTION
     * --------------------------------
     */

    const duplicates = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(786041)::text`;
        const skipped: ImportResult["errors"] = [];
        for (let offset = 0; offset < validRows.length; offset += 500) {
            const batch = validRows.slice(offset, offset + 500);
            const phones = batch.flatMap((row) => row.data?.phone ? [row.data.phone] : []);
            const existing = await tx.student.findMany({
                where: { phone: { in: phones } },
                select: { phone: true },
            });
            const used = new Set(existing.map(({ phone }) => phone));
            const students = batch.flatMap((row) => {
                const data = row.data;
                if (!data?.phone || used.has(data.phone)) {
                    skipped.push({ row: row.row, message: "Student was already imported" });
                    return [];
                }
                return [{
                    ...data,
                    isDonor: data.willingToDonate,
                    donorStatus: data.willingToDonate ? "AVAILABLE" as const : "INACTIVE" as const,
                }];
            });
            if (students.length) await tx.student.createMany({ data: students });
        }
        return skipped;
    }, { timeout: 30000 });
    result.imported = validRows.length - duplicates.length;
    result.skipped += duplicates.length;
    result.errors.push(...duplicates);

    return result;
}

export async function validateStudentsExcel(
    filePath: string
): Promise<ValidationResult> {
    const { rows } = readExcel(filePath);

    const result: ValidationResult = {
        totalRows: rows.length,
        validRows: 0,
        invalidRows: 0,
        duplicateInFileRows: 0,
        alreadyInDatabaseRows: 0,
        readyToImport: 0,
        rows: [],
    };

    /*
     * Keep track of phone numbers and WhatsApp
     * numbers already encountered in this Excel file.
     */
    const seenPhones = new Map<string, number>();
    const parsedRows = rows.map(parseStudentRow);
    const existingPhones = new Set<string>();
    const candidatePhones = [...new Set(parsedRows.flatMap(({ data, errors }) =>
        data.phone && errors.length === 0 ? [data.phone] : [],
    ))];
    for (let offset = 0; offset < candidatePhones.length; offset += 500) {
        const existingStudents = await prisma.student.findMany({
            where: { phone: { in: candidatePhones.slice(offset, offset + 500) } },
            select: { phone: true },
        });
        for (const { phone } of existingStudents) {
            if (phone) existingPhones.add(phone);
        }
    }

    for (
        let index = 0;
        index < rows.length;
        index++
    ) {
        const row = rows[index];

        if (!row) {
            continue;
        }

        const excelRow = index + 2;

        try {
            const parsed = parsedRows[index]!;

            /*
             * Step 1:
             * Basic validation.
             */
            if (parsed.errors.length > 0) {
                result.invalidRows++;

                result.rows.push({
                    row: excelRow,
                    status: "INVALID",
                    data: parsed.data,
                    errors: parsed.errors,
                });

                continue;
            }

            const phone = parsed.data.phone;
            const duplicateRow = phone ? seenPhones.get(phone) : undefined;

            if (duplicateRow) {
                result.duplicateInFileRows++;

                result.rows.push({
                    row: excelRow,
                    status: "DUPLICATE_IN_FILE",
                    data: parsed.data,
                    errors: [
                        `Duplicate student found in Excel file. First occurrence is row ${duplicateRow}`,
                    ],
                });

                continue;
            }

            /*
             * Remember this row's phone numbers.
             */
            if (phone) {
                seenPhones.set(
                    phone,
                    excelRow
                );
            }

            if (phone && existingPhones.has(phone)) {
                result.alreadyInDatabaseRows++;

                result.rows.push({
                    row: excelRow,
                    status: "ALREADY_IN_DATABASE",
                    data: parsed.data,
                    errors: [
                        "Student already exists in the database using phone/WhatsApp number",
                    ],
                });

                continue;
            }

            /*
             * Step 4:
             * Everything is valid and unique.
             */
            result.validRows++;
            result.readyToImport++;

            result.rows.push({
                row: excelRow,
                status: "VALID",
                data: parsed.data,
                errors: [],
            });
        } catch (error) {
            result.invalidRows++;

            result.rows.push({
                row: excelRow,
                status: "INVALID",
                errors: [
                    error instanceof Error
                        ? error.message
                        : "Unknown validation error",
                ],
            });
        }
    }

    return result;
}
