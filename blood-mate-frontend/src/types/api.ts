export interface DonorDistribution {
    group: string
    count: number
    percentage: number
}
export interface DashboardStats {
    students: {
        total: number
    }
    donors: {
        total: number
        available: number
        unavailable: number
        inactive: number
    }
    bloodRequests: {
        total: number
        pending: number
        matching: number
        fulfilled: number
        cancelled: number
        critical: number
    }
    donorResponses: {
        pending: number
        accepted: number
        declined: number
        noResponse: number
        donatedUnits: number
    }
    donorDistribution: DonorDistribution[]
}
