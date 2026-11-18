import prisma from "../config/database.js";
import { getContactableDonor } from "./notification.service.js";
import { RequestError } from "../utils/request-error.js";

function buildWhatsAppMessage(
    request: {
        patientName: string;
        hospital: string | null;
        location: string | null;
        bloodGroup: string;
        units: number;
        requiredAt: Date | null;
    }
) {
    const requiredDate = request.requiredAt
        ? request.requiredAt.toLocaleString("en-IN")
        : "As soon as possible";

    return `🩸 BLOOD DONATION REQUEST

Patient: ${request.patientName}
Blood Group: ${request.bloodGroup.replace("_", " ")}
Units Required: ${request.units}
Hospital: ${request.hospital ?? "Not specified"}
Location: ${request.location ?? "Not specified"}
Required: ${requiredDate}

If you are available to donate, please contact the Blood Mate volunteer.

Thank you for helping save a life. ❤️`;
}

export async function getWhatsAppContact(
    requestId: string,
    donorId: string
) {
    const request = await prisma.bloodRequest.findUnique({
        where: {
            id: requestId,
        },
    });

    if (!request) {
        throw new RequestError(404, "Blood request not found");
    }

    if (request.status === "CANCELLED" || request.status === "FULFILLED") {
        throw new RequestError(409, "This request is closed");
    }

    const donor = await getContactableDonor(prisma, donorId, request.bloodGroup);
    return { request, donor };
}

export async function generateWhatsAppLink(requestId: string, donorId: string) {
    const { request, donor } = await getWhatsAppContact(requestId, donorId);
    const message = buildWhatsAppMessage(request);

    const url = `https://wa.me/${donor.phone}?text=${encodeURIComponent(message)}`;

    return {
        donor: {
            id: donor.id,
            name: donor.name,
            phone: donor.phone,
        },
        message,
        whatsappUrl: url,
    };
}
