export type DonorStatus =
    | 'Available'
    | 'Unavailable'
    | 'Not Confirmed'

export interface Student {
    id: string
    name: string
    studentId: string
    department: string
    course: string
    semester: string
    bloodGroup: string
    phone: string
    email: string
    donorStatus: DonorStatus
    lastDonation: string
    donations: number
    consent: boolean
    verified: boolean
}

export const students: Student[] = [
    {
        id: '1',
        name: 'Afsal Rahman',
        studentId: 'FC2024001',
        department: 'Computer Science',
        course: 'BCA',
        semester: '6',
        bloodGroup: 'O+',
        phone: '+91 98765 43210',
        email: 'afsal@example.com',
        donorStatus: 'Available',
        lastDonation: '18 Jun 2026',
        donations: 4,
        consent: true,
        verified: true,
    },
    {
        id: '2',
        name: 'Fathima Nisa',
        studentId: 'FC2024018',
        department: 'Commerce',
        course: 'B.Com',
        semester: '4',
        bloodGroup: 'B+',
        phone: '+91 98765 43128',
        email: 'fathima@example.com',
        donorStatus: 'Available',
        lastDonation: '02 Aug 2026',
        donations: 3,
        consent: true,
        verified: true,
    },
    {
        id: '3',
        name: 'Muhammed Shamil',
        studentId: 'FC2024034',
        department: 'Physics',
        course: 'B.Sc Physics',
        semester: '6',
        bloodGroup: 'A+',
        phone: '+91 98765 43094',
        email: 'shamil@example.com',
        donorStatus: 'Unavailable',
        lastDonation: '12 Jul 2026',
        donations: 2,
        consent: true,
        verified: true,
    },
    {
        id: '4',
        name: 'Shahana K',
        studentId: 'FC2024052',
        department: 'English',
        course: 'BA English',
        semester: '4',
        bloodGroup: 'O−',
        phone: '+91 98765 43872',
        email: 'shahana@example.com',
        donorStatus: 'Available',
        lastDonation: '24 May 2026',
        donations: 5,
        consent: true,
        verified: true,
    },
    {
        id: '5',
        name: 'Adil Basheer',
        studentId: 'FC2024069',
        department: 'Mathematics',
        course: 'B.Sc Mathematics',
        semester: '2',
        bloodGroup: 'AB+',
        phone: '+91 98765 43901',
        email: 'adil@example.com',
        donorStatus: 'Not Confirmed',
        lastDonation: '—',
        donations: 0,
        consent: false,
        verified: false,
    },
    {
        id: '6',
        name: 'Hiba Mariyam',
        studentId: 'FC2024081',
        department: 'Zoology',
        course: 'B.Sc Zoology',
        semester: '4',
        bloodGroup: 'A−',
        phone: '+91 98765 43761',
        email: 'hiba@example.com',
        donorStatus: 'Available',
        lastDonation: '15 Apr 2026',
        donations: 2,
        consent: true,
        verified: true,
    },
    {
        id: '7',
        name: 'Riyas Ahmed',
        studentId: 'FC2024096',
        department: 'Economics',
        course: 'BA Economics',
        semester: '6',
        bloodGroup: 'B−',
        phone: '+91 98765 43611',
        email: 'riyas@example.com',
        donorStatus: 'Available',
        lastDonation: '28 Mar 2026',
        donations: 3,
        consent: true,
        verified: true,
    },
    {
        id: '8',
        name: 'Amal Dev',
        studentId: 'FC2024110',
        department: 'History',
        course: 'BA History',
        semester: '2',
        bloodGroup: 'O+',
        phone: '+91 98765 43527',
        email: 'amal@example.com',
        donorStatus: 'Unavailable',
        lastDonation: '09 Feb 2026',
        donations: 1,
        consent: true,
        verified: true,
    },
]