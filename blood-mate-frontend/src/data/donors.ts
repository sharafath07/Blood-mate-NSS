export type DonorAvailability =
    | 'Available now'
    | 'Available today'
    | 'Unavailable'
    | 'Recently contacted'

export type MatchLevel =
    | 'Excellent match'
    | 'Compatible'
    | 'Possible match'

export interface Donor {
    id: string
    name: string
    studentId: string
    department: string
    bloodGroup: string
    phone: string
    availability: DonorAvailability
    lastDonation: string
    donationCount: number
    distance: number
    matchLevel: MatchLevel
    contacted: boolean
    confirmed: boolean
}

export const donors: Donor[] = [
    {
        id: 'D001',
        name: 'Afsal Rahman',
        studentId: 'FC2024001',
        department: 'Computer Science',
        bloodGroup: 'O+',
        phone: '+91 98765 43210',
        availability: 'Available now',
        lastDonation: '18 Jun 2026',
        donationCount: 4,
        distance: 1.8,
        matchLevel: 'Excellent match',
        contacted: false,
        confirmed: false,
    },
    {
        id: 'D002',
        name: 'Amal Dev',
        studentId: 'FC2024110',
        department: 'History',
        bloodGroup: 'O+',
        phone: '+91 98765 43527',
        availability: 'Available today',
        lastDonation: '09 Feb 2026',
        donationCount: 1,
        distance: 3.2,
        matchLevel: 'Excellent match',
        contacted: false,
        confirmed: false,
    },
    {
        id: 'D003',
        name: 'Fathima Nisa',
        studentId: 'FC2024018',
        department: 'Commerce',
        bloodGroup: 'B+',
        phone: '+91 98765 43128',
        availability: 'Available now',
        lastDonation: '02 Aug 2026',
        donationCount: 3,
        distance: 2.4,
        matchLevel: 'Compatible',
        contacted: false,
        confirmed: false,
    },
    {
        id: 'D004',
        name: 'Hiba Mariyam',
        studentId: 'FC2024081',
        department: 'Zoology',
        bloodGroup: 'A−',
        phone: '+91 98765 43761',
        availability: 'Available now',
        lastDonation: '15 Apr 2026',
        donationCount: 2,
        distance: 4.1,
        matchLevel: 'Possible match',
        contacted: false,
        confirmed: false,
    },
    {
        id: 'D005',
        name: 'Riyas Ahmed',
        studentId: 'FC2024096',
        department: 'Economics',
        bloodGroup: 'B−',
        phone: '+91 98765 43611',
        availability: 'Available today',
        lastDonation: '28 Mar 2026',
        donationCount: 3,
        distance: 5.7,
        matchLevel: 'Compatible',
        contacted: false,
        confirmed: false,
    },
    {
        id: 'D006',
        name: 'Muhammed Shamil',
        studentId: 'FC2024034',
        department: 'Physics',
        bloodGroup: 'A+',
        phone: '+91 98765 43094',
        availability: 'Unavailable',
        lastDonation: '12 Jul 2026',
        donationCount: 2,
        distance: 2.9,
        matchLevel: 'Possible match',
        contacted: false,
        confirmed: false,
    },
]