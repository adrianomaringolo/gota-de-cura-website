'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/site/Section'
import { EmptyState } from '@/components/ui/Feedback'
import { useCart } from '@/lib/cart-context'
import { formatCurrency } from '@/lib/format'
import { isNewProduct } from '@/lib/products'
import { getProductType } from '@/lib/product-types'
import type { ProductItem } from '@/lib/types'
import { ProductsService } from '@/services/products'

export function ProductDetail({ urlName, typeId }: { urlName: string; typeId: string }) {
  const { addItem } = useCart()
  const [item, setItem] = useState<ProductItem | null | undefined>(undefined)
  const productType = getProductType(typeId)
  const typeLabel = productType?.type ?? item?.type ?? ''

  useEffect(() => {
    let cancelled = false
    ProductsService.getProductByUrlName(urlName)
      .then((result) => {
        if (!cancelled) setItem(result ?? null)
      })
      .catch(() => {
        if (!cancelled) setItem(null)
      })
    return () => {
      cancelled = true
    }
  }, [urlName])

  if (item === undefined) {
    return (
      <Container className="py-32">
        <div className="grid gap-10 md:grid-cols-2" aria-hidden="true">
          <div className="aspect-square animate-pulse rounded-2xl bg-canvas-sunk" />
          <div className="space-y-4">
            <div className="h-10 w-2/3 animate-pulse rounded bg-canvas-sunk" />
            <div className="h-5 w-full animate-pulse rounded bg-canvas-sunk" />
            <div className="h-5 w-4/5 animate-pulse rounded bg-canvas-sunk" />
          </div>
        </div>
      </Container>
    )
  }

  if (item === null) {
    return (
      <Container className="py-32">
        <EmptyState
          title="Não encontramos este produto"
          action={
            <ButtonLink href={`/${typeId}`}>Ver a prateleira {typeLabel}</ButtonLink>
          }
        >
          Ele pode ter saído do catálogo ou mudado de endereço.
        </EmptyState>
      </Container>
    )
  }

  return (
    <Container className="pt-32 pb-20 lg:pt-40">
      <nav aria-label="Trilha" className="mb-8 text-sm text-ink-muted">
        <Link href="/#catalogo" className="transition-colors hover:text-brand">
          Catálogo
        </Link>
        <span className="mx-2 text-line-strong" aria-hidden="true">
          /
        </span>
        <Link href={`/${typeId}`} className="transition-colors hover:text-brand">
          {typeLabel}
        </Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
        {item.image && (
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-canvas-sunk">
            <Image
              src={item.image}
              alt={item.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        )}

        <div>
          {isNewProduct(item) && (
            <span className="mb-3 inline-block rounded-full bg-brand px-3 py-1 text-2xs font-bold tracking-[0.08em] text-white uppercase">
              Novo
            </span>
          )}
          <h1 className="text-3xl font-semibold text-ink">{item.name}</h1>

          {item.description && (
            <p
              className="mt-4 max-w-[58ch] text-lg leading-relaxed text-ink-soft"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          )}

          <div className="mt-8 flex flex-wrap items-center gap-5 border-y border-line py-6">
            {item.available ? (
              <>
                <p className="flex items-baseline gap-2">
                  {Boolean(item.oldPrice) && (
                    <span className="text-base text-ink-muted line-through">
                      {formatCurrency(item.oldPrice ?? 0)}
                    </span>
                  )}
                  <span className="font-display text-3xl font-semibold text-ink tabular-nums">
                    {formatCurrency(item.price)}
                  </span>
                </p>
                <Button size="lg" onClick={() => addItem(item, typeLabel)}>
                  Adicionar ao pedido
                </Button>
              </>
            ) : (
              <p className="text-lg font-medium text-ink-soft">
                Esgotado no momento — volte em breve.
              </p>
            )}
          </div>

          {item.detailedDescription && (
            <div
              className="rich-text mt-8"
              dangerouslySetInnerHTML={{ __html: item.detailedDescription }}
            />
          )}
        </div>
      </div>
    </Container>
  )
}
