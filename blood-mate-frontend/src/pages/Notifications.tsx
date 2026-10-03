import { useMemo, useState } from 'react'
import {
    Bell,
    Check,
    CheckCheck,
    Clock3,
    MessageCircle,
    MoreHorizontal,
    // Phone,
    Search,
    Send,
    // UserRound,
    // Users,
    X,
    AlertCircle,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'

import type { Donor } from '../data/donors'

import {
    notifications as initialNotifications,
    type NotificationRecord,
    type NotificationStatus,
} from '../data/notifications'

const statusConfig: Record<
    NotificationStatus,
    {
        variant: 'success' | 'warning' | 'danger' | 'neutral' | 'info'
        icon: typeof Check
    }
> = {
    Sent: { variant: 'info', icon: Send },
    Delivered: { variant: 'success', icon: Check },
    Read: { variant: 'success', icon: CheckCheck },
    Responded: { variant: 'success', icon: MessageCircle },
    Pending: { variant: 'warning', icon: Clock3 },
    Failed: { variant: 'danger', icon: X },
}

const defaultMessage =
    'Hello [Name], an [Blood Group] blood donation is urgently needed at [Hospital]. Please confirm if you are available to donate. Your help could make a real difference. Thank you — Blood Mate.'

function StatusBadge({ status }: { status: NotificationStatus }) {
    const config = statusConfig[status]
    const Icon = config.icon

    return (
        <Badge variant={config.variant}>
            <span className="inline-flex items-center gap-1">
                <Icon size={12} />
                {status}
            </span>
        </Badge>
    )
}

export default function Notifications() {
    const [records, setRecords] =
        useState<NotificationRecord[]>(initialNotifications)

    const [search, setSearch] = useState('')

    const location = useLocation()

    const notificationState = location.state as {
        requestId?: string
        bloodGroup?: string
        hospital?: string
        donors?: Donor[]
    } | null

    const selectedDonors = notificationState?.donors ?? []
    const [message, setMessage] = useState(defaultMessage)
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const navigate = useNavigate()

    const filteredRecords = useMemo(() => {
        const query = search.toLowerCase().trim()

        if (!query) return records

        return records.filter(
            (record) =>
                record.donorName.toLowerCase().includes(query) ||
                record.requestId.toLowerCase().includes(query) ||
                record.phone.includes(query) ||
                record.hospital.toLowerCase().includes(query),
        )
    }, [records, search])

    const stats = {
        sent: records.filter((r) =>
            ['Sent', 'Delivered', 'Read', 'Responded'].includes(r.status),
        ).length,
        delivered: records.filter((r) =>
            ['Delivered', 'Read', 'Responded'].includes(r.status),
        ).length,
        pending: records.filter((r) => r.status === 'Pending').length,
        failed: records.filter((r) => r.status === 'Failed').length,
        responses: records.filter((r) => r.status === 'Responded').length,
    }

    const previewDonor = selectedDonors[0]

    const previewMessage = message
        .replace('[Name]', previewDonor?.name ?? 'Donor')
        .replace(
            '[Blood Group]',
            notificationState?.bloodGroup ?? 'blood',
        )
        .replace(
            '[Hospital]',
            notificationState?.hospital ?? 'the hospital',
        )

    const handleRemoveDonor = (id: string) => {
        setSelectedDonors((current) => current.filter((donor) => donor.id !== id))
    }

    const handleSend = async () => {
        if (selectedDonors.length === 0) return

        setSending(true)

        await new Promise((resolve) => setTimeout(resolve, 800))

        const newNotifications = selectedDonors.map((donor) => ({
            id: crypto.randomUUID(),
            requestId: notificationState?.requestId ?? '',
            donorId: donor.id,
            donorName: donor.name,
            phone: donor.phone,
            bloodGroup: donor.bloodGroup,
            hospital: notificationState?.hospital ?? '',
            message: message
                .replace('[Name]', donor.name)
                .replace(
                    '[Blood Group]',
                    notificationState?.bloodGroup ?? donor.bloodGroup,
                )
                .replace(
                    '[Hospital]',
                    notificationState?.hospital ?? '',
                ),
            status: 'Sent' as const,
            sentAt: 'Just now',
        }))

        setNotifications((current) => [
            ...newNotifications,
            ...current,
        ])

        setSending(false)
        setSent(true)
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-600">
                        <MessageCircle size={16} />
                        Donor communication
                    </div>

                    <h1 className="font-['Manrope'] text-3xl font-bold tracking-tight text-neutral-950">
                        Notifications
                    </h1>

                    <p className="mt-1 text-sm text-neutral-500">
                        Contact matched donors and track notification responses.
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-600 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    WhatsApp integration ready
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                <StatCard
                    label="Sent"
                    value={stats.sent}
                    icon={<Send size={17} />}
                />
                <StatCard
                    label="Delivered"
                    value={stats.delivered}
                    icon={<CheckCheck size={17} />}
                />
                <StatCard
                    label="Pending"
                    value={stats.pending}
                    icon={<Clock3 size={17} />}
                />
                <StatCard
                    label="Failed"
                    value={stats.failed}
                    icon={<AlertCircle size={17} />}
                />
                <StatCard
                    label="Responses"
                    value={stats.responses}
                    icon={<MessageCircle size={17} />}
                />
            </div>

            {/* Composer */}
            {selectedDonors.length === 0 ? (
                <Card className="p-8">
                    <div className="text-center">
                        <h3 className="font-['Manrope'] text-lg font-bold text-neutral-900">
                            No donors selected
                        </h3>

                        <p className="mt-2 text-sm text-neutral-500">
                            Select compatible donors from Donor Matching before sending
                            notifications.
                        </p>

                        <Button
                            className="mt-5"
                            onClick={() => navigate('/donors')}
                        >
                            Find donors
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                    <Card className="overflow-hidden">
                        <div className="border-b border-neutral-100 px-5 py-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-['Manrope'] text-lg font-bold text-neutral-900">
                                        Send notification
                                    </h2>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        BM-1024 · O+ · Critical request
                                    </p>
                                </div>

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <MessageCircle size={18} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5 p-5">
                            {/* Recipients */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="text-sm font-semibold text-neutral-800">
                                        Recipients
                                    </label>

                                    <span className="text-xs font-medium text-neutral-400">
                                        {selectedDonors.length} selected
                                    </span>
                                </div>

                                <div className="flex min-h-16 flex-wrap gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                                    {selectedDonors.length ? (
                                        selectedDonors.map((donor) => (
                                            <div
                                                key={donor.id}
                                                className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-2 py-2"
                                            >
                                                <Avatar name={donor.name} size="sm" />

                                                <div className="min-w-0">
                                                    <p className="max-w-32 truncate text-xs font-semibold text-neutral-800">
                                                        {donor.name}
                                                    </p>
                                                    <p className="text-[11px] text-neutral-400">
                                                        {donor.bloodGroup}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDonor(donor.id)}
                                                    className="ml-1 rounded-lg p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                                                    aria-label={`Remove ${donor.name}`}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex w-full items-center justify-center py-2 text-xs text-neutral-400">
                                            No donors selected
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <label
                                        htmlFor="notification-message"
                                        className="text-sm font-semibold text-neutral-800"
                                    >
                                        Message
                                    </label>

                                    <span className="text-xs text-neutral-400">
                                        {message.length}/500
                                    </span>
                                </div>

                                <textarea
                                    id="notification-message"
                                    value={message}
                                    maxLength={500}
                                    onChange={(event) => setMessage(event.target.value)}
                                    rows={7}
                                    className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:ring-4 focus:ring-red-50"
                                />

                                <div className="mt-2 flex flex-wrap gap-2">
                                    {['[Name]', '[Blood Group]', '[Hospital]'].map((variable) => (
                                        <button
                                            key={variable}
                                            type="button"
                                            onClick={() =>
                                                setMessage((current) => `${current} ${variable}`)
                                            }
                                            className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                        >
                                            {variable}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {sent && (
                                <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                                    <Check size={16} />
                                    Notification queued successfully. Backend delivery will be connected later.
                                </div>
                            )}

                            <div className="flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-neutral-400">
                                    Messages are simulated in the frontend.
                                </p>

                                <Button
                                    variant="primary"
                                    icon={<Send size={16} />}
                                    loading={sending}
                                    disabled={!selectedDonors.length || !message.trim()}
                                    onClick={handleSend}
                                >
                                    Send WhatsApp
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* WhatsApp preview */}
                    <Card className="overflow-hidden">
                        <div className="border-b border-neutral-100 px-5 py-4">
                            <h2 className="font-['Manrope'] text-lg font-bold text-neutral-900">
                                Message preview
                            </h2>
                            <p className="mt-1 text-xs text-neutral-500">
                                Preview how the donor notification will appear.
                            </p>
                        </div>

                        <div className="min-h-[390px] bg-[#efeae2] p-5">
                            <div className="mx-auto max-w-sm">
                                <div className="mb-3 flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600">
                                        <HeartIcon />
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-neutral-800">
                                            Blood Mate
                                        </p>
                                        <p className="text-[10px] text-neutral-400">
                                            Official donor notification
                                        </p>
                                    </div>
                                </div>

                                <div className="relative rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                                        {previewMessage}
                                    </p>

                                    <div className="mt-2 flex justify-end text-[10px] text-neutral-400">
                                        5:45 PM
                                        <CheckCheck
                                            size={13}
                                            className="ml-1 text-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* History */}
            <Card className="overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-neutral-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="font-['Manrope'] text-lg font-bold text-neutral-900">
                            Notification history
                        </h2>
                        <p className="mt-1 text-xs text-neutral-500">
                            Track donor communication across active requests.
                        </p>
                    </div>

                    <div className="relative w-full lg:w-72">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search notifications..."
                            className="h-10 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-50"
                        />
                    </div>
                </div>

                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[850px]">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50/70 text-left">
                                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                                    Donor
                                </th>
                                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                                    Request
                                </th>
                                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                                    Hospital
                                </th>
                                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                                    Status
                                </th>
                                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                                    Sent
                                </th>
                                <th className="w-12 px-3" />
                            </tr>
                        </thead>

                        <tbody>
                            {filteredRecords.map((record) => (
                                <NotificationRow
                                    key={record.id}
                                    record={record}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="divide-y divide-neutral-100 md:hidden">
                    {filteredRecords.map((record) => (
                        <div key={record.id} className="space-y-3 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <Avatar name={record.donorName} size="md" />

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-neutral-800">
                                            {record.donorName}
                                        </p>
                                        <p className="text-xs text-neutral-400">
                                            {record.phone}
                                        </p>
                                    </div>
                                </div>

                                <StatusBadge status={record.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-3 rounded-xl bg-neutral-50 p-3 text-xs">
                                <div>
                                    <p className="text-neutral-400">Request</p>
                                    <p className="mt-1 font-semibold text-neutral-700">
                                        {record.requestId}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-neutral-400">Blood group</p>
                                    <p className="mt-1 font-semibold text-neutral-700">
                                        {record.bloodGroup}
                                    </p>
                                </div>

                                <div className="col-span-2">
                                    <p className="text-neutral-400">Hospital</p>
                                    <p className="mt-1 font-semibold text-neutral-700">
                                        {record.hospital}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!filteredRecords.length && (
                    <div className="px-6 py-16 text-center">
                        <Bell className="mx-auto text-neutral-300" size={30} />
                        <p className="mt-3 text-sm font-semibold text-neutral-700">
                            No notifications found
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                            Try a different search term.
                        </p>
                    </div>
                )}
            </Card>
        </div>
    )
}

function StatCard({
    label,
    value,
    icon,
}: {
    label: string
    value: number
    icon: React.ReactNode
}) {
    return (
        <Card className="p-4">
            <div className="flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                    {icon}
                </div>
                <span className="text-2xl font-bold text-neutral-900">{value}</span>
            </div>

            <p className="mt-3 text-xs font-medium text-neutral-500">{label}</p>
        </Card>
    )
}

function NotificationRow({
    record,
}: {
    record: NotificationRecord
}) {
    return (
        <tr className="border-b border-neutral-100 last:border-0">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <Avatar name={record.donorName} size="md" />

                    <div>
                        <p className="text-sm font-semibold text-neutral-800">
                            {record.donorName}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-400">
                            {record.phone}
                        </p>
                    </div>
                </div>
            </td>

            <td className="px-5 py-4">
                <span className="rounded-lg bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-600">
                    {record.requestId}
                </span>
            </td>

            <td className="max-w-48 px-5 py-4">
                <p className="truncate text-sm text-neutral-600">
                    {record.hospital}
                </p>
            </td>

            <td className="px-5 py-4">
                <StatusBadge status={record.status} />
            </td>

            <td className="whitespace-nowrap px-5 py-4 text-xs text-neutral-400">
                {record.sentAt}
            </td>

            <td className="px-3 py-4">
                <button
                    type="button"
                    className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                    aria-label="More options"
                >
                    <MoreHorizontal size={17} />
                </button>
            </td>
        </tr>
    )
}

function HeartIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
        </svg>
    )
}