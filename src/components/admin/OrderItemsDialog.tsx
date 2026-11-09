'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Textarea } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import { formatCurrency } from '@/lib/format'
import {
  diffLines,
  linesToItems,
  type EditableLine,
  type ItemChange,
} from '@/lib/order-edit'
import type { Order, ProductItem } from '@/lib/types'
import { OrdersService, orderGrandTotal } from '@/services/orders'
import { ProductsService } from '@/services/products'

const normalise = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const toLines = (order: Order): EditableLine[] =>
  order.items
    .filter((item) => item.amount)
    .map((item, index) => ({
      key: `existing-${index}`,
      id: item.id,
      name: item.name,
      type: item.type,
      price: item.price,
      localizedName: item.localizedName,
      amount: item.amount,
      originalAmount: item.amount,
      removed: false,
    }))

const changeText = (change: ItemChange) =>
  change.kind === 'removed'
    ? `Removido: ${change.name} (${change.amount}×)`
    : change.kind === 'added'
      ? `Adicionado: ${change.name} (${change.amount}×)`
      : `${change.name}: de ${change.from}× para ${change.to}×`

export function OrderItemsDialog({
  order,
  open,
  onClose,
  onSaved,
}: {
  order: Order
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [lines, setLines] = useState<EditableLine[]>(() => toLines(order))
  const [reason, setReason] = useState('')
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<ProductItem[] | null>(null)
  const [saving, setSaving] = useState(false)

  // Start from the order as it is now every time the dialog opens.
  useEffect(() => {
    if (!open) return
    setLines(toLines(order))
    setReason('')
    setSearch('')
  }, [open, order])

  useEffect(() => {
    if (!open || products) return
    ProductsService.getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [open, products])

  const stockById = useMemo(
    () => new Map((products ?? []).map((product) => [product.id, product])),
    [products],
  )

  const matches = useMemo(() => {
    const term = normalise(search.trim())
    if (!term) return []
    return (products ?? [])
      .filter((product) => normalise(product.name).includes(term))
      .slice(0, 6)
  }, [products, search])

  const changes = diffLines(lines)
  const items = linesToItems(lines)
  const totalBefore = orderGrandTotal(order)
  const totalAfter = orderGrandTotal({ ...order, items })

  const update = (key: string, patch: Partial<EditableLine>) =>
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    )

  const addProduct = (product: ProductItem) => {
    setSearch('')
    setLines((current) => {
      const existing = current.find(
        (line) => line.id === product.id && line.name === product.name,
      )
      if (existing) {
        return current.map((line) =>
          line === existing
            ? { ...line, removed: false, amount: line.removed ? 1 : line.amount + 1 }
            : line,
        )
      }
      return [
        ...current,
        {
          key: `added-${product.id}-${current.length}`,
          id: product.id,
          name: product.name,
          type: product.type ?? '',
          price: product.price,
          amount: 1,
          originalAmount: null,
          removed: false,
        },
      ]
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      await OrdersService.updateOrderItems(
        order,
        items,
        changes,
        reason.trim() || undefined,
      )
      toast.success('Pedido atualizado e registrado nos comentários')
      onClose()
      onSaved()
    } catch {
      toast.error('Não foi possível salvar as alterações')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={`Editar itens do pedido #${order.orderId}`}
      description="Tudo o que mudar fica registrado nos comentários do pedido."
      closeOnBackdrop={false}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={save}
            disabled={saving || changes.length === 0 || items.length === 0}
          >
            {saving ? <Spinner className="h-4 w-4" /> : 'Salvar alterações'}
          </Button>
        </>
      }
    >
      <ul className="divide-y divide-line rounded-xl border border-line">
        {lines.map((line) => {
          const stock = stockById.get(line.id)?.amount
          const gone = line.removed || line.amount <= 0
          const overStock = stock !== undefined && !gone && line.amount > stock

          return (
            <li key={line.key} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p
                  className={
                    gone ? 'text-ink-muted line-through' : 'font-medium text-ink'
                  }
                >
                  {line.name}
                  {line.originalAmount === null && (
                    <span className="ml-2 text-xs font-semibold text-positive no-underline">
                      novo
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink-muted tabular-nums">
                  {formatCurrency(line.price)} cada
                  {stock !== undefined && ` · estoque anotado: ${stock}`}
                </p>
                {overStock && (
                  <p className="text-xs font-medium text-danger">
                    Quantidade maior que o estoque anotado.
                  </p>
                )}
              </div>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                aria-label={`Quantidade de ${line.name}`}
                value={line.removed ? 0 : line.amount}
                disabled={line.removed}
                onChange={(event) =>
                  update(line.key, {
                    amount: Math.max(0, Math.floor(Number(event.target.value) || 0)),
                  })
                }
                className="h-10 w-20 rounded-lg border border-line bg-surface px-3 text-right tabular-nums disabled:opacity-50"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  update(line.key, {
                    removed: !line.removed,
                    amount: line.removed && line.amount <= 0 ? 1 : line.amount,
                  })
                }
              >
                {line.removed ? 'Desfazer' : 'Remover'}
              </Button>
            </li>
          )
        })}
      </ul>

      <div className="mt-5">
        <Input
          label="Adicionar produto"
          type="search"
          placeholder="Buscar produto pelo nome"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          hint={products === null ? 'Carregando produtos…' : undefined}
        />
        {matches.length > 0 && (
          <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
            {matches.map((product) => (
              <li key={`${product.id}-${product.name}`}>
                <button
                  type="button"
                  onClick={() => addProduct(product)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-canvas-sunk"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-ink">{product.name}</span>
                    {product.available === false && (
                      <span className="ml-2 text-xs text-danger">esgotado</span>
                    )}
                  </span>
                  <span className="shrink-0 text-ink-soft tabular-nums">
                    {formatCurrency(product.price)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5">
        <Textarea
          label="Motivo da alteração"
          rows={2}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Ex.: cliente pediu para tirar; só havia 2 em estoque."
          hint="Vai junto no registro dos comentários."
        />
      </div>

      <div className="mt-5 rounded-xl bg-canvas-sunk px-4 py-3 text-sm">
        {changes.length === 0 ? (
          <p className="text-ink-muted">Nenhuma alteração ainda.</p>
        ) : (
          <ul className="space-y-1 text-ink">
            {changes.map((change, index) => (
              <li key={index}>• {changeText(change)}</li>
            ))}
          </ul>
        )}
        <p className="mt-2 flex justify-between border-t border-line pt-2 font-semibold text-ink tabular-nums">
          <span>Total do pedido</span>
          <span>
            {changes.length > 0 && (
              <span className="mr-2 font-normal text-ink-muted line-through">
                {formatCurrency(totalBefore)}
              </span>
            )}
            {formatCurrency(totalAfter)}
          </span>
        </p>
        {items.length === 0 && (
          <p className="mt-2 text-xs font-medium text-danger">
            O pedido precisa ter ao menos um item. Para encerrá-lo, mude o status para
            Cancelado.
          </p>
        )}
      </div>
    </Dialog>
  )
}
