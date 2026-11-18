export type DonorStatus =
    | 'AVAILABLE'
    | 'UNAVAILABLE'
    | 'INACTIVE'

export interface Student {
    id: string
    name: string
    department: string | null
    age: number | null
    gender: string | null
    semester: number | null
    bloodGroup: string | null
    phone: string | null
    address: string | null
    willingToDonate: boolean
    isDonor?: boolean
    donorStatus: DonorStatus
}
