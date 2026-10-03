export type NotificationStatus =
    | 'Sent'
    | 'Delivered'
    | 'Read'
    | 'Responded'
    | 'Pending'
    | 'Failed'

export interface NotificationRecord {
    id: string
    requestId: string
    donorName: string
    phone: string
    bloodGroup: string
    hospital: string
    message: string
    status: NotificationStatus
    sentAt: string
    response?: 'Confirmed' | 'Declined' | 'No response'
}

export const notifications: NotificationRecord[] = [
    {
        id: 'NT-1001',
        requestId: 'BM-1024',
        donorName: 'Afsal Rahman',
        phone: '+91 98765 43210',
        bloodGroup: 'O+',
        hospital: 'Aster MIMS Hospital',
        message:
            'Hello Afsal, an O+ blood donation is urgently needed at Aster MIMS Hospital. Please confirm if you are available to donate.',
        status: 'Responded',
        sentAt: 'Today, 5:42 PM',
        response: 'Confirmed',
    },
    {
        id: 'NT-1002',
        requestId: 'BM-1024',
        donorName: 'Amal Dev',
        phone: '+91 98470 11223',
        bloodGroup: 'O+',
        hospital: 'Aster MIMS Hospital',
        message:
            'Hello Amal, an O+ blood donation is urgently needed at Aster MIMS Hospital. Please confirm if you are available to donate.',
        status: 'Read',
        sentAt: 'Today, 5:40 PM',
    },
    {
        id: 'NT-1003',
        requestId: 'BM-1023',
        donorName: 'Fathima Nisa',
        phone: '+91 98951 22334',
        bloodGroup: 'B+',
        hospital: 'Baby Memorial Hospital',
        message:
            'Hello Fathima, a B+ blood donation request has been raised at Baby Memorial Hospital. Please let us know if you can help.',
        status: 'Delivered',
        sentAt: 'Today, 3:18 PM',
    },
    {
        id: 'NT-1004',
        requestId: 'BM-1022',
        donorName: 'Hiba Mariyam',
        phone: '+91 97462 44556',
        bloodGroup: 'A-',
        hospital: 'KIMS Hospital',
        message:
            'Hello Hiba, an A- blood donation is needed at KIMS Hospital. Please confirm your availability.',
        status: 'Sent',
        sentAt: 'Today, 1:05 PM',
    },
    {
        id: 'NT-1005',
        requestId: 'BM-1021',
        donorName: 'Riyas Ahmed',
        phone: '+91 99610 66778',
        bloodGroup: 'B-',
        hospital: 'IQRAA Hospital',
        message:
            'Hello Riyas, a B- blood donation request has been raised at IQRAA Hospital.',
        status: 'Failed',
        sentAt: 'Yesterday, 6:31 PM',
    },
]