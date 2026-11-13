'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Spinner } from '@/components/ui/Feedback'
import { ORDER_STATUS } from '@/lib/constants'
import type { Order, StockLine } from '@/lib/types'
import { StockService, type StockKind } from '@/services/stock'
import { Panel } from './AdminUI'

/** The order's products by product id (lines of the same product are summed). */
const orderedLines = (order: Order): StockLine[] => {
  const byId = new Map<string, StockLine>()
  for (const item of order.items) {
    if (!item.amount) continue
    const found = byId.get(item.id)
    byId.set(item.id, {
      id: item.id,
      name: found?.name ?? item.name,
      quantity: (found?.quantity ?? 0) + item.amount,
    })
  }
  return [...byId.values()]
}

/** What the dialog starts from: still to withdraw, or still to give back. */
const suggestedLines = (order: Order, kind: StockKind): StockLine[] => {
  const outstanding = order.stockWithdrawn ?? []
  if (kind === 'return') return outstanding
  return orderedLines(order)
    .map((line) => ({
      ...line,
      quantity: Math.max(
        0,
        line.quantity -
          (outstanding.find((entry) => entry.id === line.id)?.quantity ?? 0),
      ),
    }))
    .filter((line) => line.quantity > 0)
}

export function OrderStockPanel({
  order,
  onSaved,
}: {
  order: Order
  onSaved: () => void
}) {
  const [kind, setKind] = useState<StockKind | null>(null)
  const outstanding = order.stockWithdrawn ?? []
  const separated = order.status === ORDER_STATUS.SEPARADO

  if (!separated && outstanding.length === 0) return null

  return (
    <Panel className="p-5">
      <h2 className="font-display text-lg font-semibold text-ink">Estoque</h2>

      {outstanding.length > 0 ? (
        <div className="mt-3">
          <p className="text-sm text-ink-soft">Retirado do estoque para este pedido:</p>
          <ul className="mt-1.5 space-y-0.5 text-sm text-ink">
            {outstanding.map((line) => (
              <li key={line.id}>
                <span className="font-semibold tabular-nums">{line.quantity}×</span>{' '}
                {line.name}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-2 text-sm text-ink-soft">
          Os produtos separados ainda não foram retirados do estoque.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {separated && (
          <Button
            onClick={() => setKind('withdrawal')}
            disabled={suggestedLines(order, 'withdrawal').length === 0}
          >
            Avisar retirada de produtos
          </Button>
        )}
        {outstanding.length > 0 && (
          <Button variant="outline" onClick={() => setKind('return')}>
            Avisar devolução de produtos
          </Button>
        )}
      </div>

      {kind && (
        <StockDialog
          key={kind}
          order={order}
          kind={kind}
          onClose={() => setKind(null)}
          onSaved={onSaved}
        />
      )}
    </Panel>
  )
}

function StockDialog({
  order,
  kind,
  onClose,
  onSaved,
}: {
  order: Order
  kind: StockKind
  onClose: () => void
  onSaved: () => void
}) {
  const withdrawal = kind === 'withdrawal'
  const base = suggestedLines(order, kind)
  const [quantities, setQuantities] = useState<Record<string, string>>(
    Object.fromEntries(base.map((line) => [line.id, String(line.quantity)])),
  )
  const [stock, setStock] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    StockService.getStock(base.map((line) => line.id))
      .then(setStock)
      .catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const chosen = base
    .map((line) => ({
      ...line,
      quantity: Math.min(
        line.quantity,
        Math.max(0, Math.floor(Number(quantities[line.id])) || 0),
      ),
    }))
    .filter((line) => line.quantity > 0)

  const confirm = async () => {
    setSaving(true)
    try {
      await StockService.move(order, kind, chosen)
      toast.success(withdrawal ? 'Estoque atualizado' : 'Devolução registrada')
      onClose()
      onSaved()
    } catch (error) {
      console.error(error)
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : 'Não foi possível atualizar o estoque',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={withdrawal ? 'Avisar retirada de produtos' : 'Avisar devolução de produtos'}
      description={
        withdrawal
          ? 'Confirme os produtos e as quantidades que saíram do estoque. Elas serão descontadas de /admin/produtos.'
          : 'Confirme os produtos e as quantidades que voltaram. Elas serão somadas de volta ao estoque.'
      }
      closeOnBackdrop={false}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={confirm} disabled={saving || chosen.length === 0}>
            {saving ? (
              <Spinner className="h-4 w-4" />
            ) : withdrawal ? (
              'Confirmar retirada'
            ) : (
              'Confirmar devolução'
            )}
          </Button>
        </>
      }
    >
      {base.length === 0 ? (
        <p className="text-sm text-ink-soft">Não há produtos para registrar.</p>
      ) : (
        <ul className="divide-y divide-line">
          {base.map((line) => {
            const value = Number(quantities[line.id]) || 0
            const short =
              withdrawal && stock[line.id] !== undefined && value > stock[line.id]
            return (
              <li key={line.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <label htmlFor={`stock-${line.id}`} className="font-medium text-ink">
                    {line.name}
                  </label>
                  <p className="text-xs text-ink-muted">
                    {withdrawal ? 'No pedido' : 'Retirado'}: {line.quantity}
                    {stock[line.id] !== undefined && ` · Em estoque: ${stock[line.id]}`}
                  </p>
                  {short && (
                    <p className="text-xs font-medium text-warning">
                      Maior que o estoque; ele ficará em 0.
                    </p>
                  )}
                </div>
                <input
                  id={`stock-${line.id}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={line.quantity}
                  value={quantities[line.id]}
                  onChange={(event) =>
                    setQuantities((current) => ({
                      ...current,
                      [line.id]: event.target.value,
                    }))
                  }
                  className="w-20 shrink-0 rounded-lg border border-line bg-surface px-3 py-2 text-right text-base tabular-nums"
                />
              </li>
            )
          })}
        </ul>
      )}
    </Dialog>
  )
}
