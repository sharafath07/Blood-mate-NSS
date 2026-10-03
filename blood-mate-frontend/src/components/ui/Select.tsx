import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    options: string[]
    placeholder?: string
}

export default function Select({
    label,
    error,
    options,
    placeholder,
    className = '',
    ...props
}: SelectProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="mb-1.5 block text-[10px] font-bold text-neutral-600">
                    {label}
                </label>
            )}

            <div className="relative">
                <select
                    className={`
            w-full appearance-none rounded-xl border
            bg-white px-3.5 py-2.5 pr-9
            text-[12px] text-neutral-800
            outline-none transition
            ${error
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-neutral-200 focus:border-neutral-400'
                        }
            ${className}
          `}
                    {...props}
                >
                    {placeholder && (
                        <option value="">{placeholder}</option>
                    )}

                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            </div>

            {error && (
                <p className="mt-1 text-[9px] font-medium text-red-500">
                    {error}
                </p>
            )}
        </div>
    )
}