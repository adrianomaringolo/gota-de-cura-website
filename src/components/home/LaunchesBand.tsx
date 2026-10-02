'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/products/ProductCard'
import { Container, SectionHead } from '@/components/site/Section'
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
        <SectionHead
          title="Lançamentos"
          lead="Os produtos mais recentes da chácara, cadastrados nos últimos 30 dias."
        />

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} type={item.type ?? ''} />
          ))}
        </div>
      </Container>
    </section>
  )
}
