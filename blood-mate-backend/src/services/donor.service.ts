import prisma from "../config/database.js";
import { DonorStatus } from "../generated/prisma/client.js";

export async function getAllDonors() {
    return prisma.student.findMany({
        where: {
            isDonor: true,
        },
        select: {
            id: true,
            name: true,
            department: true,
            academicYear: true,
            bloodGroup: true,
            phone: true,
            whatsapp: true,
            gender: true,
            willingToDonate: true,
            isDonor: true,
            donorStatus: true,
            lastDonationAt: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}

export async function getDonorById(id: string) {
    return prisma.student.findFirst({
        where: {
            id,
            isDonor: true,
        },
        select: {
            id: true,
            name: true,
            department: true,
            academicYear: true,
            bloodGroup: true,
            phone: true,
            whatsapp: true,
            gender: true,
            willingToDonate: true,
            isDonor: true,
            donorStatus: true,
            lastDonationAt: true,
        },
    });
}

export async function updateDonorStatus(
    id: string,
    donorStatus: DonorStatus
) {
    return prisma.student.update({
        where: {
            id,
        },
        data: {
            donorStatus,
        },
        select: {
            id: true,
            name: true,
            bloodGroup: true,
            donorStatus: true,
        },
    });
}