import { useDialog } from '../../lib/useDialog'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { AlertTriangle, X } from 'lucide-react'

import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import type {
    BloodRequest,
    BloodRequestInput,
    RequestStatus,
    Urgency,
} from '../../data/bloodRequests'

interface BloodRequestFormProps {
    request?: BloodRequest | null
    onClose: () => void
    onSave: (request: BloodRequestInput & { status?: RequestStatus }) => Promise<void> | void
}

const bloodGroups = [
    'A_POSITIVE',
    'A_NEGATIVE',
    'B_POSITIVE',
    'B_NEGATIVE',
    'AB_POSITIVE',
    'AB_NEGATIVE',
    'O_POSITIVE',
    'O_NEGATIVE',
]

const statuses: RequestStatus[] = [
    'PENDING',
    'MATCHING',
    'FULFILLED',
    'CANCELLED',
]

const urgencies: Urgency[] = ['CRITICAL', 'URGENT', 'NORMAL']

function localDateTime(value?: string | null) {
    if (!value) return ''
    const date = new Date(value)
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export default function BloodRequestForm({ request, onClose, onSave }: BloodRequestFormProps) {
    const isEditing = Boolean(request)
    const [form, setForm] = useState({
        patientName: request?.patientName ?? '',
        hospital: request?.hospital ?? '',
        location: request?.location ?? '',
        bloodGroup: request?.bloodGroup ?? '',
        bystanderName: request?.bystanderName ?? '',
        bystanderPhone: request?.bystanderPhone ?? '',
        urgency: request?.urgency ?? 'NORMAL',
        status: request?.status ?? 'PENDING',
        units: request?.units ?? 1,
        notes: request?.notes ?? '',
        requiredAt: localDateTime(request?.requiredAt),
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

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

        if (!form.bloodGroup) {
            nextErrors.bloodGroup = 'Select a blood group'
        }

        if (!Number.isInteger(form.units) || form.units < 1 || form.units > 100) {
            nextErrors.units = 'Enter an integer from 1 to 100'
        }

        if (!form.hospital.trim()) {
            nextErrors.hospital = 'Hospital is required'
        }

        if (!form.bystanderName.trim()) {
            nextErrors.bystanderName = 'Bystander name is required'
        }

        const digits = form.bystanderPhone.replace(/\D/g, '')
        if (!form.bystanderPhone.trim()) {
            nextErrors.bystanderPhone = 'Bystander phone is required'
        } else if (digits.length < 8 || digits.length > 15) {
            nextErrors.bystanderPhone = 'Enter a valid phone number'
        }

        setErrors(nextErrors)

        return Object.keys(nextErrors).length === 0
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()

        if (!validate()) return

        setSaving(true)

        try {
            const { status, requiredAt, ...details } = form
            await onSave({
                ...details,
                requiredAt: requiredAt ? new Date(requiredAt).toISOString() : null,
                ...(isEditing && { status }),
            })
        } catch (error) {
            setErrors({ submit: error instanceof Error ? error.message : 'Unable to save request.' })
        } finally {
            setSaving(false)
        }
    }

    const dialogRef = useDialog<HTMLElement>(onClose, !saving)

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Close request form"
                onClick={onClose}
                className="absolute inset-0 bg-neutral-950/35 backdrop-blur-[2px]"
            />

            <aside ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Blood request form" className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
                    <div>
                        <div className="flex items-center gap-2">
                            {form.urgency === 'CRITICAL' && (
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
                                            required
                                            onChange={(event) =>
                                                update('patientName', event.target.value)
                                            }
                                        />
                                    </div>
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
                                            label: group.replace('_', '').replace('POSITIVE', '+').replace('NEGATIVE', '-'),
                                            value: group,
                                        }))}
                                        required
                                        placeholder="Select blood group"
                                        onChange={(event) =>
                                            update('bloodGroup', event.target.value)
                                        }
                                    />

                                    <Input
                                        label="Units required"
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={form.units}
                                        error={errors.units}
                                        onChange={(event) =>
                                            update('units', Number(event.target.value))
                                        }
                                    />

                                    <Select
                                        label="Urgency"
                                        value={form.urgency}
                                        options={urgencies.map((urgency) => ({
                                            label: urgency.charAt(0) + urgency.slice(1).toLowerCase(),
                                            value: urgency,
                                        }))}
                                        onChange={(event) =>
                                            update('urgency', event.target.value as Urgency)
                                        }
                                    />

                                    {isEditing && (
                                        <Select
                                            label="Request status"
                                            value={form.status}
                                            options={statuses}
                                            onChange={(event) => update('status', event.target.value as RequestStatus)}
                                        />
                                    )}

                                    <Input
                                        label="Required by"
                                        type="datetime-local"
                                        value={form.requiredAt}
                                        onChange={(event) => update('requiredAt', event.target.value)}
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
                                            required
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
                                        label="Bystander name"
                                        value={form.bystanderName}
                                        error={errors.bystanderName}
                                        placeholder="Full name"
                                        required
                                        onChange={(event) =>
                                            update('bystanderName', event.target.value)
                                        }
                                    />

                                    <Input
                                        label="Contact number"
                                        value={form.bystanderPhone}
                                        error={errors.bystanderPhone}
                                        placeholder="+91 98765 43210"
                                        required
                                        onChange={(event) =>
                                            update('bystanderPhone', event.target.value)
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

                            {errors.submit && <p role="alert" className="text-sm text-red-700">{errors.submit}</p>}
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
