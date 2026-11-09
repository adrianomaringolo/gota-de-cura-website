'use client'

import { MoreHorizontal } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

export type ActionMenuItem = {
  label: string
  onSelect: () => void
  disabled?: boolean
  danger?: boolean
}

/**
 * Row-actions dropdown. The menu is `fixed` and placed from the trigger's
 * rectangle because the admin tables scroll horizontally (`overflow-x-auto`),
 * which would clip an absolutely positioned menu.
 */
export function ActionMenu({
  items,
  label = 'Ações',
}: {
  items: ActionMenuItem[]
  label?: string
}) {
  const menuId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)

  const close = () => setPos(null)

  const toggle = () => {
    if (pos) return close()
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
  }

  useEffect(() => {
    if (!pos) return
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target))
        return
      close()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close()
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    menuRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus()
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [pos])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={pos !== null}
        aria-controls={pos ? menuId : undefined}
        onClick={toggle}
        className="inline-grid h-9 w-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-canvas-sunk hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-lift"
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>

      {pos && (
        <ul
          ref={menuRef}
          id={menuId}
          role="menu"
          style={{ top: pos.top, right: pos.right }}
          className="fixed z-50 min-w-44 rounded-xl border border-line bg-surface py-1 text-left shadow-lg"
        >
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  close()
                  item.onSelect()
                }}
                className={cn(
                  'block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-canvas-sunk disabled:pointer-events-none disabled:opacity-45',
                  item.danger ? 'text-danger' : 'text-ink',
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
