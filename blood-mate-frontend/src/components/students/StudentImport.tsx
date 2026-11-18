import { useDialog } from '../../lib/useDialog'
import { useState } from 'react'
import axios from 'axios'
import Button from '../ui/Button'
import { api } from '../../services/api'

export default function StudentImport({ onClose, onImported }: {
    onClose: () => void
    onImported: () => void
}) {
    const [file, setFile] = useState<File | null>(null)
    const [busy, setBusy] = useState(false)
    const [result, setResult] = useState<Awaited<ReturnType<typeof api.imports.upload>> | null>(null)
    const [error, setError] = useState('')
    const isAdmin = api.auth.getUser()?.role === 'ADMIN'

    async function upload(mode: 'preview' | 'validate' | 'import') {
        if (!file) return
        setBusy(true)
        setError('')
        try {
            const data = await api.imports.upload(file, mode)
            setResult(data)
            if (data.imported) onImported()
        } catch (failure) {
            setError(axios.isAxiosError(failure) && typeof failure.response?.data?.message === 'string'
                ? failure.response.data.message : 'Unable to process this workbook.')
        } finally {
            setBusy(false)
        }
    }

    const dialogRef = useDialog<HTMLElement>(onClose, !busy)

    return (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4">
            <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="import-title"
                className="max-h-[85vh] w-full max-w-xl space-y-4 overflow-auto rounded-2xl bg-white p-5">
                <h2 id="import-title" className="text-lg font-bold">Import students from Excel</h2>
                <p className="text-sm text-neutral-600">Use the first worksheet. Include Full Name, Blood Group, Contact Number or WhatsApp Number, and Semester if available.</p>
                <input aria-label="Excel workbook" type="file" accept=".xlsx,.xls" disabled={busy}
                    onChange={(event) => { setFile(event.target.files?.[0] ?? null); setResult(null); setError('') }} />
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" disabled={!file || busy} onClick={() => void upload('preview')}>Preview</Button>
                    <Button variant="outline" disabled={!file || busy} onClick={() => void upload('validate')}>Validate</Button>
                    {isAdmin && <Button disabled={!result?.readyToImport || busy} onClick={() => void upload('import')}>Import valid rows</Button>}
                    <Button variant="ghost" disabled={busy} onClick={onClose}>Close</Button>
                </div>
                {busy && <p role="status" className="text-sm text-neutral-500">Processing workbook…</p>}
                {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                {result?.rowCount !== undefined && <p className="text-sm">{result.rowCount} rows · {result.columns?.join(', ')}</p>}
                {result?.readyToImport !== undefined && <p className="text-sm">{result.readyToImport} of {result.totalRows} rows ready to import</p>}
                {result?.imported !== undefined && <p className="text-sm">{result.imported} imported · {result.skipped} skipped</p>}
                <ul className="space-y-1 text-sm text-neutral-700">
                    {result?.rows?.filter((row) => row.errors.length > 0).map((row) => <li key={row.row}>Row {row.row} · {row.errors.join(', ')}</li>)}
                    {result?.errors?.map((item) => <li key={item.row}>Row {item.row} · {item.message}</li>)}
                </ul>
            </section>
        </div>
    )
}
