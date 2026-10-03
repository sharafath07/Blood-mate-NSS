import {
    AlertCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock3,
    FileHeart,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    X,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'

import {
    bloodRequests,
    type BloodRequest,
    type RequestStatus,
    type Urgency,
} from '../data/bloodRequests'

import {
    RequestStatusBadge,
    UrgencyBadge,
} from '../components/requests/RequestStatusBadge'
import BloodRequestForm from '../components/requests/BloodRequestForm'

const statuses = [
    'All statuses',
    'New',
    'Searching',
    'Donors Contacted',
    'Partially Fulfilled',
    'Fulfilled',
    'Cancelled',
]

const urgencies = [
    'All urgency',
    'Critical',
    'Urgent',
    'Normal',
]

const bloodGroups = [
    'All blood groups',
    'A+',
    'A−',
    'B+',
    'B−',
    'AB+',
    'AB−',
    'O+',
    'O−',
]

export default function BloodRequests() {
    const [requests, setRequests] =
        useState<BloodRequest[]>(bloodRequests)

    const [formOpen, setFormOpen] = useState(false)
    const [editingRequest, setEditingRequest] =
        useState<BloodRequest | null>(null)

    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('All statuses')
    const [urgency, setUrgency] = useState('All urgency')
    const [bloodGroup, setBloodGroup] =
        useState('All blood groups')

    const [selectedRequest, setSelectedRequest] =
        useState<BloodRequest | null>(null)

    const filteredRequests = useMemo(() => {
        const query = search.toLowerCase().trim()

        return requests.filter((request) => {
            const matchesSearch =
                !query ||
                request.patientName.toLowerCase().includes(query) ||
                request.id.toLowerCase().includes(query) ||
                request.hospital.toLowerCase().includes(query)

            const matchesStatus =
                status === 'All statuses' ||
                request.status === status

            const matchesUrgency =
                urgency === 'All urgency' ||
                request.urgency === urgency

            const matchesBlood =
                bloodGroup === 'All blood groups' ||
                request.bloodGroup === bloodGroup

            return (
                matchesSearch &&
                matchesStatus &&
                matchesUrgency &&
                matchesBlood
            )
        })
    }, [requests, search, status, urgency, bloodGroup])

    const criticalCount = requests.filter(
        (request) => request.urgency === 'Critical',
    ).length

    const searchingCount = requests.filter(
        (request) =>
            request.status === 'Searching' ||
            request.status === 'Donors Contacted',
    ).length

    const fulfilledCount = requests.filter(
        (request) => request.status === 'Fulfilled',
    ).length

    const hasFilters =
        search ||
        status !== 'All statuses' ||
        urgency !== 'All urgency' ||
        bloodGroup !== 'All blood groups'

    function clearFilters() {
        setSearch('')
        setStatus('All statuses')
        setUrgency('All urgency')
        setBloodGroup('All blood groups')
    }

    const handleSaveRequest = (request: BloodRequest) => {
        setRequests((current) => {
            const exists = current.some((item) => item.id === request.id)

            if (exists) {
                return current.map((item) =>
                    item.id === request.id ? request : item,
                )
            }

            return [request, ...current]
        })

        setFormOpen(false)
        setEditingRequest(null)
    }

    function handleRequestCreated(request: BloodRequest) {
        setRequests((current) => [request, ...current])
    }

    return (
        <div className="mx-auto max-w-[1500px]">

            {/* Header */}
            <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <FileHeart className="h-3.5 w-3.5 text-red-600" />

                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                            Blood coordination
                        </span>
                    </div>

                    <h1 className="font-['Manrope'] text-[30px] font-extrabold tracking-[-0.045em] text-neutral-950 sm:text-[34px]">
                        Blood requests
                    </h1>

                    <p className="mt-1.5 text-[13px] text-neutral-400">
                        Track requests and coordinate compatible donors.
                    </p>
                </div>

                <Button
                    icon={<Plus size={16} />}
                    onClick={() => {
                        setEditingRequest(null)
                        setFormOpen(true)
                    }}
                >
                    Create Request
                </Button>
            </div>

            {/* Emergency banner */}
            {criticalCount > 0 && (
                <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50/70 p-4 sm:flex-row sm:items-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>

                    <div className="flex-1">
                        <p className="text-[11px] font-bold text-red-800">
                            {criticalCount} critical request
                            {criticalCount > 1 ? 's' : ''} need attention
                        </p>

                        <p className="mt-0.5 text-[9px] text-red-600/70">
                            These requests may require immediate donor
                            coordination.
                        </p>
                    </div>

                    <button
                        onClick={() => setUrgency('Critical')}
                        className="rounded-lg bg-red-600 px-3 py-2 text-[9px] font-bold text-white transition hover:bg-red-700"
                    >
                        View critical
                    </button>
                </div>
            )}

            {/* Summary */}
            <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

                <SummaryCard
                    label="Total requests"
                    value={requests.length}
                    description="All requests"
                />

                <SummaryCard
                    label="Need attention"
                    value={searchingCount}
                    description="Searching for donors"
                    urgent
                />

                <SummaryCard
                    label="Critical"
                    value={criticalCount}
                    description="Require immediate action"
                    urgent
                />

                <SummaryCard
                    label="Fulfilled"
                    value={fulfilledCount}
                    description="Successfully completed"
                    success
                />

            </div>

            {/* Filters */}
            <Card className="mb-5 p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-end">

                    <div className="min-w-0 flex-1 xl:max-w-[330px]">
                        <Input
                            placeholder="Search patient, request ID or hospital..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            className="pl-10"
                        />

                        <Search className="pointer-events-none relative -top-[30px] left-3 h-3.5 w-3.5 text-neutral-300" />
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:flex">
                        <FilterSelect
                            value={status}
                            onChange={setStatus}
                            options={statuses}
                        />

                        <FilterSelect
                            value={urgency}
                            onChange={setUrgency}
                            options={urgencies}
                        />

                        <FilterSelect
                            value={bloodGroup}
                            onChange={setBloodGroup}
                            options={bloodGroups}
                        />
                    </div>

                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[10px] font-bold text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-800"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </button>
                    )}
                </div>
            </Card>

            {/* Requests */}
            <Card className="overflow-hidden">

                <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="font-['Manrope'] text-[14px] font-extrabold tracking-tight">
                            Request queue
                        </h2>

                        <p className="mt-1 text-[9px] text-neutral-400">
                            {filteredRequests.length} matching request
                            {filteredRequests.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-[9px] font-bold text-neutral-500 hover:bg-neutral-50">
                        <Filter className="h-3 w-3" />
                        More filters
                    </button>
                </div>

                {/* Desktop */}
                <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-100 text-left">
                                {[
                                    'Patient',
                                    'Blood',
                                    'Hospital',
                                    'Required',
                                    'Urgency',
                                    'Status',
                                    'Donors',
                                    '',
                                ].map((heading) => (
                                    <th
                                        key={heading}
                                        className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-neutral-400 first:pl-6 last:pr-6"
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {filteredRequests.map((request) => (
                                <RequestRow
                                    key={request.id}
                                    request={request}
                                    onSelect={setSelectedRequest}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile */}
                <div className="divide-y divide-neutral-100 lg:hidden">
                    {filteredRequests.map((request) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            onSelect={setSelectedRequest}
                        />
                    ))}
                </div>

                {filteredRequests.length === 0 && (
                    <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50">
                            <FileHeart className="h-5 w-5 text-neutral-300" />
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-neutral-800">
                            No requests found
                        </h3>

                        <p className="mt-1 max-w-[280px] text-[10px] leading-relaxed text-neutral-400">
                            Try changing your filters or search criteria.
                        </p>

                        <button
                            onClick={clearFilters}
                            className="mt-4 text-[10px] font-bold text-red-600"
                        >
                            Clear filters
                        </button>
                    </div>
                )}

                {filteredRequests.length > 0 && (
                    <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3.5">
                        <p className="text-[9px] text-neutral-400">
                            Showing {filteredRequests.length} requests
                        </p>

                        <div className="flex items-center gap-1">
                            <button className="rounded-lg p-1.5 text-neutral-300 hover:bg-neutral-50">
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>

                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-900 text-[9px] font-bold text-white">
                                1
                            </span>

                            <button className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-50">
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}

            </Card>

            {/* Detail drawer */}
            {selectedRequest && (
                <RequestDetails
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onEdit={(request) => {
                        setSelectedRequest(null)
                        setEditingRequest(request)
                        setFormOpen(true)
                    }}
                />
            )}

            {formOpen && (
                <BloodRequestForm
                    request={editingRequest}
                    onClose={() => {
                        setFormOpen(false)
                        setEditingRequest(null)
                    }}
                    onSave={handleSaveRequest}
                />
            )}
        </div>
    )
}

function SummaryCard({
    label,
    value,
    description,
    urgent,
    success,
}: {
    label: string
    value: number
    description: string
    urgent?: boolean
    success?: boolean
}) {
    return (
        <Card className="p-4">
            <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                {label}
            </p>

            <div className="mt-1 flex items-end gap-2">
                <span className="font-['Manrope'] text-2xl font-extrabold tracking-tight text-neutral-950">
                    {value}
                </span>

                {urgent && (
                    <span className="mb-1 rounded-full bg-red-50 px-2 py-0.5 text-[8px] font-bold text-red-600">
                        Attention
                    </span>
                )}

                {success && (
                    <span className="mb-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-bold text-emerald-600">
                        Healthy
                    </span>
                )}
            </div>

            <p className="mt-1 text-[9px] text-neutral-400">
                {description}
            </p>
        </Card>
    )
}

function RequestRow({
    request,
    onSelect,
}: {
    request: BloodRequest
    onSelect: (request: BloodRequest) => void
}) {
    return (
        <tr
            onClick={() => onSelect(request)}
            className={`group cursor-pointer border-b border-neutral-50 transition hover:bg-neutral-50/70 ${request.urgency === 'Critical'
                ? 'bg-red-50/20'
                : ''
                }`}
        >
            <td className="px-6 py-4">
                <div>
                    <p className="text-[11px] font-bold text-neutral-800">
                        {request.patientName}
                    </p>

                    <p className="mt-0.5 text-[9px] text-neutral-400">
                        #{request.id}
                    </p>
                </div>
            </td>

            <td className="px-4 py-4">
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-red-50 px-2 text-[10px] font-bold text-red-600">
                    {request.bloodGroup}
                </span>
            </td>

            <td className="px-4 py-4">
                <div>
                    <p className="text-[10px] font-medium text-neutral-600">
                        {request.hospital}
                    </p>

                    <p className="mt-0.5 text-[9px] text-neutral-400">
                        {request.location}
                    </p>
                </div>
            </td>

            <td className="px-4 py-4">
                <div>
                    <p className="text-[10px] font-bold text-neutral-700">
                        {request.unitsRequired} unit
                        {request.unitsRequired > 1 ? 's' : ''}
                    </p>

                    <p className="mt-0.5 text-[9px] text-neutral-400">
                        {request.requiredDate}
                    </p>
                </div>
            </td>

            <td className="px-4 py-4">
                <UrgencyBadge urgency={request.urgency} />
            </td>

            <td className="px-4 py-4">
                <RequestStatusBadge status={request.status} />
            </td>

            <td className="px-4 py-4">
                <div className="text-[9px]">
                    <span className="font-bold text-neutral-700">
                        {request.confirmedDonors}
                    </span>

                    <span className="text-neutral-400">
                        {' '}
                        / {request.matchedDonors} matched
                    </span>
                </div>
            </td>

            <td className="px-6 py-4 text-right">
                <button
                    onClick={(event) => event.stopPropagation()}
                    className="rounded-lg p-1.5 text-neutral-300 opacity-0 transition group-hover:opacity-100 hover:bg-white hover:text-neutral-700"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </td>
        </tr>
    )
}

function RequestCard({
    request,
    onSelect,
}: {
    request: BloodRequest
    onSelect: (request: BloodRequest) => void
}) {
    return (
        <button
            onClick={() => onSelect(request)}
            className={`w-full p-4 text-left transition hover:bg-neutral-50 ${request.urgency === 'Critical'
                ? 'bg-red-50/30'
                : ''
                }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-[10px] font-bold text-red-600">
                        {request.bloodGroup}
                    </div>

                    <div>
                        <p className="text-[11px] font-bold text-neutral-800">
                            {request.patientName}
                        </p>

                        <p className="mt-0.5 text-[9px] text-neutral-400">
                            #{request.id}
                        </p>
                    </div>
                </div>

                <UrgencyBadge urgency={request.urgency} />
            </div>

            <div className="mt-3 flex items-center justify-between">
                <div>
                    <p className="text-[9px] text-neutral-500">
                        {request.hospital}
                    </p>

                    <p className="mt-0.5 flex items-center gap-1 text-[8px] text-neutral-400">
                        <Clock3 className="h-2.5 w-2.5" />
                        {request.requiredDate} • {request.requiredTime}
                    </p>
                </div>

                <RequestStatusBadge status={request.status} />
            </div>
        </button>
    )
}

function RequestDetails({
    request,
    onClose,
    onEdit,
}: {
    request: BloodRequest
    onClose: () => void
    onEdit: (request: BloodRequest) => void
}) {
    return (
        <>
            <div
                className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            />

            <aside className="fixed inset-y-0 right-0 z-[70] w-full max-w-[480px] overflow-y-auto border-l border-neutral-200 bg-[#fafaf9] shadow-2xl">

                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200/70 bg-[#fafaf9]/95 px-5 py-4 backdrop-blur-xl">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                            Blood request
                        </p>

                        <h2 className="mt-1 font-['Manrope'] text-[17px] font-extrabold tracking-tight text-neutral-900">
                            #{request.id}
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-5">

                    {/* Emergency summary */}
                    <div
                        className={`rounded-2xl p-5 ${request.urgency === 'Critical'
                            ? 'bg-red-600 text-white'
                            : 'bg-neutral-950 text-white'
                            }`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                                    Blood required
                                </p>

                                <p className="mt-2 font-['Manrope'] text-4xl font-extrabold tracking-[-0.05em]">
                                    {request.bloodGroup}
                                </p>

                                <p className="mt-1 text-[10px] text-white/60">
                                    {request.unitsRequired} unit
                                    {request.unitsRequired > 1 ? 's' : ''} required
                                </p>
                            </div>

                            <UrgencyBadge urgency={request.urgency} />
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-4">
                            <p className="text-[11px] font-bold">
                                {request.patientName}
                            </p>

                            <p className="mt-1 text-[9px] text-white/50">
                                {request.patientAge} years • {request.patientGender}
                            </p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-5">
                        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            Coordination progress
                        </h3>

                        <Card className="p-4">
                            <ProgressRow
                                label="Donors matched"
                                value={request.matchedDonors}
                                total={Math.max(request.matchedDonors, request.unitsRequired)}
                            />

                            <ProgressRow
                                label="Donors contacted"
                                value={request.contactedDonors}
                                total={Math.max(request.matchedDonors, 1)}
                            />

                            <ProgressRow
                                label="Donations confirmed"
                                value={request.confirmedDonors}
                                total={request.unitsRequired}
                                last
                            />
                        </Card>
                    </div>

                    {/* Hospital */}
                    <div className="mt-5">
                        <h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            Hospital information
                        </h3>

                        <Card className="divide-y divide-neutral-100">
                            {[
                                ['Hospital', request.hospital],
                                ['Location', request.location],
                                ['Ward', request.ward],
                                ['Contact person', request.contactPerson],
                                ['Contact number', request.contactNumber],
                                ['Required', `${request.requiredDate} • ${request.requiredTime}`],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between gap-5 px-4 py-3.5"
                                >
                                    <span className="shrink-0 text-[9px] text-neutral-400">
                                        {label}
                                    </span>

                                    <span className="text-right text-[10px] font-semibold text-neutral-700">
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </Card>
                    </div>

                    {/* Notes */}
                    {request.notes && (
                        <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600">
                                Notes
                            </p>

                            <p className="mt-1.5 text-[10px] leading-relaxed text-amber-800">
                                {request.notes}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 grid grid-cols-2 gap-2">
                        <Button
                            onClick={() => {
                                // Donor matching will be connected here next.
                            }}
                        >
                            Find donors
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => onEdit(request)}
                        >
                            Edit request
                        </Button>
                    </div>

                </div>
            </aside>
        </>
    )
}

function ProgressRow({
    label,
    value,
    total,
    last,
}: {
    label: string
    value: number
    total: number
    last?: boolean
}) {
    const percentage =
        total === 0
            ? 0
            : Math.min(100, Math.round((value / total) * 100))

    return (
        <div className={last ? '' : 'mb-5'}>
            <div className="mb-1.5 flex justify-between">
                <span className="text-[9px] font-semibold text-neutral-500">
                    {label}
                </span>

                <span className="text-[9px] font-bold text-neutral-700">
                    {value}
                </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div
                    className="h-full rounded-full bg-[#b91c1c] transition-all"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

function FilterSelect({
    value,
    onChange,
    options,
}: {
    value: string
    onChange: (value: string) => void
    options: string[]
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 pr-8 text-[10px] font-semibold text-neutral-600 outline-none transition hover:border-neutral-300 focus:border-neutral-400 sm:min-w-[150px]"
            >
                {options.map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        </div>
    )
}