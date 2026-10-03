import type { Student } from '../data/students'
import type { BloodRequest } from '../data/bloodRequests'
import type { Donor } from '../data/donors'

export interface DashboardStats {
    registeredStudents: number
    activeDonors: number
    activeRequests: number
    requestsFulfilled: number
    urgentRequests: number
}

export interface DonorMatchResponse {
    request: BloodRequest
    donors: Donor[]
}

export interface ApiResponse<T> {
    data: T
    message?: string
}