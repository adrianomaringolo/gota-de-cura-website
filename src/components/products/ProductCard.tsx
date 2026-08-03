'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Badge } from '@/components/ui/Feedback'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { useCart } from '@/lib/cart-context'
import { formatCurrency } from '@/lib/format'
import { isNewProduct } from '@/lib/products'
import type { ProductItem } from '@/lib/types'
import { OptionsDialog } from './OptionsDialog'
import { ProductDetailDialog } from './ProductDetailDialog'

export function ProductCard({ item, type }: { item: ProductItem; type: string }) {
  const { addItem } = useCart()
  const [detailOpen, setDetailOpen] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)

  const hasOptions = Boolean(item.optionsSet?.length)
  const onSale = Boolean(item.oldPrice)
  const isNew = isNewProduct(item)

  const handleOrder = () => {
    if (hasOptions) setOptionsOpen(true)
    else addItem(item, type)
  }

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-[border-color,box-shadow] duration-300 hover:border-brand/30 hover:shadow-lift">
        <div className="relative aspect-square overflow-hidden bg-canvas-sunk">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-quart)] group-hover:scale-[1.04]"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-ink-muted">
              sem foto
            </div>
          )}

          {/* Stacked so an automatic tag and a manual seal never overlap. */}
          <div className="absolute top-3 left-3 flex flex-col items-start gap-2">
            {isNew && (
              <span className="rounded-full bg-brand px-2.5 py-1 text-2xs font-bold tracking-[0.08em] text-white uppercase shadow-lift">
                Novo
              </span>
            )}
            {item.seal && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.seal} alt="" className="w-16" />
            )}
          </div>

          {item.priceDiscount && (
            <span className="absolute top-3 right-3 rounded-full bg-terra px-3 py-1.5 text-sm font-bold text-white">
              {item.priceDiscount} OFF
            </span>
          )}

          {!item.available && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-2 text-center text-sm font-medium text-white">
              Esgotado no momento
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg leading-snug font-semibold text-ink">
            {item.name}
          </h3>

          {item.description && (
            <p
              className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          )}

          <div className="mt-4 flex-1" />

          {item.available ? (
            <p className="flex items-baseline gap-2">
              {onSale && (
                <span className="text-sm text-ink-muted line-through">
                  {formatCurrency(item.oldPrice ?? 0)}
                </span>
              )}
              <span
                className={cn(
                  'font-display text-2xl font-semibold tabular-nums',
                  onSale ? 'text-terra' : 'text-ink',
                )}
              >
                {formatCurrency(item.price)}
              </span>
            </p>
          ) : (
            <Badge tone="neutral">Indisponível</Badge>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {item.available && (
              <Button size="sm" onClick={handleOrder} className="flex-1">
                {hasOptions ? 'Montar kit' : 'Adicionar'}
              </Button>
            )}
            {item.detailedDescription && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDetailOpen(true)}
                className={item.available ? '' : 'flex-1'}
              >
                Saiba mais
              </Button>
            )}
          </div>
        </div>
      </article>

      <ProductDetailDialog
        item={item}
        type={type}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onOrder={item.available ? handleOrder : undefined}
      />

      {hasOptions && (
        <OptionsDialog
          item={item}
          type={type}
          open={optionsOpen}
          onClose={() => setOptionsOpen(false)}
        />
      )}
    </>
  )
}
