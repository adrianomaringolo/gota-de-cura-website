'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { format } from 'date-fns'
import { AdminHeading, StatusTag, Td, Th, TableWrap } from '@/components/admin/AdminUI'
import { Select } from '@/components/ui/Field'
import { EmptyState, LoadingRows } from '@/components/ui/Feedback'
import { ORDER_STATUS, ORDER_STATUS_OPTIONS } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import type { Order } from '@/lib/types'
import { couponDiscount, OrdersService, orderTotal } from '@/services/orders'

const itemCount = (order: Order) =>
  order.items.reduce((total, item) => total + (item.amount || 0), 0)

const total = (order: Order) => {
  const subtotal = orderTotal(order.items)
  return subtotal - couponDiscount(subtotal, order.coupon)
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [status, setStatus] = useState('')

  const load = useCallback(async (statusFilter: string) => {
    setOrders(null)
    const result = await OrdersService.getOrders(statusFilter)
    setOrders(
      statusFilter
        ? result
        : result.filter(
            (order) =>
              order.status !== ORDER_STATUS.FINALIZADO &&
              order.status !== ORDER_STATUS.CANCELADO,
          ),
    )
  }, [])

  useEffect(() => {
    void load(status)
  }, [load, status])

  return (
    <>
      <AdminHeading
        title="Pedidos"
        description="Pedidos feitos pelo site. Sem filtro, a lista mostra apenas os que ainda estão em andamento."
        actions={
          <Select
            aria-label="Filtrar por status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-64"
          >
            <option value="">Todos (não finalizados)</option>
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        }
      />

      {orders === null ? (
        <LoadingRows rows={6} />
      ) : orders.length === 0 ? (
        <EmptyState title="Nenhum pedido neste filtro">
          Experimente outro status ou volte mais tarde.
        </EmptyState>
      ) : (
        <>
          <p className="mb-4 text-sm text-ink-soft">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
          </p>

          <TableWrap>
            <thead>
              <tr>
                <Th>Pedido</Th>
                <Th>Cliente</Th>
                <Th>Produtos</Th>
                <Th>Status</Th>
                <Th className="text-right">Ações</Th>
              </tr>
            </thead>
            <tbody>
              {[...orders]
                .sort((a, b) => b.orderId - a.orderId)
                .map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-canvas-sunk/60"
                  >
                    <Td>
                      <span className="font-display text-lg font-semibold">
                        #{order.orderId}
                      </span>
                      <span className="block text-xs text-ink-muted">
                        {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-medium">{order.contactInfo.name}</span>
                      <span className="block text-xs text-ink-soft">
                        {order.contactInfo.phone}
                      </span>
                      <span className="block text-xs text-ink-muted">
                        {order.contactInfo.city} · CEP {order.contactInfo.zipcode}
                      </span>
                    </Td>
                    <Td>
                      <span className="block tabular-nums">{itemCount(order)} itens</span>
                      <span className="block font-semibold tabular-nums">
                        {formatCurrency(total(order))}
                        {order.coupon && order.coupon.discount ? ' 🎟️' : ''}
                      </span>
                      <details className="mt-1.5">
                        <summary className="cursor-pointer text-xs font-medium text-brand">
                          Ver produtos
                        </summary>
                        <ul className="mt-2 space-y-1 text-xs text-ink-soft">
                          {order.items
                            .filter((item) => item.amount)
                            .map((item, index) => (
                              <li key={`${item.id}-${index}`}>
                                {item.amount}× [{item.type}] {item.name}
                              </li>
                            ))}
                        </ul>
                      </details>
                    </Td>
                    <Td>
                      <StatusTag status={order.status} />
                      <span className="mt-1.5 block text-xs text-ink-muted">
                        {order.statusLogs?.at(-1)?.userName ?? '—'}
                      </span>
                    </Td>
                    <Td className="text-right">
                      <Link
                        href={`/admin/pedidos/${order.orderId}`}
                        className="text-sm font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
                      >
                        Detalhes
                      </Link>
                    </Td>
                  </tr>
                ))}
            </tbody>
          </TableWrap>
        </>
      )}
    </>
  )
}
