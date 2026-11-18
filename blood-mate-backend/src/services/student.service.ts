import prisma from "../config/database.js";
import {
    BloodGroup,
    DonorStatus,
    Prisma,
} from "../generated/prisma/client.js";

interface GetStudentsOptions {
    page: number;
    limit: number;
    search?: string;
    bloodGroup?: BloodGroup;
    department?: string;
    semester?: number;
    donorStatus?: DonorStatus;
}

export async function getStudents(options: GetStudentsOptions) {
    const {
        page,
        limit,
        search,
        bloodGroup,
        department,
        semester,
        donorStatus,
    } = options;

    const skip = (page - 1) * limit;

    const where = {
        ...(search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                            mode: "insensitive" as const,
                        },
                    },
                    {
                        phone: {
                            contains: search,
                        },
                    },
                ],
            }
            : {}),

        ...(bloodGroup ? { bloodGroup } : {}),

        ...(department
            ? {
                department: {
                    equals: department,
                    mode: "insensitive" as const,
                },
            }
            : {}),

        ...(semester !== undefined ? { semester } : {}),
        ...(donorStatus ? { donorStatus } : {}),
    };

    const [students, total] = await Promise.all([
        prisma.student.findMany({
            where,
            orderBy: [{ name: "asc" }, { id: "asc" }],
            skip,
            take: limit,
        }),

        prisma.student.count({
            where,
        }),
    ]);

    return {
        students,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getStudentById(id: string) {
    return prisma.student.findUnique({
        where: {
            id,
        },
    });
}

export function addStudent(data: Prisma.StudentCreateInput) {
    return prisma.student.create({ data });
}

export function updateStudent(id: string, data: Prisma.StudentUpdateInput) {
    return prisma.student.update({ where: { id }, data });
}
