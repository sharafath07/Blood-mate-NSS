import prisma from "../config/database.js";
import { ResponseStatus } from "../generated/prisma/client.js";
import { RequestError } from "../utils/request-error.js";
import { getLockedRequest } from "./blood-request.service.js";

interface ResponseInput {
    requestId: string;
    donorId: string;
    status: ResponseStatus;
    donatedUnits?: number;
    recordedBy: string;
}

export function createDonorResponse(input: ResponseInput) {
    return prisma.$transaction(async (tx) => {
        const request = await getLockedRequest(tx, input.requestId);
        if (request.status === "CANCELLED") throw new RequestError(409, "This request has been cancelled");

        const contact = await tx.donorContact.findUnique({
            where: { requestId_donorId: { requestId: input.requestId, donorId: input.donorId } },
        });
        const existing = request.responses.find((response) => response.donorId === input.donorId);
        if (!contact && !existing) throw new RequestError(409, "Record contact before recording a response");

        const previousUnits = existing?.donatedUnits ?? 0;
        const donatedUnits = input.donatedUnits ?? previousUnits;
        if (input.status !== "ACCEPTED" && donatedUnits > 0) {
            throw new RequestError(409, "Completed units require an accepted response");
        }
        const totalUnits = request.donatedUnits - previousUnits + donatedUnits;
        if (totalUnits > request.units) throw new RequestError(409, "Completed units exceed the request");

        const key = { requestId: input.requestId, donorId: input.donorId };
        const values = {
            status: input.status,
            donatedUnits,
            recordedBy: input.recordedBy,
            respondedAt: input.status === "PENDING" ? null : new Date(),
        };
        const response = await tx.donorResponse.upsert({
            where: { requestId_donorId: key },
            update: values,
            create: { ...key, ...values },
        });
        await tx.bloodRequest.update({
            where: { id: key.requestId },
            data: { status: totalUnits >= request.units ? "FULFILLED" : "MATCHING" },
        });
        return response;
    });
}
