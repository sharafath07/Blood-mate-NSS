import { useDialog } from '../lib/useDialog'
import {
    AlertCircle,
    ChevronDown,

    FileHeart,
    MoreHorizontal,
    Plus,
    Search,
    X,
} from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { api } from '../services/api'
import type { DashboardStats } from '../types/api'
import axios from 'axios'

import { motion } from 'motion/react'
import { pageMotion } from '../lib/motion'

import {

    type BloodRequestInput,
    type RequestStatus,
    type BloodRequest,

} from '../data/bloodRequests'

import {
    RequestStatusBadge,
    UrgencyBadge,
} from '../components/requests/RequestStatusBadge'
import BloodRequestForm from '../components/requests/BloodRequestForm'

const statuses = [
    'All statuses',
    'PENDING',
    'MATCHING',
    'FULFILLED',
    'CANCELLED',
]

const urgencies = [
    'All urgency',
    'CRITICAL',
    'URGENT',
    'NORMAL',
]

const bloodGroups = [
    'All blood groups',
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
]

function matchCount(request: BloodRequest) {
    return request.matchedDonorCount ?? request.matchedDonors.length
}

export default function BloodRequests() {
    const [requests, setRequests] = useState<BloodRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(true)
    const [offset, setOffset] = useState(0)
    const [apiError, setApiError] = useState<string | null>(null)
    const [editingRequest, setEditingRequest] = useState<BloodRequest | null>(null)
    const [params, setParams] = useSearchParams()
    const formOpen = params.get('new') === '1' || (params.get('edit') === '1' && editingRequest !== null)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('All statuses')
    const [urgency, setUrgency] = useState('All urgency')
    const [bloodGroup, setBloodGroup] = useState('All blood groups')
    const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null)

    const [stats, setStats] = useState<DashboardStats['bloodRequests'] | null>(null)
    const [revision, setRevision] = useState(0)
    const filters = useMemo(() => ({
        search: search.trim() || undefined,
        status: status === 'All statuses' ? undefined : status,
        urgency: urgency === 'All urgency' ? undefined : urgency,
        bloodGroup: bloodGroup.endsWith('+') ? bloodGroup.slice(0, -1) + '_POSITIVE'
            : bloodGroup.endsWith('-') ? bloodGroup.slice(0, -1) + '_NEGATIVE' : undefined,
    }), [search, status, urgency, bloodGroup])
    const isAdmin = api.auth.getUser()?.role === 'ADMIN'

    useEffect(() => {
        let active = true
        api.dashboard.getStats().then(({ bloodRequests }) => {
            if (active) setStats(bloodRequests)
        }, () => { if (active) setStats(null) })
        return () => { active = false }
    }, [revision])

    useEffect(() => {
        let active = true
        const timeout = window.setTimeout(async () => {
            setLoading(true)
            setApiError(null)
            try {
                const data = await api.requests.getAll(100, 0, filters)
                if (!active) return
                setRequests(data)
                setOffset(data.length)
                setHasMore(data.length === 100)
            } catch {
                if (active) setApiError('Unable to load blood requests.')
            } finally {
                if (active) setLoading(false)
            }
        }, 150)
        return () => {
            active = false
            window.clearTimeout(timeout)
        }
    }, [filters, revision])

    const filteredRequests = requests
    const criticalCount = stats?.critical ?? 0
    const searchingCount = stats ? stats.pending + stats.matching : 0
    const fulfilledCount = stats?.fulfilled ?? 0

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

    async function removeRequest(id: string) {
        try {
            await api.requests.delete(id)
            setSelectedRequest(null)
            setRevision((current) => current + 1)
        } catch (error) {
            throw new Error(axios.isAxiosError(error) ? error.response?.data?.message ?? 'Unable to delete request.' : 'Unable to delete request.')
        }
    }

    const handleSaveRequest = async (input: BloodRequestInput & { status?: RequestStatus }) => {
        let saved: BloodRequest
        try {
            saved = editingRequest
                ? await api.requests.update(editingRequest.id, input)
                : await api.requests.create(input)
        } catch (error) {
            throw new Error(axios.isAxiosError(error) ? error.response?.data?.message ?? 'Unable to save request.' : 'Unable to save request.')
        }
        setRequests((current) => editingRequest
            ? current.map((item) => item.id === saved.id ? saved : item)
            : [saved, ...current])
        setParams({}, { replace: true })
        setEditingRequest(null)
        setRevision((current) => current + 1)
    }

    return (
        <motion.div {...pageMotion} className="mx-auto max-w-[1500px]">

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
                        setParams({ new: '1' })
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
                        onClick={() => setUrgency('CRITICAL')}
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
                    value={stats?.total ?? 0}
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


                </div>

                {loading && (
                    <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
                        <p className="text-sm text-neutral-500">
                            Loading blood requests...
                        </p>
                    </div>
                )}

                {apiError && (
                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {apiError}
                    </div>
                )}

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
                            {requests.length >= 100 && (
                                <Button
                                    variant="outline"
                                    disabled={loading || !hasMore}
                                    onClick={async () => {
                                        setLoading(true)
                                        try {
                                            const next = await api.requests.getAll(100, offset, filters)
                                            setHasMore(next.length === 100)
                                            setOffset(offset + next.length)
                                            setRequests((current) => [...new Map([...current, ...next].map((item) => [item.id, item])).values()])
                                        } catch {
                                            setApiError('Unable to load more requests.')
                                        } finally {
                                            setLoading(false)
                                        }
                                    }}
                                >Load more</Button>
                            )}
                        </div>
                    </div>
                )}

            </Card>

            {/* Detail drawer */}
            {selectedRequest && (
                <RequestDetails
                    request={selectedRequest}
                    onDelete={isAdmin ? removeRequest : undefined}
                    onClose={() => setSelectedRequest(null)}
                    onEdit={(request) => {
                        setSelectedRequest(null)
                        setEditingRequest(request)
                        setParams({ edit: '1' })
                    }}
                />
            )}

            {formOpen && (
                <BloodRequestForm
                    request={editingRequest}
                    onClose={() => {
                        setParams({}, { replace: true })
                        setEditingRequest(null)
                    }}
                    onSave={handleSaveRequest}
                />
            )}
        </motion.div>
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
            className={`group cursor-pointer border-b border-neutral-50 transition hover:bg-neutral-50/70 ${request.urgency === 'CRITICAL'
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
                    {request.bloodGroup.replace('_', '').replace('POSITIVE', '+').replace('NEGATIVE', '-')}
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
                        {request.units} unit
                        {request.units > 1 ? 's' : ''}
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
                        {matchCount(request)} matched
                    </span>
                </div>
            </td>

            <td className="px-6 py-4 text-right">
                <button
                    onClick={(event) => { event.stopPropagation(); onSelect(request) }}
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
            className={`w-full p-4 text-left transition hover:bg-neutral-50 ${request.urgency === 'CRITICAL'
                ? 'bg-red-50/30'
                : ''
                }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-[10px] font-bold text-red-600">
                        {request.bloodGroup.replace('_', '').replace('POSITIVE', '+').replace('NEGATIVE', '-')}
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
    onDelete,
}: {
    request: BloodRequest
    onClose: () => void
    onEdit: (request: BloodRequest) => void
    onDelete?: (id: string) => Promise<void>
}) {
    const navigate = useNavigate()

    const [confirmDelete, setConfirmDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState('')

    async function deleteRequest() {
        if (!onDelete) return
        setDeleting(true)
        setError('')
        try {
            await onDelete(request.id)
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Unable to delete request.')
        } finally {
            setDeleting(false)
            setConfirmDelete(false)
        }
    }
    const dialogRef = useDialog<HTMLElement>(onClose)

    return (
        <>
            <div
                className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            />

            <aside ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Blood request details" className="fixed inset-y-0 right-0 z-[70] w-full max-w-[480px] overflow-y-auto border-l border-neutral-200 bg-[#fafaf9] shadow-2xl">

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
                        className={`rounded-2xl p-5 ${request.urgency === 'CRITICAL'
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
                                    {request.bloodGroup.replace('_', '').replace('POSITIVE', '+').replace('NEGATIVE', '-')}
                                </p>

                                <p className="mt-1 text-[10px] text-white/60">
                                    {request.units} unit
                                    {request.units > 1 ? 's' : ''} required
                                </p>
                            </div>

                            <UrgencyBadge urgency={request.urgency} />
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-4">
                            <p className="text-[11px] font-bold">
                                {request.patientName}
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
                                value={matchCount(request)}
                                total={Math.max(matchCount(request), request.units)}
                            />

                            <ProgressRow label="Donors contacted" value={request.contactedDonors} total={Math.max(matchCount(request), 1)} />
                            <ProgressRow label="Units completed" value={request.donatedUnits ?? 0} total={request.units} last />

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
                                // ['Ward', request.ward],
                                ['Bystander name', request.bystanderName],
                                ['Bystander phone', request.bystanderPhone],
                                // ['Required', `${request.requiredDate} • ${request.requiredTime}`],
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
                            disabled={request.status === 'CANCELLED' || request.status === 'FULFILLED'}
                            onClick={() => {
                                navigate(`/donors/${encodeURIComponent(request.id)}`)
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

                    {onDelete && request.contactedDonors === 0 && !request.responses?.length && (
                        <div className="mt-4">
                            {confirmDelete ? <div className="space-y-2">
                                <p className="text-sm">Permanently delete this blood request?</p>
                                <Button variant="danger" loading={deleting} onClick={() => void deleteRequest()}>Delete permanently</Button>
                                <Button variant="ghost" disabled={deleting} onClick={() => setConfirmDelete(false)}>Keep request</Button>
                            </div> : <Button variant="ghost" onClick={() => setConfirmDelete(true)}>Delete request</Button>}
                        </div>
                    )}
                    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
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
                    <option key={option} value={option}>{/^[A-Z]{3,}$/.test(option) ? option.charAt(0) + option.slice(1).toLowerCase() : option}</option>
                ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        </div>
    )
}
