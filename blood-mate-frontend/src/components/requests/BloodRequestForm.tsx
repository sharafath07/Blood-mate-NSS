import { FormEvent, useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import type {
    BloodRequest,
    RequestStatus,
    Urgency,
} from '../../data/bloodRequests'

interface BloodRequestFormProps {
    request?: BloodRequest | null
    onClose: () => void
    onSave: (request: BloodRequest) => void
}

const bloodGroups = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
]

const statuses: RequestStatus[] = [
    'New',
    'Searching',
    'Donors Contacted',
    'Partially Fulfilled',
    'Fulfilled',
    'Cancelled',
]

const urgencies: Urgency[] = ['Critical', 'Urgent', 'Normal']

const emptyRequest: Omit<BloodRequest, 'id' | 'createdAt'> = {
    patientName: '',
    patientAge: 0,
    patientGender: 'Male',
    bloodGroup: 'O+',
    unitsRequired: 1,
    hospital: '',
    location: '',
    ward: '',
    contactPerson: '',
    contactNumber: '',
    requiredDate: '',
    requiredTime: '',
    urgency: 'Normal',
    status: 'New',
    matchedDonors: 0,
    contactedDonors: 0,
    confirmedDonors: 0,
    notes: '',
}

export default function BloodRequestForm({
    request,
    onClose,
    onSave,
}: BloodRequestFormProps) {
    const [form, setForm] = useState(emptyRequest)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    const isEditing = Boolean(request)

    useEffect(() => {
        if (request) {
            setForm({
                patientName: request.patientName,
                patientAge: request.patientAge,
                patientGender: request.patientGender,
                bloodGroup: request.bloodGroup,
                unitsRequired: request.unitsRequired,
                hospital: request.hospital,
                location: request.location,
                ward: request.ward,
                contactPerson: request.contactPerson,
                contactNumber: request.contactNumber,
                requiredDate: request.requiredDate,
                requiredTime: request.requiredTime,
                urgency: request.urgency,
                status: request.status,
                matchedDonors: request.matchedDonors,
                contactedDonors: request.contactedDonors,
                confirmedDonors: request.confirmedDonors,
                notes: request.notes,
            })
        } else {
            setForm(emptyRequest)
        }

        setErrors({})
    }, [request])

    const update = <K extends keyof typeof form>(
        field: K,
        value: (typeof form)[K],
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }))

        setErrors((current) => ({
            ...current,
            [field]: '',
        }))
    }

    const validate = () => {
        const nextErrors: Record<string, string> = {}


        if (!form.patientName.trim()) {
            nextErrors.patientName = 'Patient name is required'
        }

        if (!form.patientAge || form.patientAge < 1 || form.patientAge > 120) {
            nextErrors.patientAge = 'Enter a valid age'
        }

        if (!form.bloodGroup) {
            nextErrors.bloodGroup = 'Select a blood group'
        }

        if (!form.unitsRequired || form.unitsRequired < 1) {
            nextErrors.unitsRequired = 'At least 1 unit is required'
        }

        if (!form.hospital.trim()) {
            nextErrors.hospital = 'Hospital is required'
        }

        if (!form.contactPerson.trim()) {
            nextErrors.contactPerson = 'Contact person is required'
        }

        const digits = form.contactNumber.replace(/\D/g, '')
        if (!form.contactNumber.trim()) {
            nextErrors.contactNumber = 'Contact number is required'
        } else if (digits.length < 10 || digits.length > 15) {
            nextErrors.contactNumber = 'Enter a valid phone number'
        }

        if (!form.requiredDate) {
            nextErrors.requiredDate = 'Required date is required'
        }

        if (!form.requiredTime) {
            nextErrors.requiredTime = 'Required time is required'
        }

        setErrors(nextErrors)

        return Object.keys(nextErrors).length === 0
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()

        if (!validate()) return

        setSaving(true)

        await new Promise((resolve) => setTimeout(resolve, 700))

        const savedRequest: BloodRequest = {
            ...form,
            id: request?.id ?? `BM-${Math.floor(1000 + Math.random() * 9000)}`,
            createdAt:
                request?.createdAt ??
                new Date().toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                }),
        }

        onSave(savedRequest)
        setSaving(false)
    }

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Close request form"
                onClick={onClose}
                className="absolute inset-0 bg-neutral-950/35 backdrop-blur-[2px]"
            />

            <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
                    <div>
                        <div className="flex items-center gap-2">
                            {form.urgency === 'Critical' && (
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                    <AlertTriangle size={15} />
                                </span>
                            )}

                            <h2 className="font-['Manrope'] text-xl font-bold text-neutral-950">
                                {isEditing ? 'Edit blood request' : 'Create blood request'}
                            </h2>
                        </div>

                        <p className="mt-1 text-xs text-neutral-500">
                            {isEditing
                                ? `Update ${request?.id}`
                                : 'Register a new patient blood requirement'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-800"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
                        <div className="space-y-7">
                            {/* Patient */}
                            <section>
                                <SectionTitle
                                    title="Patient information"
                                    description="Basic details about the person requiring blood."
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <Input
                                            label="Patient name"
                                            value={form.patientName}
                                            error={errors.patientName}
                                            placeholder="Enter patient's full name"
                                            onChange={(event) =>
                                                update('patientName', event.target.value)
                                            }
                                        />
                                    </div>

                                    <Input
                                        label="Age"
                                        type="number"
                                        min={1}
                                        max={120}
                                        value={form.patientAge || ''}
                                        error={errors.patientAge}
                                        placeholder="Age"
                                        onChange={(event) =>
                                            update('patientAge', Number(event.target.value))
                                        }
                                    />

                                    <Select
                                        label="Gender"
                                        value={form.patientGender}
                                        options={[
                                            { label: 'Male', value: 'Male' },
                                            { label: 'Female', value: 'Female' },
                                            { label: 'Other', value: 'Other' },
                                        ]}
                                        onChange={(event) =>
                                            update('patientGender', event.target.value)
                                        }
                                    />
                                </div>
                            </section>

                            {/* Blood requirement */}
                            <section>
                                <SectionTitle
                                    title="Blood requirement"
                                    description="Specify the blood group, units, urgency and required time."
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Select
                                        label="Blood group"
                                        value={form.bloodGroup}
                                        error={errors.bloodGroup}
                                        options={bloodGroups.map((group) => ({
                                            label: group,
                                            value: group,
                                        }))}
                                        onChange={(event) =>
                                            update('bloodGroup', event.target.value)
                                        }
                                    />

                                    <Input
                                        label="Units required"
                                        type="number"
                                        min={1}
                                        max={20}
                                        value={form.unitsRequired}
                                        error={errors.unitsRequired}
                                        onChange={(event) =>
                                            update('unitsRequired', Number(event.target.value))
                                        }
                                    />

                                    <Select
                                        label="Urgency"
                                        value={form.urgency}
                                        options={urgencies.map((urgency) => ({
                                            label: urgency,
                                            value: urgency,
                                        }))}
                                        onChange={(event) =>
                                            update('urgency', event.target.value as Urgency)
                                        }
                                    />

                                    <Select
                                        label="Request status"
                                        value={form.status}
                                        options={statuses.map((status) => ({
                                            label: status,
                                            value: status,
                                        }))}
                                        onChange={(event) =>
                                            update('status', event.target.value as RequestStatus)
                                        }
                                    />

                                    <Input
                                        label="Required date"
                                        type="date"
                                        value={form.requiredDate}
                                        error={errors.requiredDate}
                                        onChange={(event) =>
                                            update('requiredDate', event.target.value)
                                        }
                                    />

                                    <Input
                                        label="Required time"
                                        type="time"
                                        value={form.requiredTime}
                                        error={errors.requiredTime}
                                        onChange={(event) =>
                                            update('requiredTime', event.target.value)
                                        }
                                    />
                                </div>
                            </section>

                            {/* Hospital */}
                            <section>
                                <SectionTitle
                                    title="Hospital information"
                                    description="Where the donation is required."
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <Input
                                            label="Hospital"
                                            value={form.hospital}
                                            error={errors.hospital}
                                            placeholder="Hospital name"
                                            onChange={(event) =>
                                                update('hospital', event.target.value)
                                            }
                                        />
                                    </div>

                                    <Input
                                        label="Location"
                                        value={form.location}
                                        placeholder="City / area"
                                        onChange={(event) =>
                                            update('location', event.target.value)
                                        }
                                    />

                                    <Input
                                        label="Ward / room"
                                        value={form.ward}
                                        placeholder="Ward, ICU, room..."
                                        onChange={(event) =>
                                            update('ward', event.target.value)
                                        }
                                    />
                                </div>
                            </section>

                            {/* Contact */}
                            <section>
                                <SectionTitle
                                    title="Contact information"
                                    description="Primary person coordinating this request."
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Input
                                        label="Contact person"
                                        value={form.contactPerson}
                                        error={errors.contactPerson}
                                        placeholder="Full name"
                                        onChange={(event) =>
                                            update('contactPerson', event.target.value)
                                        }
                                    />

                                    <Input
                                        label="Contact number"
                                        value={form.contactNumber}
                                        error={errors.contactNumber}
                                        placeholder="+91 98765 43210"
                                        onChange={(event) =>
                                            update('contactNumber', event.target.value)
                                        }
                                    />
                                </div>
                            </section>

                            {/* Notes */}
                            <section>
                                <SectionTitle
                                    title="Additional notes"
                                    description="Optional information for the coordination team."
                                />

                                <textarea
                                    value={form.notes}
                                    onChange={(event) => update('notes', event.target.value)}
                                    rows={4}
                                    placeholder="Add relevant notes..."
                                    className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-red-400 focus:ring-4 focus:ring-red-50"
                                />
                            </section>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-neutral-100 bg-white px-5 py-4 sm:px-6">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={saving}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                loading={saving}
                            >
                                {isEditing ? 'Save changes' : 'Create request'}
                            </Button>
                        </div>
                    </div>
                </form>
            </aside>
        </div>
    )
}

function SectionTitle({
    title,
    description,
}: {
    title: string
    description: string
}) {
    return (
        <div className="mb-4">
            <h3 className="font-['Manrope'] text-sm font-bold text-neutral-900">
                {title}
            </h3>
            <p className="mt-1 text-xs text-neutral-400">{description}</p>
        </div>
    )
}