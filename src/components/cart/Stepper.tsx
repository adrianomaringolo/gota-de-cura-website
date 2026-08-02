import { cn } from '@/lib/cn'

const STEPS = ['Meu pedido', 'Meus dados', 'Confirmação'] as const

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
      {STEPS.map((label, index) => {
        const done = index < current
        const active = index === current

        return (
          <li key={label} className="flex items-center gap-3">
            {index > 0 && (
              <span
                aria-hidden="true"
                className={cn('h-px w-6 sm:w-10', done ? 'bg-brand' : 'bg-line-strong')}
              />
            )}
            <span
              className={cn(
                'flex items-center gap-2 font-medium',
                active ? 'text-brand' : done ? 'text-ink-soft' : 'text-ink-muted',
              )}
              aria-current={active ? 'step' : undefined}
            >
              <span
                className={cn(
                  'grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold',
                  active
                    ? 'bg-brand text-white'
                    : done
                      ? 'bg-brand-soft text-brand'
                      : 'bg-canvas-sunk text-ink-muted',
                )}
              >
                {done ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
