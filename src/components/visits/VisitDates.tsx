'use client'

import { cn } from '@/lib/cn'
import { useVisits } from '@/lib/hooks'
import { formatVisitDateLong } from '@/lib/format'
import { isUpcoming } from '@/services/visits'

export function VisitDates({
  tone = 'ink',
  className,
}: {
  tone?: 'ink' | 'light'
  className?: string
}) {
  const { data, loading } = useVisits()
  const light = tone === 'light'
  const upcoming = data.filter((visit) => isUpcoming(visit))

  if (loading) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)} aria-hidden="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              'h-12 w-44 animate-pulse rounded-xl',
              light ? 'bg-white/10' : 'bg-canvas-sunk',
            )}
            style={{ animationDelay: `${index * 90}ms` }}
          />
        ))}
      </div>
    )
  }

  if (upcoming.length === 0) {
    return (
      <p
        className={cn('text-base', light ? 'text-white/70' : 'text-ink-soft', className)}
      >
        Não há datas abertas no momento. As próximas são anunciadas primeiro no nosso
        Instagram.
      </p>
    )
  }

  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {upcoming.map((visit) => (
        <li
          key={visit.id ?? visit.date}
          className={cn(
            'rounded-xl px-4 py-3 text-base font-medium',
            light ? 'bg-white/10 text-white' : 'bg-brand-tint text-brand',
          )}
        >
          {formatVisitDateLong(visit.date)}
        </li>
      ))}
    </ul>
  )
}
