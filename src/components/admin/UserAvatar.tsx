import { colorFromString, initialsOf } from '@/lib/avatar'
import { cn } from '@/lib/cn'

export function UserAvatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <span
      title={name}
      aria-hidden="true"
      style={{ backgroundColor: colorFromString(name) }}
      className={cn(
        'inline-grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white select-none',
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  )
}
