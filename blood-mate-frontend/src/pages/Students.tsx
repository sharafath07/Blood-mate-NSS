import CallLink from '../components/ui/CallLink'
import { useDialog } from '../lib/useDialog'
import {
    ChevronDown,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Users,
    X,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import StudentForm from '../components/students/StudentForm'
import StudentImport from '../components/students/StudentImport'
import { motion } from 'motion/react'
import { useSearchParams } from 'react-router-dom'
import { pageMotion } from '../lib/motion'

import { api } from '../services/api'

import {

    type DonorStatus,
    type Student,
} from '../data/students'

const departments = [
    'All departments',
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

const donorStatuses = [
    'All statuses',
    'AVAILABLE',
    'UNAVAILABLE',
    'INACTIVE',
]

function formatBloodGroup(group: string | null) {
    return group?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-') ?? 'Unknown'
}

function statusVariant(status: DonorStatus) {
    switch (status) {
        case 'AVAILABLE':
            return 'success' as const
        case 'UNAVAILABLE':
            return 'warning' as const
        default:
            return 'neutral' as const
    }
}

// function StudentRow({
//     student,
//     onSelect,
// }: {
//     student: Student
//     onSelect: (student: Student) => void
// }) {
//     return (
//         <tr
//             onClick={() => onSelect(student)}
//             className="group cursor-pointer border-b border-neutral-50 transition hover:bg-neutral-50/70"
//         >
//             <td className="px-6 py-4">
//                 <div className="flex items-center gap-3">
//                     <Avatar name={student.name} />

//                     <div className="min-w-0">
//                         <p className="truncate text-[11px] font-bold text-neutral-800">
//                             {student.name}
//                         </p>

//                         <p className="mt-0.5 text-[9px] text-neutral-400">
//                             {student.studentId}
//                         </p>
//                     </div>
//                 </div>
//             </td>

//             <td className="px-4 py-4">
//                 <span className="text-[10px] font-medium text-neutral-500">
//                     {student.department}
//                 </span>
//             </td>

//             <td className="px-4 py-4">
//                 <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-red-50 px-2 text-[10px] font-bold text-red-600">
//                     {formatBloodGroup(student.bloodGroup)}
//                 </span>
//             </td>

//             <td className="px-4 py-4">
//                 <span className="text-[10px] text-neutral-500">
//                     {student.phone}
//                 </span>
//             </td>

//             <td className="px-4 py-4">
//                 <Badge variant={statusVariant(student.donorStatus)} dot>
//                     {student.donorStatus}
//                 </Badge>
//             </td>

//             <td className="px-4 py-4">
//                 <span className="text-[10px] text-neutral-500">
//                     {student.lastDonation}
//                 </span>
//             </td>

//             <td className="px-4 py-4 text-center">
//                 <span className="text-[10px] font-bold text-neutral-700">
//                     {student.donations}
//                 </span>
//             </td>

//             <td className="px-6 py-4 text-right">
//                 <button
//                     onClick={(event) => {
//                         event.stopPropagation()
//                     }}
//                     className="rounded-lg p-1.5 text-neutral-300 opacity-0 transition group-hover:opacity-100 hover:bg-white hover:text-neutral-700"
//                 >
//                     <MoreHorizontal className="h-4 w-4" />
//                 </button>
//             </td>
//         </tr>
//     )

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


                    </div>
                </div>

                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-red-50 px-2 text-[10px] font-bold text-red-600">
                    {formatBloodGroup(student.bloodGroup)}
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
    const dialogRef = useDialog<HTMLElement>(onClose)

    return (
        <>
            <div
                className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            />

            <aside ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Student details" className="fixed inset-y-0 right-0 z-[70] w-full max-w-[440px] overflow-y-auto border-l border-neutral-200 bg-white shadow-2xl">

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
                                {student.department}
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
                                {formatBloodGroup(student.bloodGroup)}
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
                                ['Age', student.age],
                                ['Gender', student.gender],
                                // ['Email', student.email],
                                ['Department', student.department],
                                ['Semester', student.semester],
                                // ['Course', student.course],
                                // ['Last donation', student.lastDonation],
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

                        <CallLink phone={student.phone} label="Call" className="flex-1" />
                    </div>

                </div>
            </aside>
        </>
    )
}

export default function Students() {
    const [studentList, setStudentList] = useState<Student[]>([])
    const [search, setSearch] = useState('')
    const [department, setDepartment] = useState('All departments')
    const [bloodGroup, setBloodGroup] = useState('All blood groups')
    const [params] = useSearchParams()
    const [status, setStatus] = useState(params.get('available') === '1' ? 'AVAILABLE' : 'All statuses')
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [formOpen, setFormOpen] = useState(false)
    const [editingStudent, setEditingStudent] = useState<Student | null>(null)
    const [loading, setLoading] = useState(true)
    const [apiError, setApiError] = useState<string | null>(null)

    const resultsRef = useRef<HTMLDivElement>(null)
    const [semester, setSemester] = useState('All semesters')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [total, setTotal] = useState(0)
    const [revision, setRevision] = useState(0)
    const [summary, setSummary] = useState<{ students: number; available: number } | null>(null)
    const [importOpen, setImportOpen] = useState(false)

    function resetResults() {
        setPage(1)
        setStudentList([])
        setTotalPages(0)
        if (resultsRef.current) resultsRef.current.scrollTop = 0
    }

    function refresh() {
        resetResults()
        setRevision((current) => current + 1)
    }

    useEffect(() => {
        let active = true
        api.dashboard.getStats().then((stats) => {
            if (active) setSummary({ students: stats.students.total, available: stats.donors.available })
        }, () => { if (active) setSummary(null) })
        return () => { active = false }
    }, [revision])

    useEffect(() => {
        let active = true
        const timer = window.setTimeout(async () => {
            setLoading(true)
            setApiError(null)
            try {
                const code = bloodGroup.endsWith('+') ? bloodGroup.slice(0, -1) + '_POSITIVE'
                    : bloodGroup.endsWith('-') ? bloodGroup.slice(0, -1) + '_NEGATIVE' : undefined
                const result = await api.students.getAll(page, 50, {
                    search: search.trim() || undefined,
                    department: department === 'All departments' ? undefined : department,
                    bloodGroup: code,
                    donorStatus: status === 'All statuses' ? undefined : status,
                    semester: semester === 'All semesters' ? undefined : semester,
                })
                if (!active) return
                setTotal(result.pagination.total)
                setTotalPages(result.pagination.totalPages)
                setStudentList((current) => page === 1 ? result.students
                    : [...new Map([...current, ...result.students].map((student) => [student.id, student])).values()])
            } catch {
                if (active) setApiError('Unable to load students.')
            } finally {
                if (active) setLoading(false)
            }
        }, page === 1 ? 150 : 0)
        return () => {
            active = false
            window.clearTimeout(timer)
        }
    }, [page, search, department, bloodGroup, status, semester, revision])

    const handleSaveStudent = async (student: Student) => {
        if (editingStudent) await api.students.update(editingStudent.id, student)
        else await api.students.create(student)
        setFormOpen(false)
        setEditingStudent(null)
        refresh()
    }

    const hasFilters =
        search ||
        department !== 'All departments' ||
        bloodGroup !== 'All blood groups' ||
        status !== 'All statuses' || semester !== 'All semesters'

    function clearFilters() {
        resetResults()
        setSemester('All semesters')
        setSearch('')
        setDepartment('All departments')
        setBloodGroup('All blood groups')
        setStatus('All statuses')
    }

    return (
        <motion.div {...pageMotion} className="mx-auto max-w-[1500px]">

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

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setImportOpen(true)}>Import Excel</Button>
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
            </div>

            {loading && (
                <p className="text-sm text-neutral-400">
                    Loading students…
                </p>
            )}

            {apiError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {apiError} <button className="underline" onClick={refresh}>Retry</button>
                </div>
            )}

            {/* Summary */}
            <div className="mb-5 grid gap-3 sm:grid-cols-3">

                <Card className="p-4">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                        Total students
                    </p>

                    <div className="mt-1 flex items-end gap-2">
                        <span className="font-['Manrope'] text-2xl font-extrabold tracking-tight">
                            {summary?.students ?? total}
                        </span>


                    </div>
                </Card>

                <Card className="p-4">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                        Available donors
                    </p>

                    <div className="mt-1 flex items-end gap-2">
                        <span className="font-['Manrope'] text-2xl font-extrabold tracking-tight">
                            {summary?.available ?? '—'}
                        </span>


                    </div>
                </Card>



            </div>

            {/* Filters */}
            <Card className="mb-5 p-4 pl-2">
                <div className="flex flex-col items-center justify-between gap-3 xl:flex-row xl:items-end">

                    <div className="min-w-0 flex flex-1 w-full">
                        <Search className="pointer-events-none relative top-[16px] left-7 h-3.5 w-3.5 text-neutral-300" />

                        <Input
                            placeholder="Search by name or phone..."
                            value={search}
                            onChange={(event) => { resetResults(); setSearch(event.target.value) }}
                            className="pl-10"
                        />

                    </div>

                    <div className="grid grid-cols-1 gap-2 pl-2 sm:grid-cols-3 xl:flex">
                        <FilterSelect
                            value={department}
                            onChange={(value) => { resetResults(); setDepartment(value) }}
                            options={departments}
                        />

                        <FilterSelect
                            value={bloodGroup}
                            onChange={(value) => { resetResults(); setBloodGroup(value) }}
                            options={bloodGroups}
                        />

                        <FilterSelect
                            value={status}
                            onChange={(value) => { resetResults(); setStatus(value) }}
                            options={donorStatuses}
                        />
                        <FilterSelect value={semester}
                            onChange={(value) => { resetResults(); setSemester(value) }}
                            options={['All semesters', ...Array.from({ length: 12 }, (_, index) => String(index + 1))]} />

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
                            Showing {studentList.length} of {total} records
                        </p>
                    </div>

                </div>

                {!loading && !apiError && studentList.length === 0 ? (
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
                ) : studentList.length > 0 && (
                    <div
                        ref={resultsRef}
                        role="region"
                        aria-label="Student directory results"
                        tabIndex={0}
                        className="max-h-[60vh] overflow-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-red-600"
                    >
                        {/* Desktop */}
                        <div className="hidden lg:block">
                            <table className="w-full">
                                <thead className="sticky top-0 z-10 bg-white">
                                    <tr className="border-b border-neutral-100 text-left">
                                        {[
                                            'Student',
                                            'Department',
                                            'Blood',
                                            'Phone',
                                            'Donor status',
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
                                    {studentList.map((student) => (
                                        <tr
                                            key={student.id}
                                            onClick={() => setSelectedStudent(student)}
                                            className="group cursor-pointer border-b border-neutral-50 transition hover:bg-neutral-50/70"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={student.name} />
                                                    <div className="min-w-0">
                                                        <p className="truncate text-[11px] font-bold text-neutral-800">
                                                            {student.name}
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
                                                    {formatBloodGroup(student.bloodGroup)}
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



                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    type="button"
                                                    aria-label={`View ${student.name}`}
                                                    onClick={(event) => { event.stopPropagation(); setSelectedStudent(student) }}
                                                    className="rounded-lg p-1.5 text-neutral-300 opacity-0 transition group-hover:opacity-100 hover:bg-white hover:text-neutral-700"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile/tablet */}
                        <div className="divide-y divide-neutral-100 lg:hidden">
                            {studentList.map((student) => (
                                <StudentCard
                                    key={student.id}
                                    student={student}
                                    onSelect={setSelectedStudent}
                                />
                            ))}
                        </div>
                        {page < totalPages && <div className="p-4 text-center">
                            <Button variant="outline" disabled={loading} onClick={() => {
                                setLoading(true)
                                setPage((current) => current + 1)
                            }}>Load more students</Button>
                        </div>}
                    </div>
                )}
            </Card>

            {importOpen && <StudentImport onClose={() => setImportOpen(false)} onImported={refresh} />}

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
        </motion.div>
    )
}

function FilterSelect({
    value,
    onChange,
    options,
    ...props
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
                {...props}
                className="w-50 appearance-none rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 pr-8 text-[10px] font-semibold text-neutral-600 outline-none transition hover:border-neutral-300 focus:border-neutral-400 sm:min-w-[150px]"
            >
                {options.map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
        </div>
    )
}
