'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type DialogProps = {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** Some flows (a successful order) must be dismissed deliberately. */
  dismissible?: boolean
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
}

/**
 * Native <dialog>: real focus trapping, real inertness, top-layer rendering —
 * so it can never be clipped by an ancestor's overflow.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissible = true,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    const handleCancel = (event: Event) => {
      event.preventDefault()
      if (dismissible) onClose()
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [dismissible, onClose])

  return (
    <dialog
      ref={ref}
      // The <dialog> itself is only the layer: it fills the viewport and stays
      // transparent. Centring is done by the flex wrapper below rather than by
      // the UA's `margin: auto`, which depends on a margin Preflight resets and
      // on how each engine measures the viewport when a scrollbar is present.
      className={cn(
        'h-full max-h-full w-full max-w-full overflow-y-auto bg-transparent p-0 text-ink',
        'backdrop:bg-veil/55 backdrop:animate-[fade-in_0.2s_ease-out]',
      )}
    >
      <div
        onClick={(event) => {
          if (dismissible && event.target === event.currentTarget) onClose()
        }}
        className="flex min-h-full items-center justify-center p-4"
      >
        <div
          data-dialog-panel=""
          className={cn(
            'flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl border border-line',
            'bg-surface shadow-float animate-[sheet-in_0.28s_var(--ease-out-quart)]',
            sizes[size],
          )}
        >
          {(title || dismissible) && (
            <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div>
                {title && (
                  <h2 className="font-display text-xl leading-tight font-semibold text-ink">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-1 text-sm text-ink-soft">{description}</p>
                )}
              </div>
              {dismissible && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="-mt-1 -mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-canvas-sunk hover:text-ink"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              )}
            </header>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

          {footer && (
            <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-canvas px-6 py-4">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </dialog>
  )
}
