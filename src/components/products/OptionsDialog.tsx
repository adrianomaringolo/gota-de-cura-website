'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Select } from '@/components/ui/Field'
import { useCart } from '@/lib/cart-context'
import type { ProductItem } from '@/lib/types'

const readValues = (values: string[] | string) =>
  (typeof values === 'string' ? values.split(',') : values)
    .map((value) => value.trim())
    .filter(Boolean)

export function OptionsDialog({
  item,
  type,
  open,
  onClose,
}: {
  item: ProductItem
  type: string
  open: boolean
  onClose: () => void
}) {
  const { addItem } = useCart()
  const options = item.optionsSet ?? []
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (open) setSelected([])
  }, [open])

  const complete = options.length > 0 && options.every((_, index) => selected[index])

  const confirm = () => {
    addItem(item, type, selected)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={item.name}
      description="Escolha o que vai dentro do kit."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={confirm} disabled={!complete}>
            Adicionar ao pedido
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {options.map((option, index) => (
          <Select
            key={option.name}
            label={option.name}
            value={selected[index] ?? ''}
            onChange={(event) => {
              const next = [...selected]
              next[index] = event.target.value
              setSelected(next)
            }}
          >
            <option value="" disabled>
              — selecione —
            </option>
            {readValues(option.values).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        ))}
      </div>
    </Dialog>
  )
}
