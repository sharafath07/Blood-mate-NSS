import prisma from "../config/database.js";
import {
    BloodGroup,
    DonorStatus,
} from "../generated/prisma/client.js";

interface GetStudentsOptions {
    page: number;
    limit: number;
    search?: string;
    bloodGroup?: BloodGroup;
    department?: string;
    donorStatus?: DonorStatus;
}

export async function getStudents(options: GetStudentsOptions) {
    const {
        page,
        limit,
        search,
        bloodGroup,
        department,
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
                    {
                        whatsapp: {
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

        ...(donorStatus ? { donorStatus } : {}),
    };

    const [students, total] = await Promise.all([
        prisma.student.findMany({
            where,
            orderBy: {
                name: "asc",
            },
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

export async function updateStudent(
    id: string,
    data: {
        name?: string;
        department?: string | null;
        age?: number | null;
        bloodGroup?: BloodGroup | null;
        phone?: string | null;
        whatsapp?: string | null;
        address?: string | null;
        academicYear?: string | null;
        willingToDonate?: boolean;
        isDonor?: boolean;
        donorStatus?: DonorStatus;
        lastDonationAt?: Date | null;
    }
) {
    return prisma.student.update({
        where: {
            id,
        },
        data,
    });
}