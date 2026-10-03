import type { BloodRequest } from '../data/bloodRequests'
import type { Donor } from '../data/donors'

const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    })

    if (!response.ok) {
        const message = await response.text()

        throw new Error(
            message || `Request failed with status ${response.status}`,
        )
    }

    if (response.status === 204) {
        return undefined as T
    }

    return response.json()
}

export const api = {
    students: {
        getAll: () =>
            request('/students'),

        getById: (id: string) =>
            request(`/students/${id}`),

        create: <T>(data: T) =>
            request('/students', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: <T>(id: string, data: T) =>
            request(`/students/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
    },

    requests: {
        getAll: () => request<BloodRequest[]>('/requests'),

        getById: (id: string) =>
            request<BloodRequest>(`/requests/${id}`),

        create: (data: BloodRequest) =>
            request<BloodRequest>('/requests', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        update: (id: string, data: BloodRequest) =>
            request<BloodRequest>(`/requests/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
    },

    donors: {
        getMatches: (requestId: string) =>
            request<Donor[]>(`/requests/${requestId}/donors`),
    },

    notifications: {
        send: <T>(data: T) =>
            request('/notifications/send', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        getAll: () =>
            request('/notifications'),
    },

    dashboard: {
        getStats: () =>
            request('/dashboard/stats'),
    },
}