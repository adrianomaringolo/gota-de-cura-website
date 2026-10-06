'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  AdminHeading,
  StatValue,
  StatusTag,
  Td,
  Th,
  TableWrap,
} from '@/components/admin/AdminUI'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { EmptyState, LoadingRows } from '@/components/ui/Feedback'
import { ORDER_STATUS, ORDER_STATUS_OPTIONS } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import type { Order } from '@/lib/types'
import { couponDiscount, OrdersService, orderTotal } from '@/services/orders'

const orderValue = (order: Order) => {
  const subtotal = orderTotal(order.items)
  return subtotal - couponDiscount(subtotal, order.coupon)
}

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [range, setRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  })

  useEffect(() => {
    OrdersService.getOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
  }, [])

  const filtered = useMemo(() => {
    if (!orders) return []
    if (!range.start || !range.end) return orders

    const from = new Date(range.start)
    from.setHours(0, 0, 0, 0)
    const to = new Date(range.end)
    to.setHours(23, 59, 59, 999)

    return orders.filter((order) => {
      const created = new Date(order.createdAt)
      return created >= from && created <= to
    })
  }, [orders, range])

  const active = filtered.filter((order) => order.status !== ORDER_STATUS.CANCELADO)
  const revenue = active.reduce((sum, order) => sum + orderValue(order), 0)
  const itemsSold = active.reduce(
    (sum, order) =>
      sum + order.items.reduce((count, item) => count + (item.amount || 0), 0),
    0,
  )

  return (
    <>
      <AdminHeading
        title="Relatórios de vendas"
        description="Pedidos cancelados ficam de fora da receita e do total de itens."
      />

      <div className="mb-8 flex flex-wrap items-end gap-3">
        <Input
          label="De"
          type="date"
          value={start}
          onChange={(event) => setStart(event.target.value)}
          className="w-44"
        />
        <Input
          label="Até"
          type="date"
          value={end}
          onChange={(event) => setEnd(event.target.value)}
          className="w-44"
        />
        <Button
          className="mb-0.5"
          onClick={() => setRange({ start, end })}
          disabled={!start || !end}
        >
          Filtrar
        </Button>
        <Button
          variant="ghost"
          className="mb-0.5"
          onClick={() => {
            setStart('')
            setEnd('')
            setRange({ start: '', end: '' })
          }}
        >
          Limpar
        </Button>
      </div>

      {orders === null ? (
        <LoadingRows rows={6} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatValue label="Pedidos no período" value={filtered.length} />
            <StatValue label="Itens vendidos" value={itemsSold} />
            <StatValue label="Receita" value={formatCurrency(revenue)} tone="brand" />
          </div>

          <h2 className="mt-10 mb-4 font-display text-xl font-semibold text-ink">
            Pedidos por status
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {ORDER_STATUS_OPTIONS.map((option) => (
              <div
                key={option.value}
                className="rounded-xl border border-line bg-surface px-3 py-3"
              >
                <p className="text-xs text-ink-muted">{option.label}</p>
                <p className="mt-0.5 font-display text-xl font-semibold tabular-nums">
                  {filtered.filter((order) => order.status === option.value).length}
                </p>
              </div>
            ))}
          </div>

          <h2 className="mt-10 mb-4 font-display text-xl font-semibold text-ink">
            Detalhe dos pedidos
          </h2>
          {filtered.length === 0 ? (
            <EmptyState title="Nenhum pedido no período selecionado" />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Pedido</Th>
                  <Th>Data</Th>
                  <Th>Cliente</Th>
                  <Th className="text-right">Itens</Th>
                  <Th className="text-right">Valor</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {[...filtered]
                  .sort((a, b) => b.orderId - a.orderId)
                  .map((order) => (
                    <tr key={order.id}>
                      <Td className="font-semibold tabular-nums">#{order.orderId}</Td>
                      <Td className="text-ink-soft tabular-nums">
                        {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                      </Td>
                      <Td>
                        <span className="font-medium">{order.contactInfo.name}</span>
                        <span className="block text-xs text-ink-muted">
                          {order.contactInfo.phone}
                        </span>
                      </Td>
                      <Td className="text-right tabular-nums">
                        {order.items.reduce(
                          (count, item) => count + (item.amount || 0),
                          0,
                        )}
                      </Td>
                      <Td className="text-right font-medium tabular-nums">
                        {formatCurrency(orderValue(order))}
                        {order.coupon && order.coupon.discount ? ' 🎟️' : ''}
                      </Td>
                      <Td>
                        <StatusTag status={order.status} />
                      </Td>
                    </tr>
                  ))}
              </tbody>
            </TableWrap>
          )}
        </>
      )}
    </>
  )
}
