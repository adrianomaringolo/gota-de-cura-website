'use client'

import Image from 'next/image'
import { cn } from '@/lib/cn'
import { formatCurrency } from '@/lib/format'
import { isNewProduct } from '@/lib/products'
import type { ProductItem } from '@/lib/types'
import { readValues } from './data'

export function PlantaView({ item }: { item: ProductItem }) {
  const onSale = Boolean(item.oldPrice)
  const options = item.optionsSet ?? []

  return (
    <div className="mx-auto max-w-[80rem] px-5 py-8 sm:px-8 sm:py-11">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-canvas-sunk">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 26rem"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-ink-muted">
              sem foto
            </div>
          )}
          {!item.available && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-2.5 text-center text-base font-medium text-white">
              Esgotado no momento
            </span>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {item.name}
            </h1>
            {isNewProduct(item) && (
              <span className="rounded-full bg-brand px-3 py-1 text-2xs font-bold tracking-[0.08em] text-white uppercase">
                Novo
              </span>
            )}
          </div>

          {item.description && (
            <p
              className="mt-4 max-w-[62ch] text-lg leading-relaxed text-ink-soft"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          )}

          <div className="mt-7 border-y border-line py-5">
            {item.available ? (
              <p className="flex items-baseline gap-3">
                {onSale && (
                  <span className="text-lg text-ink-muted line-through">
                    {formatCurrency(item.oldPrice ?? 0)}
                  </span>
                )}
                <span
                  className={cn(
                    'font-display text-4xl font-semibold tabular-nums',
                    onSale ? 'text-terra' : 'text-ink',
                  )}
                >
                  {formatCurrency(item.price)}
                </span>
              </p>
            ) : (
              <p className="text-lg font-medium text-ink-soft">
                Esgotado no momento — volte em breve.
              </p>
            )}
          </div>

          {options.length > 0 && (
            <div className="mt-6 space-y-4">
              {options.map((option) => (
                <div key={option.name}>
                  <p className="text-sm font-semibold text-ink">{option.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {readValues(option.values).map((value) => (
                      <span
                        key={value}
                        className="rounded-full bg-brand-tint px-3.5 py-1.5 text-sm font-medium text-brand"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {item.detailedDescription && (
            <div
              className="rich-text mt-7 text-base"
              dangerouslySetInnerHTML={{ __html: item.detailedDescription }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
