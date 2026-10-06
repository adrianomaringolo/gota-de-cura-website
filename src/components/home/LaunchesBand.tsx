'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { Container, SectionHead } from '@/components/site/Section'
import { cn } from '@/lib/cn'
import { isNewProduct } from '@/lib/products'
import type { ProductItem } from '@/lib/types'
import { ProductsService } from '@/services/products'

/** Caps the teaser grid so a busy restocking week doesn't take over the homepage. */
const MAX_ITEMS = 8

/**
 * Products created within the "Novo" window (see `isNewProduct`), newest
 * first. Renders nothing — not even a skeleton — until there is at least one
 * to show, so an ordinary week never leaves an empty band on the homepage.
 */
export function LaunchesBand() {
  const t = useTranslations('launches')
  const [items, setItems] = useState<ProductItem[] | null>(null)

  useEffect(() => {
    let cancelled = false

    ProductsService.getProducts()
      .then((products) => {
        if (cancelled) return

        const launches = products
          .filter((product) => !product.hidden && isNewProduct(product))
          .sort((a, b) => ((a.createdAt ?? '') < (b.createdAt ?? '') ? 1 : -1))
          .slice(0, MAX_ITEMS)

        setItems(launches)
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!items?.length) return null

  return (
    <section className="bg-canvas-sunk py-20 lg:py-24">
      <Container>
        <SectionHead title={t('title')} />

        <div
          className={cn(
            'mt-12 grid grid-cols-2 gap-4 sm:gap-5',
            // Two columns for a thin shelf, three once there's enough to fill it —
            // never stretch a lone product across a wide row.
            items.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2',
          )}
        >
          {items.map((item) => (
            <ProductCard key={item.id} item={item} type={item.type ?? ''} />
          ))}
        </div>
      </Container>
    </section>
  )
}
