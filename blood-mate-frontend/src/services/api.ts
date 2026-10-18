import axios from 'axios'

import type { BloodRequest } from '../data/bloodRequests'
import type { Donor } from '../data/donors'
import type { NotificationRecord } from '../data/notifications'
import type { Student } from '../data/students'
import type { DashboardStats } from '../types/api'

const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export interface StudentPagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface PaginatedStudents {
    students: Student[]
    pagination: StudentPagination
}

interface ApiEnvelope<T> {
    success?: boolean
    data: T
    message?: string
}

interface LoginResponse {
    success: boolean
    token?: string
    user?: {
        id: string
        name: string
        email: string
        role?: string
    }
    message?: string
}

function unwrap<T>(response: T | ApiEnvelope<T>): T {
    if (
        response &&
        typeof response === 'object' &&
        'data' in response &&
        'success' in response
    ) {
        return (response as ApiEnvelope<T>).data
    }

    return response as T
}

// Add authentication token to every protected request.
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')

    if (token) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

// Handle expired/invalid authentication.
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')

            if (window.location.pathname !== '/login') {
                window.location.replace('/login')
            }
        }

        return Promise.reject(error)
    },
)

export const api = {
    students: {
        getAll: async (
            page = 1,
            limit = 20,
        ): Promise<PaginatedStudents> => {
            const response = await apiClient.get(
                '/students',
                {
                    params: { page, limit },
                },
            )

            const body = response.data

            const payload =
                body?.data && !Array.isArray(body.data)
                    ? body.data
                    : body

            return {
                students: Array.isArray(payload?.students)
                    ? payload.students
                    : [],
                pagination: {
                    page: Number(payload?.pagination?.page ?? page),
                    limit: Number(payload?.pagination?.limit ?? limit),
                    total: Number(payload?.pagination?.total ?? 0),
                    totalPages: Number(payload?.pagination?.totalPages ?? 0),
                },
            }
        },

        getById: async (id: string) => {
            const response = await apiClient.get<
                Student | ApiEnvelope<Student>
            >(`/students/${id}`)

            return unwrap(response.data)
        },

        create: async (data: Partial<Student>) => {
            const response = await apiClient.post<
                Student | ApiEnvelope<Student>
            >('/students', data)

            return unwrap(response.data)
        },

        update: async (id: string, data: Partial<Student>) => {
            const response = await apiClient.put<
                Student | ApiEnvelope<Student>
            >(`/students/${id}`, data)

            return unwrap(response.data)
        },
    },

    requests: {
        getAll: async () => {
            const response = await apiClient.get<
                BloodRequest[] | ApiEnvelope<BloodRequest[]>
            >('/blood-requests')

            return unwrap(response.data)
        },

        getById: async (id: string) => {
            const response = await apiClient.get<
                BloodRequest | ApiEnvelope<BloodRequest>
            >(`/blood-requests/${id}`)

            return unwrap(response.data)
        },

        create: async (data: BloodRequest) => {
            const response = await apiClient.post<
                BloodRequest | ApiEnvelope<BloodRequest>
            >('/blood-requests', data)

            return unwrap(response.data)
        },

        update: async (id: string, data: BloodRequest) => {
            const response = await apiClient.put<
                BloodRequest | ApiEnvelope<BloodRequest>
            >(`/blood-requests/${id}`, data)

            return unwrap(response.data)
        },
    },

    donors: {
        getMatches: async (requestId: string) => {
            const response = await apiClient.get<{
                success: boolean
                data: {
                    request: BloodRequest
                    donors: Donor[]
                    totalDonors: number
                }
            }>(`/donor-matching/${requestId}`)

            return response.data.data.donors
        },
    },

    notifications: {
        send: async <T>(data: T) => {
            const response = await apiClient.post('/notifications/send', data)

            return response.data
        },

        getAll: async () => {
            const response = await apiClient.get<
                NotificationRecord[] | ApiEnvelope<NotificationRecord[]>
            >('/notifications')

            return unwrap(response.data)
        },
    },

    dashboard: {
        getStats: async () => {
            const response = await apiClient.get<
                DashboardStats | ApiEnvelope<DashboardStats>
            >('/dashboard/stats')

            return unwrap(response.data)
        },
    },

    auth: {
        login: async (email: string, password: string) => {
            const response = await apiClient.post<LoginResponse>(
                '/auth/login',
                {
                    email,
                    password,
                },
            )

            const data = response.data

            if (!data.success || !data.token) {
                throw new Error(
                    data.message || 'Login failed. Authentication token was not returned.',
                )
            }

            localStorage.setItem('token', data.token)

            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user))
            }

            return data
        },

        logout: () => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        },

        getUser: () => {
            const user = localStorage.getItem('user')

            if (!user) {
                return null
            }

            try {
                return JSON.parse(user)
            } catch {
                return null
            }
        },

        isAuthenticated: () => {
            return Boolean(localStorage.getItem('token'))
        },
    },
}