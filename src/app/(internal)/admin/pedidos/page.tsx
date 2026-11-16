'use client'

import { DeliveryPill } from '@/components/admin/DeliveryPill'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { useLocalStorage } from 'buildgrid-ui'
import {
  AdminHeading,
  AssigneeFilterPills,
  StatusFilterPills,
  StatusTag,
  Td,
  Th,
  TableWrap,
} from '@/components/admin/AdminUI'
import { UserAvatar } from '@/components/admin/UserAvatar'
import { EmptyState, LoadingRows } from '@/components/ui/Feedback'
import { ORDER_STATUS } from '@/lib/constants'
import { formatCurrency } from '@/lib/format'
import { formatDuration, timeInCurrentStatus } from '@/lib/order-kpis'
import type { Order } from '@/lib/types'
import { OrdersService, orderGrandTotal } from '@/services/orders'

const itemCount = (order: Order) =>
  order.items.reduce((total, item) => total + (item.amount || 0), 0)

const total = orderGrandTotal

const href = (order: Order) => `/admin/pedidos/${order.orderId}`

/** The first two cells are the way into the order, so the whole cell is the link. */
const cellLink =
  '-m-2 block rounded-lg p-2 transition-colors hover:bg-brand/5 hover:[&_.font-medium]:text-brand focus-visible:outline-2 focus-visible:outline-brand'

const DAY_MS = 24 * 60 * 60 * 1000

/** Elapsed time in the current status, escalating in colour after 1, 2 and 4 days; closed orders stay quiet, it would only grow forever. */
function TimeInStatus({ order }: { order: Order }) {
  if (
    order.status === ORDER_STATUS.FINALIZADO ||
    order.status === ORDER_STATUS.CANCELADO
  ) {
    return null
  }
  const elapsed = timeInCurrentStatus(order)
  if (elapsed === null) return null

  const days = elapsed / DAY_MS
  const tone =
    days > 4
      ? 'rounded bg-danger px-1.5 py-0.5 font-semibold text-white'
      : days > 2
        ? 'font-semibold text-danger'
        : days > 1
          ? 'font-semibold text-warning'
          : 'text-ink-muted'

  return (
    <span className={`ml-2 text-xs tabular-nums ${tone}`}>
      há {formatDuration(elapsed)}
    </span>
  )
}

/**
 * An explicit choice wins ("Sem responsável" included). Orders where nobody
 * was ever picked keep showing who last touched the status, as before.
 */
function Assignee({ order }: { order: Order }) {
  if (order.assignee) {
    return (
      <span className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-soft">
        <UserAvatar name={order.assignee.name} className="h-5 w-5 text-[9px]" />
        {order.assignee.name}
      </span>
    )
  }
  if (order.assignee === null) {
    return <span className="mt-1.5 block text-xs text-ink-muted">Sem responsável</span>
  }
  return (
    <span className="mt-1.5 block text-xs text-ink-muted">
      {order.statusLogs?.at(-1)?.userName ?? '—'}
    </span>
  )
}

/** Orders still in progress: not finalized, not canceled. */
const isActive = (order: Order) =>
  order.status !== ORDER_STATUS.FINALIZADO && order.status !== ORDER_STATUS.CANCELADO

/** Orders with no one explicitly assigned share this key in the person filter. */
const UNASSIGNED = '__sem-responsavel__'

const assigneeKey = (order: Order) => order.assignee?.id ?? UNASSIGNED
const assigneeName = (order: Order) => order.assignee?.name ?? 'Sem responsável'

/** Keeps the chosen responsável filter across visits to the orders list. */
const ASSIGNEE_FILTER_KEY = 'admin-pedidos-filtro-responsavel'

export default function AdminOrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[] | null>(null)
  const [status, setStatus] = useState('')
  const [assignee, setAssignee] = useLocalStorage(ASSIGNEE_FILTER_KEY, '')

  const load = useCallback(async () => {
    setAllOrders(null)
    setAllOrders(await OrdersService.getOrders())
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openOrders = useMemo(() => (allOrders ?? []).filter(isActive), [allOrders])

  const matchesAssignee = useCallback(
    (order: Order) => !assignee || assigneeKey(order) === assignee,
    [assignee],
  )
  const matchesStatus = useCallback(
    (order: Order) => !status || order.status === status,
    [status],
  )

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<string, number>> = {}
    for (const order of openOrders.filter(matchesAssignee)) {
      counts[order.status] = (counts[order.status] ?? 0) + 1
    }
    return counts
  }, [openOrders, matchesAssignee])

  const assigneeEntries = useMemo(() => {
    const entries = new Map<string, { key: string; name: string; count: number }>()
    for (const order of openOrders.filter(matchesStatus)) {
      const key = assigneeKey(order)
      const current = entries.get(key)
      if (current) current.count += 1
      else entries.set(key, { key, name: assigneeName(order), count: 1 })
    }
    const unassigned = entries.get(UNASSIGNED)
    entries.delete(UNASSIGNED)
    const named = [...entries.values()].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR'),
    )
    return unassigned ? [...named, unassigned] : named
  }, [openOrders, matchesStatus])

  const orders = useMemo(
    () => (allOrders ? openOrders.filter(matchesStatus).filter(matchesAssignee) : null),
    [allOrders, openOrders, matchesStatus, matchesAssignee],
  )

  return (
    <>
      <AdminHeading
        title="Pedidos"
        description="Pedidos feitos pelo site. Sem filtro, a lista mostra apenas os que ainda estão em andamento."
      />

      {allOrders && (
        <div className="mb-6 space-y-3">
          <StatusFilterPills
            counts={statusCounts}
            totalLabel="Todos (não finalizados)"
            totalCount={openOrders.filter(matchesAssignee).length}
            value={status}
            onChange={setStatus}
          />
          <AssigneeFilterPills
            entries={assigneeEntries}
            totalLabel="Todos os responsáveis"
            totalCount={openOrders.filter(matchesStatus).length}
            value={assignee}
            onChange={setAssignee}
          />
        </div>
      )}

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
                      <Link href={href(order)} className={cellLink}>
                        <span className="font-display text-lg font-semibold text-brand underline decoration-brand/30 underline-offset-4">
                          #{order.orderId}
                        </span>
                        <span className="block text-xs text-ink-muted">
                          {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </Link>
                    </Td>
                    <Td>
                      <Link href={href(order)} className={cellLink}>
                        <span className="font-medium">{order.contactInfo.name}</span>
                        <span className="block text-xs text-ink-soft">
                          {order.contactInfo.phone}
                        </span>
                        <div className="mt-1.5">
                          <DeliveryPill delivery={order.delivery} />
                        </div>
                        {order.delivery?.method === 'shipping' ? (
                          <span className="mt-1 block text-xs text-ink-muted">
                            {order.delivery.city}/{order.delivery.state} · CEP{' '}
                            {order.delivery.zipcode}
                          </span>
                        ) : (
                          !order.delivery &&
                          order.contactInfo.city && (
                            <span className="block text-xs text-ink-muted">
                              {order.contactInfo.city} · CEP {order.contactInfo.zipcode}
                            </span>
                          )
                        )}
                      </Link>
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
                      <TimeInStatus order={order} />
                      <Assignee order={order} />
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
