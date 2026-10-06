'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import type { ProductItem } from '@/lib/types'

/** The product's photos: the chosen one large, the rest as thumbnails below it. */
export function ProductGallery({
  item,
  sizes,
  priority,
  className,
}: {
  item: ProductItem
  sizes: string
  priority?: boolean
  className?: string
}) {
  const t = useTranslations('product')
  const photos = item.images?.length ? item.images : item.image ? [item.image] : []
  const [current, setCurrent] = useState(0)

  if (photos.length === 0) return null

  const shown = photos[Math.min(current, photos.length - 1)]

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-canvas-sunk">
        <Image
          src={shown}
          alt={item.name}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      </div>

      {photos.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {photos.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={t('photoOf', { index: index + 1, total: photos.length })}
              aria-current={src === shown ? 'true' : undefined}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg border-2 bg-canvas-sunk transition-colors',
                src === shown
                  ? 'border-brand'
                  : 'border-transparent hover:border-line-strong',
              )}
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
