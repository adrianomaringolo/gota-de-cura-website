'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Select, Textarea } from '@/components/ui/Field'
import { EmptyState, LoadingRows, Spinner } from '@/components/ui/Feedback'
import { ORDER_STATUS_OPTIONS } from '@/lib/constants'
import { formatCurrency, formatDateAndTime } from '@/lib/format'
import type { Order } from '@/lib/types'
import { couponDiscount, OrdersService, orderTotal } from '@/services/orders'
import { Panel, StatusTag, Td, Th, TableWrap } from './AdminUI'

export function OrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  const [tab, setTab] = useState<'comments' | 'history'>('comments')

  const load = useCallback(async () => {
    try {
      setOrder(await OrdersService.getOrderById(orderId))
    } catch {
      setOrder(null)
    }
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  if (order === undefined) return <LoadingRows rows={5} />
  if (order === null) {
    return (
      <EmptyState title={`Pedido #${orderId} não encontrado`}>
        Ele pode ter sido removido. Volte para a lista de pedidos.
      </EmptyState>
    )
  }

  const subtotal = orderTotal(order.items)
  const discount = couponDiscount(subtotal, order.coupon)

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print-none">
        <Link
          href="/admin/pedidos"
          className="text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
        >
          ← Voltar aos pedidos
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          Imprimir
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-semibold text-ink">
              Pedido #{order.orderId}
            </h1>
            <StatusTag status={order.status} />
          </div>

          <p className="mt-3 font-display text-xl text-ink">{order.contactInfo.name}</p>
          <dl className="mt-4 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
            {[
              ['Feito em', formatDateAndTime(new Date(order.createdAt))],
              ['Celular', order.contactInfo.phone],
              ['E-mail', order.contactInfo.email || '—'],
              ['Cidade', `${order.contactInfo.city} (CEP ${order.contactInfo.zipcode})`],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <dt className="shrink-0 text-ink-muted">{label}:</dt>
                <dd className="min-w-0 break-words text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          {order.contactInfo.observations && (
            <p className="mt-4 rounded-lg bg-warning-tint px-4 py-3 text-sm text-ink">
              <strong className="font-semibold">Observações:</strong>{' '}
              {order.contactInfo.observations}
            </p>
          )}
        </div>

        <div className="print-none">
          <StatusChanger order={order} onSaved={load} />
        </div>
      </div>

      <h2 className="mt-10 mb-4 font-display text-xl font-semibold text-ink">Produtos</h2>
      <TableWrap>
        <thead>
          <tr>
            <Th>Código</Th>
            <Th>Produto</Th>
            <Th className="text-right">Preço un.</Th>
            <Th className="text-right">Qtd.</Th>
            <Th className="text-right">Total</Th>
          </tr>
        </thead>
        <tbody>
          {order.items
            .filter((item) => item.amount)
            .map((item, index) => (
              <tr key={`${item.id}-${index}`}>
                <Td className="text-xs text-ink-muted">{item.id}</Td>
                <Td>
                  <span className="font-medium">{item.name}</span>
                  <span className="block text-xs text-ink-muted">{item.type}</span>
                </Td>
                <Td className="text-right tabular-nums">{formatCurrency(item.price)}</Td>
                <Td className="text-right tabular-nums">{item.amount}</Td>
                <Td className="text-right font-medium tabular-nums">
                  {formatCurrency(item.price * (item.amount || 0))}
                </Td>
              </tr>
            ))}
        </tbody>
      </TableWrap>

      <dl className="mt-5 ml-auto max-w-sm space-y-1.5 text-base">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Subtotal</dt>
          <dd className="tabular-nums">{formatCurrency(subtotal)}</dd>
        </div>
        {order.coupon && discount > 0 && (
          <div className="flex justify-between text-positive">
            <dt>Cupom {order.coupon.number}</dt>
            <dd className="tabular-nums">− {formatCurrency(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-line pt-2">
          <dt className="font-display text-lg font-semibold">Total</dt>
          <dd className="font-display text-xl font-semibold tabular-nums">
            {formatCurrency(subtotal - discount)}
          </dd>
        </div>
      </dl>

      <div className="mt-12 print-none">
        <div className="flex gap-1 border-b border-line">
          {(
            [
              ['comments', `Comentários (${order.comments?.length ?? 0})`],
              ['history', `Histórico (${order.statusLogs?.length ?? 0})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={
                tab === key
                  ? '-mb-px border-b-2 border-brand px-4 py-2.5 text-sm font-semibold text-brand'
                  : '-mb-px border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink'
              }
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'comments' ? (
            <CommentsTab order={order} onSaved={load} />
          ) : (
            <HistoryTab order={order} />
          )}
        </div>
      </div>
    </>
  )
}

function StatusChanger({ order, onSaved }: { order: Order; onSaved: () => void }) {
  const [status, setStatus] = useState(order.status)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setStatus(order.status)
  }, [order.status])

  const save = async () => {
    setSaving(true)
    try {
      await OrdersService.editOrderStatus(order, status)
      toast.success('Status atualizado')
      onSaved()
    } catch {
      toast.error('Não foi possível atualizar o status')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Panel className="p-5">
      <h2 className="font-display text-lg font-semibold text-ink">Mudar status</h2>
      <Select
        aria-label="Novo status"
        className="mt-3"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        {ORDER_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Button
        className="mt-3 w-full"
        onClick={save}
        disabled={saving || status === order.status}
      >
        {saving ? <Spinner className="h-4 w-4" /> : 'Salvar status'}
      </Button>
    </Panel>
  )
}

function CommentsTab({ order, onSaved }: { order: Order; onSaved: () => void }) {
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  const add = async () => {
    if (!comment.trim()) return
    setSaving(true)
    try {
      await OrdersService.addCommentToOrder(order, comment.trim())
      setComment('')
      onSaved()
    } catch {
      toast.error('Não foi possível salvar o comentário')
    } finally {
      setSaving(false)
    }
  }

  const comments = [...(order.comments ?? [])].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  )

  return (
    <div>
      <Textarea
        label="Novo comentário"
        rows={3}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Anote aqui o que a equipe precisa saber sobre este pedido."
      />
      <Button className="mt-2" onClick={add} disabled={saving || !comment.trim()}>
        {saving ? <Spinner className="h-4 w-4" /> : 'Adicionar comentário'}
      </Button>

      {comments.length === 0 ? (
        <p className="mt-6 text-sm text-ink-muted">Ainda não há comentários.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {comments.map((entry, index) => (
            <li key={index} className="rounded-xl border border-line bg-surface p-4">
              <p className="text-sm">
                <strong className="font-semibold text-ink">{entry.userName}</strong>
                <span className="ml-2 text-xs text-ink-muted">
                  {format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm')}
                </span>
              </p>
              <p className="mt-1.5 text-sm whitespace-pre-line text-ink-soft">
                {entry.comment}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function HistoryTab({ order }: { order: Order }) {
  if (!order.statusLogs?.length) {
    return <p className="text-sm text-ink-muted">Não houve mudança de status.</p>
  }

  return (
    <ul className="space-y-2.5">
      {order.statusLogs.map((log, index) => (
        <li key={index} className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-xs text-ink-muted tabular-nums">
            {format(new Date(log.updatedAt), 'dd/MM/yyyy HH:mm')}
          </span>
          <strong className="font-semibold text-ink">{log.userName}</strong>
          <span className="text-ink-soft">mudou de</span>
          <StatusTag status={log.oldStatus} />
          <span className="text-ink-soft">para</span>
          <StatusTag status={log.newStatus} />
        </li>
      ))}
    </ul>
  )
}
