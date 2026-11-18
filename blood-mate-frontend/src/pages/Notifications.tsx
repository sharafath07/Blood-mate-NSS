import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import axios from 'axios'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import type { ResponseStatus } from '../data/bloodRequests'
import type { NotificationRecord } from '../data/notifications'
import { api } from '../services/api'
import { whatsAppLink } from '../lib/contactLinks'
import CallLink from '../components/ui/CallLink'

interface Recipient {
    id: string
    name: string
}

interface ComposerState {
    requestId?: string
    bloodGroup?: string
    hospital?: string
    donors?: Recipient[]
}

const defaultMessage =
    'Hello [Name], a blood donation for [Blood Group] is needed at [Hospital]. Please let the Blood Mate coordinator know if you are available. Thank you.'

const responseOptions: { label: string; value: ResponseStatus }[] = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Declined', value: 'DECLINED' },
    { label: 'No response', value: 'NO_RESPONSE' },
]

function errorMessage(error: unknown, fallback: string) {
    return axios.isAxiosError(error) && typeof error.response?.data?.message === 'string'
        ? error.response.data.message
        : fallback
}

export default function Notifications() {
    const [params] = useSearchParams()
    const requestId = params.get('request')
    const draftId = params.get('draft')
    return <ContactDraft key={`${requestId}:${draftId}`} requestId={requestId} draftId={draftId} />
}

function ContactDraft({ requestId, draftId }: { requestId: string | null; draftId: string | null }) {
    const [context, setContext] = useState<ComposerState | null>(null)
    const [draftError, setDraftError] = useState('')
    useEffect(() => {
        if (!requestId || !draftId) return
        const currentRequestId = requestId
        const currentDraftId = draftId
        let active = true
        async function load() {
            try {
                const saved: unknown = JSON.parse(sessionStorage.getItem(`contact-draft:${currentDraftId}`) ?? '[]')
                if (!Array.isArray(saved) || saved.length === 0) throw new Error('Draft unavailable')
                const [request, donors] = await Promise.all([
                    api.requests.getById(currentRequestId),
                    api.donors.getMatches(currentRequestId),
                ])
                const recipients = donors.filter((donor) => saved.includes(donor.id) && donor.phone)
                if (!recipients.length) throw new Error('No eligible recipients')
                if (active) {
                    setContext({
                        requestId: request.id,
                        bloodGroup: request.bloodGroup.replace('_POSITIVE', '+').replace('_NEGATIVE', '-'),
                        hospital: request.hospital ?? undefined,
                        donors: recipients.map(({ id, name }) => ({ id, name })),
                    })
                }
            } catch {
                if (active) setDraftError('This contact draft is no longer available. Choose donors from the request again.')
            }
        }
        void load()
        return () => { active = false }
    }, [requestId, draftId])
    if (requestId && draftId && !context && !draftError) return <p role="status" className="p-5">Loading contact draft…</p>
    return <ContactPage context={context} draftId={draftId} draftError={draftError} />
}

function ContactPage({ context, draftId, draftError }: { context: ComposerState | null; draftId: string | null; draftError: string }) {
    const navigate = useNavigate()
    const [message, setMessage] = useState(defaultMessage)
    const [recipients, setRecipients] = useState(context?.donors ?? [])
    const [prepared, setPrepared] = useState<{ donorId: string; message: string; url: string; phone: string } | null>(null)
    const [opened, setOpened] = useState(false)
    const [busy, setBusy] = useState(false)
    const [history, setHistory] = useState<NotificationRecord[] | null>(null)
    const [historyError, setHistoryError] = useState('')
    const [composerError, setComposerError] = useState('')
    const [notice, setNotice] = useState('')
    const [search, setSearch] = useState('')
    const [hasMore, setHasMore] = useState(false)

    useEffect(() => {
        let active = true
        api.notifications.getAll().then((items) => {
            if (!active) return
            setHistory(items)
            setHasMore(items.length === 50)
        }, () => {
            if (active) setHistoryError('Unable to load contact history.')
        })
        return () => { active = false }
    }, [])

    async function loadHistory(offset = 0) {
        try {
            const items = await api.notifications.getAll(offset)
            setHistory((current) => offset ? [...(current ?? []), ...items] : items)
            setHasMore(items.length === 50)
            setHistoryError('')
        } catch {
            setHistoryError('Unable to refresh contact history.')
        }
    }

    async function prepare(recipient: Recipient) {
        const requestId = context?.requestId
        if (!requestId || !message.trim()) return
        setBusy(true)
        setComposerError('')
        setPrepared(null)
        setOpened(false)
        try {
            const phone = await api.notifications.getContactPhone(requestId, recipient.id)
            const text = message.trim()
                .replaceAll('[Name]', recipient.name)
                .replaceAll('[Blood Group]', context?.bloodGroup ?? 'the requested blood group')
                .replaceAll('[Hospital]', context?.hospital || 'the hospital')
            const url = whatsAppLink(phone, text)
            if (!url) {
                setComposerError('This donor does not have a valid WhatsApp number.')
                return
            }
            setPrepared({ donorId: recipient.id, message: text, url, phone })
        } catch (error) {
            setComposerError(errorMessage(error, 'Unable to prepare this contact.'))
        } finally {
            setBusy(false)
        }
    }

    async function confirmContact() {
        const requestId = context?.requestId
        if (!requestId || !prepared || !opened) return
        setBusy(true)
        setComposerError('')
        try {
            const { donorId, message: sentMessage } = prepared
            await api.notifications.recordContact({ requestId, donorId, message: sentMessage })
            setPrepared(null)
            setOpened(false)
            const remaining = recipients.filter(({ id }) => id !== donorId)
            setRecipients(remaining)
            if (draftId) {
                if (remaining.length) sessionStorage.setItem(`contact-draft:${draftId}`, JSON.stringify(remaining.map(({ id }) => id)))
                else sessionStorage.removeItem(`contact-draft:${draftId}`)
            }
            setNotice('Contact recorded.')
            await loadHistory()
        } catch (error) {
            setComposerError(errorMessage(error, 'Unable to record this contact.'))
        } finally {
            setBusy(false)
        }
    }

    const query = search.toLowerCase().trim()
    const results = (history ?? []).filter((entry) =>
        [entry.donorName, entry.requestId, entry.phone, entry.hospital].some((value) =>
            value.toLowerCase().includes(query),
        ),
    )

    return (
        <div className="mx-auto max-w-[1200px] space-y-5 pb-10">
            <header>
                <h1 className="font-['Manrope'] text-3xl font-extrabold">Donor contacts</h1>
                <p className="mt-1 text-sm text-neutral-500">Open a draft in WhatsApp, send it there, then record the contact here.</p>
            </header>
            {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
            {draftError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{draftError}</p>}
            {recipients.length > 0 ? (
                <Card className="space-y-4 p-5">
                    <h2 className="text-lg font-bold">Prepare WhatsApp messages</h2>
                    <label className="block text-sm font-semibold" htmlFor="message">Message</label>
                    <textarea id="message" rows={4} maxLength={500} value={message} onChange={(event) => {
                        setMessage(event.target.value)
                        setPrepared(null)
                        setOpened(false)
                    }} className="w-full rounded-xl border border-neutral-200 p-3 text-sm" />
                    <ul className="divide-y divide-neutral-100">
                        {recipients.map((recipient) => (
                            <li key={recipient.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                <span className="text-sm font-semibold">{recipient.name}</span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button variant="outline" disabled={busy || !message.trim()} onClick={() => void prepare(recipient)}>
                                        Prepare
                                    </Button>
                                    {prepared?.donorId === recipient.id && (
                                        <>
                                            <CallLink phone={prepared.phone} label="Call donor" />
                                            <a className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-bold text-white"
                                                href={prepared.url} target="_blank" rel="noopener noreferrer"
                                                onClick={() => setOpened(true)}>
                                                Open WhatsApp
                                            </a>
                                            <Button disabled={!opened || busy} onClick={() => void confirmContact()}>Mark as sent</Button>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                    {composerError && <p role="alert" className="text-sm text-red-700">{composerError}</p>}
                </Card>
            ) : (
                <Button icon={<MessageCircle size={16} />} onClick={() => navigate('/requests')}>Choose a blood request</Button>
            )}
            <Card className="space-y-4 p-5">
                <h2 className="text-lg font-bold">Contact and response history</h2>
                <Input aria-label="Search contact history" placeholder="Search contacts or requests" value={search}
                    onChange={(event) => setSearch(event.target.value)} />
                {historyError && <p role="alert" className="text-sm text-red-700">{historyError} <button className="underline" onClick={() => void loadHistory()}>Retry</button></p>}
                {!history && !historyError && <p role="status" className="text-sm text-neutral-500">Loading history…</p>}
                {history && results.length === 0 && <p className="text-sm text-neutral-500">No matching contact records.</p>}
                <ul className="divide-y divide-neutral-100">
                    {results.map((entry) => (
                        <ResponseRow key={entry.id + ':' + entry.responseStatus + ':' + entry.donatedUnits}
                            entry={entry} onSaved={async () => { setNotice('Response saved.'); await loadHistory() }} />
                    ))}
                </ul>
                {hasMore && <Button variant="outline" disabled={busy} onClick={async () => {
                    setBusy(true)
                    try { await loadHistory(history?.length) } finally { setBusy(false) }
                }}>Load more history</Button>}
            </Card>
        </div>
    )
}

function ResponseRow({ entry, onSaved }: { entry: NotificationRecord; onSaved: () => Promise<void> }) {
    const [status, setStatus] = useState(entry.responseStatus)
    const [units, setUnits] = useState(entry.donatedUnits)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    async function save() {
        setSaving(true)
        setError('')
        try {
            await api.notifications.recordResponse({
                requestId: entry.requestId,
                donorId: entry.donorId,
                status,
                donatedUnits: status === 'ACCEPTED' ? units : 0,
            })
            await onSaved()
        } catch (failure) {
            setError(errorMessage(failure, 'Unable to save response.'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <li className="py-4">
            <p className="text-sm font-semibold">{entry.donorName} · {entry.phone}</p>
            <p className="mt-1 text-xs text-neutral-500">{entry.hospital || 'Blood request'} · {new Date(entry.sentAt).toLocaleString()}</p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
                <Select label="Response" id={`response-${entry.id}`} value={status} options={responseOptions}
                    onChange={(event) => setStatus(event.target.value as ResponseStatus)} />
                {status === 'ACCEPTED' && (
                    <Input label="Completed units" id={`units-${entry.id}`} type="number" min={0} max={100} value={units}
                        onChange={(event) => setUnits(Number(event.target.value))} />
                )}
                <Button variant="outline" loading={saving} disabled={!Number.isInteger(units) || units < 0 || units > 100}
                    onClick={() => void save()}>Save response</Button>
            </div>
            {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
        </li>
    )
}
