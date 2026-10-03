import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: ButtonVariant
    loading?: boolean
    icon?: ReactNode
}

const variants: Record<ButtonVariant, string> = {
    primary:
        'bg-[#b91c1c] text-white shadow-[0_6px_18px_rgba(185,28,28,0.18)] hover:bg-[#991b1b]',
    secondary:
        'bg-neutral-950 text-white hover:bg-neutral-800',
    outline:
        'border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50',
    ghost:
        'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
    danger:
        'bg-red-50 text-red-600 hover:bg-red-100',
}

export default function Button({
    children,
    variant = 'primary',
    loading = false,
    icon,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={`
        inline-flex items-center justify-center gap-2
        rounded-xl px-4 py-2.5
        text-[11px] font-bold
        transition-all duration-200
        disabled:cursor-not-allowed disabled:opacity-50
        ${variants[variant]}
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                icon
            )}

            {children}
        </button>
    )
}