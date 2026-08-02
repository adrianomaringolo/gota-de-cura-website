import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { ORDER_STATUS } from '@/lib/constants'
import { Badge } from '@/components/ui/Feedback'

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
}: {
  label: string
  value: ReactNode
  tone?: 'brand'
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
    </div>
  )
}

const STATUS_META: Record<
  string,
  { label: string; tone: Parameters<typeof Badge>[0]['tone'] }
> = {
  [ORDER_STATUS.EM_ESPERA]: { label: 'Em espera', tone: 'warning' },
  [ORDER_STATUS.EM_ANDAMENTO]: { label: 'Em andamento', tone: 'brand' },
  [ORDER_STATUS.APROVADO]: { label: 'Aprovado', tone: 'lab' },
  [ORDER_STATUS.PAGO]: { label: 'Pago', tone: 'positive' },
  [ORDER_STATUS.SEPARADO]: { label: 'Separado/enviado', tone: 'lab' },
  [ORDER_STATUS.EM_FINALIZACAO]: { label: 'Em finalização', tone: 'brand' },
  [ORDER_STATUS.FINALIZADO]: { label: 'Finalizado', tone: 'positive' },
  [ORDER_STATUS.CANCELADO]: { label: 'Cancelado', tone: 'neutral' },
}

export function StatusTag({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? { label: 'Finalizado', tone: 'positive' as const }
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}
