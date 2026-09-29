import prisma from "../config/database.js";

import {
    BloodGroup,
    DonorStatus,
} from "../generated/prisma/client";

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

        orderBy: {
            createdAt: "asc",
        },
    });
}