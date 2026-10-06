'use client'

import { useLocale, useTranslations } from 'next-intl'
import { ProductGallery } from './ProductGallery'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { formatCurrency } from '@/lib/format'
import { localizeProduct } from '@/lib/products'
import { typeDisplayName } from '@/lib/product-types'
import type { ProductItem } from '@/lib/types'

export function ProductDetailDialog({
  item,
  type,
  open,
  onClose,
  onOrder,
}: {
  item: ProductItem
  type: string
  open: boolean
  onClose: () => void
  onOrder?: () => void
}) {
  const t = useTranslations('product')
  const locale = useLocale()
  const shown = localizeProduct(item, locale)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={shown.name}
      description={typeDisplayName(type, locale)}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('close')}
          </Button>
          {onOrder && (
            <Button
              onClick={() => {
                onOrder()
                onClose()
              }}
            >
              {t('addWithPrice', { price: formatCurrency(item.price, locale) })}
            </Button>
          )}
        </>
      }
    >
      <div className="grid gap-6 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <ProductGallery item={shown} sizes="240px" />
        <div
          className="rich-text text-base"
          dangerouslySetInnerHTML={{
            __html: shown.detailedDescription || shown.description || '',
          }}
        />
      </div>
    </Dialog>
  )
}
