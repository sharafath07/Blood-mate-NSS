import prisma from "../config/database.js";
import { Prisma, RequestStatus } from "../generated/prisma/client.js";
import { RequestError } from "../utils/request-error.js";
import { findDonorsByBloodGroup, matchedDonorFields } from "./donor-matching.service.js";

type RequestFields = {
    patientName: string;
    bystanderName: string;
    bystanderPhone: string;
    hospital?: string | null;
    location?: string | null;
    bloodGroup: Prisma.BloodRequestCreateInput["bloodGroup"];
    units?: number;
    requiredAt?: Date | null;
    urgency?: Prisma.BloodRequestCreateInput["urgency"];
    notes?: string | null;
};

const requestInclude = {
    matchedDonors: { select: matchedDonorFields, orderBy: { createdAt: "asc" } },
    responses: { select: { id: true, donorId: true, status: true, respondedAt: true, donatedUnits: true } },
    _count: { select: { contacts: true } },
} satisfies Prisma.BloodRequestInclude;

function withProgress<T extends Prisma.BloodRequestGetPayload<{ include: typeof requestInclude }>>(request: T) {
    const { _count, ...data } = request;
    return {
        ...data,
        contactedDonors: _count.contacts,
        confirmedDonors: data.responses.filter((response) => response.status === "ACCEPTED").length,
        donatedUnits: data.responses.reduce((total, response) => total + response.donatedUnits, 0),
    };
}

export async function getLockedRequest(tx: Prisma.TransactionClient, id: string) {
    await tx.$queryRaw`SELECT id FROM "BloodRequest" WHERE id = ${id} FOR UPDATE`;
    const request = await tx.bloodRequest.findUnique({ where: { id }, include: requestInclude });
    if (!request) throw new RequestError(404, "Blood request not found");
    return withProgress(request);
}

export async function createBloodRequest(input: RequestFields) {
    return prisma.$transaction(async (tx) => {
        const donors = await findDonorsByBloodGroup(input.bloodGroup, tx);
        const created = await tx.bloodRequest.create({
            data: { ...input, matchedDonors: { connect: donors.map(({ id }) => ({ id })) } },
            include: requestInclude,
        });
        const request = withProgress(created);
        return { request, donors: request.matchedDonors };
    });
}

export async function getAllBloodRequests(limit = 100, offset = 0, summary = false, filters: { search?: string; status?: RequestStatus; urgency?: RequestFields["urgency"]; bloodGroup?: RequestFields["bloodGroup"] } = {}) {
    const { search, status, urgency, bloodGroup } = filters;
    const requests = await prisma.bloodRequest.findMany({
        where: {
            status,
            urgency,
            bloodGroup,
            ...(search && { OR: [
                { patientName: { contains: search, mode: "insensitive" } },
                { id: { contains: search, mode: "insensitive" } },
                { hospital: { contains: search, mode: "insensitive" } },
            ] }),
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: offset,
        take: limit,
        include: {
            ...requestInclude,
            matchedDonors: summary ? false : requestInclude.matchedDonors,
            _count: { select: { contacts: true, matchedDonors: true } },
        },
    });
    return requests.map((request) => {
        const { matchedDonors, _count, responses, ...data } = request;
        return {
            ...data,
            matchedDonors: matchedDonors ?? [],
            matchedDonorCount: _count.matchedDonors,
            responses,
            contactedDonors: _count.contacts,
            confirmedDonors: responses.filter((response) => response.status === "ACCEPTED").length,
            donatedUnits: responses.reduce((total, response) => total + response.donatedUnits, 0),
        };
    });
}

export async function getBloodRequestById(id: string) {
    const request = await prisma.bloodRequest.findUnique({
        where: { id },
        include: {
            ...requestInclude,
            responses: {
                include: { donor: { select: { id: true, name: true, phone: true } } },
            },
        },
    });
    return request ? withProgress(request) : null;
}

export async function updateBloodRequest(id: string, input: Partial<RequestFields> & { status?: RequestStatus }) {
    return prisma.$transaction(async (tx) => {
        const existing = await getLockedRequest(tx, id);
        const units = input.units ?? existing.units;
        const status = input.status ?? existing.status;
        if (units < existing.donatedUnits) {
            throw new RequestError(409, "Units cannot be lower than the units already recorded");
        }
        if (status === "FULFILLED" && existing.donatedUnits < units &&
            (existing.status !== "FULFILLED" || units !== existing.units)) {
            throw new RequestError(409, "Record the completed donation units before fulfilling the request");
        }
        if (status === "CANCELLED" && existing.donatedUnits >= units) {
            throw new RequestError(409, "A fulfilled request cannot be cancelled");
        }
        const bloodGroupChanged = input.bloodGroup !== undefined && input.bloodGroup !== existing.bloodGroup;
        if (bloodGroupChanged && (existing.contactedDonors || existing.responses.length)) {
            throw new RequestError(409, "Blood group cannot change after outreach or responses");
        }

        const donors = bloodGroupChanged && input.bloodGroup
            ? await findDonorsByBloodGroup(input.bloodGroup, tx)
            : undefined;
        const updated = await tx.bloodRequest.update({
            where: { id },
            data: {
                ...input,
                status: existing.donatedUnits >= units ? "FULFILLED" : status,
                ...(donors && { matchedDonors: { set: donors.map(({ id }) => ({ id })) } }),
            },
            include: requestInclude,
        });
        return withProgress(updated);
    });
}

export async function deleteBloodRequest(id: string) {
    return prisma.$transaction(async (tx) => {
        const request = await getLockedRequest(tx, id);
        if (request.responses.length || request.contactedDonors) {
            throw new RequestError(409, "Request history exists. Cancel the request instead.");
        }
        return tx.bloodRequest.delete({ where: { id } });
    });
}
