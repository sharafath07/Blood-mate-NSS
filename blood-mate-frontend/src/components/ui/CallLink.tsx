import { Phone } from 'lucide-react'
import { callLink } from '../../lib/contactLinks'
import Button from './Button'

export default function CallLink({ phone, label, className = '' }: {
    phone: string | null
    label: string
    className?: string
}) {
    const href = callLink(phone)
    const icon = <Phone className="h-3.5 w-3.5" />

    if (!href) return <Button disabled variant="outline" className={className} icon={icon}>{label}</Button>

    return (
        <a href={href} className={`inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-[11px] font-bold text-neutral-700 hover:bg-neutral-50 ${className}`}>
            {icon}
            {label}
        </a>
    )
}
