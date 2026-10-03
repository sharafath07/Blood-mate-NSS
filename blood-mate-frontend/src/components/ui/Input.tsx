import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export default function Input({
    label,
    error,
    className = '',
    ...props
}: InputProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="mb-1.5 block text-[10px] font-bold text-neutral-600">
                    {label}
                </label>
            )}

            <input
                className={`
          w-full rounded-xl
          border
          bg-white
          px-3.5 py-2.5
          text-[12px]
          text-neutral-900
          outline-none
          transition
          placeholder:text-neutral-300
          ${error
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-neutral-200 focus:border-neutral-400'
                    }
          ${className}
        `}
                {...props}
            />

            {error && (
                <p className="mt-1 text-[9px] font-medium text-red-500">
                    {error}
                </p>
            )}
        </div>
    )
}