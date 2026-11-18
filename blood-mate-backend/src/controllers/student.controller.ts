import { Request, Response } from "express";
import { z } from "zod";
import { normalizePhone } from "../utils/phone.util.js";
import {
    BloodGroup,
    DonorStatus,
    Gender,
} from "../generated/prisma/client.js";

import {
    getStudents,
    getStudentById,
    updateStudent,
    addStudent,
} from "../services/student.service.js";

export async function listStudents(
    req: Request,
    res: Response
) {
    try {
        const page = Math.max(
            Number.parseInt(String(req.query.page ?? "1"), 10) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                Number.parseInt(String(req.query.limit ?? "370"), 10) || 370,
                1
            ),
            500
        );

        const search =
            typeof req.query.search === "string"
                ? req.query.search.trim()
                : undefined;

        const bloodGroup =
            typeof req.query.bloodGroup === "string" &&
                Object.values(BloodGroup).includes(
                    req.query.bloodGroup as BloodGroup
                )
                ? (req.query.bloodGroup as BloodGroup)
                : undefined;

        const donorStatus =
            typeof req.query.donorStatus === "string" &&
                Object.values(DonorStatus).includes(
                    req.query.donorStatus as DonorStatus
                )
                ? (req.query.donorStatus as DonorStatus)
                : undefined;

        const department =
            typeof req.query.department === "string"
                ? req.query.department.trim()
                : undefined;

        const semester = req.query.semester === undefined ? undefined
            : typeof req.query.semester === "string" ? Number(req.query.semester) : NaN;
        if (semester !== undefined && (!Number.isInteger(semester) || semester < 1 || semester > 12)) {
            return res.status(400).json({ success: false, message: "Invalid semester" });
        }
        const result = await getStudents({
            page,
            limit,
            search,
            bloodGroup,
            department,
            donorStatus,
            semester,
        });

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("API operation failed:", error instanceof Error ? error.name : "UnknownError");

        return res.status(500).json({
            success: false,
            message: "Failed to fetch students",
        });
    }
}

export async function getStudent(
    req: Request,
    res: Response
) {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID",
            });
        }

        const student = await getStudentById(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        return res.json({
            success: true,
            data: student,
        });
    } catch (error) {
        console.error("API operation failed:", error instanceof Error ? error.name : "UnknownError");

        return res.status(500).json({
            success: false,
            message: "Failed to fetch student",
        });
    }
}

const studentInput = z.object({
    name: z.string().trim().min(1).max(160),
    department: z.string().trim().max(160).nullable().optional(),
    age: z.number().int().min(15).max(100).nullable().optional(),
    semester: z.number().int().min(1).max(12).nullable().optional(),
    gender: z.enum(Gender).nullable().optional(),
    bloodGroup: z.enum(BloodGroup).nullable().optional(),
    phone: z.string().transform(normalizePhone).refine(
        (value) => value !== null && /^\+?[0-9]{8,15}$/.test(value),
        "Invalid phone number",
    ).nullable().optional(),
    address: z.string().trim().max(500).nullable().optional(),
    willingToDonate: z.boolean().optional(),
    donorStatus: z.enum(DonorStatus).optional(),
});

export async function editStudent(req: Request, res: Response) {
    const { id } = req.params;
    const parsed = studentInput.partial().safeParse(req.body);
    if (typeof id !== "string" || !parsed.success || Object.keys(parsed.data).length === 0) {
        return res.status(400).json({ success: false, message: "Invalid student update", issues: parsed.error?.issues });
    }

    try {
        const existing = await getStudentById(id);
        if (!existing) return res.status(404).json({ success: false, message: "Student not found" });

        const willing = parsed.data.willingToDonate ?? existing.willingToDonate;
        const data = {
            ...parsed.data,
            isDonor: willing,
            donorStatus: willing ? parsed.data.donorStatus ?? (existing.willingToDonate ? existing.donorStatus : DonorStatus.AVAILABLE) : DonorStatus.INACTIVE,
        };
        const student = await updateStudent(id, data);
        return res.json({ success: true, data: student });
    } catch (error) {
        console.error("Student update failed", error instanceof Error ? error.name : "");
        return res.status(500).json({ success: false, message: "Failed to update student" });
    }
}

export async function createStudent(req: Request, res: Response) {
    const parsed = studentInput.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid student details", issues: parsed.error.issues });
    }

    try {
        const willing = parsed.data.willingToDonate ?? false;
        const student = await addStudent({
            ...parsed.data,
            willingToDonate: willing,
            isDonor: willing,
            donorStatus: willing ? parsed.data.donorStatus ?? DonorStatus.AVAILABLE : DonorStatus.INACTIVE,
        });
        return res.status(201).json({ success: true, data: student });
    } catch (error) {
        console.error("Student creation failed", error instanceof Error ? error.name : "");
        return res.status(500).json({ success: false, message: "Failed to create student" });
    }
}
