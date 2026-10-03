import prisma from "../config/database.js";
import {
    DonorStatus,
    RequestStatus,
    ResponseStatus,
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
    };
}