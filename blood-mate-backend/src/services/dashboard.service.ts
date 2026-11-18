import prisma from "../config/database.js";
import { BloodGroup } from "../generated/prisma/client.js";

export async function getDashboardStats() {
    const [students, donorGroups, requestGroups, responseGroups, critical] = await Promise.all([
        prisma.student.count(),
        prisma.student.groupBy({
            by: ["donorStatus", "bloodGroup"],
            where: { isDonor: true, willingToDonate: true },
            _count: { _all: true },
        }),
        prisma.bloodRequest.groupBy({ by: ["status"], _count: { _all: true } }),
        prisma.donorResponse.groupBy({ by: ["status"], _count: { _all: true }, _sum: { donatedUnits: true } }),
        prisma.bloodRequest.count({ where: { urgency: "CRITICAL", status: { in: ["PENDING", "MATCHING"] } } }),
    ]);

    const requests = new Map(requestGroups.map(({ status, _count }) => [status, _count._all]));
    const responses = new Map(responseGroups.map(({ status, _count }) => [status, _count._all]));
    const total = donorGroups.reduce((sum, row) => sum + row._count._all, 0);
    const available = donorGroups.reduce((sum, row) => sum + (row.donorStatus === "AVAILABLE" ? row._count._all : 0), 0);

    return {
        students: { total: students },
        donors: {
            total,
            available,
            unavailable: donorGroups.reduce((sum, row) => sum + (row.donorStatus === "UNAVAILABLE" ? row._count._all : 0), 0),
            inactive: donorGroups.reduce((sum, row) => sum + (row.donorStatus === "INACTIVE" ? row._count._all : 0), 0),
        },
        bloodRequests: {
            total: requestGroups.reduce((sum, row) => sum + row._count._all, 0),
            pending: requests.get("PENDING") ?? 0,
            matching: requests.get("MATCHING") ?? 0,
            fulfilled: requests.get("FULFILLED") ?? 0,
            cancelled: requests.get("CANCELLED") ?? 0,
            critical,
        },
        donorResponses: {
            pending: responses.get("PENDING") ?? 0,
            accepted: responses.get("ACCEPTED") ?? 0,
            declined: responses.get("DECLINED") ?? 0,
            noResponse: responses.get("NO_RESPONSE") ?? 0,
            donatedUnits: responseGroups.reduce((sum, row) => sum + (row._sum.donatedUnits ?? 0), 0),
        },
        donorDistribution: [...Object.values(BloodGroup), null].map((group) => {
            const count = donorGroups.find((row) => row.bloodGroup === group && row.donorStatus === "AVAILABLE")?._count._all ?? 0;
            return {
                group: group?.replace("_POSITIVE", "+").replace("_NEGATIVE", "-") ?? "Unknown",
                count,
                percentage: available ? Math.round(count * 1000 / available) / 10 : 0,
            };
        }),
    };
}
