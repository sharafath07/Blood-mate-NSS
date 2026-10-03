import {
    Check,
    ChevronDown,
    ChevronRight,
    Clock3,
    Droplets,
    Filter,
    MapPin,
    MessageCircle,
    Phone,
    Search,
    Send,
    ShieldCheck,
    UserCheck,
    Users,
    X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'

import {
    donors,
    type Donor,
    type DonorAvailability,
} from '../data/donors'

const availabilityOptions = [
    'All availability',
    'Available now',
    'Available today',
    'Unavailable',
    'Recently contacted',
]

const bloodGroups = [
    'All groups',
    'A+',
    'A−',
    'B+',
    'B−',
    'AB+',
    'AB−',
    'O+',
    'O−',
]

function availabilityVariant(
    availability: DonorAvailability,
) {
    if (availability === 'Available now') {
        return 'success' as const
    }

    if (availability === 'Available today') {
        return 'info' as const
    }

    if (availability === 'Recently contacted') {
        return 'warning' as const
    }

    return 'neutral' as const
}

function matchVariant(match: Donor['matchLevel']) {
    if (match === 'Excellent match') {
        return 'success' as const
    }

    if (match === 'Compatible') {
        return 'info' as const
    }

    return 'warning' as const
}

export default function DonorMatching() {
    const [selected, setSelected] = useState<string[]>([])
    const [search, setSearch] = useState('')
    const [availability, setAvailability] =
        useState('All availability')
    const [bloodGroup, setBloodGroup] =
        useState('All groups')

    const [selectedDonor, setSelectedDonor] =
        useState<Donor | null>(null)

    const navigate = useNavigate()

    const filteredDonors = useMemo(() => {
        const query = search.toLowerCase().trim()

        return donors.filter((donor) => {
            const matchesSearch =
                !query ||
                donor.name.toLowerCase().includes(query) ||
                donor.studentId.toLowerCase().includes(query) ||
                donor.department.toLowerCase().includes(query)

            const matchesAvailability =
                availability === 'All availability' ||
                donor.availability === availability

            const matchesBlood =
                bloodGroup === 'All groups' ||
                donor.bloodGroup === bloodGroup

            return (
                matchesSearch &&
                matchesAvailability &&
                matchesBlood
            )
        })
    }, [search, availability, bloodGroup])

    const availableCount = donors.filter(
        (donor) =>
            donor.availability === 'Available now' ||
            donor.availability === 'Available today',
    ).length

    const excellentMatches = donors.filter(
        (donor) => donor.matchLevel === 'Excellent match',
    ).length

    function toggleSelection(id: string) {
        setSelected((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id],
        )
    }

    function selectAll() {
        const ids = filteredDonors
            .filter(
                (donor) =>
                    donor.availability !== 'Unavailable',
            )
            .map((donor) => donor.id)

        setSelected(ids)
    }

    function clearSelection() {
        setSelected([])
    }

    const handleNotifySelected = () => {
        if (selectedDonors.length === 0) return

        const donorsToNotify = donors.filter((donor) =>
            selectedDonors.includes(donor.id),
        )

        navigate('/notifications', {
            state: {
                requestId: selectedRequest.id,
                bloodGroup: selectedRequest.bloodGroup,
                hospital: selectedRequest.hospital,
                donors: donorsToNotify,
            },
        })
    }

    const allSelected =
        filteredDonors.length > 0 &&
        filteredDonors
            .filter(
                (donor) => donor.availability !== 'Unavailable',
            )
            .every((donor) => selected.includes(donor.id))

    return (
        <div className="mx-auto max-w-[1500px] pb-24">

            {/* Header */}
            <div className="mb-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <UserCheck className="h-3.5 w-3.5 text-red-600" />

                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                            Donor coordination
                        </span>
                    </div>

                    <h1 className="font-['Manrope'] text-[30px] font-extrabold tracking-[-0.045em] text-neutral-950 sm:text-[34px]">
                        Find compatible donors
                    </h1>

                    <p className="mt-1.5 text-[13px] text-neutral-400">
                        Review matched donors and contact the right people quickly.
                    </p>
                </div>
            </div>

            {/* Request context */}
            <section className="mb-5 overflow-hidden rounded-2xl bg-neutral-950 text-white">
                <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 shadow-[0_8px_25px_rgba(220,38,38,0.25)]">
                            <Droplets className="h-5 w-5" />
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-['Manrope'] text-[23px] font-extrabold tracking-tight">
                                    O+
                                </span>

                                <span className="rounded-full bg-red-500/20 px-2 py-1 text-[9px] font-bold text-red-300">
                                    Critical
                                </span>
                            </div>

                            <p className="mt-1 text-[11px] text-white/50">
                                Request #BM-1024 • Muhammed Riyas
                            </p>

                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[9px] text-white/45">
                                <span className="flex items-center gap-1.5">
                                    <Droplets className="h-3 w-3" />
                                    2 units required
                                </span>

                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3 w-3" />
                                    Baby Memorial Hospital
                                </span>

                                <span className="flex items-center gap-1.5">
                                    <Clock3 className="h-3 w-3" />
                                    Required today
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 rounded-xl bg-white/5 p-3">
                        <div className="text-right">
                            <p className="text-[9px] font-medium text-white/40">
                                Donation progress
                            </p>

                            <p className="mt-1 text-[15px] font-bold">
                                1 / 2
                            </p>
                        </div>

                        <div className="h-9 w-px bg-white/10" />

                        <div>
                            <p className="text-[9px] font-medium text-white/40">
                                Confirmed
                            </p>

                            <p className="mt-1 text-[11px] font-bold text-emerald-400">
                                1 donor
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* Match summary */}
            <div className="mb-5 grid gap-3 sm:grid-cols-3">

                <MatchStat
                    icon={<Users />}
                    label="Matched donors"
                    value={donors.length}
                    description="Potentially compatible"
                />

                <MatchStat
                    icon={<ShieldCheck />}
                    label="Excellent matches"
                    value={excellentMatches}
                    description="Highest compatibility"
                />

                <MatchStat
                    icon={<Check />}
                    label="Available"
                    value={availableCount}
                    description="Can potentially donate"
                    success
                />

            </div>

            {/* Filters */}
            <Card className="mb-5 p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-end">

                    <div className="min-w-0 flex-1 xl:max-w-[340px]">
                        <Input
                            placeholder="Search donor, student ID or department..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            className="pl-10"
                        />

                        <Search className="pointer-events-none relative -top-[30px] left-3 h-3.5 w-3.5 text-neutral-300" />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 xl:flex">
                        <FilterSelect
                            value={availability}
                            onChange={setAvailability}
                            options={availabilityOptions}
                        />

                        <FilterSelect
                            value={bloodGroup}
                            onChange={setBloodGroup}
                            options={bloodGroups}
                        />
                    </div>

                    <button className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-3 py-2.5 text-[10px] font-bold text-neutral-500 hover:bg-neutral-50">
                        <Filter className="h-3 w-3" />
                        Advanced filters
                    </button>
                </div>
            </Card>

            {/* Selection toolbar */}
            {selected.length > 0 && (
                <div className="sticky top-[74px] z-20 mb-4 flex flex-col gap-3 rounded-2xl border border-red-100 bg-white/95 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[10px] font-bold text-red-600">
                            {selected.length}
                        </div>

                        <div>
                            <p className="text-[10px] font-bold text-neutral-800">
                                {selected.length} donor
                                {selected.length > 1 ? 's' : ''} selected
                            </p>

                            <p className="text-[9px] text-neutral-400">
                                Ready to contact
                            </p>
                        </div>
                    </div>

                    <div className="ml-auto flex gap-2">
                        <button
                            onClick={clearSelection}
                            className="rounded-lg px-3 py-2 text-[9px] font-bold text-neutral-400 hover:bg-neutral-50"
                        >
                            Clear
                        </button>

                        <Button
                            icon={<MessageCircle className="h-3.5 w-3.5" />}
                            onClick={handleNotifySelected}
                            disabled={selected.length === 0}
                        >
                            Notify selected
                        </Button>
                    </div>
                </div>
            )}

            {/* Donor list */}
            <Card className="overflow-hidden">

                <div className="flex flex-col gap-3 border-b border-neutral-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <h2 className="font-['Manrope'] text-[14px] font-extrabold tracking-tight">
                            Recommended donors
                        </h2>

                        <p className="mt-1 text-[9px] text-neutral-400">
                            Ranked by compatibility and availability
                        </p>
                    </div>

                    <button
                        onClick={
                            allSelected ? clearSelection : selectAll
                        }
                        className="flex items-center gap-1.5 self-start rounded-lg border border-neutral-200 px-3 py-2 text-[9px] font-bold text-neutral-500 hover:bg-neutral-50"
                    >
                        <Check className="h-3 w-3" />
                        {allSelected
                            ? 'Clear selection'
                            : 'Select available'}
                    </button>
                </div>

                <div className="divide-y divide-neutral-100">
                    {filteredDonors.map((donor) => (
                        <DonorRow
                            key={donor.id}
                            donor={donor}
                            selected={selected.includes(donor.id)}
                            onToggle={() => toggleSelection(donor.id)}
                            onOpen={() => setSelectedDonor(donor)}
                        />
                    ))}
                </div>

                {filteredDonors.length === 0 && (
                    <div className="flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50">
                            <Users className="h-5 w-5 text-neutral-300" />
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-neutral-800">
                            No matching donors
                        </h3>

                        <p className="mt-1 max-w-[280px] text-[10px] leading-relaxed text-neutral-400">
                            Try changing the blood group, availability or search filters.
                        </p>
                    </div>
                )}

            </Card>

            {/* Bottom notification panel */}
            {selected.length > 0 && (
                <div className="fixed bottom-5 left-1/2 z-40 w-[calc(100%-32px)] max-w-[720px] -translate-x-1/2">
                    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-950 p-3 shadow-2xl">
                        <div className="hidden h-9 w-9 items-center justify-center rounded-xl bg-white/10 sm:flex">
                            <Send className="h-4 w-4 text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[10px] font-bold text-white">
                                Ready to contact {selected.length} donor
                                {selected.length > 1 ? 's' : ''}
                            </p>

                            <p className="mt-0.5 truncate text-[9px] text-white/40">
                                A WhatsApp notification can be prepared next.
                            </p>
                        </div>

                        <Button
                            className="shrink-0"
                            icon={<MessageCircle className="h-3.5 w-3.5" />}
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            )}

            {/* Donor detail drawer */}
            {selectedDonor && (
                <DonorDetails
                    donor={selectedDonor}
                    onClose={() => setSelectedDonor(null)}
                    onSelect={() => {
                        toggleSelection(selectedDonor.id)
                        setSelectedDonor(null)
                    }}
                    selected={selected.includes(selectedDonor.id)}
                />
            )}
        </div>
    )
}

function MatchStat({
    icon,
    label,
    value,
    description,
    success,
}: {
    icon: React.ReactNode
    label: string
    value: number
    description: string
    success?: boolean
}) {
    return (
        <Card className="flex items-center gap-3 p-4">
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${success ? 'bg-emerald-50' : 'bg-neutral-50'
                    }`}
            >
                <span
                    className={
                        success
                            ? 'text-emerald-600'
                            : 'text-neutral-600'
                    }
                >
                    {icon}
                </span>
            </div>

            <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                    {label}
                </p>

                <div className="mt-0.5 flex items-end gap-2">
                    <span className="font-['Manrope'] text-xl font-extrabold">
                        {value}
                    </span>

                    <span className="mb-0.5 text-[8px] text-neutral-400">
                        {description}
                    </span>
                </div>
            </div>
        </Card>
    )
}

function DonorRow({
    donor,
    selected,
    onToggle,
    onOpen,
}: {
    donor: Donor
    selected: boolean
    onToggle: () => void
    onOpen: () => void
}) {
    const unavailable =
        donor.availability === 'Unavailable'

    return (
        <div
            className={`group flex flex-col gap-4 p-4 transition sm:flex-row sm:items-center sm:px-6 ${selected
                ? 'bg-red-50/50'
                : 'hover:bg-neutral-50/60'
                } ${unavailable ? 'opacity-55' : ''}`}
        >
            {/* Checkbox */}
            <button
                disabled={unavailable}
                onClick={onToggle}
                className={`
          hidden h-5 w-5 shrink-0 items-center justify-center rounded-md border transition sm:flex
          ${selected
                        ? 'border-red-600 bg-red-600'
                        : 'border-neutral-300 bg-white hover:border-neutral-400'
                    }
          disabled:cursor-not-allowed
        `}
            >
                {selected && (
                    <Check className="h-3 w-3 text-white" />
                )}
            </button>

            {/* Main */}
            <button
                onClick={onOpen}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
                <Avatar name={donor.name} />

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[11px] font-bold text-neutral-800">
                            {donor.name}
                        </p>

                        <Badge variant={matchVariant(donor.matchLevel)}>
                            {donor.matchLevel}
                        </Badge>
                    </div>

                    <p className="mt-1 truncate text-[9px] text-neutral-400">
                        {donor.studentId} • {donor.department}
                    </p>
                </div>
            </button>

            {/* Blood */}
            <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[10px] font-bold text-red-600">
                    {donor.bloodGroup}
                </div>
            </div>

            {/* Availability */}
            <div className="hidden min-w-[125px] md:block">
                <Badge
                    variant={availabilityVariant(
                        donor.availability,
                    )}
                    dot
                >
                    {donor.availability}
                </Badge>
            </div>

            {/* Distance */}
            <div className="hidden min-w-[65px] lg:block">
                <p className="text-[9px] text-neutral-400">
                    Distance
                </p>

                <p className="mt-0.5 text-[10px] font-bold text-neutral-700">
                    {donor.distance} km
                </p>
            </div>

            {/* Donation */}
            <div className="hidden min-w-[90px] xl:block">
                <p className="text-[9px] text-neutral-400">
                    Last donation
                </p>

                <p className="mt-0.5 text-[9px] font-semibold text-neutral-600">
                    {donor.lastDonation}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 border-t border-neutral-100 pt-3 sm:border-0 sm:pt-0">
                <div className="flex items-center gap-2 md:hidden">
                    <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-red-50 px-2 text-[10px] font-bold text-red-600">
                        {donor.bloodGroup}
                    </span>

                    <Badge
                        variant={availabilityVariant(
                            donor.availability,
                        )}
                        dot
                    >
                        {donor.availability}
                    </Badge>
                </div>

                <div className="ml-auto flex gap-1.5">
                    <button
                        onClick={onOpen}
                        className="rounded-lg border border-neutral-200 p-2 text-neutral-400 transition hover:bg-white hover:text-neutral-800"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                        disabled={unavailable}
                        className="rounded-lg bg-neutral-950 p-2 text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-200"
                    >
                        <MessageCircle className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

function DonorDetails({
    donor,
    onClose,
    onSelect,
    selected,
}: {
    donor: Donor
    onClose: () => void
    onSelect: () => void
    selected: boolean
}) {
    return (
        <>
            <div
                className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            />

            <aside className="fixed inset-y-0 right-0 z-[70] w-full max-w-[450px] overflow-y-auto border-l border-neutral-200 bg-[#fafaf9] shadow-2xl">

                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200/70 bg-[#fafaf9]/95 px-5 py-4 backdrop-blur-xl">
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                            Donor profile
                        </p>

                        <h2 className="mt-1 font-['Manrope'] text-[17px] font-extrabold tracking-tight text-neutral-900">
                            Compatibility details
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

                    <div className="flex items-center gap-4">
                        <Avatar name={donor.name} size="lg" />

                        <div>
                            <h3 className="font-['Manrope'] text-[18px] font-extrabold tracking-tight">
                                {donor.name}
                            </h3>

                            <p className="mt-1 text-[9px] text-neutral-400">
                                {donor.studentId} • {donor.department}
                            </p>

                            <div className="mt-2 flex gap-2">
                                <Badge
                                    variant={matchVariant(
                                        donor.matchLevel,
                                    )}
                                    dot
                                >
                                    {donor.matchLevel}
                                </Badge>

                                <Badge
                                    variant={availabilityVariant(
                                        donor.availability,
                                    )}
                                    dot
                                >
                                    {donor.availability}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-2">
                        <DetailStat
                            label="Blood"
                            value={donor.bloodGroup}
                            red
                        />

                        <DetailStat
                            label="Distance"
                            value={`${donor.distance} km`}
                        />

                        <DetailStat
                            label="Donations"
                            value={String(donor.donationCount)}
                        />
                    </div>

                    <div className="mt-6">
                        <h4 className="mb-3 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                            Donor information
                        </h4>

                        <Card className="divide-y divide-neutral-100">
                            {[
                                ['Phone', donor.phone],
                                ['Department', donor.department],
                                ['Last donation', donor.lastDonation],
                                ['Distance', `${donor.distance} km`],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between px-4 py-3.5"
                                >
                                    <span className="text-[9px] text-neutral-400">
                                        {label}
                                    </span>

                                    <span className="text-right text-[10px] font-semibold text-neutral-700">
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </Card>
                    </div>

                    <div className="mt-6">
                        <h4 className="mb-3 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                            Compatibility
                        </h4>

                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold text-emerald-800">
                                        {donor.matchLevel}
                                    </p>

                                    <p className="mt-1 text-[9px] leading-relaxed text-emerald-700/70">
                                        This donor has been identified as a suitable
                                        candidate for the current blood request.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-2">
                        <Button
                            variant={selected ? 'danger' : 'primary'}
                            onClick={onSelect}
                        >
                            {selected ? 'Remove donor' : 'Select donor'}
                        </Button>

                        <Button variant="outline" icon={<Phone className="h-3.5 w-3.5" />}>
                            Call donor
                        </Button>
                    </div>

                </div>
            </aside>
        </>
    )
}

function DetailStat({
    label,
    value,
    red,
}: {
    label: string
    value: string
    red?: boolean
}) {
    return (
        <div
            className={`rounded-xl p-3 ${red ? 'bg-red-50' : 'bg-neutral-50'
                }`}
        >
            <p className="text-[8px] font-bold uppercase tracking-wider text-neutral-400">
                {label}
            </p>

            <p
                className={`mt-1 font-['Manrope'] text-base font-extrabold ${red ? 'text-red-600' : 'text-neutral-900'
                    }`}
            >
                {value}
            </p>
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
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 pr-8 text-[10px] font-semibold text-neutral-600 outline-none transition hover:border-neutral-300 focus:border-neutral-400 sm:min-w-[160px]"
            >
                {options.map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        </div>
    )
}