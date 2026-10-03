import type { ReactNode } from 'react'

type BadgeVariant =
    | 'success'
    | 'warning'
    | 'danger'
    | 'neutral'
    | 'info'

interface BadgeProps {
    children: ReactNode
    variant?: BadgeVariant
    dot?: boolean
}

const variants: Record<BadgeVariant, string> = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    warning: 'bg-orange-50 text-orange-700 ring-orange-100',
    danger: 'bg-red-50 text-red-700 ring-red-100',
    neutral: 'bg-neutral-50 text-neutral-600 ring-neutral-100',
    info: 'bg-blue-50 text-blue-700 ring-blue-100',
}

const dots: Record<BadgeVariant, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-orange-500',
    danger: 'bg-red-500',
    neutral: 'bg-neutral-400',
    info: 'bg-blue-500',
}

export default function Badge({
    children,
    variant = 'neutral',
    dot = false,
}: BadgeProps) {
    return (
        <span
            className={`
        inline-flex items-center gap-1.5
        rounded-full px-2.5 py-1
        text-[9px] font-bold
        ring-1
        ${variants[variant]}
      `}
        >
            {dot && (
                <span
                    className={`h-1.5 w-1.5 rounded-full ${dots[variant]}`}
                />
            )}

            {children}
        </span>
    )
}