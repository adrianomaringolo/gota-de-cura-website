import {
  CheckCheck,
  CircleCheck,
  CircleX,
  Clock,
  Hourglass,
  MessageCircle,
  Package,
  Truck,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ORDER_STATUS } from '@/lib/constants'

export function AdminHeading({
  title,
  description,
  actions,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5 print-none">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-[70ch] text-sm text-ink-soft">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-xl border border-line bg-surface', className)}>
      {children}
    </div>
  )
}

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full min-w-[42rem] border-collapse text-sm">{children}</table>
    </div>
  )
}

export function Th({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <th
      scope="col"
      className={cn(
        'border-b border-line bg-canvas-sunk px-4 py-3 text-left text-xs font-semibold tracking-wide text-ink-soft uppercase',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  className,
}: {
  children?: ReactNode
  className?: string
}) {
  return (
    <td className={cn('border-b border-line px-4 py-3 align-top text-ink', className)}>
      {children}
    </td>
  )
}

export function StatValue({
  label,
  value,
  tone,
  hint,
}: {
  label: string
  value: ReactNode
  tone?: 'brand'
  /** Small print under the value: the sample behind an average, a caveat. */
  hint?: ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-xl border px-5 py-4',
        tone === 'brand' ? 'border-brand bg-brand text-white' : 'border-line bg-surface',
      )}
    >
      <p
        className={cn(
          'text-xs font-medium',
          tone === 'brand' ? 'text-white/75' : 'text-ink-muted',
        )}
      >
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value}</p>
      {hint && (
        <p
          className={cn(
            'mt-1 text-xs',
            tone === 'brand' ? 'text-white/75' : 'text-ink-muted',
          )}
        >
          {hint}
        </p>
      )}
    </div>
  )
}

/**
 * One colour and one icon per status, so a tag reads at a glance: each hue
 * is used by a single status. Classes are spelled out whole for Tailwind.
 */
const STATUS_META: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  [ORDER_STATUS.EM_ESPERA]: {
    label: 'Em espera',
    icon: Clock,
    color: 'bg-[oklch(0.95_0.07_90)] text-[oklch(0.45_0.1_80)]',
  },
  [ORDER_STATUS.EM_ANDAMENTO]: {
    label: 'Em andamento',
    icon: MessageCircle,
    color: 'bg-[oklch(0.94_0.04_255)] text-[oklch(0.45_0.15_257)]',
  },
  [ORDER_STATUS.APROVADO]: {
    label: 'Aprovado',
    icon: CircleCheck,
    color: 'bg-[oklch(0.94_0.045_200)] text-[oklch(0.45_0.09_205)]',
  },
  [ORDER_STATUS.PAGO]: {
    label: 'Pago',
    icon: Wallet,
    color: 'bg-[oklch(0.94_0.06_160)] text-[oklch(0.42_0.1_160)]',
  },
  [ORDER_STATUS.PREPARADO]: {
    label: 'Preparado',
    icon: Package,
    color: 'bg-[oklch(0.94_0.05_50)] text-[oklch(0.48_0.14_45)]',
  },
  [ORDER_STATUS.SEPARADO]: {
    label: 'Separado/enviado',
    icon: Truck,
    color: 'bg-[oklch(0.94_0.04_300)] text-[oklch(0.44_0.15_298)]',
  },
  [ORDER_STATUS.EM_FINALIZACAO]: {
    label: 'Em finalização',
    icon: Hourglass,
    color: 'bg-[oklch(0.95_0.04_350)] text-[oklch(0.47_0.16_352)]',
  },
  [ORDER_STATUS.FINALIZADO]: {
    label: 'Finalizado',
    icon: CheckCheck,
    color: 'bg-[oklch(0.94_0.07_125)] text-[oklch(0.42_0.1_130)]',
  },
  [ORDER_STATUS.CANCELADO]: {
    label: 'Cancelado',
    icon: CircleX,
    color: 'bg-[oklch(0.94_0.04_25)] text-[oklch(0.48_0.17_25)]',
  },
}

/** `label` overrides the Portuguese one — the public order page passes a translation. */
export function StatusTag({
  status,
  label,
  size = 'md',
}: {
  status: string
  label?: string
  size?: 'md' | 'lg'
}) {
  const meta = STATUS_META[status] ?? STATUS_META[ORDER_STATUS.FINALIZADO]
  const Icon = meta.icon
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold whitespace-nowrap',
        size === 'lg' ? 'gap-2 px-4 py-1.5 text-base' : 'gap-1.5 px-3 py-1 text-sm',
        meta.color,
      )}
    >
      <Icon
        className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}
        strokeWidth={2.25}
        aria-hidden="true"
      />
      {label ?? meta.label}
    </span>
  )
}
