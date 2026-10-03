import type { ChangeEvent, SelectHTMLAttributes } from 'react'

interface SelectOption {
    label: string
    value: string
}

type SelectOptions = string[] | SelectOption[]

interface SelectProps
    extends Omit<
        SelectHTMLAttributes<HTMLSelectElement>,
        'value' | 'onChange'
    > {
    label?: string
    value: string
    onChange: (event: ChangeEvent<HTMLSelectElement>) => void
    options: SelectOptions
    placeholder?: string
    error?: string
}

export default function Select({
    label,
    value,
    onChange,
    options,
    placeholder,
    error,
    id,
    ...props
}: SelectProps) {
    return (
        <div className="space-y-2">
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-neutral-800"
                >
                    {label}
                </label>
            )}

            <select
                {...props}
                id={id}
                value={value}
                onChange={onChange}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${error ? 'border-red-400' : 'border-neutral-200'
                    }`}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}

                {options.map((option) => {
                    const item =
                        typeof option === 'string'
                            ? { label: option, value: option }
                            : option

                    return (
                        <option key={item.value} value={item.value}>
                            {item.label}
                        </option>
                    )
                })}
            </select>

            {error && (
                <p className="text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    )
}