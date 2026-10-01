import prisma from "../config/database.js";

import {
    BloodGroup,
    RequestStatus,
} from "../generated/prisma/client";

import {
    findDonorsByBloodGroup,
} from "./donor-matching.service.js";

interface CreateBloodRequestInput {
    patientName: string;
    hospital?: string;
    location?: string;
    bystanderName: string;
    bystanderPhone: string;
    bloodGroup: BloodGroup;
    units?: number;
    requiredAt?: Date;
    requesterId: string;
}

export async function createBloodRequest(
    input: CreateBloodRequestInput
) {
    const request =
        await prisma.bloodRequest.create({
            data: {
                patientName: input.patientName,
                bystanderName: input.bystanderName,
                bystanderPhone: input.bystanderPhone,
                hospital: input.hospital ?? null,
                location: input.location ?? null,
                bloodGroup: input.bloodGroup,
                units: input.units ?? 1,
                requiredAt: input.requiredAt ?? null,
                requesterId: input.requesterId,
                status: RequestStatus.PENDING,
            },
        });

    const donors =
        await findDonorsByBloodGroup(
            input.bloodGroup
        );

    return {
        request,
        donors,
    };
}

export async function getAllBloodRequests() {
    return prisma.bloodRequest.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            requester: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            responses: {
                select: {
                    id: true,
                    donorId: true,
                    status: true,
                    respondedAt: true,
                },
            },
        },
    });
}

export async function getBloodRequestById(id: string) {
    return prisma.bloodRequest.findUnique({
        where: {
            id,
        },
        include: {
            requester: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
            responses: {
                include: {
                    donor: {
                        select: {
                            id: true,
                            name: true,
                            bloodGroup: true,
                            phone: true,
                            whatsapp: true,
                            department: true,
                            donorStatus: true,
                        },
                    },
                },
            },
        },
    });
}

export async function updateBloodRequestStatus(
    id: string,
    status: RequestStatus
) {
    return prisma.bloodRequest.update({
        where: {
            id,
        },
        data: {
            status,
        },
    });
}

export async function deleteBloodRequest(id: string) {
    return prisma.bloodRequest.delete({
        where: {
            id,
        },
    });
}