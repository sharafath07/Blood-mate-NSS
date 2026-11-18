import type { DonorStatus } from './students'

export type RequestStatus =
    | 'PENDING'
    | 'MATCHING'
    | 'FULFILLED'
    | 'CANCELLED'

export type Urgency = 'CRITICAL' | 'URGENT' | 'NORMAL'
export type ResponseStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'NO_RESPONSE'

export interface BloodRequest {
    id: string
    patientName: string
    // patientAge: number
    // patientGender: string
    bloodGroup: string
    units: number
    hospital: string | null
    location: string | null
    // ward: string
    bystanderName: string
    bystanderPhone: string
    // requiredDate: string
    // requiredTime: string
    urgency: Urgency
    status: RequestStatus
    matchedDonors: MatchedDonor[]
    matchedDonorCount?: number
    responses?: { donorId: string; status: ResponseStatus; donatedUnits: number }[]
    contactedDonors: number
    confirmedDonors: number
    createdAt: string
    notes: string | null
    requiredAt?: string | null
    updatedAt?: string
    donatedUnits?: number
}

export interface MatchedDonor {
    id: string
    name: string
    department: string | null
    bloodGroup: string | null
    phone: string | null
    gender: string | null
    semester: number | null
    donorStatus: DonorStatus
}

export type BloodRequestInput = Pick<BloodRequest,
    'patientName' | 'hospital' | 'location' | 'bystanderName' | 'bystanderPhone' |
    'bloodGroup' | 'units' | 'urgency' | 'notes' | 'requiredAt'
>
