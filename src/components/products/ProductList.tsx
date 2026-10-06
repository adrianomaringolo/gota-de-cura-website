'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { EmptyState } from '@/components/ui/Feedback'
import { ProductsService } from '@/services/products'
import type { ProductItem, ProductType } from '@/lib/types'
import { ProductCard } from './ProductCard'

export function ProductList({ productType }: { productType: ProductType }) {
  const t = useTranslations('productList')
  const [items, setItems] = useState<ProductItem[] | null>(null)

  useEffect(() => {
    let cancelled = false

    const load =
      productType.mode === 'type'
        ? ProductsService.getProductsByType(productType.type)
        : ProductsService.getProductsByCategory(productType.type)

    load
      .then((result) => {
        if (!cancelled) setItems(result.filter((item) => !item.hidden))
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })

    return () => {
      cancelled = true
    }
  }, [productType.mode, productType.type])

  if (items === null) {
    return (
      <div
        className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
        aria-hidden="true"
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-line bg-surface"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="aspect-square rounded-t-2xl bg-canvas-sunk" />
            <div className="space-y-2 p-5">
              <div className="h-4 w-3/4 rounded bg-canvas-sunk" />
              <div className="h-3 w-full rounded bg-canvas-sunk" />
              <div className="h-6 w-1/3 rounded bg-canvas-sunk" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return <EmptyState title={t('emptyTitle')}>{t('emptyBody')}</EmptyState>
  }

  const available = items.filter((item) => item.available)
  const soldOut = items.filter((item) => !item.available)
  const ordered = [...available, ...soldOut]

  return (
    <>
      <p className="mb-6 text-sm text-ink-muted">
        {t('count', { count: items.length })}
        {soldOut.length > 0 && ` · ${t('soldOutCount', { count: soldOut.length })}`}
      </p>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {ordered.map((item) => (
          <ProductCard key={item.id} item={item} type={productType.type} />
        ))}
      </div>
    </>
  )
}
