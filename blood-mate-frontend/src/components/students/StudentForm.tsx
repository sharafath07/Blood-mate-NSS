import { useState } from 'react'
import { CheckCircle2, UserRound, X } from 'lucide-react'

import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

import type { Student, DonorStatus } from '../../data/students'

interface StudentFormProps {
    student?: Student | null
    onClose: () => void
    onSave: (student: Student) => void
}

interface FormData {
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
    donations: string
    consent: boolean
    verified: boolean
}

const departments = [
    'Computer Science',
    'Commerce',
    'Physics',
    'English',
    'Mathematics',
    'Zoology',
    'Economics',
    'History',
]

const bloodGroups = [
    'A+',
    'A−',
    'B+',
    'B−',
    'AB+',
    'AB−',
    'O+',
    'O−',
]

const courses = [
    'BCA',
    'B.Com',
    'B.Sc Physics',
    'BA English',
    'B.Sc Mathematics',
    'B.Sc Zoology',
    'BA Economics',
    'BA History',
]

const semesters = ['1', '2', '3', '4', '5', '6']

const donorStatuses: DonorStatus[] = [
    'Available',
    'Unavailable',
    'Not Confirmed',
]

export default function StudentForm({
    student,
    onClose,
    onSave,
}: StudentFormProps) {
    const editing = Boolean(student)

    const [form, setForm] = useState<FormData>({
        name: student?.name ?? '',
        studentId: student?.studentId ?? '',
        department: student?.department ?? '',
        course: student?.course ?? '',
        semester: student?.semester ?? '',
        bloodGroup: student?.bloodGroup ?? '',
        phone: student?.phone ?? '',
        email: student?.email ?? '',
        donorStatus: student?.donorStatus ?? 'Not Confirmed',
        lastDonation: student?.lastDonation ?? '',
        donations: String(student?.donations ?? 0),
        consent: student?.consent ?? false,
        verified: student?.verified ?? false,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)

    function update<K extends keyof FormData>(
        key: K,
        value: FormData[K],
    ) {
        setForm((current) => ({
            ...current,
            [key]: value,
        }))

        if (errors[key]) {
            setErrors((current) => ({
                ...current,
                [key]: '',
            }))
        }
    }

    function validate() {
        const nextErrors: Record<string, string> = {}

        if (!form.name.trim()) {
            nextErrors.name = 'Full name is required'
        }

        if (!form.studentId.trim()) {
            nextErrors.studentId = 'Student ID is required'
        }

        if (!form.department) {
            nextErrors.department = 'Select a department'
        }

        if (!form.course) {
            nextErrors.course = 'Select a course'
        }

        if (!form.semester) {
            nextErrors.semester = 'Select a semester'
        }

        if (!form.bloodGroup) {
            nextErrors.bloodGroup = 'Select a blood group'
        }

        if (!form.phone.trim()) {
            nextErrors.phone = 'Phone number is required'
        } else if (!/^[+0-9\s-]{10,16}$/.test(form.phone)) {
            nextErrors.phone = 'Enter a valid phone number'
        }

        if (
            form.email.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
        ) {
            nextErrors.email = 'Enter a valid email address'
        }

        if (!form.consent) {
            nextErrors.consent = 'Donor consent must be confirmed'
        }

        setErrors(nextErrors)

        return Object.keys(nextErrors).length === 0
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()

        if (!validate()) return

        setSaving(true)

        // Simulate an API request.
        await new Promise((resolve) => setTimeout(resolve, 700))

        const savedStudent: Student = {
            id: student?.id ?? crypto.randomUUID(),
            name: form.name.trim(),
            studentId: form.studentId.trim(),
            department: form.department,
            course: form.course,
            semester: form.semester,
            bloodGroup: form.bloodGroup,
            phone: form.phone.trim(),
            email: form.email.trim(),
            donorStatus: form.donorStatus,
            lastDonation: form.lastDonation || '—',
            donations: Number(form.donations) || 0,
            consent: form.consent,
            verified: form.verified,
        }

        onSave(savedStudent)

        setSaving(false)
    }

    return (
        <>
            <div
                className="fixed inset-0 z-[60] bg-black/25 backdrop-blur-sm"
                onClick={onClose}
            />

            <aside className="fixed inset-y-0 right-0 z-[70] w-full max-w-[560px] overflow-y-auto border-l border-neutral-200 bg-[#fafaf9] shadow-2xl">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200/70 bg-[#fafaf9]/95 px-5 py-4 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
                            <UserRound className="h-4 w-4 text-red-600" />
                        </div>

                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                                Student management
                            </p>

                            <h2 className="font-['Manrope'] text-[16px] font-extrabold tracking-tight text-neutral-900">
                                {editing ? 'Edit student' : 'Add student'}
                            </h2>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-800"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5">

                    {/* Personal */}
                    <FormSection
                        number="01"
                        title="Personal information"
                        description="Basic information about the student."
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Input
                                    label="Full name *"
                                    placeholder="Enter student's full name"
                                    value={form.name}
                                    onChange={(e) => update('name', e.target.value)}
                                    error={errors.name}
                                />
                            </div>

                            <Input
                                label="Student ID *"
                                placeholder="FC2024XXX"
                                value={form.studentId}
                                onChange={(e) =>
                                    update('studentId', e.target.value)
                                }
                                error={errors.studentId}
                            />

                            <Input
                                label="Phone number *"
                                placeholder="+91 XXXXX XXXXX"
                                value={form.phone}
                                onChange={(e) => update('phone', e.target.value)}
                                error={errors.phone}
                            />

                            <div className="sm:col-span-2">
                                <Input
                                    label="Email address"
                                    type="email"
                                    placeholder="student@example.com"
                                    value={form.email}
                                    onChange={(e) => update('email', e.target.value)}
                                    error={errors.email}
                                />
                            </div>
                        </div>
                    </FormSection>

                    {/* Academic */}
                    <FormSection
                        number="02"
                        title="Academic information"
                        description="College and course details."
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Select
                                label="Department *"
                                value={form.department}
                                onChange={(e) =>
                                    update('department', e.target.value)
                                }
                                options={departments}
                                placeholder="Select department"
                                error={errors.department}
                            />

                            <Select
                                label="Course *"
                                value={form.course}
                                onChange={(e) =>
                                    update('course', e.target.value)
                                }
                                options={courses}
                                placeholder="Select course"
                                error={errors.course}
                            />

                            <Select
                                label="Semester *"
                                value={form.semester}
                                onChange={(e) =>
                                    update('semester', e.target.value)
                                }
                                options={semesters}
                                placeholder="Select semester"
                                error={errors.semester}
                            />
                        </div>
                    </FormSection>

                    {/* Blood */}
                    <FormSection
                        number="03"
                        title="Blood & donation"
                        description="Information used for donor matching."
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Select
                                label="Blood group *"
                                value={form.bloodGroup}
                                onChange={(e) =>
                                    update('bloodGroup', e.target.value)
                                }
                                options={bloodGroups}
                                placeholder="Select blood group"
                                error={errors.bloodGroup}
                            />

                            <Select
                                label="Donor status"
                                value={form.donorStatus}
                                onChange={(e) =>
                                    update(
                                        'donorStatus',
                                        e.target.value as DonorStatus,
                                    )
                                }
                                options={donorStatuses}
                            />

                            <Input
                                label="Last donation"
                                type="date"
                                value={
                                    form.lastDonation === '—'
                                        ? ''
                                        : form.lastDonation
                                }
                                onChange={(e) =>
                                    update('lastDonation', e.target.value)
                                }
                            />

                            <Input
                                label="Previous donations"
                                type="number"
                                min="0"
                                value={form.donations}
                                onChange={(e) =>
                                    update('donations', e.target.value)
                                }
                            />
                        </div>
                    </FormSection>

                    {/* Verification */}
                    <FormSection
                        number="04"
                        title="Consent & verification"
                        description="Confirm the information before adding the student."
                    >
                        <div className="space-y-3">
                            <CheckRow
                                checked={form.consent}
                                onChange={(checked) =>
                                    update('consent', checked)
                                }
                                title="Donor consent"
                                description="Student has agreed to be contacted for blood donation requests."
                                error={errors.consent}
                            />

                            <CheckRow
                                checked={form.verified}
                                onChange={(checked) =>
                                    update('verified', checked)
                                }
                                title="Information verified"
                                description="Student information has been checked by the Blood Mate team."
                            />
                        </div>
                    </FormSection>

                    {/* Actions */}
                    <div className="sticky bottom-0 -mx-5 mt-7 flex gap-2 border-t border-neutral-200/70 bg-[#fafaf9]/95 px-5 py-4 backdrop-blur-xl">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            loading={saving}
                            className="flex-1"
                        >
                            {editing ? 'Save changes' : 'Add student'}
                        </Button>
                    </div>

                </form>
            </aside>
        </>
    )
}

function FormSection({
    number,
    title,
    description,
    children,
}: {
    number: string
    title: string
    description: string
    children: React.ReactNode
}) {
    return (
        <section className="mb-7">
            <div className="mb-4 flex gap-3">
                <span className="text-[9px] font-bold text-red-500">
                    {number}
                </span>

                <div>
                    <h3 className="text-[12px] font-bold text-neutral-800">
                        {title}
                    </h3>

                    <p className="mt-0.5 text-[9px] text-neutral-400">
                        {description}
                    </p>
                </div>
            </div>

            {children}
        </section>
    )
}

function CheckRow({
    checked,
    onChange,
    title,
    description,
    error,
}: {
    checked: boolean
    onChange: (value: boolean) => void
    title: string
    description: string
    error?: string
}) {
    return (
        <div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`
          flex w-full items-start gap-3 rounded-xl border p-3 text-left transition
          ${checked
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    }
        `}
            >
                <div
                    className={`
            mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border
            ${checked
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-neutral-300 bg-white'
                        }
          `}
                >
                    {checked && (
                        <CheckCircle2 className="h-3 w-3 text-white" />
                    )}
                </div>

                <div>
                    <p className="text-[10px] font-bold text-neutral-700">
                        {title}
                    </p>

                    <p className="mt-0.5 text-[9px] leading-relaxed text-neutral-400">
                        {description}
                    </p>
                </div>
            </button>

            {error && (
                <p className="mt-1 text-[9px] font-medium text-red-500">
                    {error}
                </p>
            )}
        </div>
    )
}