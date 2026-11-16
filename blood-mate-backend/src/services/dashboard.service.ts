import prisma from "../config/database.js";
import {
    DonorStatus,
    RequestStatus,
    ResponseStatus,
    BloodGroup,
} from "../generated/prisma/client.js";

export async function getDashboardStats() {
    const [
        totalStudents,
        totalDonors,
        availableDonors,
        unavailableDonors,
        inactiveDonors,
        totalRequests,
        pendingRequests,
        matchingRequests,
        fulfilledRequests,
        cancelledRequests,
        pendingResponses,
        acceptedResponses,
        declinedResponses,
        aPosBlood,
        aNegBlood,
        bPosBlood,
        bNegBlood,
        abPosBlood,
        abNegBlood,
        oPosBlood,
        oNegBlood,
    ] = await Promise.all([
        prisma.student.count(),

        prisma.student.count({
            where: {
                isDonor: true,
            },
        }),

        prisma.student.count({
            where: {
                isDonor: true,
                donorStatus: DonorStatus.AVAILABLE,
            },
        }),

        prisma.student.count({
            where: {
                isDonor: true,
                donorStatus: DonorStatus.UNAVAILABLE,
            },
        }),

        prisma.student.count({
            where: {
                isDonor: true,
                donorStatus: DonorStatus.INACTIVE,
            },
        }),

        prisma.bloodRequest.count(),

        prisma.bloodRequest.count({
            where: {
                status: RequestStatus.PENDING,
            },
        }),

        prisma.bloodRequest.count({
            where: {
                status: RequestStatus.MATCHING,
            },
        }),

        prisma.bloodRequest.count({
            where: {
                status: RequestStatus.FULFILLED,
            },
        }),

        prisma.bloodRequest.count({
            where: {
                status: RequestStatus.CANCELLED,
            },
        }),

        prisma.donorResponse.count({
            where: {
                status: ResponseStatus.PENDING,
            },
        }),

        prisma.donorResponse.count({
            where: {
                status: ResponseStatus.ACCEPTED,
            },
        }),

        prisma.donorResponse.count({
            where: {
                status: ResponseStatus.DECLINED,
            },
        }),

        prisma.student.count({
            where: {
                isDonor: true,
                bloodGroup: BloodGroup.A_POSITIVE,
            },
        }),

        prisma.student.count({
            where: {
                isDonor: true,
                bloodGroup: BloodGroup.A_NEGATIVE,
            },
        }),

        prisma.student.count({
            where: {
                isDonor: true,
                bloodGroup: BloodGroup.B_POSITIVE,
            },
        }),

        prisma.student.count({
            where: {
                isDonor: true,
                bloodGroup: BloodGroup.B_NEGATIVE,
            },
        }),

        prisma.student.count({
            where: {
                isDonor: true,
                bloodGroup: BloodGroup.AB_POSITIVE,
            },
        }),

        prisma.student.count({
            where: {
                isDonor: true,
                bloodGroup: BloodGroup.AB_NEGATIVE,
            },
        }),

        prisma.student.count({
            where: {
                isDonor: true,
                bloodGroup: BloodGroup.O_POSITIVE,
            },
        }),

        prisma.student.count({
            where: {
                isDonor: true,
                bloodGroup: BloodGroup.O_NEGATIVE,
            },
        }),
    ]);

    return {
        students: {
            total: totalStudents,
        },

        donors: {
            total: totalDonors,
            available: availableDonors,
            unavailable: unavailableDonors,
            inactive: inactiveDonors,
        },

        bloodRequests: {
            total: totalRequests,
            pending: pendingRequests,
            matching: matchingRequests,
            fulfilled: fulfilledRequests,
            cancelled: cancelledRequests,
        },

        donorResponses: {
            pending: pendingResponses,
            accepted: acceptedResponses,
            declined: declinedResponses,
        },

        donorDistribution: [
            {
                group: "A+",
                count: aPosBlood,
            },
            {
                group: "A-",
                count: aNegBlood,
            },
            {
                group: "B+",
                count: bPosBlood,
            },
            {
                group: "B-",
                count: bNegBlood,
            },
            {
                group: "AB+",
                count: abPosBlood,
            },
            {
                group: "AB-",
                count: abNegBlood,
            },
            {
                group: "O+",
                count: oPosBlood,
            },
            {
                group: "O-",
                count: oNegBlood,
            },
        ],
    };
}