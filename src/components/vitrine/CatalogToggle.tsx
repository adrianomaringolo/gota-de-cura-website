'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { GridIcon, ListIcon } from './icons'

/** Switches the catalogue between the image grid and the grouped price list. */
export function CatalogToggle({
  active,
  onGrid,
  onList,
}: {
  active: 'grid' | 'list'
  onGrid: () => void
  onList: () => void
}) {
  return (
    <div className="inline-flex rounded-full border border-line bg-surface p-1 shadow-lift">
      <Segment
        icon={<GridIcon className="h-5 w-5" />}
        label="Linhas"
        active={active === 'grid'}
        onClick={onGrid}
      />
      <Segment
        icon={<ListIcon className="h-5 w-5" />}
        label="Lista de preços"
        active={active === 'list'}
        onClick={onList}
      />
    </div>
  )
}

function Segment({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-12 items-center gap-2 rounded-full px-5 text-base font-medium',
        'transition-[background-color,color] duration-150',
        active ? 'bg-brand text-white shadow-lift' : 'text-ink-soft hover:text-ink',
      )}
    >
      {icon}
      {label}
    </button>
  )
}
