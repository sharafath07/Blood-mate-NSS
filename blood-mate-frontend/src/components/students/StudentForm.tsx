import { useDialog } from '../../lib/useDialog'
import { useState, type FormEvent } from 'react'
import {

    UserRound, X
} from 'lucide-react'

import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

import type { Student, DonorStatus } from '../../data/students'

interface StudentFormProps {
    student?: Student | null
    onClose: () => void
    onSave: (student: Student) => Promise<void> | void
}

interface FormData {
    name: string

    department: string

    semester: string
    bloodGroup: string
    phone: string

    age: number
    willingToDonate: boolean
    donorStatus: DonorStatus
    gender: string
    address: string

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

const semesters = Array.from({ length: 12 }, (_, index) => String(index + 1))

const departments = [
    "BA Arabic",
    "BA Islamic History",
    "BA English",
    "BA Malayalam",
    "BA Sociology",
    "BA Multimedia",
    "BA Economics",
    "BA Functional English",
    "BA History",
    "BSc Physics",
    "BSc Chemistry",
    "BSc Mathematics",
    "BSc Statistics",
    "BSc Zoology",
    "BSc Botany",
    "BSc Computer Science",
    "BSc Psychology",
    "BBA",
    "BCA",
    "BCom with Computer Applications",
    "BCom Finance",
    "BVoc Software Development",
    "BVoc Automobile",
    "MA Arabic",
    "MA English",
    "MA History",
    "MA Economics",
    "MA Journalism and Mass Communication",
    "MSc Physics",
    "MSc Chemistry",
    "MSc Mathematics",
    "MSc Statistics",
    "MSc Zoology",
    "MSc Computer Science",
    "MSc Psychology",
    "MSc Geology",
    "MCom"
]

const donorStatuses: DonorStatus[] = [
    "AVAILABLE",
    "UNAVAILABLE",
    "INACTIVE"
]

export default function StudentForm({
    student,
    onClose,
    onSave,
}: StudentFormProps) {
    const editing = Boolean(student)

    const [form, setForm] = useState<FormData>({
        name: student?.name ?? '',
        age: student?.age ?? 18,
        gender: student?.gender ?? '',

        department: student?.department ?? '',

        semester: String(student?.semester ?? ''),
        bloodGroup: student?.bloodGroup ?? '',
        phone: student?.phone ?? '',
        address: student?.address ?? '',

        willingToDonate: student?.willingToDonate ?? false,
        donorStatus: student?.donorStatus ?? 'AVAILABLE',

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

        if (!form.department) {
            nextErrors.department = 'Select a department'
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

        // ) {

        setErrors(nextErrors)

        return Object.keys(nextErrors).length === 0
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault()

        if (!validate()) return

        setSaving(true)

        try {
            const savedStudent: Student = {
                id: student?.id ?? '',
                name: form.name.trim(),

                department: form.department,
                age: form.age,
                gender: form.gender || null,

                semester: Number(form.semester),
                bloodGroup: form.bloodGroup,
                phone: form.phone.trim(),
                address: form.address.trim(),

                willingToDonate: form.willingToDonate,
                donorStatus: form.willingToDonate ? form.donorStatus : 'INACTIVE',

            }

            await onSave(savedStudent)
        } catch (error) {
            setErrors({ submit: error instanceof Error ? error.message : 'Unable to save student.' })
        } finally {
            setSaving(false)
        }
    }

    const dialogRef = useDialog<HTMLElement>(onClose, !saving)

    return (
        <>
            <div
                className="fixed inset-0 z-[60] bg-black/25 backdrop-blur-sm"
                onClick={onClose}
            />

            <aside ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Student form" className="fixed inset-y-0 right-0 z-[70] w-full max-w-[560px] overflow-y-auto border-l border-neutral-200 bg-[#fafaf9] shadow-2xl">

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
                                    required
                                    onChange={(e) => update('name', e.target.value)}
                                    error={errors.name}
                                />
                            </div>



                            <Input
                                label="Age *"
                                type="number"
                                min="18"
                                placeholder="Enter student's age"
                                value={form.age}
                                required
                                onChange={(e) => update('age', e.target.valueAsNumber)}
                                error={errors.age}
                            />

                            <Input
                                label="Phone number *"
                                placeholder="+91 XXXXX XXXXX"
                                value={form.phone}
                                required
                                onChange={(e) => update('phone', e.target.value)}
                                error={errors.phone}
                            />

                            <Select
                                label="Gender *"
                                value={form.gender}
                                onChange={(e) => update('gender', e.target.value)}
                                error={errors.gender}
                                placeholder='Select gender'
                                required
                                options={[
                                    { label: 'Male', value: 'Male' },
                                    { label: 'Female', value: 'Female' }
                                ]}
                            >
                            </Select>

                            <div className="w-full col-span-2">
                                <label className="mb-1.5 block  text-[10px] font-bold text-neutral-600">
                                    Address *
                                </label>
                                <textarea
                                    className={`w-full rounded-lg border px-3  py-2 text-[10px] text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-[11px] ${errors.address ? 'border-red-500' : 'border-neutral-300'
                                        }`}
                                    placeholder="Enter student's address"
                                    value={form.address}
                                    rows={3}
                                    required
                                    onChange={(e) => update('address', e.target.value)}
                                // error={errors.address}
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
                                required
                                placeholder="Select department"
                                error={errors.department}
                            />



                            <Select
                                label="Semester *"
                                value={form.semester}
                                onChange={(e) =>
                                    update('semester', e.target.value)
                                }
                                options={semesters}
                                required
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

                            <label className="flex items-center gap-2 text-sm text-neutral-700">
                                <input
                                    type="checkbox"
                                    checked={form.willingToDonate}
                                    onChange={(event) => {
                                        const willing = event.target.checked
                                        setForm((current) => ({
                                            ...current,
                                            willingToDonate: willing,
                                            donorStatus: willing ? 'AVAILABLE' : 'INACTIVE',
                                        }))
                                    }}
                                />
                                Student has agreed to be contacted about donating
                            </label>

                            <Select
                                label="Donor status"
                                disabled={!form.willingToDonate}
                                value={form.donorStatus}
                                onChange={(e) =>
                                    update(
                                        'donorStatus',
                                        e.target.value as DonorStatus,
                                    )
                                }
                                options={donorStatuses}
                            />


                        </div>
                    </FormSection>

                    {/* Verification */}


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

                        {errors.submit && <p role="alert" className="text-sm text-red-700">{errors.submit}</p>}
                        <Button
                            type="submit"
                            loading={saving}
                            className="flex-1"
                        >
                            {editing ? 'Save changes' : 'Add student'}
                        </Button>
                    </div>

                </form >
            </aside >
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

// function CheckRow({
//     checked,
//     onChange,
//     title,
//     description,
//     error,
// }: {
//     checked: boolean
//     onChange: (value: boolean) => void
//     title: string
//     description: string
//     error?: string
// }) {
//     return (
//         <div>
//             <button
//                 type="button"
//                 onClick={() => onChange(!checked)}
//                 className={`
//           flex w-full items-start gap-3 rounded-xl border p-3 text-left transition
//           ${checked
//                         ? 'border-emerald-200 bg-emerald-50/50'
//                         : 'border-neutral-200 bg-white hover:border-neutral-300'

//         `}
//             >
//                 <div
//                     className={`
//             mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border
//             ${checked
//                             ? 'border-emerald-500 bg-emerald-500'
//                             : 'border-neutral-300 bg-white'

//           `}
//                 >
//                     {checked && (
//                         <CheckCircle2 className="h-3 w-3 text-white" />
//                     )}
//                 </div>

//                 <div>
//                     <p className="text-[10px] font-bold text-neutral-700">
//                         {title}
//                     </p>

//                     <p className="mt-0.5 text-[9px] leading-relaxed text-neutral-400">
//                         {description}
//                     </p>
//                 </div>
//             </button>

//             {error && (
//                 <p className="mt-1 text-[9px] font-medium text-red-500">
//                     {error}
//                 </p>
//             )}
//         </div>
//     )
// }