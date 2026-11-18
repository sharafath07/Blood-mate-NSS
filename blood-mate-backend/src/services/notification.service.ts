import prisma from "../config/database.js";
import type { BloodGroup, Prisma } from "../generated/prisma/client.js";
import { RequestError } from "../utils/request-error.js";
import { normalizePhone } from "../utils/phone.util.js";
import { getLockedRequest } from "./blood-request.service.js";

export async function getContactableDonor(
    db: Pick<Prisma.TransactionClient, "student">,
    donorId: string,
    bloodGroup: BloodGroup,
) {
    const donor = await db.student.findFirst({
        where: { id: donorId, bloodGroup, donorStatus: "AVAILABLE", isDonor: true, willingToDonate: true },
        select: { id: true, name: true, phone: true },
    });
    if (!donor) throw new RequestError(409, "This student is no longer available for this request");
    const phone = normalizePhone(donor.phone)?.replace(/^(?:\+|00)/, "");
    if (!phone || !/^[1-9]\d{7,14}$/.test(phone)) throw new RequestError(409, "Donor has no valid phone number");
    return { ...donor, phone };
}

const contactInclude = {
    donor: { select: { name: true } },
    request: { select: { bloodGroup: true, hospital: true } },
} satisfies Prisma.DonorContactInclude;

export async function getContactHistory(offset: number, limit: number) {
    const contacts = await prisma.donorContact.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: offset,
        take: limit,
        include: contactInclude,
    });
    const responses = contacts.length ? await prisma.donorResponse.findMany({
        where: { OR: contacts.map(({ requestId, donorId }) => ({ requestId, donorId })) },
        select: { requestId: true, donorId: true, status: true, donatedUnits: true },
    }) : [];
    const responsesByContact = new Map(responses.map((item) => [JSON.stringify([item.requestId, item.donorId]), item]));
    return contacts.map((contact) => {
        const response = responsesByContact.get(JSON.stringify([contact.requestId, contact.donorId]));
        return {
            id: contact.id,
            requestId: contact.requestId,
            donorId: contact.donorId,
            donorName: contact.donor.name,
            phone: contact.phone,
            message: contact.message,
            hospital: contact.request.hospital ?? "",
            bloodGroup: contact.request.bloodGroup,
            sentAt: contact.createdAt,
            status: response?.status === "ACCEPTED" || response?.status === "DECLINED" ? "Responded" : "Sent",
            responseStatus: response?.status ?? "PENDING",
            donatedUnits: response?.donatedUnits ?? 0,
        };
    });
}

export async function recordContact(input: { requestId: string; donorId: string; message: string; recordedBy: string }) {
    return prisma.$transaction(async (tx) => {
        const request = await getLockedRequest(tx, input.requestId);
        const where = { requestId_donorId: { requestId: input.requestId, donorId: input.donorId } };
        const existing = await tx.donorContact.findUnique({ where });
        if (existing) return existing;
        if (request.status === "CANCELLED" || request.status === "FULFILLED") {
            throw new RequestError(409, "This request is closed");
        }
        const donor = await getContactableDonor(tx, input.donorId, request.bloodGroup);
        const contact = await tx.donorContact.create({ data: { ...input, phone: donor.phone } });
        if (request.status === "PENDING") {
            await tx.bloodRequest.update({ where: { id: request.id }, data: { status: "MATCHING" } });
        }
        return contact;
    });
}
