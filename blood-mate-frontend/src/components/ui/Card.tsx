import type { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
}

export default function Card({
    children,
    className = '',
}: CardProps) {
    return (
        <div
            className={`
        rounded-2xl
        border border-neutral-200/80
        bg-white
        shadow-[0_1px_2px_rgba(0,0,0,0.02)]
        ${className}
      `}
        >
            {children}
        </div>
    )
}