import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    SlidersHorizontal,
    Users,
    X,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import StudentForm from '../components/students/StudentForm'

import {
    students as initialStudents,
    type DonorStatus,
    type Student,
} from '../data/students'

const departments = [
    'All departments',
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

const donorStatuses = [
    'All statuses',
    'Available',
    'Unavailable',
    'Not Confirmed',
]

function statusVariant(status: DonorStatus) {
    switch (status) {
        case 'Available':
            return 'success' as const
        case 'Unavailable':
            return 'warning' as const
        default:
            return 'neutral' as const
    }
}

function StudentRow({
    student,
    onSelect,
}: {
    student: Student
    onSelect: (student: Student) => void
}) {
    return (
        <tr
            onClick={() => onSelect(student)}
            className="group cursor-pointer border-b border-neutral-50 transition hover:bg-neutral-50/70"
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <Avatar name={student.name} />

                    <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold text-neutral-800">
                            {student.name}
                        </p>

                        <p className="mt-0.5 text-[9px] text-neutral-400">
                            {student.studentId}
                        </p>
                    </div>
                </div>
            </td>

            <td className="px-4 py-4">
                <span className="text-[10px] font-medium text-neutral-500">
                    {student.department}
                </span>
            </td>

            <td className="px-4 py-4">
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-red-50 px-2 text-[10px] font-bold text-red-600">
                    {student.bloodGroup}
                </span>
            </td>

            <td className="px-4 py-4">
                <span className="text-[10px] text-neutral-500">
                    {student.phone}
                </span>
            </td>

            <td className="px-4 py-4">
                <Badge variant={statusVariant(student.donorStatus)} dot>
                    {student.donorStatus}
                </Badge>
            </td>

            <td className="px-4 py-4">
                <span className="text-[10px] text-neutral-500">
                    {student.lastDonation}
                </span>
            </td>

            <td className="px-4 py-4 text-center">
                <span className="text-[10px] font-bold text-neutral-700">
                    {student.donations}
                </span>
            </td>

            <td className="px-6 py-4 text-right">
                <button
                    onClick={(event) => {
                        event.stopPropagation()
                    }}
                    className="rounded-lg p-1.5 text-neutral-300 opacity-0 transition group-hover:opacity-100 hover:bg-white hover:text-neutral-700"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </td>
        </tr>
    )
}

function StudentCard({
    student,
    onSelect,
}: {
    student: Student
    onSelect: (student: Student) => void
}) {
    return (
        <button
            onClick={() => onSelect(student)}
            className="w-full border-b border-neutral-100 p-4 text-left transition hover:bg-neutral-50"
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <Avatar name={student.name} />

                    <div>
                        <p className="text-[11px] font-bold text-neutral-800">
                            {student.name}
                        </p>

                        <p className="mt-0.5 text-[9px] text-neutral-400">
                            {student.studentId}
                        </p>
                    </div>
                </div>

                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-red-50 px-2 text-[10px] font-bold text-red-600">
                    {student.bloodGroup}
                </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <span className="text-[9px] text-neutral-400">
                    {student.department}
                </span>

                <Badge variant={statusVariant(student.donorStatus)} dot>
                    {student.donorStatus}
                </Badge>
            </div>
        </button>
    )
}

function StudentDetails({
    student,
    onClose,
    onEdit
}: {
    student: Student
    onClose: () => void
    onEdit: (student: Student) => void
}) {
    return (
        <>
            <div
                className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            />

            <aside className="fixed inset-y-0 right-0 z-[70] w-full max-w-[440px] overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl">

                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white/95 px-5 py-4 backdrop-blur">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            Student profile
                        </p>

                        <h2 className="mt-1 font-['Manrope'] text-[17px] font-extrabold tracking-tight text-neutral-900">
                            Details
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-800"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-5">

                    <div className="flex items-center gap-4">
                        <Avatar name={student.name} size="lg" />

                        <div>
                            <h3 className="font-['Manrope'] text-[18px] font-extrabold tracking-tight text-neutral-900">
                                {student.name}
                            </h3>

                            <p className="mt-1 text-[10px] text-neutral-400">
                                {student.studentId} • {student.course}
                            </p>

                            <div className="mt-2">
                                <Badge variant={statusVariant(student.donorStatus)} dot>
                                    {student.donorStatus}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="mt-7 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-red-50 p-4">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-red-400">
                                Blood group
                            </p>

                            <p className="mt-1 font-['Manrope'] text-xl font-extrabold text-red-600">
                                {student.bloodGroup}
                            </p>
                        </div>

                        <div className="rounded-xl bg-neutral-50 p-4">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                                Donations
                            </p>

                            <p className="mt-1 font-['Manrope'] text-xl font-extrabold text-neutral-900">
                                {student.donations}
                            </p>
                        </div>
                    </div>

                    <div className="mt-7">
                        <h4 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            Personal information
                        </h4>

                        <Card className="divide-y divide-neutral-100">
                            {[
                                ['Phone', student.phone],
                                ['Email', student.email],
                                ['Department', student.department],
                                ['Course', student.course],
                                ['Last donation', student.lastDonation],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between px-4 py-3.5"
                                >
                                    <span className="text-[10px] text-neutral-400">
                                        {label}
                                    </span>

                                    <span className="max-w-[220px] text-right text-[10px] font-semibold text-neutral-700">
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </Card>
                    </div>

                    <div className="mt-6 flex gap-2">
                        <Button
                            className="flex-1"
                            onClick={() => onEdit(student)}
                        >
                            Edit student
                        </Button>

                        <Button
                            variant="outline"
                            className="flex-1"
                        >
                            Contact
                        </Button>
                    </div>

                </div>
            </aside>
        </>
    )
}

export default function Students() {
    const [studentList, setStudentList] = useState<Student[]>(
        initialStudents,
    )
    const [search, setSearch] = useState('')
    const [department, setDepartment] = useState('All departments')
    const [bloodGroup, setBloodGroup] = useState('All blood groups')
    const [status, setStatus] = useState('All statuses')
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [formOpen, setFormOpen] = useState(false)
    const [editingStudent, setEditingStudent] =
        useState<Student | null>(null)

    function handleSaveStudent(student: Student) {
        setStudentList((current) => {
            const exists = current.some(
                (item) => item.id === student.id,
            )

            if (exists) {
                return current.map((item) =>
                    item.id === student.id ? student : item,
                )
            }

            return [student, ...current]
        })

        setFormOpen(false)
        setEditingStudent(null)
    }

    const filteredStudents = useMemo(() => {
        const query = search.toLowerCase().trim()

        return studentList.filter((student) => {
            const matchesSearch =
                !query ||
                student.name.toLowerCase().includes(query) ||
                student.studentId.toLowerCase().includes(query) ||
                student.phone.toLowerCase().includes(query)

            const matchesDepartment =
                department === 'All departments' ||
                student.department === department

            const matchesBlood =
                bloodGroup === 'All blood groups' ||
                student.bloodGroup === bloodGroup

            const matchesStatus =
                status === 'All statuses' ||
                student.donorStatus === status

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesBlood &&
                matchesStatus
            )
        })
    }, [search, department, bloodGroup, status])

    const hasFilters =
        search ||
        department !== 'All departments' ||
        bloodGroup !== 'All blood groups' ||
        status !== 'All statuses'

    function clearFilters() {
        setSearch('')
        setDepartment('All departments')
        setBloodGroup('All blood groups')
        setStatus('All statuses')
    }

    return (
        <div className="mx-auto max-w-[1500px]">

            {/* Header */}
            <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-red-600" />

                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                            Student directory
                        </span>
                    </div>

                    <h1 className="font-['Manrope'] text-[30px] font-extrabold tracking-[-0.045em] text-neutral-950 sm:text-[34px]">
                        Students
                    </h1>

                    <p className="mt-1.5 text-[13px] text-neutral-400">
                        Manage students and potential blood donors.
                    </p>
                </div>

                <Button
                    icon={<Plus className="h-3.5 w-3.5" />}
                    onClick={() => {
                        setEditingStudent(null)
                        setFormOpen(true)
                    }}
                >
                    Add student
                </Button>
            </div>

            {/* Summary */}
            <div className="mb-5 grid gap-3 sm:grid-cols-3">

                <Card className="p-4">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                        Total students
                    </p>

                    <div className="mt-1 flex items-end gap-2">
                        <span className="font-['Manrope'] text-2xl font-extrabold tracking-tight">
                            1,248
                        </span>

                        <span className="mb-1 text-[9px] font-bold text-emerald-600">
                            +8.2%
                        </span>
                    </div>
                </Card>

                <Card className="p-4">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                        Available donors
                    </p>

                    <div className="mt-1 flex items-end gap-2">
                        <span className="font-['Manrope'] text-2xl font-extrabold tracking-tight">
                            386
                        </span>

                        <span className="mb-1 text-[9px] font-bold text-emerald-600">
                            30.9%
                        </span>
                    </div>
                </Card>

                <Card className="p-4">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                        New this month
                    </p>

                    <div className="mt-1 flex items-end gap-2">
                        <span className="font-['Manrope'] text-2xl font-extrabold tracking-tight">
                            42
                        </span>

                        <span className="mb-1 text-[9px] font-bold text-emerald-600">
                            +14.5%
                        </span>
                    </div>
                </Card>

            </div>

            {/* Filters */}
            <Card className="mb-5 p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-end">

                    <div className="min-w-0 flex-1 xl:max-w-[330px]">
                        <Input
                            placeholder="Search by name, ID or phone..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="pl-10"
                        />

                        <Search className="pointer-events-none relative -top-[30px] left-3 h-3.5 w-3.5 text-neutral-300" />
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:flex">
                        <FilterSelect
                            value={department}
                            onChange={setDepartment}
                            options={departments}
                        />

                        <FilterSelect
                            value={bloodGroup}
                            onChange={setBloodGroup}
                            options={bloodGroups}
                        />

                        <FilterSelect
                            value={status}
                            onChange={setStatus}
                            options={donorStatuses}
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

            {/* Table */}
            <Card className="overflow-hidden">

                <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="font-['Manrope'] text-[14px] font-extrabold tracking-tight">
                            Student directory
                        </h2>

                        <p className="mt-1 text-[9px] text-neutral-400">
                            Showing {filteredStudents.length} of {studentList.length} records
                        </p>
                    </div>

                    <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-[9px] font-bold text-neutral-500 hover:bg-neutral-50">
                        <SlidersHorizontal className="h-3 w-3" />
                        Columns
                    </button>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50">
                            <Filter className="h-5 w-5 text-neutral-300" />
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-neutral-800">
                            No students found
                        </h3>

                        <p className="mt-1 max-w-[280px] text-[10px] leading-relaxed text-neutral-400">
                            Try changing your search or filter criteria.
                        </p>

                        <button
                            onClick={clearFilters}
                            className="mt-4 text-[10px] font-bold text-red-600"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-100 text-left">
                                        {[
                                            'Student',
                                            'Department',
                                            'Blood',
                                            'Phone',
                                            'Donor status',
                                            'Last donation',
                                            'Donations',
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
                                    {filteredStudents.map((student) => (
                                        <StudentRow
                                            key={student.id}
                                            student={student}
                                            onSelect={setSelectedStudent}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile/tablet */}
                        <div className="divide-y divide-neutral-100 lg:hidden">
                            {filteredStudents.map((student) => (
                                <StudentCard
                                    key={student.id}
                                    student={student}
                                    onSelect={setSelectedStudent}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Pagination */}
                {filteredStudents.length > 0 && (
                    <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3.5">
                        <p className="text-[9px] text-neutral-400">
                            1–{filteredStudents.length} of {studentList.length}
                        </p>

                        <div className="flex items-center gap-1">
                            <button className="rounded-lg p-1.5 text-neutral-300 hover:bg-neutral-50 hover:text-neutral-700">
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>

                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-900 text-[9px] font-bold text-white">
                                1
                            </span>

                            <button className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700">
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}

            </Card>

            {selectedStudent && (
                <StudentDetails
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                    onEdit={(student) => {
                        setSelectedStudent(null)
                        setEditingStudent(student)
                        setFormOpen(true)
                    }}
                />
            )}

            {formOpen && (
                <StudentForm
                    student={editingStudent}
                    onClose={() => {
                        setFormOpen(false)
                        setEditingStudent(null)
                    }}
                    onSave={handleSaveStudent}
                />
            )}
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