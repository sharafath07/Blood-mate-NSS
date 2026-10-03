import { Request, Response } from "express";
import {
    BloodGroup,
    DonorStatus,
} from "../generated/prisma/client.js";

import {
    getStudents,
    getStudentById,
    updateStudent,
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
                Number.parseInt(String(req.query.limit ?? "20"), 10) || 20,
                1
            ),
            100
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

        const result = await getStudents({
            page,
            limit,
            search,
            bloodGroup,
            department,
            donorStatus,
        });

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error(error);

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
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch student",
        });
    }
}

export async function editStudent(
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

        const existingStudent = await getStudentById(id);

        if (!existingStudent) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        const {
            name,
            department,
            age,
            bloodGroup,
            phone,
            whatsapp,
            address,
            academicYear,
            willingToDonate,
            isDonor,
            donorStatus,
        } = req.body;

        if (
            bloodGroup !== undefined &&
            bloodGroup !== null &&
            !Object.values(BloodGroup).includes(bloodGroup)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid blood group",
            });
        }

        if (
            donorStatus !== undefined &&
            !Object.values(DonorStatus).includes(donorStatus)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid donor status",
            });
        }

        const updatedStudent = await updateStudent(id, {
            ...(name !== undefined && { name }),
            ...(department !== undefined && { department }),
            ...(age !== undefined && { age }),
            ...(bloodGroup !== undefined && { bloodGroup }),
            ...(phone !== undefined && { phone }),
            ...(whatsapp !== undefined && { whatsapp }),
            ...(address !== undefined && { address }),
            ...(academicYear !== undefined && { academicYear }),
            ...(willingToDonate !== undefined && { willingToDonate }),
            ...(isDonor !== undefined && { isDonor }),
            ...(donorStatus !== undefined && { donorStatus }),
        });

        return res.json({
            success: true,
            message: "Student updated successfully",
            data: updatedStudent,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update student",
        });
    }
}