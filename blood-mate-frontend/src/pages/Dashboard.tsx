import {
    ArrowUpRight,
    ChevronRight,
    Clock3,
    Droplets,
    HeartPulse,
    Plus,
    Search,
    ShieldCheck,
    Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { motion } from 'motion/react'
import { pageMotion } from '../lib/motion'
import type { BloodRequest } from '../data/bloodRequests'
import type { DashboardStats } from '../types/api'
import { useNavigate } from 'react-router-dom'

function StatCard({
    label,
    value,
    change,
    description,
    icon: Icon,
    urgent,
}: {
    label: string
    value: string | number
    change?: string
    description: string
    icon: typeof Users
    urgent?: boolean
}) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
            <div className="flex items-start justify-between">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${urgent ? 'bg-red-50' : 'bg-neutral-50'
                        }`}
                >
                    <Icon
                        className={`h-[19px] w-[19px] ${urgent ? 'text-red-600' : 'text-neutral-700'
                            }`}
                        strokeWidth={1.8}
                    />
                </div>
            </div>

            <div className="mt-5">
                <p className="text-[12px] font-medium text-neutral-400">{label}</p>

                <div className="mt-1.5 flex items-end gap-2">
                    <h3 className="font-['Manrope'] text-[27px] font-extrabold tracking-[-0.04em] text-neutral-950">
                        {value}
                    </h3>

                    {change && (
                        <span
                            className={`mb-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${urgent
                                ? 'bg-red-50 text-red-600'
                                : 'bg-emerald-50 text-emerald-600'
                                }`}
                        >
                            {change}
                        </span>
                    )}
                </div>

                <p className="mt-1 text-[10px] text-neutral-400">{description}</p>
            </div>
        </div>
    )
}

function BloodGroupRow({
    group,
    count,
    percentage,
}: {
    group: string
    count: number
    percentage: number
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[11px] font-bold text-red-600">
                {group}
            </div>

            <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-600">
                        {count} donors
                    </span>

                    <span className="text-[10px] font-medium text-neutral-400">
                        {percentage}%
                    </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                    <div
                        className="h-full rounded-full bg-[#b91c1c] transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    )
}

function UrgencyBadge({ urgency }: { urgency: string }) {
    const styles = {
        CRITICAL: 'bg-red-50 text-red-600 ring-red-100',
        URGENT: 'bg-orange-50 text-orange-600 ring-orange-100',
        NORMAL: 'bg-neutral-50 text-neutral-500 ring-neutral-100',
    }

    return (
        <span
            className={`inline-flex rounded-full px-2 py-1 text-[9px] font-bold ring-1 ${styles[urgency as keyof typeof styles] ?? styles.NORMAL
                }`}
        >
            {urgency ? urgency.charAt(0) + urgency.slice(1).toLowerCase() : "Normal"}
        </span>
    )
}

export default function Dashboard() {
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)

    const navigate = useNavigate()

    const [recentRequests, setRecentRequests] = useState<BloodRequest[]>([])
    const bloodGroups = dashboardStats?.donorDistribution ?? []
    const [requestsLoading, setRequestsLoading] = useState(true)

    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState<string | null>(null)
    const stats = [
        {
            label: 'Registered Students',
            value: dashboardStats?.students.total ?? 0,
            description: 'registered in Blood Mate',
            icon: Users,
        },
        {
            label: 'Active Donors',
            value: dashboardStats?.donors.available ?? 0,
            description: 'currently available',
            icon: HeartPulse,
        },
        {
            label: 'Active Requests',
            value: (dashboardStats?.bloodRequests.pending ?? 0) + (dashboardStats?.bloodRequests.matching ?? 0),
            description: `${dashboardStats?.bloodRequests.pending ?? 0} pending`,
            icon: Droplets,
            urgent: true,
        },
        {
            label: 'Requests Fulfilled',
            value: dashboardStats?.bloodRequests.fulfilled ?? 0,
            description: 'requests fulfilled',
            icon: ShieldCheck,
        },
    ]

    useEffect(() => {
        let cancelled = false

        async function loadDashboard() {
            setLoading(true)
            setRequestsLoading(true)
            setApiError(null)

            const [statsResult, requestsResult] = await Promise.allSettled([
                api.dashboard.getStats(),
                api.requests.getAll(5),
            ])

            if (cancelled) return

            if (statsResult.status === 'fulfilled') {
                const data = statsResult.value

                setDashboardStats(data)
            } else {
                console.error(
                    'Failed to load dashboard statistics:',
                    statsResult.reason,
                )
                setApiError('Unable to load dashboard statistics.')
            }

            if (requestsResult.status === 'fulfilled') {
                const data = requestsResult.value

                if (Array.isArray(data)) {
                    setRecentRequests(
                        [...data]
                            .sort(
                                (a, b) =>
                                    new Date(b.createdAt).getTime() -
                                    new Date(a.createdAt).getTime(),
                            )
                            .slice(0, 5),
                    )
                } else {
                    setRecentRequests([])
                }
            } else {
                console.error(
                    'Failed to load recent requests:',
                    requestsResult.reason,
                )
                setApiError((current) =>
                    current
                        ? `${current} Recent requests could not be loaded.`
                        : 'Unable to load recent blood requests.',
                )
            }

            setLoading(false)
            setRequestsLoading(false)
        }

        void loadDashboard()

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <motion.div {...pageMotion} className="mx-auto max-w-[1500px]">

            {/* Page heading */}
            <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>

                    <h1 className="font-['Manrope'] text-[30px] font-extrabold tracking-[-0.045em] text-neutral-950 sm:text-[34px]">
                        Blood donation dashboard
                    </h1>

                    <p className="mt-1.5 text-[13px] text-neutral-400">
                        Here's what's happening across your blood donation network.
                    </p>
                </div>

                <div className="flex gap-2">

                    <button type="button" onClick={() => navigate('/requests?new=1')} className="flex items-center gap-2 rounded-xl bg-[#b91c1c] px-4 py-2.5 text-[11px] font-bold text-white shadow-[0_8px_20px_rgba(185,28,28,0.2)] transition hover:bg-[#991b1b]">
                        <Plus className="h-3.5 w-3.5" />
                        New request
                    </button>
                </div>
            </div>

            {apiError && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {apiError}
                </div>
            )}

            {loading && (
                <div className="mb-5 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                    Loading dashboard statistics...
                </div>
            )}

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>

            {/* Main grid */}
            <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">

                {/* Blood groups */}
                <section className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6">
                    <div className="mb-6 flex items-start justify-between">
                        <div>
                            <h2 className="font-['Manrope'] text-[15px] font-extrabold tracking-tight text-neutral-900">
                                Donor distribution
                            </h2>

                            <p className="mt-1 text-[10px] text-neutral-400">
                                Active donors by blood group
                            </p>
                        </div>

                        <button type="button" onClick={() => navigate('/students?available=1')} className="flex items-center gap-1 text-[10px] font-bold text-red-600 hover:text-red-700">
                            View all
                            <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>

                    {bloodGroups.length > 0 ? (
                        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                            {bloodGroups.map((item) => (
                                <BloodGroupRow key={item.group} {...item} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-500">
                            Donor distribution is not available yet.
                        </p>
                    )}
                </section>

                {/* Quick actions */}
                <section className="overflow-hidden rounded-2xl bg-neutral-950 p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white/60">
                                Quick actions
                            </span>

                            <h2 className="mt-4 font-['Manrope'] text-[21px] font-extrabold tracking-[-0.03em]">
                                Help someone today.
                            </h2>

                            <p className="mt-1.5 max-w-[320px] text-[11px] leading-relaxed text-white/45">
                                Manage requests, find compatible donors and coordinate
                                life-saving donations.
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                            <HeartPulse className="h-5 w-5 text-white" />
                        </div>
                    </div>

                    <div className="mt-7 grid gap-2 sm:grid-cols-2">
                        <button type="button" onClick={() => navigate('/requests?new=1')} className="group flex items-center justify-between rounded-xl bg-white px-4 py-3 text-left transition hover:bg-neutral-100">
                            <div>
                                <p className="text-[11px] font-bold text-neutral-900">
                                    Create request
                                </p>
                                <p className="mt-0.5 text-[9px] text-neutral-400">
                                    Start a blood request
                                </p>
                            </div>

                            <ArrowUpRight className="h-4 w-4 text-neutral-400 transition group-hover:text-neutral-900" />
                        </button>

                        <button type="button" onClick={() => navigate('/requests')} className="group flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left transition hover:bg-white/15">
                            <div>
                                <p className="text-[11px] font-bold text-white">
                                    Find donors
                                </p>
                                <p className="mt-0.5 text-[9px] text-white/40">
                                    Match compatible donors
                                </p>
                            </div>

                            <ArrowUpRight className="h-4 w-4 text-white/50 transition group-hover:text-white" />
                        </button>
                    </div>
                </section>
            </div>

            {/* Requests */}
            <section className="mt-5 rounded-2xl border border-neutral-200/80 bg-white">

                <div className="flex flex-col gap-4 border-b border-neutral-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-['Manrope'] text-[15px] font-extrabold tracking-tight text-neutral-900">
                                Recent blood requests
                            </h2>

                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-600">
                                {dashboardStats?.bloodRequests.pending ?? 0} pending
                            </span>
                        </div>

                        <p className="mt-1 text-[10px] text-neutral-400">
                            Requests that need your attention
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => navigate('/requests')} className="hidden items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-[10px] font-semibold text-neutral-500 sm:flex">
                            <Search className="h-3 w-3" />
                            Search
                        </button>

                        <button type="button" onClick={() => navigate('/requests')} className="flex items-center gap-1 text-[10px] font-bold text-red-600">
                            View all
                            <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                {requestsLoading ? (
                    <p className="p-6 text-sm text-neutral-500">
                        Loading recent requests…
                    </p>
                ) : recentRequests.length === 0 ? (
                    <p className="p-6 text-sm text-neutral-500">
                        No blood requests found.
                    </p>
                ) : (
                    <div>
                        {/* Desktop table */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-100 text-left">
                                        <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                                            Request
                                        </th>
                                        <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                                            Blood
                                        </th>
                                        <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                                            Hospital
                                        </th>
                                        <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                                            Units
                                        </th>
                                        <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                                            Urgency
                                        </th>
                                        <th className="px-6 py-3 text-right text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                                            Updated
                                        </th>
                                    </tr>
                                </thead>


                                <tbody>
                                    {recentRequests.map((request) => (
                                        <tr
                                            key={request.id}
                                            className="group border-b border-neutral-50 transition hover:bg-neutral-50/70"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-[11px] font-bold text-neutral-800">
                                                        {request.patientName}
                                                    </p>
                                                    <p className="mt-0.5 text-[9px] text-neutral-400">
                                                        {request.id}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-red-50 px-2 text-[10px] font-bold text-red-600">
                                                    {request.bloodGroup}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className="text-[10px] font-medium text-neutral-600">
                                                    {request.hospital}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className="text-[10px] font-semibold text-neutral-700">
                                                    {request.units} unit{request.units > 1 ? 's' : ''}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <UrgencyBadge urgency={request.urgency} />
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5 text-[9px] text-neutral-400">
                                                    <Clock3 className="h-3 w-3" />
                                                    {new Date(request.updatedAt ?? request.createdAt).toLocaleString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="divide-y divide-neutral-100 md:hidden">
                            {recentRequests.map((request) => (
                                <div key={request.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-[11px] font-bold text-red-600">
                                                {request.bloodGroup}
                                            </div>

                                            <div>
                                                <p className="text-[11px] font-bold text-neutral-800">
                                                    {request.patientName}
                                                </p>
                                                <p className="mt-0.5 text-[9px] text-neutral-400">
                                                    {request.id}
                                                </p>
                                            </div>
                                        </div>

                                        <UrgencyBadge urgency={request.urgency} />
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-[9px] text-neutral-400">
                                            {request.hospital}
                                        </span>

                                        <span className="text-[9px] font-semibold text-neutral-500">
                                            {request.units} unit{request.units > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </section>

        </motion.div >
    )
}