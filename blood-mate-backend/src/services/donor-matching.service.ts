import prisma from "../config/database.js";
import {
    BloodGroup,
    DonorStatus,
    Prisma,
} from "../generated/prisma/client.js";

export const matchedDonorFields = {
    id: true,
    name: true,
    department: true,
    bloodGroup: true,
    phone: true,
    gender: true,
    semester: true,
    donorStatus: true,
} satisfies Prisma.StudentSelect;

export async function findDonorsByBloodGroup(
    bloodGroup: BloodGroup,
    db: Pick<Prisma.TransactionClient, "student"> = prisma,
) {
    return db.student.findMany({
        where: {
            bloodGroup,
            willingToDonate: true,
            isDonor: true,
            donorStatus: DonorStatus.AVAILABLE,
        },
        select: matchedDonorFields,
        orderBy: {
            createdAt: "asc",
        },
    });
}
