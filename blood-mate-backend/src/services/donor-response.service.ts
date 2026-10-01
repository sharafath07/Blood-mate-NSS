import prisma from "../config/database.js";
import {
    RequestStatus,
    ResponseStatus,
} from "../generated/prisma/client.js";

interface CreateDonorResponseInput {
    requestId: string;
    donorId: string;
    status: ResponseStatus;
}

export async function createDonorResponse(
    input: CreateDonorResponseInput
) {
    const response = await prisma.$transaction(async (tx) => {
        const response = await tx.donorResponse.upsert({
            where: {
                requestId_donorId: {
                    requestId: input.requestId,
                    donorId: input.donorId,
                },
            },
            update: {
                status: input.status,
                respondedAt: new Date(),
            },
            create: {
                requestId: input.requestId,
                donorId: input.donorId,
                status: input.status,
                respondedAt: new Date(),
            },
        });

        if (input.status === ResponseStatus.ACCEPTED) {
            await tx.bloodRequest.update({
                where: {
                    id: input.requestId,
                },
                data: {
                    status: RequestStatus.FULFILLED,
                },
            });
        }

        return response;
    });

    return response;
}