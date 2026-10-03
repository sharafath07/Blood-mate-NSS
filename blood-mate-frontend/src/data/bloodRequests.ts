export type RequestStatus =
    | 'New'
    | 'Searching'
    | 'Donors Contacted'
    | 'Partially Fulfilled'
    | 'Fulfilled'
    | 'Cancelled'

export type Urgency = 'Critical' | 'Urgent' | 'Normal'

export interface BloodRequest {
    id: string
    patientName: string
    patientAge: number
    patientGender: string
    bloodGroup: string
    unitsRequired: number
    hospital: string
    location: string
    ward: string
    contactPerson: string
    contactNumber: string
    requiredDate: string
    requiredTime: string
    urgency: Urgency
    status: RequestStatus
    matchedDonors: number
    contactedDonors: number
    confirmedDonors: number
    createdAt: string
    notes: string
}

export const bloodRequests: BloodRequest[] = [
    {
        id: 'BM-1024',
        patientName: 'Muhammed Riyas',
        patientAge: 47,
        patientGender: 'Male',
        bloodGroup: 'O+',
        unitsRequired: 2,
        hospital: 'Baby Memorial Hospital',
        location: 'Kozhikode',
        ward: 'ICU',
        contactPerson: 'Rashid',
        contactNumber: '+91 98765 21001',
        requiredDate: '2026-10-03',
        requiredTime: '18:30',
        urgency: 'Critical',
        status: 'Searching',
        matchedDonors: 14,
        contactedDonors: 8,
        confirmedDonors: 1,
        createdAt: '12 min ago',
        notes: 'Blood required urgently for surgery.',
    },
    {
        id: 'BM-1023',
        patientName: 'Fathima Nisa',
        patientAge: 32,
        patientGender: 'Female',
        bloodGroup: 'B+',
        unitsRequired: 1,
        hospital: 'Kozhikode Medical College',
        location: 'Kozhikode',
        ward: 'General Ward',
        contactPerson: 'Nihal',
        contactNumber: '+91 98765 21002',
        requiredDate: '2026-10-04',
        requiredTime: '09:00',
        urgency: 'Urgent',
        status: 'Donors Contacted',
        matchedDonors: 11,
        contactedDonors: 7,
        confirmedDonors: 2,
        createdAt: '42 min ago',
        notes: 'Replacement donor required.',
    },
    {
        id: 'BM-1022',
        patientName: 'Adil Rahman',
        patientAge: 61,
        patientGender: 'Male',
        bloodGroup: 'A−',
        unitsRequired: 2,
        hospital: 'IQRAA Hospital',
        location: 'Kozhikode',
        ward: 'Cardiology',
        contactPerson: 'Sameer',
        contactNumber: '+91 98765 21003',
        requiredDate: '2026-10-05',
        requiredTime: '10:30',
        urgency: 'Normal',
        status: 'New',
        matchedDonors: 0,
        contactedDonors: 0,
        confirmedDonors: 0,
        createdAt: '2 hrs ago',
        notes: '',
    },
    {
        id: 'BM-1021',
        patientName: 'Shahana K',
        patientAge: 28,
        patientGender: 'Female',
        bloodGroup: 'O−',
        unitsRequired: 1,
        hospital: 'MVR Cancer Centre',
        location: 'Kozhikode',
        ward: 'Oncology',
        contactPerson: 'Ameen',
        contactNumber: '+91 98765 21004',
        requiredDate: '2026-10-03',
        requiredTime: '20:00',
        urgency: 'Urgent',
        status: 'Partially Fulfilled',
        matchedDonors: 6,
        contactedDonors: 5,
        confirmedDonors: 1,
        createdAt: '3 hrs ago',
        notes: 'One additional donor needed.',
    },
    {
        id: 'BM-1020',
        patientName: 'Haris P',
        patientAge: 39,
        patientGender: 'Male',
        bloodGroup: 'AB+',
        unitsRequired: 1,
        hospital: 'Aster MIMS',
        location: 'Kozhikode',
        ward: 'Emergency',
        contactPerson: 'Fazil',
        contactNumber: '+91 98765 21005',
        requiredDate: '2026-10-03',
        requiredTime: '21:00',
        urgency: 'Critical',
        status: 'Fulfilled',
        matchedDonors: 9,
        contactedDonors: 6,
        confirmedDonors: 1,
        createdAt: '5 hrs ago',
        notes: '',
    },
]