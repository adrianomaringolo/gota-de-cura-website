import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Container({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mx-auto w-full max-w-[86rem] px-4 sm:px-6 lg:px-10', className)}>
      {children}
    </div>
  )
}

export function SectionHead({
  title,
  lead,
  aside,
  tone = 'ink',
  className,
}: {
  title: ReactNode
  lead?: ReactNode
  aside?: ReactNode
  tone?: 'ink' | 'light'
  className?: string
}) {
  const light = tone === 'light'

  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="max-w-[34ch]">
        <h2
          className={cn(
            'rule-mark text-3xl font-semibold',
            light ? 'text-white' : 'text-ink',
          )}
        >
          {title}
        </h2>
        {lead && (
          <p
            className={cn(
              'mt-4 max-w-[52ch] text-base leading-relaxed',
              light ? 'text-white/75' : 'text-ink-soft',
            )}
          >
            {lead}
          </p>
        )}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  )
}
