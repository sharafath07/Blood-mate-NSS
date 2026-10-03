interface AvatarProps {
    name: string
    src?: string
    size?: 'sm' | 'md' | 'lg'
}

const sizes = {
    sm: 'h-7 w-7 text-[9px]',
    md: 'h-9 w-9 text-[10px]',
    lg: 'h-12 w-12 text-sm',
}

function getInitials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
}

export default function Avatar({
    name,
    src,
    size = 'md',
}: AvatarProps) {
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`${sizes[size]} rounded-full object-cover`}
            />
        )
    }

    return (
        <div
            className={`
        ${sizes[size]}
        flex shrink-0 items-center justify-center
        rounded-full
        bg-neutral-900
        font-bold
        text-white
      `}
        >
            {getInitials(name)}
        </div>
    )
}