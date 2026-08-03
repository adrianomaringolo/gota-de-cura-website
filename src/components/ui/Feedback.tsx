import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-current',
        'border-r-transparent align-[-0.125em]',
        className,
      )}
    />
  )
}

export function LoadingRows({
  rows = 3,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-xl bg-canvas-sunk"
          style={{ animationDelay: `${index * 90}ms` }}
        />
      ))}
    </div>
  )
}

export function EmptyState({
  title,
  children,
  action,
  className,
}: {
  title: string
  children?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center',
        className,
      )}
    >
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {children && (
        <div className="mx-auto mt-2 max-w-[46ch] text-sm text-ink-soft">{children}</div>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}

const tones = {
  brand: 'bg-brand-tint text-brand',
  terra: 'bg-terra-tint text-terra',
  lab: 'bg-lab-tint text-lab',
  positive: 'bg-positive-tint text-positive',
  warning: 'bg-warning-tint text-warning',
  danger: 'bg-danger-tint text-danger',
  neutral: 'bg-canvas-sunk text-ink-soft',
} as const

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: keyof typeof tones
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
