import prisma from "../config/database.js";
import {
    BloodGroup,
    DonorStatus,
} from "../generated/prisma/client.js";

export async function findDonorsByBloodGroup(
    bloodGroup: BloodGroup
) {
    return prisma.student.findMany({
        where: {
            bloodGroup,
            willingToDonate: true,
            isDonor: true,
            donorStatus: DonorStatus.AVAILABLE,
        },
        select: {
            id: true,
            name: true,
            department: true,
            bloodGroup: true,
            phone: true,
            whatsapp: true,
            gender: true,
            academicYear: true,
            donorStatus: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}