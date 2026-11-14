'use client'

import { ChevronDown, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'buildgrid-ui'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type ActionMenuItem = {
  label: string
  onSelect: () => void
  disabled?: boolean
  danger?: boolean
  icon?: ReactNode
}

/**
 * Row-actions dropdown. The content renders in a portal, so the admin tables'
 * horizontal scroll (`overflow-x-auto`) cannot clip it; keyboard navigation,
 * focus return and outside-click dismissal come from the library.
 */
export function ActionMenu({
  items,
  label = 'Ações',
  variant = 'icon',
}: {
  items: ActionMenuItem[]
  label?: string
  /** `button` shows the label with a chevron; `icon` is the compact "…" for table rows. */
  variant?: 'icon' | 'button'
}) {
  return (
    <DropdownMenu>
      {variant === 'button' ? (
        <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-canvas-sunk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-lift data-[state=open]:bg-canvas-sunk">
          {label}
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger
          aria-label={label}
          className="inline-grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-canvas-sunk hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-lift data-[state=open]:bg-canvas-sunk data-[state=open]:text-ink"
        >
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        </DropdownMenuTrigger>
      )}

      <DropdownMenuContent
        align="end"
        sideOffset={4}
        className="z-50 min-w-44 rounded-xl border border-line bg-surface p-1 text-ink shadow-lg"
      >
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            disabled={item.disabled}
            onSelect={item.onSelect}
            className={cn(
              'cursor-pointer rounded-lg px-3 py-2 text-sm focus:bg-canvas-sunk',
              item.danger
                ? 'text-danger focus:bg-danger-tint focus:text-danger'
                : 'text-ink focus:text-ink',
            )}
          >
            <span className="flex items-center gap-2.5">
              {item.icon}
              {item.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
