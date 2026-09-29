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
                patientName:
                    input.patientName,

                hospital:
                    input.hospital ?? null,

                location:
                    input.location ?? null,

                bloodGroup:
                    input.bloodGroup,

                units:
                    input.units ?? 1,

                requiredAt:
                    input.requiredAt ?? null,

                requesterId:
                    input.requesterId,

                status:
                    RequestStatus.PENDING,
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