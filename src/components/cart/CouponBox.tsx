'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { useCoupons } from '@/lib/hooks'
import { isCouponValidNow } from '@/services/coupons'
import type { Coupon } from '@/lib/types'

export function CouponBox({
  applied,
  onApply,
}: {
  applied?: Coupon
  onApply: (coupon: Coupon | undefined) => void
}) {
  const { data: coupons } = useCoupons()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const apply = () => {
    const match = coupons.find(
      (candidate) => candidate.code === code && isCouponValidNow(candidate),
    )

    if (!match) {
      setError('Esse código não é válido ou já expirou.')
      onApply(undefined)
      return
    }

    setError('')
    onApply(match)
  }

  if (applied) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-positive-tint px-4 py-3">
        <p className="text-sm text-ink">
          Cupom <strong className="font-semibold">{applied.code}</strong> aplicado.
        </p>
        <button
          type="button"
          onClick={() => {
            onApply(undefined)
            setCode('')
          }}
          className="text-sm font-medium text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
        >
          Remover
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 transition-colors hover:decoration-brand"
      >
        Tenho um cupom ou vale-presente
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-line p-4">
      <div className="flex flex-wrap items-end gap-3">
        <Input
          label="Código"
          value={code}
          error={error || undefined}
          placeholder="Ex.: VISITA10"
          autoFocus
          onChange={(event) =>
            setCode(event.target.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase())
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              apply()
            }
          }}
          className="min-w-48 flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={apply}
          disabled={!code}
          className="mb-0.5"
        >
          Aplicar
        </Button>
      </div>
    </div>
  )
}
