import { useId, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
}

export default function Input({
    label,
    error,
    id: providedId,
    className = '',
    ...props
}: InputProps) {
    const autoId = useId()
    const id = providedId ?? autoId
    const errorId = id + "-error"
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="mb-1.5 block text-[10px] font-bold text-neutral-600">
                    {label}
                </label>
            )}

            <input
                {...props}
                id={id}
                aria-invalid={error ? true : props['aria-invalid']}
                aria-describedby={[props['aria-describedby'], error && errorId].filter(Boolean).join(' ') || undefined}
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
            />

            {error && (
                <p id={errorId} className="mt-1 text-[9px] font-medium text-red-500">
                    {error}
                </p>
            )}
        </div>
    )
}
