'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import type { ProductItem } from '@/lib/types'
import { foldText, shelfLabel, type Shelf } from './data'
import { SearchIcon, XIcon } from './icons'

const byName = (a: ProductItem, b: ProductItem) => a.name.localeCompare(b.name, 'pt')

function Row({ item, onOpen }: { item: ProductItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-end gap-2 py-3.5 text-left transition-colors duration-150 active:bg-brand-tint"
    >
      <span
        className={cn(
          'font-display text-lg leading-snug font-medium',
          item.available ? 'text-ink' : 'text-ink-muted',
        )}
      >
        {item.name}
      </span>
      <span
        aria-hidden="true"
        className="mb-[7px] flex-1 border-b border-dotted border-line-strong"
      />
      <span
        className={cn(
          'shrink-0 font-display text-lg leading-snug font-semibold tabular-nums',
          item.available ? 'text-ink' : 'text-ink-muted',
        )}
      >
        {item.available ? formatCurrency(item.price) : 'Indisponível'}
      </span>
    </button>
  )
}

export function ListaView({
  shelves,
  toggle,
  onOpen,
}: {
  shelves: Shelf[]
  toggle: ReactNode
  onOpen: (shelf: Shelf, item: ProductItem) => void
}) {
  const [query, setQuery] = useState('')
  const q = foldText(query)

  const results = useMemo(() => {
    return shelves
      .map((shelf) => {
        if (!q) return { shelf, items: shelf.items }
        // A hit on the category name keeps the whole shelf; otherwise filter items.
        const categoryHit = foldText(shelfLabel(shelf.type)).includes(q)
        return {
          shelf,
          items: categoryHit
            ? shelf.items
            : shelf.items.filter((item) => foldText(item.name).includes(q)),
        }
      })
      .filter((entry) => entry.items.length > 0)
  }, [shelves, q])

  const total = results.reduce((sum, entry) => sum + entry.items.length, 0)

  return (
    <div className="mx-auto max-w-[80rem] px-5 pb-12 sm:px-8">
      <div className="pt-7 sm:pt-10">{toggle}</div>

      <h1 className="mt-6 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Lista de preços
      </h1>

      <div className="sticky top-0 z-20 bg-canvas pt-5 pb-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome ou categoria…"
            aria-label="Buscar na lista de preços"
            className="h-14 w-full rounded-full border border-line bg-surface pr-14 pl-12 text-base text-ink shadow-lift outline-none placeholder:text-ink-muted focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Limpar busca"
              className="absolute top-1/2 right-2.5 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition-colors hover:bg-canvas-sunk hover:text-ink"
            >
              <XIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 px-1 text-sm text-ink-muted">
        {query
          ? `${total} ${total === 1 ? 'item encontrado' : 'itens encontrados'}`
          : 'Todo o catálogo por categoria. Toque em um item para ver a descrição e a foto.'}
      </p>

      {results.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
          <p className="font-display text-lg font-semibold text-ink">
            Nada encontrado para “{query.trim()}”
          </p>
          <p className="mx-auto mt-2 max-w-[42ch] text-sm text-ink-soft">
            Tente outro termo, ou toque em <b>Limpar busca</b> para ver a lista completa.
          </p>
        </div>
      ) : (
        <div className="mt-4">
          {results.map(({ shelf, items }) => (
            <section key={shelf.type.id} className="mt-9 first:mt-2">
              <h2 className="sticky top-[88px] z-10 flex items-baseline gap-3 border-b-2 border-brand/25 bg-canvas pt-2 pb-2 font-display text-2xl font-semibold text-brand">
                {shelfLabel(shelf.type)}
                <span className="text-sm font-normal text-ink-muted">{items.length}</span>
              </h2>
              <div className="divide-y divide-line">
                {[...items].sort(byName).map((item) => (
                  <Row key={item.id} item={item} onOpen={() => onOpen(shelf, item)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
