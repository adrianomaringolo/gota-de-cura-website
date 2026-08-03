'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { formatCurrency } from '@/lib/format'
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
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={item.name}
      description={type}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          {onOrder && (
            <Button
              onClick={() => {
                onOrder()
                onClose()
              }}
            >
              Adicionar · {formatCurrency(item.price)}
            </Button>
          )}
        </>
      }
    >
      <div className="grid gap-6 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        {item.image && (
          <div className="relative aspect-square overflow-hidden rounded-xl bg-canvas-sunk">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="240px"
              className="object-cover"
            />
          </div>
        )}
        <div
          className="rich-text text-base"
          dangerouslySetInnerHTML={{
            __html: item.detailedDescription || item.description || '',
          }}
        />
      </div>
    </Dialog>
  )
}
