import type { Request, Response } from "express";
import {
    getStudentById,
    getStudents,
} from "../services/student.service.js";

export async function listStudents(
    _req: Request,
    res: Response
) {
    try {
        const students = await getStudents();

        res.json({
            success: true,
            data: students,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
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

        // Express 5 can type params as string | string[]
        if (typeof id !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid student ID",
            });

            return;
        }

        const student = await getStudentById(id);

        if (!student) {
            res.status(404).json({
                success: false,
                message: "Student not found",
            });

            return;
        }

        res.json({
            success: true,
            data: student,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch student",
        });
    }
}