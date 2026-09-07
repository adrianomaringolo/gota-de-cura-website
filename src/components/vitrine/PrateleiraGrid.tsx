'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/Feedback'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import { isNewProduct } from '@/lib/products'
import type { ProductItem } from '@/lib/types'
import { plainText, shelfLabel, type Shelf } from './data'

function PrateleiraCard({ item, onOpen }: { item: ProductItem; onOpen: () => void }) {
  const onSale = Boolean(item.oldPrice)

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-left',
        'transition-[transform,border-color,box-shadow] duration-200 ease-[var(--ease-out-quart)]',
        'hover:border-brand/30 hover:shadow-lift',
        'active:scale-[0.98] active:border-brand/40 active:shadow-lift',
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-canvas-sunk">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, 260px"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-ink-muted">
            sem foto
          </div>
        )}

        {isNewProduct(item) && (
          <span className="absolute top-3 left-3 rounded-full bg-brand px-2.5 py-1 text-2xs font-bold tracking-[0.08em] text-white uppercase shadow-lift">
            Novo
          </span>
        )}

        {!item.available && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-2 text-center text-sm font-medium text-white">
            Esgotado hoje
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg leading-snug font-semibold text-ink">
          {item.name}
        </h3>
        {item.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">
            {plainText(item.description)}
          </p>
        )}

        <div className="mt-3 flex-1" />

        {item.available ? (
          <p className="flex items-baseline gap-2">
            {onSale && (
              <span className="text-sm text-ink-muted line-through">
                {formatCurrency(item.oldPrice ?? 0)}
              </span>
            )}
            <span
              className={cn(
                'font-display text-xl font-semibold tabular-nums',
                onSale ? 'text-terra' : 'text-ink',
              )}
            >
              {formatCurrency(item.price)}
            </span>
          </p>
        ) : (
          <Badge tone="neutral">Indisponível</Badge>
        )}
      </div>
    </button>
  )
}

export function PrateleiraGrid({
  shelf,
  onOpen,
}: {
  shelf: Shelf
  onOpen: (item: ProductItem) => void
}) {
  const soldOut = shelf.items.filter((item) => !item.available).length
  const description = plainText(shelf.type.description)

  return (
    <div className="mx-auto max-w-[92rem] px-5 py-8 sm:px-8 sm:py-11">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
        {shelfLabel(shelf.type)}
      </h1>
      {description && (
        <p className="mt-3 line-clamp-2 max-w-[68ch] text-base leading-relaxed text-ink-soft sm:text-lg">
          {description}
        </p>
      )}
      <p className="mt-3 text-sm text-ink-muted">
        {shelf.items.length} {shelf.items.length === 1 ? 'produto' : 'produtos'}
        {soldOut > 0 && ` · ${soldOut} esgotado(s) hoje`}
      </p>

      <div className="mt-7 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(min(100%,15rem),1fr))] sm:gap-4">
        {shelf.items.map((item) => (
          <PrateleiraCard key={item.id} item={item} onOpen={() => onOpen(item)} />
        ))}
      </div>
    </div>
  )
}
