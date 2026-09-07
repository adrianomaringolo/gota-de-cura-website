'use client'

import Image from 'next/image'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { countLabel, shelfLabel, type Shelf } from './data'
import { ArrowRightIcon } from './icons'

function LinhaTile({ shelf, onOpen }: { shelf: Shelf; onOpen: () => void }) {
  const featured = Boolean(shelf.type.featured)

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group relative isolate flex overflow-hidden rounded-2xl bg-veil text-left',
        'transition-transform duration-200 ease-[var(--ease-out-quart)] active:scale-[0.98]',
        featured
          ? 'aspect-[16/10] sm:col-span-2 sm:aspect-[16/9]'
          : 'aspect-[4/5] sm:aspect-square',
      )}
    >
      <Image
        src={`/images/categories/${shelf.type.image}`}
        alt=""
        fill
        sizes={
          featured ? '(max-width: 640px) 100vw, 520px' : '(max-width: 640px) 50vw, 260px'
        }
        className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-quart)] group-hover:scale-[1.03] group-active:scale-[1.05]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-veil/92 via-veil/35 to-transparent"
      />

      <div className="relative mt-auto flex w-full items-end justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <h3
            className={cn(
              'font-display font-semibold text-white text-shadow-photo',
              featured ? 'text-2xl sm:text-3xl' : 'text-lg leading-tight sm:text-xl',
            )}
          >
            {shelfLabel(shelf.type)}
          </h3>
          <p className="mt-1 text-sm text-white/75">{countLabel(shelf.items.length)}</p>
        </div>
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/40 text-white transition-colors group-active:bg-white group-active:text-veil"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </span>
      </div>
    </button>
  )
}

export function LinhaGrid({
  shelves,
  toggle,
  onOpen,
}: {
  shelves: Shelf[]
  toggle: ReactNode
  onOpen: (shelf: Shelf) => void
}) {
  return (
    <div className="mx-auto max-w-[92rem] px-5 pt-7 pb-8 sm:px-8 sm:pt-10 sm:pb-11">
      <div className="mb-6">{toggle}</div>

      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
        Nossas linhas
      </h1>
      <p className="mt-3 max-w-[44ch] text-base leading-relaxed text-ink-soft sm:text-lg">
        Toque para conhecer cada planta, ver os preços e o que temos disponível hoje.
      </p>

      <div className="mt-8 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,14rem),1fr))] sm:mt-10 sm:gap-4">
        {shelves.map((shelf) => (
          <LinhaTile key={shelf.type.id} shelf={shelf} onOpen={() => onOpen(shelf)} />
        ))}
      </div>
    </div>
  )
}
