'use client'

import { ProductGallery } from './ProductGallery'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Button, ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/site/Section'
import { EmptyState } from '@/components/ui/Feedback'
import { useCart } from '@/lib/cart-context'
import { formatCurrency } from '@/lib/format'
import { Link } from '@/i18n/navigation'
import { isNewProduct, localizeProduct } from '@/lib/products'
import { getProductType, shelfName, typeDisplayName } from '@/lib/product-types'
import type { ProductItem } from '@/lib/types'
import { ProductsService } from '@/services/products'

export function ProductDetail({ urlName, typeId }: { urlName: string; typeId: string }) {
  const t = useTranslations('product')
  const locale = useLocale()
  const { addItem } = useCart()
  const [item, setItem] = useState<ProductItem | null | undefined>(undefined)
  const productType = getProductType(typeId)
  // The Portuguese name is the key the cart and the order record…
  const typeKey = productType?.type ?? item?.type ?? ''
  // …and this is what the visitor reads.
  const typeLabel = productType
    ? shelfName(productType, locale)
    : typeDisplayName(typeKey, locale)

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
          title={t('notFoundTitle')}
          action={
            <ButtonLink href={`/${typeId}`}>
              {t('seeShelf', { shelf: typeLabel })}
            </ButtonLink>
          }
        >
          {t('notFoundBody')}
        </EmptyState>
      </Container>
    )
  }

  const shown = localizeProduct(item, locale)

  return (
    <Container className="pt-32 pb-20 lg:pt-40">
      <nav aria-label={t('breadcrumb')} className="mb-8 text-sm text-ink-muted">
        <Link href="/#catalogo" className="transition-colors hover:text-brand">
          {t('catalog')}
        </Link>
        <span className="mx-2 text-line-strong" aria-hidden="true">
          /
        </span>
        <Link href={`/${typeId}`} className="transition-colors hover:text-brand">
          {typeLabel}
        </Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
        <ProductGallery item={shown} priority sizes="(max-width: 768px) 100vw, 620px" />

        <div>
          {isNewProduct(item) && (
            <span className="mb-3 inline-block rounded-full bg-brand px-3 py-1 text-2xs font-bold tracking-[0.08em] text-white uppercase">
              {t('new')}
            </span>
          )}
          <h1 className="text-3xl font-semibold text-ink">{shown.name}</h1>

          {shown.description && (
            <p
              className="mt-4 max-w-[58ch] text-lg leading-relaxed text-ink-soft"
              dangerouslySetInnerHTML={{ __html: shown.description }}
            />
          )}

          <div className="mt-8 flex flex-wrap items-center gap-5 border-y border-line py-6">
            {item.available ? (
              <>
                <p className="flex items-baseline gap-2">
                  {Boolean(item.oldPrice) && (
                    <span className="text-base text-ink-muted line-through">
                      {formatCurrency(item.oldPrice ?? 0, locale)}
                    </span>
                  )}
                  <span className="font-display text-3xl font-semibold text-ink tabular-nums">
                    {formatCurrency(item.price, locale)}
                  </span>
                </p>
                <Button size="lg" onClick={() => addItem(item, typeKey)}>
                  {t('addToOrder')}
                </Button>
              </>
            ) : (
              <p className="text-lg font-medium text-ink-soft">{t('soldOutLong')}</p>
            )}
          </div>

          {shown.detailedDescription && (
            <div
              className="rich-text mt-8"
              dangerouslySetInnerHTML={{ __html: shown.detailedDescription }}
            />
          )}
        </div>
      </div>
    </Container>
  )
}
