'use client'

import Image from 'next/image'
import { cn } from '@/lib/cn'
import { ArrowLeftIcon, HomeIcon } from './icons'

type Crumb = { label: string; onClick?: () => void }

/**
 * The one fixed element of the kiosk: the droplet mark, a way back, and a way
 * home that never leaves the screen once the visitor has gone in.
 */
export function VitrineChrome({
  crumbs,
  onBack,
  onHome,
}: {
  crumbs: Crumb[]
  onBack?: () => void
  onHome?: () => void
}) {
  const atHome = !onBack && !onHome

  return (
    <header className="relative z-10 flex items-center gap-3 bg-brand px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 text-white shadow-raised sm:gap-4 sm:px-6">
      <Image
        src="/images/logos/logo-icon.png"
        alt="Gota de Cura"
        width={415}
        height={601}
        // Renderizado a ~30px de largura (h-11). Sem `sizes` o Next transformaria
        // a arte a 640px+ sem ganho visual.
        sizes="128px"
        priority
        className="h-10 w-auto shrink-0 brightness-0 invert sm:h-11"
      />

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-13 shrink-0 items-center gap-2 rounded-full border border-white/25 bg-white/10 pr-5 pl-4 text-base font-medium transition-[transform,background-color] duration-150 hover:bg-white/20 active:scale-[0.97]"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Voltar
        </button>
      )}

      <nav
        aria-label="Trilha"
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-white/70',
          atHome ? 'text-base sm:text-lg' : 'text-sm sm:text-base',
        )}
      >
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1
          return (
            <span
              key={index}
              className={cn(
                'flex min-w-0 items-center gap-2',
                last ? 'flex-1' : 'shrink-0',
              )}
            >
              {index > 0 && (
                <span aria-hidden="true" className="shrink-0 text-white/35">
                  /
                </span>
              )}
              {crumb.onClick && !last ? (
                <button
                  type="button"
                  onClick={crumb.onClick}
                  className="max-w-[14ch] shrink-0 truncate rounded-full transition-colors hover:text-white"
                >
                  {crumb.label}
                </button>
              ) : (
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate',
                    last && !atHome && 'font-medium text-white',
                  )}
                >
                  {crumb.label}
                </span>
              )}
            </span>
          )
        })}
      </nav>

      {onHome && (
        <button
          type="button"
          onClick={onHome}
          aria-label="Voltar ao início"
          className="inline-flex h-13 shrink-0 items-center gap-2 rounded-full bg-white pr-5 pl-4 text-base font-semibold text-brand-darkest transition-[transform,background-color] duration-150 hover:bg-brand-soft active:scale-[0.97]"
        >
          <HomeIcon className="h-5 w-5" />
          Início
        </button>
      )}
    </header>
  )
}
