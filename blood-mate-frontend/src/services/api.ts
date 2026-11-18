import axios from 'axios'

import type { BloodRequest, BloodRequestInput, RequestStatus, ResponseStatus } from '../data/bloodRequests'
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
    data?: { user: {
        id: string
        name: string
        email: string
        role: string
    } }
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
            filters: { search?: string; department?: string; bloodGroup?: string; donorStatus?: string; semester?: string } = {},
        ): Promise<PaginatedStudents> => {
            const response = await apiClient.get(
                '/students',
                {
                    params: { page, limit, ...filters },
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
            const response = await apiClient.patch<
                Student | ApiEnvelope<Student>
            >(`/students/${id}`, data)

            return unwrap(response.data)
        },
    },

    imports: {
        upload: async (file: File, mode: 'preview' | 'validate' | 'import') => {
            const body = new FormData()
            body.set('file', file)
            const url = mode === 'import' ? '/import/students' : `/import/students/${mode}`
            const response = await apiClient.post<ApiEnvelope<{
                rowCount?: number
                columns?: string[]
                readyToImport?: number
                totalRows?: number
                imported?: number
                skipped?: number
                rows?: { row: number; status: string; errors: string[] }[]
                errors?: { row: number; message: string }[]
            }>>(url, body, { headers: { 'Content-Type': undefined } })
            return unwrap(response.data)
        },
    },

    requests: {
        getAll: async (limit = 100, offset = 0, filters: { search?: string; status?: string; urgency?: string; bloodGroup?: string } = {}): Promise<BloodRequest[]> => {
            const response = await apiClient.get<
                | BloodRequest[]
                | ApiEnvelope<BloodRequest[]>
            >('/blood-requests', { params: { limit, offset, summary: 'true', ...filters } })

            return unwrap(response.data)
        },

        getById: async (id: string) => {
            const response = await apiClient.get<
                BloodRequest | ApiEnvelope<BloodRequest>
            >(`/blood-requests/${id}`)

            return unwrap(response.data)
        },

        create: async (data: BloodRequestInput) => {
            const response = await apiClient.post<
                ApiEnvelope<{ request: BloodRequest }>
            >('/blood-requests', data)

            return unwrap(response.data).request
        },

        update: async (id: string, data: Partial<BloodRequestInput> & { status?: RequestStatus }) => {
            const response = await apiClient.patch<
                BloodRequest | ApiEnvelope<BloodRequest>
            >(`/blood-requests/${id}`, data)

            return unwrap(response.data)
        },

        delete: async (id: string) => {
            const response = await apiClient.delete<
                BloodRequest | ApiEnvelope<BloodRequest>
            >(`/blood-requests/${id}`)

            return unwrap(response.data)
        }
    },

    donors: {
        getMatches: async (requestId: string) => {
            const response = await apiClient.get<{
                success: boolean
                data: {
                    request: Pick<BloodRequest, 'id' | 'bloodGroup' | 'units' | 'status'>
                    donors: BloodRequest['matchedDonors']
                    totalDonors: number
                }
            }>(`/donor-matching/${requestId}`)

            return response.data.data.donors
        },
    },

    notifications: {
        getContactPhone: async (requestId: string, donorId: string) => {
            const response = await apiClient.get<ApiEnvelope<{ phone: string }>>(
                `/whatsapp/${encodeURIComponent(requestId)}/${encodeURIComponent(donorId)}`,
                { params: { format: 'contact' } },
            )
            return '+' + unwrap(response.data).phone
        },
        recordContact: async (data: { requestId: string; donorId: string; message: string }) => {
            await apiClient.post('/notifications', data)
        },
        recordResponse: async (data: { requestId: string; donorId: string; status: ResponseStatus; donatedUnits: number }) => {
            await apiClient.post('/donor-responses', data)
        },

        getAll: async (offset = 0, limit = 50) => {
            const response = await apiClient.get<ApiEnvelope<NotificationRecord[]>>(
                '/notifications', { params: { offset, limit } },
            )

            return unwrap(response.data)
        },
    },
    dashboard: {
        getStats: async (): Promise<DashboardStats> => {
            const response = await apiClient.get<{
                success: boolean
                data: DashboardStats
                message?: string
            }>('/dashboard/stats')

            return response.data.data
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

            if (data.data?.user) {
                localStorage.setItem('user', JSON.stringify(data.data.user))
            } else {
                localStorage.removeItem('user')
            }

            return data
        },

        logout: () => {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            Object.keys(sessionStorage).filter((key) => key.startsWith('contact-draft:'))
                .forEach((key) => sessionStorage.removeItem(key))
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
            const token = localStorage.getItem('token')
            try {
                const payload = token?.split('.')[1]
                if (!payload) return false
                const session = JSON.parse(atob(payload.replaceAll('-', '+').replaceAll('_', '/'))) as { exp?: number }
                return typeof session.exp === 'number' && session.exp * 1000 > Date.now()
            } catch {
                return false
            }
        },
    },
}
