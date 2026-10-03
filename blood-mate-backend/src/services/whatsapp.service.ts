import prisma from "../config/database.js";

function normalizeWhatsAppNumber(phone: string): string {
    return phone.replace(/\D/g, "");
}

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

export async function generateWhatsAppLink(
    requestId: string,
    donorId: string
) {
    const request = await prisma.bloodRequest.findUnique({
        where: {
            id: requestId,
        },
    });

    if (!request) {
        throw new Error("REQUEST_NOT_FOUND");
    }

    const donor = await prisma.student.findUnique({
        where: {
            id: donorId,
        },
        select: {
            id: true,
            name: true,
            phone: true,
            whatsapp: true,
            bloodGroup: true,
            donorStatus: true,
        },
    });

    if (!donor) {
        throw new Error("DONOR_NOT_FOUND");
    }

    const phone = donor.whatsapp ?? donor.phone;

    if (!phone) {
        throw new Error("DONOR_PHONE_NOT_FOUND");
    }

    const number = normalizeWhatsAppNumber(phone);
    const message = buildWhatsAppMessage(request);

    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    return {
        donor: {
            id: donor.id,
            name: donor.name,
            phone,
        },
        message,
        whatsappUrl: url,
    };
}