import type { BloodRequest } from '../data/bloodRequests'
import type { Donor } from '../data/donors'

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
    }
    donorResponses: {
        pending: number
        accepted: number
        declined: number
    }
    donorDistribution: DonorDistribution[]
}

export interface DonorMatchResponse {
    request: BloodRequest
    donors: Donor[]
}

export interface ApiResponse<T> {
    data: T
    message?: string
}