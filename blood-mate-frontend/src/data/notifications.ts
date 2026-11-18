import type { ResponseStatus } from './bloodRequests'

export interface NotificationRecord {
    id: string
    requestId: string
    donorId: string
    donorName: string
    phone: string
    bloodGroup: string
    hospital: string
    message: string
    status: 'Sent' | 'Responded'
    sentAt: string
    responseStatus: ResponseStatus
    donatedUnits: number
}
