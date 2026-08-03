import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * The standing head for interior pages: violet band, generous rag, and room
 * for one supporting sentence. Deliberately not a hero — heroes belong to the
 * home page and to the visit.
 */
export function PageHeader({
  title,
  lead,
  children,
  className,
}: {
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn('relative overflow-hidden bg-brand-darkest text-white', className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-24 h-96 w-96 rounded-full bg-brand-lift/25 blur-3xl"
      />
      <div className="relative mx-auto max-w-[86rem] px-4 pt-32 pb-14 sm:px-6 lg:px-10 lg:pt-40 lg:pb-20">
        <h1 className="max-w-[18ch] text-4xl font-semibold">{title}</h1>
        {lead && (
          <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-white/75">
            {lead}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </header>
  )
}
